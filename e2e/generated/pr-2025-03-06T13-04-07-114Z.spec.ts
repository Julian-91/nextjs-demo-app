import { test, expect } from '@playwright/test';

// Page object for the background color changer application
class BackgroundColorChangerPage {
  constructor(private page) {}

  // Navigate to the homepage
  async goto() {
    await this.page.goto('/');
  }

  // Get the blue button element
  async getBlueButton() {
    return this.page.getByRole('button', { name: 'Change to Blue' });
  }

  // Get the green button element
  async getGreenButton() {
    return this.page.getByRole('button', { name: 'Change to Green' });
  }

  // Get the red button element
  async getRedButton() {
    return this.page.getByRole('button', { name: 'Change to Red' });
  }

  // Get the reset button element
  async getResetButton() {
    return this.page.getByRole('button', { name: 'Reset' });
  }

  // Click the blue button
  async clickBlueButton() {
    const button = await this.getBlueButton();
    await button.click();
  }

  // Click the green button
  async clickGreenButton() {
    const button = await this.getGreenButton();
    await button.click();
  }

  // Click the red button
  async clickRedButton() {
    const button = await this.getRedButton();
    await button.click();
  }

  // Click the reset button
  async clickResetButton() {
    const button = await this.getResetButton();
    await button.click();
  }

  // Get current background color class
  async getBackgroundColorClass() {
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
    const resetButton = await this.getResetButton();
    return resetButton.isVisible();
  }
}

test.describe('Background Color Changer Application', () => {
  let page;
  let backgroundColorPage;

  test.beforeEach(async ({ page: p }) => {
    page = p;
    backgroundColorPage = new BackgroundColorChangerPage(page);
    await backgroundColorPage.goto();
  });

  test('should display all color changing buttons', async () => {
    const blueButton = await backgroundColorPage.getBlueButton();
    const greenButton = await backgroundColorPage.getGreenButton();
    const redButton = await backgroundColorPage.getRedButton();

    await expect(blueButton).toBeVisible();
    await expect(greenButton).toBeVisible();
    await expect(redButton).toBeVisible();
  });

  test('should change background to blue when blue button is clicked', async () => {
    await backgroundColorPage.clickBlueButton();
    
    // Check that the correct background class is applied
    const backgroundClass = await backgroundColorPage.getBackgroundColorClass();
    expect(backgroundClass).toBe('blue-bg');
    
    // Check that reset button appears
    const isResetVisible = await backgroundColorPage.isResetButtonVisible();
    expect(isResetVisible).toBeTruthy();
  });

  test('should change background to green when green button is clicked', async () => {
    await backgroundColorPage.clickGreenButton();
    
    // Check that the correct background class is applied
    const backgroundClass = await backgroundColorPage.getBackgroundColorClass();
    expect(backgroundClass).toBe('green-bg');
    
    // Check that reset button appears
    const isResetVisible = await backgroundColorPage.isResetButtonVisible();
    expect(isResetVisible).toBeTruthy();
  });

  test('should change background to red when red button is clicked', async () => {
    await backgroundColorPage.clickRedButton();
    
    // Check that the correct background class is applied
    const backgroundClass = await backgroundColorPage.getBackgroundColorClass();
    expect(backgroundClass).toBe('red-bg');
    
    // Check that reset button appears
    const isResetVisible = await backgroundColorPage.isResetButtonVisible();
    expect(isResetVisible).toBeTruthy();
  });

  test('should reset background when reset button is clicked', async () => {
    // First change to a color
    await backgroundColorPage.clickRedButton();
    
    // Verify color was changed
    let backgroundClass = await backgroundColorPage.getBackgroundColorClass();
    expect(backgroundClass).toBe('red-bg');
    
    // Now reset
    await backgroundColorPage.clickResetButton();
    
    // Verify background was reset
    backgroundClass = await backgroundColorPage.getBackgroundColorClass();
    expect(backgroundClass).toBe('');
    
    // Verify reset button is no longer visible
    const isResetVisible = await backgroundColorPage.isResetButtonVisible();
    expect(isResetVisible).toBeFalsy();
  });

  test('should be able to switch between different colors', async () => {
    // Change to blue
    await backgroundColorPage.clickBlueButton();
    expect(await backgroundColorPage.getBackgroundColorClass()).toBe('blue-bg');
    
    // Change to green
    await backgroundColorPage.clickGreenButton();
    expect(await backgroundColorPage.getBackgroundColorClass()).toBe('green-bg');
    
    // Change to red
    await backgroundColorPage.clickRedButton();
    expect(await backgroundColorPage.getBackgroundColorClass()).toBe('red-bg');
    
    // Reset
    await backgroundColorPage.clickResetButton();
    expect(await backgroundColorPage.getBackgroundColorClass()).toBe('');
  });
});