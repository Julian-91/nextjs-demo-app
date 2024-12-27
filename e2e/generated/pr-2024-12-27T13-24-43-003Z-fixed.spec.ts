import { test, expect } from '@playwright/test';

class BackgroundColorPage {
  constructor(private page) {}

  async goto() {
    await this.page.goto('/', { waitUntil: 'networkidle' });
  }

  async changeBackgroundColor(color: 'blue' | 'green' | 'red') {
    await this.page.getByRole('button', { name: `Change to ${color}`, exact: true }).click();
    await this.page.waitForFunction(
      (expectedColor) => document.body.classList.contains(`${expectedColor}-bg`),
      color
    );
  }

  async resetBackground() {
    const resetButton = this.page.getByRole('button', { name: 'Reset Background', exact: true });
    await resetButton.click();
    await this.page.waitForFunction(() => !document.body.className.includes('-bg'));
  }

  async getBackgroundClass() {
    return this.page.evaluate(() => {
      const bgClass = Array.from(document.body.classList)
        .find(className => className.endsWith('-bg'));
      return bgClass || '';
    });
  }

  async waitForResetButton(visible: boolean) {
    const resetButton = this.page.getByRole('button', { name: 'Reset Background', exact: true });
    if (visible) {
      await expect(resetButton).toBeVisible({ timeout: 10000 });
    } else {
      await expect(resetButton).not.toBeVisible({ timeout: 10000 });
    }
  }
}

test.describe('Background Color Changes', () => {
  let backgroundPage: BackgroundColorPage;

  test.beforeEach(async ({ page }) => {
    backgroundPage = new BackgroundColorPage(page);
    await backgroundPage.goto();
  });

  test('should change background colors correctly', async () => {
    try {
      // Initial state
      await expect(await backgroundPage.getBackgroundClass()).toBe('');

      // Change to blue
      await backgroundPage.changeBackgroundColor('blue');
      await expect(await backgroundPage.getBackgroundClass()).toBe('blue-bg');

      // Change to green
      await backgroundPage.changeBackgroundColor('green');
      await expect(await backgroundPage.getBackgroundClass()).toBe('green-bg');

      // Change to red
      await backgroundPage.changeBackgroundColor('red');
      await expect(await backgroundPage.getBackgroundClass()).toBe('red-bg');

      // Reset background
      await backgroundPage.resetBackground();
      await expect(await backgroundPage.getBackgroundClass()).toBe('');
    } catch (error) {
      throw new Error(`Background color test failed: ${error.message}`);
    }
  });

  test('should handle multiple color changes', async () => {
    try {
      await backgroundPage.changeBackgroundColor('blue');
      await expect(await backgroundPage.getBackgroundClass()).toBe('blue-bg');

      await backgroundPage.changeBackgroundColor('red');
      await expect(await backgroundPage.getBackgroundClass()).toBe('red-bg');
      
      await backgroundPage.changeBackgroundColor('green');
      await expect(await backgroundPage.getBackgroundClass()).toBe('green-bg');
    } catch (error) {
      throw new Error(`Multiple color changes test failed: ${error.message}`);
    }
  });

  test('reset button should only appear when background color is set', async () => {
    try {
      // Initial state - reset button should not be visible
      await backgroundPage.waitForResetButton(false);

      // Set background color
      await backgroundPage.changeBackgroundColor('red');
      await backgroundPage.waitForResetButton(true);

      // Reset background
      await backgroundPage.resetBackground();
      await backgroundPage.waitForResetButton(false);
    } catch (error) {
      throw new Error(`Reset button visibility test failed: ${error.message}`);
    }
  });
});