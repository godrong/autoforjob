import { WebDriver, until, By } from 'selenium-webdriver';
import { logger } from './logger';

export class WebDriverUtils {
  static async waitAndClick(driver: WebDriver, selector: string, timeout = 10000) {
    try {
      const element = await driver.wait(until.elementLocated(By.css(selector)), timeout);
      await element.click();
    } catch (error) {
      logger.error(`Failed to click element: ${selector}`, error);
      throw error;
    }
  }

  static async waitForElement(driver: WebDriver, selector: string, timeout = 10000) {
    return await driver.wait(until.elementLocated(By.css(selector)), timeout);
  }
}