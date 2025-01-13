import path from 'path';

// 文件路径配置
export const BOSS_PATHS = {
  DATA_FILE: path.resolve(process.cwd(), 'data', 'boss', 'data.json'),
  COOKIE_FILE: path.resolve(process.cwd(), 'data', 'boss', 'cookie.json'),
  CONFIG_FILE: path.resolve(process.cwd(), 'config', 'default.yaml')
};

// Boss直聘默认配置
export const BOSS_DEFAULTS = {
  keywords: ['Java', 'Python', 'Golang', '大模型'],
  cityCode: ['上海'],
  experience: ['不限'],
  jobType: '不限',
  salary: '20-50K',
  degree: ['不限'],
  scale: ['不限'],
  stage: ['不限'],
  expectedSalary: [20],
  filterDeadHR: true,
  enableAI: true,
  sayHi: "您好,我有7年工作经验,还有AIGC大模型、Java,Python,Golang和运维的相关经验,希望应聘这个岗位,期待可以与您进一步沟通,谢谢！"
};

// AI配置默认值
export const AI_DEFAULTS = {
  introduce: `我熟练使用Spring Boot、Spring Cloud、Alibaba Cloud及其生态体系，
擅长MySQL、Oracle、PostgreSQL等关系型数据库以及MongoDB、Redis等非关系型数据库。
熟悉Docker、Kubernetes等容器化技术，掌握WebSocket、Netty等通信协议，
拥有即时通讯系统的开发经验。熟练使用MyBatis-Plus、Spring Data、Django ORM等ORM框架，
熟练使用Python、Golang开发，具备机器学习、深度学习及大语言模型的开发与部署经验。
此外，我熟悉前端开发，涉及Vue、React、Nginx配置及PHP框架应用`,

  prompt: `我目前在找工作,{introduce},我期望的的岗位方向是【{keyword}】,
目前我需要投递的岗位名称是【{jobName}】,这个岗位的要求是【{jd}】,
如果这个岗位和我的期望与经历基本符合，注意是基本符合，那么请帮我写一个给HR打招呼的文本发给我，
如果这个岗位和我的期望经历完全不相干，直接返回false给我，
注意只要返回我需要的内容即可，不要有其他的语气助词，重点要突出我和岗位的匹配度以及我的优势`
};
