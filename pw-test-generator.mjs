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
                content: `You are an expert in Playwright E2E testing. Analyze the following PR diff and create test scaffolding ONLY for newly added functionality.
        Focus exclusively on new components, features, or UI elements that were added in this PR.
        Ignore modified or deleted code - only create tests for completely new additions.

        For each new feature or component:
        1. Create appropriate selectors using data-testid, role, or other reliable attributes
        2. Define empty test cases with descriptive names that cover the new functionality
        3. Include setup with test.describe() and test.beforeEach() if needed
        4. Add comments indicating what needs to be tested
        
        Fill in all selectors but leave the actual test logic empty.
        Do NOT include any markdown syntax or code block indicators.
        Prefer role-based selectors or data-testid when possible.
        Output ONLY the raw test code that can be directly saved to a .spec.ts file.
        If no new functionality is added in the PR, output: "No new functionality to test."
        
        PR Changes:
        ${diff}
        
        Example format for new functionality:
        import { test, expect } from '@playwright/test';

        // Selectors for new LoginButton component
        const loginButton: Locator = page.getByRole('button', { name: 'Login' })';
        const loginModal: Locator = page.getByTestId('modalTestId');
        const closeButton: Locator = page.locator('button[aria-label="Close login modal"]');

        test.describe('New Login Button', () => {
          test.beforeEach(async ({ page }) => {
            await page.goto('/');
          });

          test('should open login modal when clicked', async ({ page }) => {
            // 1. Click login button
            // 2. Verify modal appears
          });

          test('should close modal with close button', async ({ page }) => {
            // 1. Open modal
            // 2. Click close
            // 3. Verify modal closed
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