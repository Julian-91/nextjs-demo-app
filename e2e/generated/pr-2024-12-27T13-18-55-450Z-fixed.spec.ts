import { test, expect } from '@playwright/test';

class BackgroundColorPage {
  constructor(private readonly page) {}

  async goto() {
    await this.page.goto('/', { waitUntil: 'networkidle' });
  }

  async changeBackgroundColor(color: 'blue' | 'green' | 'red') {
    const button = this.page.getByRole('button', { name: `Change to ${color}`, exact: true });
    await button.waitFor({ state: 'visible' });
    await button.click();
    await this.page.waitForTimeout(100);
  }

  async resetBackground() {
    const resetButton = this.page.getByRole('button', { name: 'Reset', exact: true });
    await resetButton.waitFor({ state: 'visible' });
    await resetButton.click();
    await this.page.waitForTimeout(100);
  }

  async expectBackgroundColor(color: 'blue' | 'green' | 'red' | 'default') {
    const body = this.page.locator('body');
    await body.waitFor({ state: 'visible' });

    if (color === 'default') {
      await expect(body).not.toHaveAttribute('class', /.*blue-bg.*|.*green-bg.*|.*red-bg.*/);
    } else {
      await expect(body).toHaveAttribute('class', new RegExp(`.*${color}-bg.*`));
    }
  }

  async expectResetButtonVisible(visible: boolean) {
    const resetButton = this.page.getByRole('button', { name: 'Reset', exact: true });
    if (visible) {
      await expect(resetButton).toBeVisible({ timeout: 5000 });
    } else {
      await expect(resetButton).not.toBeVisible({ timeout: 5000 });
    }
  }
}

test.describe('Background Color Changer', () => {
  let colorPage: BackgroundColorPage;

  test.beforeEach(async ({ page }) => {
    colorPage = new BackgroundColorPage(page);
    await colorPage.goto();
  });

  test('should change and reset background colors', async ({ page }) => {
    try {
      await colorPage.expectBackgroundColor('default');
      await colorPage.expectResetButtonVisible(false);

      await colorPage.changeBackgroundColor('blue');
      await colorPage.expectBackgroundColor('blue');
      await colorPage.expectResetButtonVisible(true);

      await colorPage.changeBackgroundColor('green');
      await colorPage.expectBackgroundColor('green');
      await colorPage.expectResetButtonVisible(true);

      await colorPage.changeBackgroundColor('red');
      await colorPage.expectBackgroundColor('red');
      await colorPage.expectResetButtonVisible(true);

      await colorPage.resetBackground();
      await colorPage.expectBackgroundColor('default');
      await colorPage.expectResetButtonVisible(false);
    } catch (error) {
      await page.screenshot({ path: `test-failure-${Date.now()}.png` });
      throw error;
    }
  });
});