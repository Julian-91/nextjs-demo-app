import { test, expect } from '@playwright/test';

class ColorChangerPage {
  constructor(private page) {}

  async goto() {
    await this.page.goto('/');
  }

  async changeBackgroundColor(color: 'blue' | 'green' | 'red' | '') {
    if (color === '') {
      await this.page.getByRole('button', { name: 'Reset Background' }).click();
    } else {
      await this.page.getByRole('button', { name: `Change to ${color[0].toUpperCase()}${color.slice(1)}` }).click();
    }
  }

  async getBodyClasses() {
    return await this.page.evaluate(() => document.body.className);
  }

  async isResetButtonVisible() {
    return await this.page.getByRole('button', { name: 'Reset Background' }).isVisible();
  }
}

test.describe('Background Color Changer', () => {
  let colorChangerPage: ColorChangerPage;

  test.beforeEach(async ({ page }) => {
    colorChangerPage = new ColorChangerPage(page);
    await colorChangerPage.goto();
  });

  test('should change background colors correctly', async () => {
    // Initial state
    expect(await colorChangerPage.getBodyClasses()).toBe('');
    expect(await colorChangerPage.isResetButtonVisible()).toBe(false);

    // Change to blue
    await colorChangerPage.changeBackgroundColor('blue');
    expect(await colorChangerPage.getBodyClasses()).toContain('blue-bg');
    expect(await colorChangerPage.isResetButtonVisible()).toBe(true);

    // Change to green
    await colorChangerPage.changeBackgroundColor('green');
    expect(await colorChangerPage.getBodyClasses()).toContain('green-bg');
    expect(await colorChangerPage.isResetButtonVisible()).toBe(true);

    // Change to red (new functionality)
    await colorChangerPage.changeBackgroundColor('red');
    expect(await colorChangerPage.getBodyClasses()).toContain('red-bg');
    expect(await colorChangerPage.isResetButtonVisible()).toBe(true);

    // Reset background
    await colorChangerPage.changeBackgroundColor('');
    expect(await colorChangerPage.getBodyClasses()).toBe('');
    expect(await colorChangerPage.isResetButtonVisible()).toBe(false);
  });

  test('should remove previous color class when changing colors', async () => {
    // Change to blue
    await colorChangerPage.changeBackgroundColor('blue');
    expect(await colorChangerPage.getBodyClasses()).toBe('blue-bg');

    // Change to green
    await colorChangerPage.changeBackgroundColor('green');
    expect(await colorChangerPage.getBodyClasses()).toBe('green-bg');
    
    // Change to red
    await colorChangerPage.changeBackgroundColor('red');
    expect(await colorChangerPage.getBodyClasses()).toBe('red-bg');
    
    // Verify no multiple classes are present
    const finalClasses = await colorChangerPage.getBodyClasses();
    expect(finalClasses.split(' ').length).toBe(1);
    expect(finalClasses).not.toContain('blue-bg');
    expect(finalClasses).not.toContain('green-bg');
  });
});