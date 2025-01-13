import { IJob } from './boss.types';
import { JobUtils } from '../../common/utils';
import { logger } from '../../common/logger';

export class JobFilter {
  static async filterJob(
    job: IJob, 
    config: IBossConfig
  ): Promise<boolean> {
    // 1. HR活跃度检查
    if (config.filterDeadHR && !JobUtils.isHrActive(job.recruiter)) {
      logger.info(`职位被过滤: ${job.jobName} - HR不活跃`);
      return false;
    }

    // 2. 猎头职位检查
    if (!config.enableHeadhunter && job.isHeadhunter) {
      logger.info(`职位被过滤: ${job.jobName} - 猎头发布`);
      return false;
    }

    // 3. 职位内容关键词过滤
    const mismatchKeyword = JobUtils.semanticMatch(
      config.blacklistKeywords,
      job.jobInfo
    );
    if (mismatchKeyword) {
      logger.info(`职位被过滤: ${job.jobName} - 包含关键词: ${mismatchKeyword}`);
      return false;
    }

    return true;
  }
} 