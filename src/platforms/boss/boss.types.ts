export interface IBossConfig {
  keywords: string[];
  cityCode: string[];
  jobType: string;
  salary: string;
  experience: string[];
  degree: string[];
  scale: string[];
  stage: string[];
  enableAI: boolean;
  filterDeadHR: boolean;
  expectedSalary: number[];
}

export interface IJob {
  href: string;
  jobName: string;
  jobArea: string;
  jobInfo: string;
  salary: string;
  companyTag: string;
  recruiter: string;
  companyName: string;
  companyInfo: string;
}
