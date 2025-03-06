import { test, expect } from '@playwright/test';

// Page Object for the Home page
class HomePage {
  constructor(private page) {}

  async goto() {
    await this.page.goto('/');
    // Wait for page to be fully loaded
    await this.page.waitForLoadState('networkidle');
  }

  async changeBackgroundColor(color: 'blue' | 'green' | 'red' | '') {
    if (color === '') {
      await this.page.getByRole('button', { name: 'Reset Background' }).click();
    } else {
      await this.page.getByRole('button', { name: `Change to ${color.charAt(0).toUpperCase() + color.slice(1)}` }).click();
    }
    // Wait for any animations or transitions to complete
    await this.page.waitForTimeout(100);
  }

  async getBodyClasses() {
    return this.page.evaluate(() => document.body.className);
  }

  async verifyBackgroundColor(color: 'blue' | 'green' | 'red' | '') {
    if (color === '') {
      await expect(this.page.locator('body')).not.toHaveClass(/blue-bg|green-bg|red-bg/, { timeout: 5000 });
    } else {
      // Use a contains approach instead of exact matching since body has other classes
      await expect(this.page.locator('body')).toHaveClass(new RegExp(color + '-bg'), { timeout: 5000 });
    }
  }

  async verifyResetButtonExists(shouldExist: boolean) {
    const resetButton = this.page.getByRole('button', { name: 'Reset Background' });
    if (shouldExist) {
      await expect(resetButton).toBeVisible({ timeout: 5000 });
    } else {
      await expect(resetButton).not.toBeVisible({ timeout: 5000 });
    }
  }
}

test.describe('Background Color Change Feature', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should have default background with no color class', async () => {
    await homePage.verifyBackgroundColor('');
    await homePage.verifyResetButtonExists(false);
  });

  test('should change background to blue when blue button is clicked', async ({ page }) => {
    await homePage.changeBackgroundColor('blue');
    await homePage.verifyBackgroundColor('blue');
    await homePage.verifyResetButtonExists(true);
  });

  test('should change background to green when green button is clicked', async ({ page }) => {
    await homePage.changeBackgroundColor('green');
    await homePage.verifyBackgroundColor('green');
    await homePage.verifyResetButtonExists(true);
  });

  test('should change background to red when red button is clicked', async ({ page }) => {
    await homePage.changeBackgroundColor('red');
    await homePage.verifyBackgroundColor('red');
    await homePage.verifyResetButtonExists(true);
  });

  test('should reset background when reset button is clicked', async ({ page }) => {
    // First set a background color
    await homePage.changeBackgroundColor('red');
    await homePage.verifyBackgroundColor('red');
    
    // Then reset it
    await homePage.changeBackgroundColor('');
    await homePage.verifyBackgroundColor('');
    await homePage.verifyResetButtonExists(false);
  });

  test('should allow changing from one color to another', async ({ page }) => {
    // Set initial color to blue
    await homePage.changeBackgroundColor('blue');
    await homePage.verifyBackgroundColor('blue');
    
    // Change to green
    await homePage.changeBackgroundColor('green');
    await homePage.verifyBackgroundColor('green');
    
    // Change to red
    await homePage.changeBackgroundColor('red');
    await homePage.verifyBackgroundColor('red');
  });
});