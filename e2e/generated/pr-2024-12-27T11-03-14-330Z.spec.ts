import { test, expect } from '@playwright/test';

class HomePage {
  constructor(private page) {}

  async goto() {
    await this.page.goto('/');
  }

  async changeBackgroundColor(color: 'blue' | 'green' | 'red' | 'reset') {
    if (color === 'reset') {
      await this.page.click('button:text("Reset Background")');
    } else {
      await this.page.click(`button:text("Change to ${color[0].toUpperCase() + color.slice(1)}")`);
    }
  }

  async getBodyClasses() {
    return await this.page.evaluate(() => {
      return Array.from(document.body.classList);
    });
  }

  async isResetButtonVisible() {
    return await this.page.isVisible('button:text("Reset Background")');
  }
}

test.describe('Background Color Change Functionality', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should change background color to blue', async () => {
    await homePage.changeBackgroundColor('blue');
    const classes = await homePage.getBodyClasses();
    expect(classes).toContain('blue-bg');
  });

  test('should change background color to green', async () => {
    await homePage.changeBackgroundColor('green');
    const classes = await homePage.getBodyClasses();
    expect(classes).toContain('green-bg');
  });

  test('should change background color to red', async () => {
    await homePage.changeBackgroundColor('red');
    const classes = await homePage.getBodyClasses();
    expect(classes).toContain('red-bg');
  });

  test('should show reset button only after color change', async () => {
    // Initially reset button should not be visible
    expect(await homePage.isResetButtonVisible()).toBe(false);

    // Change color and verify reset button appears
    await homePage.changeBackgroundColor('blue');
    expect(await homePage.isResetButtonVisible()).toBe(true);
  });

  test('should reset background color', async () => {
    // Set a color first
    await homePage.changeBackgroundColor('blue');
    expect(await homePage.getBodyClasses()).toContain('blue-bg');

    // Reset the color
    await homePage.changeBackgroundColor('reset');
    const classes = await homePage.getBodyClasses();
    expect(classes).not.toContain('blue-bg');
    expect(classes).not.toContain('green-bg');
    expect(classes).not.toContain('red-bg');
  });

  test('should remove previous color class when changing colors', async () => {
    // Set initial color
    await homePage.changeBackgroundColor('blue');
    expect(await homePage.getBodyClasses()).toContain('blue-bg');

    // Change to different color
    await homePage.changeBackgroundColor('green');
    const classes = await homePage.getBodyClasses();
    expect(classes).toContain('green-bg');
    expect(classes).not.toContain('blue-bg');
  });
});