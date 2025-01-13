import { WebElement, By } from 'selenium-webdriver';
import { IJob } from './boss.types';

export class BossDOMHelper {
  static async getJobInfo(jobCard: WebElement): Promise<IJob> {
    const jobTitle = await jobCard.findElement(By.css('.job-title')).getText();
    const companyName = await jobCard.findElement(By.css('.company-name')).getText();
    const salary = await jobCard.findElement(By.css('.salary')).getText();
    const jobLink = await jobCard.findElement(By.css('.job-card-left')).getAttribute('href');
    
    return {
      href: jobLink,
      jobName: jobTitle.replace('\n', ' '),
      companyName,
      salary: this.parseSalary(salary),
      // ... 其他字段
    };
  }

  static async isHeadhunter(jobCard: WebElement): Promise<boolean> {
    try {
      await jobCard.findElement(By.css('img.job-tag-icon'));
      return true;
    } catch {
      return false;
    }
  }

  static async isNotCommunicated(jobCard: WebElement): Promise<boolean> {
    const btnText = await jobCard.findElement(By.css('.start-chat-btn')).getText();
    return btnText.includes('立即沟通');
  }

  static getUniqueKey(job: IJob): string {
    return `${job.jobName}--${job.companyName}`;
  }
} 