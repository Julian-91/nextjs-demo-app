import { test, expect } from '@playwright/test';

class BackgroundColorPage {
  constructor(private page: any) {}

  async goto() {
    await this.page.goto('/', { waitUntil: 'networkidle' });
  }

  async changeBackgroundColor(color: string) {
    const button = this.page.getByRole('button', { name: `Change to ${color}`, exact: true });
    await button.waitFor({ state: 'visible' });
    await button.click();
    await this.page.waitForTimeout(100); // Allow class change to take effect
  }

  async resetBackground() {
    const resetButton = this.page.getByRole('button', { name: 'Reset Background', exact: true });
    await resetButton.waitFor({ state: 'visible' });
    await resetButton.click();
    await this.page.waitForTimeout(100);
  }

  async getBackgroundClass() {
    try {
      return await this.page.$eval('body', (element) => element.className.trim());
    } catch (error) {
      console.error('Error getting background class:', error);
      return '';
    }
  }

  async waitForBackgroundClass(expectedClass: string) {
    await this.page.waitForFunction(
      (className) => document.body.className.includes(className),
      expectedClass,
      { timeout: 5000 }
    );
  }
}

test.describe('Background Color Change Feature', () => {
  let colorPage: BackgroundColorPage;

  test.beforeEach(async ({ page }) => {
    colorPage = new BackgroundColorPage(page);
    await colorPage.goto();
  });

  test('should change background colors correctly', async ({ page }) => {
    await test.step('Initial state check', async () => {
      const bgClass = await colorPage.getBackgroundClass();
      expect(bgClass).toBe('');
    });

    await test.step('Change to blue', async () => {
      await colorPage.changeBackgroundColor('Blue');
      await colorPage.waitForBackgroundClass('blue-bg');
      const bgClass = await colorPage.getBackgroundClass();
      expect(bgClass).toBe('blue-bg');
    });

    await test.step('Change to green', async () => {
      await colorPage.changeBackgroundColor('Green');
      await colorPage.waitForBackgroundClass('green-bg');
      const bgClass = await colorPage.getBackgroundClass();
      expect(bgClass).toBe('green-bg');
    });

    await test.step('Change to red', async () => {
      await colorPage.changeBackgroundColor('Red');
      await colorPage.waitForBackgroundClass('red-bg');
      const bgClass = await colorPage.getBackgroundClass();
      expect(bgClass).toBe('red-bg');
    });

    await test.step('Reset background', async () => {
      await colorPage.resetBackground();
      const bgClass = await colorPage.getBackgroundClass();
      expect(bgClass).toBe('');
    });
  });

  test('should handle rapid color changes correctly', async ({ page }) => {
    const colors = ['Blue', 'Green', 'Red'];
    
    for (const color of colors) {
      await test.step(`Change to ${color}`, async () => {
        await colorPage.changeBackgroundColor(color);
        await colorPage.waitForBackgroundClass(`${color.toLowerCase()}-bg`);
        const bgClass = await colorPage.getBackgroundClass();
        expect(bgClass).toBe(`${color.toLowerCase()}-bg`);
      });
    }
  });

  test('should maintain color class exclusively', async ({ page }) => {
    await test.step('Verify blue background', async () => {
      await colorPage.changeBackgroundColor('Blue');
      await colorPage.waitForBackgroundClass('blue-bg');
      const bgClass = await colorPage.getBackgroundClass();
      expect(bgClass).toBe('blue-bg');
      expect(bgClass).not.toContain('green-bg');
      expect(bgClass).not.toContain('red-bg');
    });

    await test.step('Verify green background', async () => {
      await colorPage.changeBackgroundColor('Green');
      await colorPage.waitForBackgroundClass('green-bg');
      const bgClass = await colorPage.getBackgroundClass();
      expect(bgClass).toBe('green-bg');
      expect(bgClass).not.toContain('blue-bg');
      expect(bgClass).not.toContain('red-bg');
    });

    await test.step('Verify red background', async () => {
      await colorPage.changeBackgroundColor('Red');
      await colorPage.waitForBackgroundClass('red-bg');
      const bgClass = await colorPage.getBackgroundClass();
      expect(bgClass).toBe('red-bg');
      expect(bgClass).not.toContain('blue-bg');
      expect(bgClass).not.toContain('green-bg');
    });
  });
});