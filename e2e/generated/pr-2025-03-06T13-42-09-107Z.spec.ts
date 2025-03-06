import { test, expect, Page } from '@playwright/test';

class HomePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/');
  }

  async changeBackgroundColor(color: string) {
    const buttonSelector = color === '' 
      ? 'text=Reset' 
      : `text=Change to ${color.charAt(0).toUpperCase() + color.slice(1)}`;
    
    await this.page.locator(buttonSelector).click();
  }

  async getBackgroundColor() {
    // Check which background class is applied to the body
    const bodyClasses = await this.page.evaluate(() => {
      return document.body.className;
    });
    
    return bodyClasses;
  }

  async isResetButtonVisible() {
    return this.page.locator('text=Reset').isVisible();
  }
}

test.describe('Background Color Change Tests', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should change background to blue when clicking the blue button', async () => {
    await homePage.changeBackgroundColor('blue');
    
    const bodyClasses = await homePage.getBackgroundColor();
    expect(bodyClasses).toContain('blue-bg');
    
    // Check that the Reset button appears
    expect(await homePage.isResetButtonVisible()).toBeTruthy();
  });

  test('should change background to green when clicking the green button', async () => {
    await homePage.changeBackgroundColor('green');
    
    const bodyClasses = await homePage.getBackgroundColor();
    expect(bodyClasses).toContain('green-bg');
    
    // Check that the Reset button appears
    expect(await homePage.isResetButtonVisible()).toBeTruthy();
  });

  test('should change background to red when clicking the red button', async () => {
    await homePage.changeBackgroundColor('red');
    
    const bodyClasses = await homePage.getBackgroundColor();
    expect(bodyClasses).toContain('red-bg');
    
    // Check that the Reset button appears
    expect(await homePage.isResetButtonVisible()).toBeTruthy();
  });

  test('should reset background when clicking the reset button', async () => {
    // First change to a color
    await homePage.changeBackgroundColor('red');
    
    // Then reset
    await homePage.changeBackgroundColor('');
    
    const bodyClasses = await homePage.getBackgroundColor();
    expect(bodyClasses).not.toContain('red-bg');
    expect(bodyClasses).not.toContain('blue-bg');
    expect(bodyClasses).not.toContain('green-bg');
    
    // Check that the Reset button disappears
    expect(await homePage.isResetButtonVisible()).toBeFalsy();
  });

  test('should change between multiple colors', async () => {
    // Change to blue
    await homePage.changeBackgroundColor('blue');
    let bodyClasses = await homePage.getBackgroundColor();
    expect(bodyClasses).toContain('blue-bg');
    
    // Change to green
    await homePage.changeBackgroundColor('green');
    bodyClasses = await homePage.getBackgroundColor();
    expect(bodyClasses).toContain('green-bg');
    expect(bodyClasses).not.toContain('blue-bg');
    
    // Change to red
    await homePage.changeBackgroundColor('red');
    bodyClasses = await homePage.getBackgroundColor();
    expect(bodyClasses).toContain('red-bg');
    expect(bodyClasses).not.toContain('green-bg');
    
    // Reset back to default
    await homePage.changeBackgroundColor('');
    bodyClasses = await homePage.getBackgroundColor();
    expect(bodyClasses).not.toContain('red-bg');
  });
});