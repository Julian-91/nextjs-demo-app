import { test, expect } from '@playwright/test';

// Page object for the background color changer page
class BackgroundColorPage {
  constructor(private page) {}

  // Visit the homepage
  async goto() {
    await this.page.goto('/');
  }

  // Click the change background button for a specific color
  async changeBackgroundTo(color: 'blue' | 'green' | 'red') {
    await this.page.getByRole('button', { name: `Change to ${color[0].toUpperCase() + color.slice(1)}` }).click();
  }

  // Click the reset button
  async resetBackground() {
    await this.page.getByRole('button', { name: 'Reset' }).click();
  }

  // Get the current background color class from the body
  async getCurrentBackgroundColorClass() {
    return this.page.evaluate(() => {
      const bodyClasses = document.body.classList;
      if (bodyClasses.contains('blue-bg')) return 'blue-bg';
      if (bodyClasses.contains('green-bg')) return 'green-bg';
      if (bodyClasses.contains('red-bg')) return 'red-bg';
      return '';
    });
  }

  // Check if reset button is visible
  async isResetButtonVisible() {
    return this.page.getByRole('button', { name: 'Reset' }).isVisible();
  }
}

test.describe('Background Color Changer', () => {
  let bgColorPage: BackgroundColorPage;

  test.beforeEach(async ({ page }) => {
    bgColorPage = new BackgroundColorPage(page);
    await bgColorPage.goto();
  });

  test('should change the background color to blue when blue button is clicked', async () => {
    await bgColorPage.changeBackgroundTo('blue');
    
    // Verify color was applied correctly
    const bgClass = await bgColorPage.getCurrentBackgroundColorClass();
    expect(bgClass).toBe('blue-bg');
    
    // Verify reset button appears
    expect(await bgColorPage.isResetButtonVisible()).toBeTruthy();
  });

  test('should change the background color to green when green button is clicked', async () => {
    await bgColorPage.changeBackgroundTo('green');
    
    // Verify color was applied correctly
    const bgClass = await bgColorPage.getCurrentBackgroundColorClass();
    expect(bgClass).toBe('green-bg');
    
    // Verify reset button appears
    expect(await bgColorPage.isResetButtonVisible()).toBeTruthy();
  });

  test('should change the background color to red when red button is clicked', async () => {
    await bgColorPage.changeBackgroundTo('red');
    
    // Verify color was applied correctly
    const bgClass = await bgColorPage.getCurrentBackgroundColorClass();
    expect(bgClass).toBe('red-bg');
    
    // Verify reset button appears
    expect(await bgColorPage.isResetButtonVisible()).toBeTruthy();
  });

  test('should reset the background color when reset button is clicked', async () => {
    // First change to a color
    await bgColorPage.changeBackgroundTo('red');
    
    // Verify color was applied
    expect(await bgColorPage.getCurrentBackgroundColorClass()).toBe('red-bg');
    
    // Reset the color
    await bgColorPage.resetBackground();
    
    // Verify color was reset
    expect(await bgColorPage.getCurrentBackgroundColorClass()).toBe('');
    
    // Verify reset button is no longer visible
    expect(await bgColorPage.isResetButtonVisible()).toBeFalsy();
  });

  test('should allow cycling through different background colors', async () => {
    // Change to blue
    await bgColorPage.changeBackgroundTo('blue');
    expect(await bgColorPage.getCurrentBackgroundColorClass()).toBe('blue-bg');
    
    // Change to green
    await bgColorPage.changeBackgroundTo('green');
    expect(await bgColorPage.getCurrentBackgroundColorClass()).toBe('green-bg');
    
    // Change to red
    await bgColorPage.changeBackgroundTo('red');
    expect(await bgColorPage.getCurrentBackgroundColorClass()).toBe('red-bg');
    
    // Back to blue
    await bgColorPage.changeBackgroundTo('blue');
    expect(await bgColorPage.getCurrentBackgroundColorClass()).toBe('blue-bg');
    
    // Reset
    await bgColorPage.resetBackground();
    expect(await bgColorPage.getCurrentBackgroundColorClass()).toBe('');
  });
});