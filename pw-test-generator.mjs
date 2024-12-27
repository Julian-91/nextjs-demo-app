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
                content: `You are an expert in Playwright E2E testing. Based on the following PR changes, generate appropriate e2e tests. 
      The tests should cover the main user flows affected by these changes.
      Output only the test code, no explanations.
      
      PR Changes:
      ${diff}
      
      Generate a Playwright test that:
      1. Covers the main functionality changes
      2. Includes appropriate assertions
      3. Follows Playwright best practices
      4. Uses page object model if appropriate
      5. Includes appropriate setup and teardown
      6. Is written in TypeScript
      7. Use baseUrl: '/'`
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