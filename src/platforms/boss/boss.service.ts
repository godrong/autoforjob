import { Builder, By, until, WebDriver, WebElement } from 'selenium-webdriver';
import { IBossConfig, IJob } from './boss.types';
import { AiService } from '../../ai/ai.service';
import { logger } from '../../common/logger';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { BOSS_PATHS } from './boss.config';

export class BossService {
  private driver!: WebDriver;
  private config: IBossConfig;
  private aiService: AiService;
  private blackCompanies: Set<string> = new Set();
  private blackRecruiters: Set<string> = new Set();
  private blackJobs: Set<string> = new Set();
  private resultList: IJob[] = [];
  private readonly deadStatus = ['半年前活跃'];
  private noJobPages = 0;
  private lastSize = -1;
  private readonly noJobMaxPages = 5;
  private readonly dataPath = BOSS_PATHS.DATA_FILE;
  private readonly cookiePath = BOSS_PATHS.COOKIE_FILE;

  constructor(config: IBossConfig, aiService: AiService) {
    this.config = config;
    this.aiService = aiService;
  }

  async init(): Promise<void> {
    this.driver = await new Builder().forBrowser('chrome').build();
    await this.loadBlacklists();
  }

  private async loadBlacklists(): Promise<void> {
    try {
      const data = await readFile(this.dataPath, 'utf8');
      const json = JSON.parse(data);
      this.blackCompanies = new Set(json.blackCompanies);
      this.blackRecruiters = new Set(json.blackRecruiters);
      this.blackJobs = new Set(json.blackJobs);
    } catch (error) {
      logger.error('Failed to load blacklists:', error);
    }
  }

  async login(): Promise<void> {
    try {
      await this.driver.get('https://www.zhipin.com/web/geek/guide');
      
      const cookies = await this.loadCookies();
      if (cookies) {
        for (const cookie of cookies) {
          await this.driver.manage().addCookie(cookie);
        }
        await this.driver.navigate().refresh();
        
        const isLoggedIn = await this.checkLoginStatus();
        if (isLoggedIn) {
          logger.info('Cookie登录成功');
          return;
        }
        
        logger.info('Cookie已失效，切换到扫码登录');
        await this.scanLogin();
      } else {
        await this.scanLogin();
      }
    } catch (error) {
      logger.error('Login failed:', error);
      throw error;
    }
  }

  private async loadCookies(): Promise<any> {
    try {
      const data = await readFile(this.cookiePath, 'utf8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  private async retry<T>(
    fn: () => Promise<T>, 
    retries = 3, 
    delay = 1000
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.retry(fn, retries - 1, delay * 2);
      }
      throw error;
    }
  }

  private async checkLoginStatus(): Promise<boolean> {
    try {
      const loginIndicators = [
        '.user-nav',
        '.header-login-btn',
        '.geek-avatar',
        '.user-menu',
        '[class*="user"]',
        '.geek-info'
      ];

      for (const selector of loginIndicators) {
        try {
          await this.driver.wait(
            until.elementLocated(By.css(selector)),
            3000
          );
          return true;
        } catch {
          continue;
        }
      }

      const currentUrl = await this.driver.getCurrentUrl();
      if (currentUrl.includes('geek/recommend') || 
          currentUrl.includes('geek/job')) {
        return true;
      }

      const isLoggedInScript = `
        return !!(
          localStorage.getItem('token') || 
          sessionStorage.getItem('token') ||
          document.cookie.includes('token')
        )
      `;
      const hasToken = await this.driver.executeScript(isLoggedInScript);
      if (hasToken) {
        return true;
      }

      return false;
    } catch (error) {
      logger.warn('检查登录状态时发生错误:', error);
      return false;
    }
  }

  private async scanLogin(): Promise<void> {
    await this.retry(async () => {
      try {
        if (await this.checkLoginStatus()) {
          logger.info('已经处于登录状态');
          return;
        }

        await this.driver.wait(
          until.elementLocated(By.css('.login-entry-page,.login-register-content,.scan-login')), 
          10000
        );

        const qrLoginTab = await this.driver.findElement(
          By.css('.btn-sign-switch,.phone-switch')
        );
        await qrLoginTab.click();
        await this.randomDelay(1000, 2000);

        const qrCode = await this.driver.wait(
          until.elementLocated(By.css('.qr-code-box,.qr-img-box img')),
          10000
        );

        logger.info('请使用Boss直聘APP扫描二维码登录...');
        
        await this.driver.wait(
          until.elementLocated(By.css('.user-nav,.header-login-btn')),
          300000
        );

        await this.saveCookies();
        logger.info('登录成功并保存cookie');

      } catch (error) {
        logger.error('扫码登录失败:', error);
        throw error;
      }
    }, 3, 2000);
  }

