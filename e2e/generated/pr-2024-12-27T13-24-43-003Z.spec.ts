import { test, expect } from '@playwright/test';

class BackgroundColorPage {
  constructor(private page) {}

  async goto() {
    await this.page.goto('/');
  }

  async changeBackgroundColor(color: 'blue' | 'green' | 'red') {
    await this.page.getByRole('button', { name: `Change to ${color}` }).click();
  }

  async resetBackground() {
    await this.page.getByRole('button', { name: 'Reset Background' }).click();
  }

  async getBackgroundClass() {
    const body = this.page.locator('body');
    return body.getAttribute('class');
  }
}

test.describe('Background Color Changes', () => {
  let backgroundPage: BackgroundColorPage;

  test.beforeEach(async ({ page }) => {
    backgroundPage = new BackgroundColorPage(page);
    await backgroundPage.goto();
  });

  test('should change background colors correctly', async () => {
    // Initial state
    await expect(await backgroundPage.getBackgroundClass()).toBe('');

    // Change to blue
    await backgroundPage.changeBackgroundColor('blue');
    await expect(await backgroundPage.getBackgroundClass()).toBe('blue-bg');

    // Change to green
    await backgroundPage.changeBackgroundColor('green');
    await expect(await backgroundPage.getBackgroundClass()).toBe('green-bg');

    // Change to red (new feature)
    await backgroundPage.changeBackgroundColor('red');
    await expect(await backgroundPage.getBackgroundClass()).toBe('red-bg');

    // Reset background
    await backgroundPage.resetBackground();
    await expect(await backgroundPage.getBackgroundClass()).toBe('');
  });

  test('should handle multiple color changes', async () => {
    await backgroundPage.changeBackgroundColor('blue');
    await expect(await backgroundPage.getBackgroundClass()).toBe('blue-bg');

    await backgroundPage.changeBackgroundColor('red');
    await expect(await backgroundPage.getBackgroundClass()).toBe('red-bg');
    
    await backgroundPage.changeBackgroundColor('green');
    await expect(await backgroundPage.getBackgroundClass()).toBe('green-bg');
  });

  test('reset button should only appear when background color is set', async ({ page }) => {
    // Reset button should not be visible initially
    await expect(page.getByRole('button', { name: 'Reset Background' })).not.toBeVisible();

    // Set background color
    await backgroundPage.changeBackgroundColor('red');
    await expect(page.getByRole('button', { name: 'Reset Background' })).toBeVisible();

    // Reset background
    await backgroundPage.resetBackground();
    await expect(page.getByRole('button', { name: 'Reset Background' })).not.toBeVisible();
  });
});