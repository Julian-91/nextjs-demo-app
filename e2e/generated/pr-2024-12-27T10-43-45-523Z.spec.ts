```typescript
import { test, expect } from '@playwright/test';

class BackgroundPage {
  constructor(private page) {}

  async goto() {
    await this.page.goto('/');
  }

  async changeBackgroundColor(color: 'blue' | 'green' | 'red' | '') {
    if (color === '') {
      await this.page.getByRole('button', { name: 'Reset Background' }).click();
    } else {
      await this.page.getByRole('button', { name: `Change to ${color.charAt(0).toUpperCase() + color.slice(1)}` }).click();
    }
  }

  async getBackgroundColor() {
    const bodyClasses = await this.page.evaluate(() => document.body.className);
    return bodyClasses.includes('blue-bg') ? 'blue' :
           bodyClasses.includes('green-bg') ? 'green' :
           bodyClasses.includes('red-bg') ? 'red' : '';
  }

  async isResetButtonVisible() {
    return await this.page.getByRole('button', { name: 'Reset Background' }).isVisible();
  }
}

test.describe('Background Color Changer', () => {
  let backgroundPage: BackgroundPage;

  test.beforeEach(async ({ page }) => {
    backgroundPage = new BackgroundPage(page);
    await backgroundPage.goto();
  });

  test('should change background colors correctly', async () => {
    // Initial state
    expect(await backgroundPage.getBackgroundColor()).toBe('');
    expect(await backgroundPage.isResetButtonVisible()).toBe(false);

    // Change to blue
    await backgroundPage.changeBackgroundColor('blue');
    expect(await backgroundPage.getBackgroundColor()).toBe('blue');
    expect(await backgroundPage.isResetButtonVisible()).toBe(true);

    // Change to green
    await backgroundPage.changeBackgroundColor('green');
    expect(await backgroundPage.getBackgroundColor()).toBe('green');
    expect(await backgroundPage.isResetButtonVisible()).toBe(true);

    // Change to red
    await backgroundPage.changeBackgroundColor('red');
    expect(await backgroundPage.getBackgroundColor()).toBe('red');
    expect(await backgroundPage.isResetButtonVisible()).toBe(true);

    // Reset background
    await backgroundPage.changeBackgroundColor('');
    expect(await backgroundPage.getBackgroundColor()).toBe('');
    expect(await backgroundPage.isResetButtonVisible()).toBe(false);
  });

  test('should handle multiple color changes', async () => {
    await backgroundPage.changeBackgroundColor('blue');
    expect(await backgroundPage.getBackgroundColor()).toBe('blue');

    await backgroundPage.changeBackgroundColor('red');
    expect(await backgroundPage.getBackgroundColor()).toBe('red');

    await backgroundPage.changeBackgroundColor('green');
    expect(await backgroundPage.getBackgroundColor()).toBe('green');
  });

  test('should remove reset button when background is cleared', async () => {
    await backgroundPage.changeBackgroundColor('red');
    expect(await backgroundPage.isResetButtonVisible()).toBe(true);

    await backgroundPage.changeBackgroundColor('');
    expect(await backgroundPage.isResetButtonVisible()).toBe(false);
  });
});
```