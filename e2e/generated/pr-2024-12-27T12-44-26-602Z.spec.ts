import { test, expect } from '@playwright/test';

class BackgroundColorPage {
  constructor(private page: any) {}

  async goto() {
    await this.page.goto('/');
  }

  async changeBackgroundColor(color: string) {
    await this.page.getByRole('button', { name: `Change to ${color}` }).click();
  }

  async resetBackground() {
    await this.page.getByRole('button', { name: 'Reset Background' }).click();
  }

  async getBackgroundClass() {
    return this.page.evaluate(() => {
      return document.body.className;
    });
  }
}

test.describe('Background Color Change Feature', () => {
  let colorPage: BackgroundColorPage;

  test.beforeEach(async ({ page }) => {
    colorPage = new BackgroundColorPage(page);
    await colorPage.goto();
  });

  test('should change background colors correctly', async () => {
    // Initial state check
    let bgClass = await colorPage.getBackgroundClass();
    expect(bgClass).toBe('');

    // Test blue background
    await colorPage.changeBackgroundColor('Blue');
    bgClass = await colorPage.getBackgroundClass();
    expect(bgClass).toBe('blue-bg');

    // Test green background
    await colorPage.changeBackgroundColor('Green');
    bgClass = await colorPage.getBackgroundClass();
    expect(bgClass).toBe('green-bg');

    // Test new red background
    await colorPage.changeBackgroundColor('Red');
    bgClass = await colorPage.getBackgroundClass();
    expect(bgClass).toBe('red-bg');

    // Test reset functionality
    await colorPage.resetBackground();
    bgClass = await colorPage.getBackgroundClass();
    expect(bgClass).toBe('');
  });

  test('should handle rapid color changes correctly', async () => {
    const colors = ['Blue', 'Green', 'Red'];
    
    for (const color of colors) {
      await colorPage.changeBackgroundColor(color);
      const bgClass = await colorPage.getBackgroundClass();
      expect(bgClass).toBe(`${color.toLowerCase()}-bg`);
    }
  });

  test('should maintain color class exclusively', async () => {
    // Change to blue
    await colorPage.changeBackgroundColor('Blue');
    let bgClass = await colorPage.getBackgroundClass();
    expect(bgClass).toBe('blue-bg');
    expect(bgClass).not.toContain('green-bg');
    expect(bgClass).not.toContain('red-bg');

    // Change to green
    await colorPage.changeBackgroundColor('Green');
    bgClass = await colorPage.getBackgroundClass();
    expect(bgClass).toBe('green-bg');
    expect(bgClass).not.toContain('blue-bg');
    expect(bgClass).not.toContain('red-bg');

    // Change to red
    await colorPage.changeBackgroundColor('Red');
    bgClass = await colorPage.getBackgroundClass();
    expect(bgClass).toBe('red-bg');
    expect(bgClass).not.toContain('blue-bg');
    expect(bgClass).not.toContain('green-bg');
  });
});