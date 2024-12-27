import fs from 'fs/promises';
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});
async function main() {
    try {
        const diff = await fs.readFile('pr_diff.txt', 'utf-8');
        await fs.mkdir('e2e/generated', { recursive: true });

        const message = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 4000,
            messages: [{
                role: "user",
                content: `You are an expert in Playwright E2E testing. Based on the following PR changes, generate test scaffolding.
                For each main UI component or feature change in the PR:
                1. Create appropriate selectors using data-testid, role, or other reliable attributes
                2. Define empty test cases with descriptive names
                3. Include setup with test.describe() and test.beforeEach() if needed
                4. Add comments indicating what needs to be tested
                
                Fill in all selectors but leave the actual test logic empty.
                Do NOT include any markdown syntax or code block indicators.
                Prefer role-based selectors or data-testid when possible.
                Output ONLY the raw test code that can be directly saved to a .spec.ts file.
                
                PR Changes:
                ${diff}
                
                Example format:
                import { test, expect } from '@playwright/test';
        
                // Selectors
                const submitButton = 'button[role="button"][name="Submit"]';
                const nameInput = 'input[data-testid="name-input"]';
                const errorMessage = '[role="alert"]';
        
                test.describe('Login Form', () => {
                  test.beforeEach(async ({ page }) => {
                    // Setup code here
                  });
        
                  test('should show error with empty fields', async ({ page }) => {
                    // 1. Click submit with empty fields
                    // 2. Verify error message
                  });
                });`
            }]
        });
        const testContent = message.content[0].text;

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `e2e/generated/pr-${timestamp}.spec.ts`;

        await fs.writeFile(filename, testContent, 'utf-8');

        console.log(`Successfully generated test: ${filename}`);
    } catch (error) {
        console.error('Error generating tests:', error);
        process.exit(1);
    }
}
main();