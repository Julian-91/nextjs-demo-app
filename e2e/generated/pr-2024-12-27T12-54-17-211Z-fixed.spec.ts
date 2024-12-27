import { test, expect } from '@playwright/test';

class ColorChangerPage {
  constructor(private readonly page) {}

  async goto() {
    await this.page.goto('/', { waitUntil: 'networkidle' });
  }

  async changeBackgroundColor(color: 'blue' | 'green' | 'red' | '') {
    try {
      if (color === '') {
        await this.page.getByRole('button', { name: 'Reset Background', exact: true }).click();
      } else {
        await this.page.getByRole('button', { name: `Change to ${color[0].toUpperCase()}${color.slice(1)}`, exact: true }).click();
      }
      await this.page.waitForTimeout(100);
    } catch (error) {
      console.error(`Failed to change background color to ${color}:`, error);
      throw error;
    }
  }

  async getBodyClasses() {
    try {
      const classNames = await this.page.evaluate(() => {
        const classes = document.body.className.split(' ')
          .filter(cls => cls.includes('-bg') || !cls.includes('__'))
          .join(' ');
        return classes.trim();
      });
      return classNames;
    } catch (error) {
      console.error('Failed to get body classes:', error);
      throw error;
    }
  }

  async isResetButtonVisible() {
    try {
      const resetButton = this.page.getByRole('button', { name: 'Reset Background', exact: true });
      await resetButton.waitFor({ state: 'attached', timeout: 5000 });
      return await resetButton.isVisible();
    } catch (error) {
      console.error('Failed to check reset button visibility:', error);
      throw error;
    }
  }
}

test.describe('Background Color Changer', () => {
  let colorChangerPage: ColorChangerPage;

  test.beforeEach(async ({ page }) => {
    colorChangerPage = new ColorChangerPage(page);
    await colorChangerPage.goto();
  });

  test('should change background colors correctly', async () => {
    // Initial state check
    expect(await colorChangerPage.getBodyClasses()).toBe('');
    expect(await colorChangerPage.isResetButtonVisible()).toBe(false);

    // Change to blue
    await colorChangerPage.changeBackgroundColor('blue');
    expect(await colorChangerPage.getBodyClasses()).toBe('blue-bg');
    expect(await colorChangerPage.isResetButtonVisible()).toBe(true);

    // Change to green
    await colorChangerPage.changeBackgroundColor('green');
    expect(await colorChangerPage.getBodyClasses()).toBe('green-bg');
    expect(await colorChangerPage.isResetButtonVisible()).toBe(true);

    // Change to red
    await colorChangerPage.changeBackgroundColor('red');
    expect(await colorChangerPage.getBodyClasses()).toBe('red-bg');
    expect(await colorChangerPage.isResetButtonVisible()).toBe(true);

    // Reset background
    await colorChangerPage.changeBackgroundColor('');
    expect(await colorChangerPage.getBodyClasses()).toBe('');
    expect(await colorChangerPage.isResetButtonVisible()).toBe(false);
  });

  test('should remove previous color class when changing colors', async ({ page }) => {
    await test.step('Change to blue', async () => {
      await colorChangerPage.changeBackgroundColor('blue');
      expect(await colorChangerPage.getBodyClasses()).toBe('blue-bg');
    });

    await test.step('Change to green', async () => {
      await colorChangerPage.changeBackgroundColor('green');
      expect(await colorChangerPage.getBodyClasses()).toBe('green-bg');
    });

    await test.step('Change to red', async () => {
      await colorChangerPage.changeBackgroundColor('red');
      expect(await colorChangerPage.getBodyClasses()).toBe('red-bg');
    });

    await test.step('Verify no multiple classes', async () => {
      const finalClasses = await colorChangerPage.getBodyClasses();
      expect(finalClasses.split(' ').length).toBe(1);
      expect(finalClasses).not.toContain('blue-bg');
      expect(finalClasses).not.toContain('green-bg');
    });
  });
});