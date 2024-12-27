Based on the PR diff, I'll create test scaffolding for the new red background color functionality that was added. Here's the E2E test code:

import { test, expect } from '@playwright/test';

// Selectors for background color buttons
const blueButton = 'button[role="button"]:has-text("Change to Blue")';
const greenButton = 'button[role="button"]:has-text("Change to Green")'; 
const redButton = 'button[role="button"]:has-text("Change to Red")';
const resetButton = 'button[role="button"]:has-text("Reset Background")';

// Main container
const mainContainer = 'main[role="main"]';

test.describe('Background Color Changer', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page before each test
    await page.goto('/');
  });

  test('should change background to blue when blue button clicked', async ({ page }) => {
    // 1. Click blue button
    // 2. Verify body has blue-bg class
    // 3. Verify reset button is visible
  });

  test('should change background to green when green button clicked', async ({ page }) => {
    // 1. Click green button  
    // 2. Verify body has green-bg class
    // 3. Verify reset button is visible
  });

  test('should change background to red when red button clicked', async ({ page }) => {
    // 1. Click red button
    // 2. Verify body has red-bg class 
    // 3. Verify reset button is visible
  });

  test('should reset background when reset button clicked', async ({ page }) => {
    // 1. Set a background color first
    // 2. Click reset button
    // 3. Verify no color classes remain on body
    // 4. Verify reset button is hidden
  });

  test('should only allow one background color at a time', async ({ page }) => {
    // 1. Click multiple color buttons in sequence
    // 2. Verify only the last selected color class remains
    // 3. Verify previous color classes are removed
  });
});