  private buildSearchUrl(cityCode: string): string {
    const baseUrl = 'https://www.zhipin.com/web/geek/job?';
    const params = new URLSearchParams({
      city: cityCode,
      experience: this.config.experience.join(','),
      salary: this.config.salary,
      degree: this.config.degree.join(','),
      scale: this.config.scale.join(','),
      stage: this.config.stage.join(','),
      jobType: this.config.jobType
    });
    return `${baseUrl}${params.toString()}`;
  }

  private async parseJobCard(jobCard: WebElement): Promise<IJob> {
    try {
      await this.driver.wait(
        until.stalenessOf(jobCard),
        1000
      ).catch(() => {});
      
      const jobLink = await jobCard.findElement(By.css('.job-card-left'));
      const href = await jobLink.getAttribute('href');
      const jobName = await jobCard.findElement(By.css('.job-name')).getText();
      const salary = await jobCard.findElement(By.css('.salary')).getText();
      const jobArea = await jobCard.findElement(By.css('.job-area')).getText();
      
      const companyCard = await jobCard.findElement(By.css('.company-info'));
      const companyName = await companyCard.findElement(By.css('.company-name')).getText();
      const companyTag = await companyCard.findElement(By.css('.company-tag-list')).getText();
      
      let recruiter = '';
      try {
        const jobInfo = await jobCard.findElement(By.css('.job-info'));
        
        const recruiterElement = await jobInfo.findElement(By.css('.info-public'));
        
        recruiter = await recruiterElement.getText();
        recruiter = recruiter.replace(/hr/i, '').trim();
        
      } catch (e) {
        logger.warn('获取招聘者信息失败，尝试备选方案');
        
        const selectors = [
          '.job-info .info-public',
          '.info-public',
          '.job-card-footer .name',
          '[class*="boss-name"]'
        ];

        for (const selector of selectors) {
          try {
            const element = await jobCard.findElement(By.css(selector));
            recruiter = await element.getText();
            if (recruiter) {
              recruiter = recruiter.replace(/hr/i, '').trim();
              break;
            }
          } catch {
            continue;
          }
        }
      }

      if (!recruiter) {
        logger.warn(`无法获取招聘者信息，职位：${jobName}`);
        recruiter = '未知招聘者';
      }

      return {
        href,
        jobName,
        jobArea,
        salary,
        companyName,
        companyTag,
        recruiter,
        jobInfo: '',
        companyInfo: ''
      };
    } catch (error) {
      logger.error('解析职位卡片失败:', error);
      throw error;
    }
  }

  private async isValidJob(job: IJob, keyword: string): Promise<boolean> {
    try {
      if (this.blackCompanies.has(job.companyName) ||
          this.blackRecruiters.has(job.recruiter) ||
          Array.from(this.blackJobs).some((blackJob: string) => job.jobName.includes(blackJob))) {
        return false;
      }

      if (this.config.filterDeadHR && this.deadStatus.some(status => job.recruiter.includes(status))) {
        return false;
      }

      if (this.config.expectedSalary.length === 2) {
        const [min, max] = job.salary.match(/\d+/g)?.map(Number) || [0, 0];
        if (min < this.config.expectedSalary[0] || max > this.config.expectedSalary[1]) {
          return false;
        }
      }

      if (this.config.enableAI) {
        try {
          const aiResult = await this.aiService.sendRequest(
            `关键词: ${keyword}\n职位: ${job.jobName}\n描述: ${job.jobInfo}`
          );
          return !aiResult.includes('false');
        } catch (error) {
          logger.warn('AI 服务调用失败，使用基础匹配规则:', error);
          
          const basicMatch = job.jobName.toLowerCase().includes(keyword.toLowerCase()) ||
                           job.jobInfo.toLowerCase().includes(keyword.toLowerCase());
          return basicMatch;
        }
      }

      return true;
    } catch (error) {
      logger.error('职位验证失败:', error);
      return true;
    }
  }

  private async resumeSubmission(url: string, keyword: string): Promise<number> {
    try {
      await this.driver.get(url);
      await this.checkVerify();
      await this.waitForElement('.job-list-box');
      
      const jobCards = await this.driver.findElements(By.css('.job-card-wrapper'));
      logger.info(`找到 ${jobCards.length} 个职位`);

      for (const jobCard of jobCards) {
        try {
          const job = await this.retry(
            async () => await this.parseJobCard(jobCard),
            3,
            1000
          );
          
        //   if (!await this.isValidJob(job, keyword)) {
        //     continue;
        //   }

          await this.submitResume(job);
          this.resultList.push(job);
          
        } catch (error) {
          logger.error('处理职位卡片失败:', error);
          continue;
        }
      }

      return this.resultList.length;
    } catch (error) {
      logger.error('职位列表获取失败:', error);
      return -1;
    }
  }

