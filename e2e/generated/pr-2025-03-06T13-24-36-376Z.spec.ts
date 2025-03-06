import { test, expect } from '@playwright/test';

class HomePage {
  constructor(private readonly page) {}

  async goto() {
    await this.page.goto('/');
  }

  async changeBackgroundColor(color: string) {
    await this.page.getByRole('button', { name: `Change to ${color}` }).click();
  }

  async resetBackground() {
    await this.page.getByRole('button', { name: 'Reset Background' }).click();
  }

  async getBodyClasses() {
    return this.page.evaluate(() => {
      return Array.from(document.body.classList);
    });
  }

  async hasBackgroundColor(color: string) {
    const classes = await this.getBodyClasses();
    return classes.includes(`${color}-bg`);
  }

  async assertBackgroundColor(color: string | null) {
    if (color) {
      await expect(this.page.locator('body')).toHaveClass(new RegExp(`${color}-bg`));
    } else {
      const classes = await this.getBodyClasses();
      expect(classes).not.toContain('blue-bg');
      expect(classes).not.toContain('green-bg');
      expect(classes).not.toContain('red-bg');
    }
  }

  async assertResetButtonVisible(shouldBeVisible: boolean) {
    if (shouldBeVisible) {
      await expect(this.page.getByRole('button', { name: 'Reset Background' })).toBeVisible();
    } else {
      await expect(this.page.getByRole('button', { name: 'Reset Background' })).not.toBeVisible();
    }
  }
}

test.describe('Background Color Changer', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should change background color to blue', async () => {
    await homePage.changeBackgroundColor('Blue');
    await homePage.assertBackgroundColor('blue');
    await homePage.assertResetButtonVisible(true);
  });

  test('should change background color to green', async () => {
    await homePage.changeBackgroundColor('Green');
    await homePage.assertBackgroundColor('green');
    await homePage.assertResetButtonVisible(true);
  });

  test('should change background color to red', async () => {
    await homePage.changeBackgroundColor('Red');
    await homePage.assertBackgroundColor('red');
    await homePage.assertResetButtonVisible(true);
  });

  test('should reset background color', async () => {
    // Change to a color first
    await homePage.changeBackgroundColor('Red');
    await homePage.assertBackgroundColor('red');
    
    // Then reset
    await homePage.resetBackground();
    await homePage.assertBackgroundColor(null);
    await homePage.assertResetButtonVisible(false);
  });

  test('should change between different colors', async () => {
    // Change from blue to green
    await homePage.changeBackgroundColor('Blue');
    await homePage.assertBackgroundColor('blue');
    
    await homePage.changeBackgroundColor('Green');
    await homePage.assertBackgroundColor('green');
    expect(await homePage.hasBackgroundColor('blue')).toBe(false);
    
    // Change from green to red
    await homePage.changeBackgroundColor('Red');
    await homePage.assertBackgroundColor('red');
    expect(await homePage.hasBackgroundColor('green')).toBe(false);
  });

  test('reset button should only appear when a background color is set', async () => {
    // Initially, reset button should not be visible
    await homePage.assertResetButtonVisible(false);
    
    // After setting color, reset button should be visible
    await homePage.changeBackgroundColor('Blue');
    await homePage.assertResetButtonVisible(true);
    
    // After resetting, reset button should not be visible again
    await homePage.resetBackground();
    await homePage.assertResetButtonVisible(false);
  });
});