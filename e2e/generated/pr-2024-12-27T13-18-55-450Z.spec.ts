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
    await this.page.getByRole('button', { name: 'Reset' }).click();
  }

  async expectBackgroundColor(color: 'blue' | 'green' | 'red' | 'default') {
    if (color === 'default') {
      await expect(this.page.locator('body')).not.toHaveClass(/blue-bg|green-bg|red-bg/);
    } else {
      await expect(this.page.locator('body')).toHaveClass(`${color}-bg`);
    }
  }

  async expectResetButtonVisible(visible: boolean) {
    if (visible) {
      await expect(this.page.getByRole('button', { name: 'Reset' })).toBeVisible();
    } else {
      await expect(this.page.getByRole('button', { name: 'Reset' })).not.toBeVisible();
    }
  }
}

test.describe('Background Color Changer', () => {
  let colorPage: BackgroundColorPage;

  test.beforeEach(async ({ page }) => {
    colorPage = new BackgroundColorPage(page);
    await colorPage.goto();
  });

  test('should change and reset background colors', async () => {
    // Initially no background color class should be present
    await colorPage.expectBackgroundColor('default');
    await colorPage.expectResetButtonVisible(false);

    // Test blue background
    await colorPage.changeBackgroundColor('blue');
    await colorPage.expectBackgroundColor('blue');
    await colorPage.expectResetButtonVisible(true);

    // Test green background
    await colorPage.changeBackgroundColor('green');
    await colorPage.expectBackgroundColor('green');
    await colorPage.expectResetButtonVisible(true);

    // Test new red background functionality
    await colorPage.changeBackgroundColor('red');
    await colorPage.expectBackgroundColor('red');
    await colorPage.expectResetButtonVisible(true);

    // Test reset functionality
    await colorPage.resetBackground();
    await colorPage.expectBackgroundColor('default');
    await colorPage.expectResetButtonVisible(false);
  });
});