  private async submitResume(job: IJob): Promise<void> {
    try {
      await this.driver.get(job.href);
      await this.checkVerify();
      await this.randomDelay();
      
      const button = await this.waitForClickable('.btn-container .btn-apply');
      await button.click();
      
      logger.info(`投递成功: ${job.companyName} - ${job.jobName}`);
      await this.randomDelay();
    } catch (error) {
      logger.error(`投递失败 ${job.companyName} - ${job.jobName}:`, error);
    }
  }

  async cleanup(): Promise<void> {
    try {
      this.printResult();
      if (this.driver) {
        await this.driver.quit();
      }
    } catch (error) {
      logger.error('Cleanup failed:', error);
    }
  }

  async postJobs(): Promise<void> {
    try {
      await this.login();
      logger.info('登录成功，开始搜索职位...');

      for (const cityCode of this.config.cityCode) {
        for (const keyword of this.config.keywords) {
          let page = 1;
          this.noJobPages = 0;
          this.lastSize = -1;

          while (page <= this.noJobMaxPages) {
            const searchUrl = this.buildSearchUrl(cityCode);
            const url = `${searchUrl}&query=${encodeURIComponent(keyword)}&page=${page}`;
            
            logger.info(`正在搜索: ${keyword} - 第${page}页`);
            
            const resultSize = await this.resumeSubmission(url, keyword);

            
            if (resultSize === -1) {
              logger.warn('今日投递已达上限，结束搜索');
            //   return;
            }

            if (resultSize === this.lastSize) {
              this.noJobPages++;
              if (this.noJobPages >= this.noJobMaxPages) {
                logger.info(`连续${this.noJobMaxPages}页无新职位，切换关键词`);
                break;
              }
            } else {
              this.noJobPages = 0;
            }

            this.lastSize = resultSize;
            page++;
            
            await this.randomDelay();
          }
        }
      }
    } catch (error) {
      logger.error('职位投递失败:', error);
    } finally {
      await this.cleanup();
    }
  }

  private async checkVerify(): Promise<void> {
    try {
      const verifyElement = await this.driver.findElement(By.css('.waf-nc-title'));
      const verifyText = await verifyElement.getText();
      if (verifyText.includes('验证')) {
        logger.error('出现访问验证了！程序退出...');
        await this.cleanup();
        process.exit(1);
      }
    } catch {
      logger.info('未出现访问验证，继续运行...');
    }
  }

  private async saveCookies(): Promise<void> {
    try {
      const cookies = await this.driver.manage().getCookies();
      await writeFile(this.cookiePath, JSON.stringify(cookies));
      logger.info('Cookies saved successfully');
    } catch (error) {
      logger.error('Failed to save cookies:', error);
    }
  }

  private async waitForElement(selector: string, timeout = 10000): Promise<WebElement> {
    return await this.driver.wait(until.elementLocated(By.css(selector)), timeout);
  }

  private async waitForClickable(selector: string, timeout = 10000): Promise<WebElement> {
    const element = await this.waitForElement(selector, timeout);
    return await this.driver.wait(until.elementIsEnabled(element), timeout);
  }

  private async randomDelay(min = 1000, max = 3000): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1) + min);
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  private printResult(): void {
    logger.info('=== 投递结果统计 ===');
    logger.info(`总投递数量: ${this.resultList.length}`);
    logger.info('投递详情:');
    this.resultList.forEach((job, index) => {
      logger.info(`${index + 1}. ${job.companyName} - ${job.jobName}`);
    });
  }

  private async debugPage(message: string): Promise<void> {
    try {
      const html = await this.driver.getPageSource();
      const screenshot = await this.driver.takeScreenshot();
      
      logger.debug({
        message,
        html,
        screenshot,
        url: await this.driver.getCurrentUrl()
      });
    } catch (error) {
      logger.error('调试信息获取失败:', error);
    }
  }

  private async handleWindowSwitch<T>(action: () => Promise<T>): Promise<T> {
    const originalWindow = await this.driver.getWindowHandle();
    try {
      return await action();
    } finally {
      try {
        const handles = await this.driver.getAllWindowHandles();
        if (handles.includes(originalWindow)) {
          await this.driver.switchTo().window(originalWindow);
        }
      } catch (error) {
        logger.error('切换窗口失败:', error);
      }
    }
  }
}