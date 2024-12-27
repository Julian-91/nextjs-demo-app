import fs from 'fs/promises';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';
import { Octokit } from '@octokit/rest';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const octokit = new Octokit({
    auth: process.env.GH_TOKEN
});

async function main() {
    try {
        // Get generated test files
        const generatedDir = 'e2e/generated';
        const files = await fs.readdir(generatedDir);
        const testFiles = files.filter(file => file.endsWith('.spec.ts'));

        // Read test content and Playwright error output
        const testContents = await Promise.all(testFiles.map(async file => {
            const content = await fs.readFile(path.join(generatedDir, file), 'utf-8');
            return { file, content };
        }));

        let playwrightOutput = '';
        try {
            playwrightOutput = await fs.readFile('playwright-report/results.json', 'utf-8');
        } catch (error) {
            console.log('No Playwright results file found', error);
        }

        // For each failed test, generate a fixed version
        for (const { file, content } of testContents) {
            const message = await anthropic.messages.create({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 4000,
                messages: [{
                    role: "user",
                    content: `You are an expert in Playwright E2E testing. This generated test failed execution.
          Create a fixed version of the test that addresses potential issues. Consider:
          1. Test setup and teardown
          2. Selectors and element targeting (prefer role-based selectors)
          3. Timing and wait conditions
          4. Assertions
          5. Error handling
          
          Original Test:
          ${content}
          
          Playwright Output:
          ${playwrightOutput}
          
          Output ONLY the complete, fixed test code without any markdown formatting or explanations.
          Use robust selectors, proper wait conditions, and thorough error handling.`
                }]
            });

            const fixedTest = message.content[0].text

            // Save the fixed version with a -fixed suffix
            const fixedFileName = file.replace('.spec.ts', '-fixed.spec.ts');
            await fs.writeFile(path.join(generatedDir, fixedFileName), fixedTest, 'utf-8');

            //             // Generate review explaining the changes
            //             const reviewMessage = await anthropic.messages.create({
            //                 model: "claude-3-sonnet-20240229",
            //                 max_tokens: 4000,
            //                 messages: [{
            //                     role: "user",
            //                     content: `Compare these two Playwright tests and explain the key fixes and improvements made:

            //           Original Test:
            //           ${content}

            //           Fixed Test:
            //           ${fixedTest}

            //           Provide a concise explanation focusing on the specific improvements and why they should help the test pass.`
            //                 }]
            //             });

            //             // Post review and fixed test as PR comment
            //             const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
            //             await octokit.issues.createComment({
            //                 owner,
            //                 repo,
            //                 issue_number: parseInt(process.env.GITHUB_EVENT_NUMBER),
            //                 body: `## E2E Test Review - ${file}

            // ${reviewMessage.content[0].text}

            // ### Fixed Test Code
            // \`\`\`typescript
            // ${fixedTest}
            // \`\`\`

            // I've generated a fixed version of this test at \`${fixedFileName}\`. The fixed version includes more robust selectors, better wait conditions, and improved error handling.`
            //             });
        }

        console.log('Test review and fixes posted as PR comments');
    } catch (error) {
        console.error('Error reviewing tests:', error);
        process.exit(1);
    }
}

main();