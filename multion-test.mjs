import assert from 'node:assert';
import { MultiOnClient } from 'multion';

assert(process.env.MULTION_API_KEY, 'MULTION_API_KEY is required');

const prUrl = process.argv[2];
const previewUrl = process.argv[3];

const multion = new MultiOnClient({ apiKey: process.env.MULTION_API_KEY });
const prResponse = await multion.browse({
    cmd: 'Based on the content of the PR, output a clear test to perform on the preview site.',
    url: prUrl,
    maxSteps: 3,
});

// Set output for GitHub Actions
console.log("### PR analysis:\n" + prResponse.message);

const previewResponse = await multion.browse({
    cmd: "Output the results of the performed test: " + prResponse.message,
    url: previewUrl,
    maxSteps: 3,
});

// Set output for GitHub Actions
console.log("### Test results:\n" + previewResponse.message); 