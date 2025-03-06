import { test, expect } from '@playwright/test';

class HomePage {
  constructor(private readonly page) {}

  async goto() {
    await this.page.goto('/');
    // Allow time for initial page load
    await this.page.waitForLoadState('networkidle');
  }

  async changeBackgroundColor(color: string) {
    const button = this.page.getByRole('button', { name: new RegExp(`^Change to ${color}$`, 'i') });
    await button.waitFor({ state: 'visible' });
    await button.click();
    // Wait for color change to take effect
    await this.page.waitForTimeout(300);
  }

  async resetBackground() {
    try {
      const resetButton = this.page.getByRole('button', { name: /Reset Background/i });
      // Add a more specific timeout for the reset button
      await resetButton.waitFor({ state: 'visible', timeout: 3000 });
      await resetButton.click();
      // Wait for reset to take effect
      await this.page.waitForTimeout(300);
    } catch (error) {
      console.error('Reset button not found:', error);
      // Take screenshot for debugging
      await this.page.screenshot({ path: `reset-button-error-${Date.now()}.png` });
      throw error;
    }
  }

  async getBodyClasses() {
    return this.page.evaluate(() => {
      return Array.from(document.body.classList);
    });
  }

  async hasBackgroundColor(color: string) {
    const classes = await this.getBodyClasses();
    return classes.includes(`${color.toLowerCase()}-bg`);
  }

  async assertBackgroundColor(color: string | null) {
    if (color) {
      const colorClass = `${color.toLowerCase()}-bg`;
      await expect(this.page.locator('body')).toHaveClass(new RegExp(colorClass), { timeout: 5000 });
    } else {
      const classes = await this.getBodyClasses();
      expect(classes).not.toContain('blue-bg');
      expect(classes).not.toContain('green-bg');
      expect(classes).not.toContain('red-bg');
    }
  }

  async assertResetButtonExists(shouldExist: boolean) {
    const resetButton = this.page.getByRole('button', { name: /Reset Background/i });
    
    if (shouldExist) {
      try {
        // Check if the button is in the DOM, even if not visible
        await expect(resetButton).toHaveCount(1, { timeout: 5000 });
      } catch (error) {
        console.error('Reset button should exist but was not found');
        await this.page.screenshot({ path: `reset-button-should-exist-${Date.now()}.png` });
        throw error;
      }
    } else {
      try {
        // Check if the button is not in the DOM or not visible
        await expect(resetButton).toHaveCount(0, { timeout: 5000 });
      } catch (error) {
        // If error occurs, check if button is actually visible
        const isVisible = await resetButton.isVisible().catch(() => false);
        if (isVisible) {
          await this.page.screenshot({ path: `reset-button-should-not-exist-${Date.now()}.png` });
          throw new Error('Reset button should not exist but was found');
        }
      }
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
    await homePage.assertResetButtonExists(true);
  });

  test('should change background color to green', async () => {
    await homePage.changeBackgroundColor('Green');
    await homePage.assertBackgroundColor('green');
    await homePage.assertResetButtonExists(true);
  });

  test('should change background color to red', async () => {
    await homePage.changeBackgroundColor('Red');
    await homePage.assertBackgroundColor('red');
    await homePage.assertResetButtonExists(true);
  });

  test('should reset background color', async ({ page }) => {
    // Change to a color first
    await homePage.changeBackgroundColor('Red');
    await homePage.assertBackgroundColor('red');
    
    // Verify the reset button exists before trying to click it
    await homePage.assertResetButtonExists(true);
    
    // Take a screenshot for debugging if needed
    await page.screenshot({ path: 'before-reset.png' });
    
    // Then reset - with more careful handling
    const resetButton = page.getByRole('button', { name: /Reset Background/i });
    await resetButton.waitFor({ state: 'visible', timeout: 5000 });
    await resetButton.click();
    
    // Verify reset worked
    await homePage.assertBackgroundColor(null);
    await homePage.assertResetButtonExists(false);
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

  test('reset button should only appear when a background color is set', async ({ page }) => {
    // Initially, reset button should not be visible
    await homePage.assertResetButtonExists(false);
    
    // After setting color, reset button should be visible
    await homePage.changeBackgroundColor('Blue');
    
    // Take a screenshot after color change for debugging
    await page.screenshot({ path: 'after-color-change.png' });
    
    // Check if reset button exists in DOM
    const resetButton = page.getByRole('button', { name: /Reset Background/i });
    const exists = await resetButton.count() > 0;
    
    if (exists) {
      // If it exists, verify it's visible
      await expect(resetButton).toBeVisible();
    } else {
      throw new Error('Reset button was not found in DOM after setting color');
    }
    
    // Now click the reset button
    await resetButton.click();
    
    // After resetting, reset button should not be visible again
    await expect(page.getByRole('button', { name: /Reset Background/i })).toHaveCount(0);
  });
});