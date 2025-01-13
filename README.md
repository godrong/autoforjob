# AI智能投递助手

一个基于Node.js和OpenAI的智能简历投递系统，支持多平台自动化投递并使用AI进行职位匹配分析。

## 特性

- 🤖 AI驱动的职位匹配
  - 智能分析职位描述与个人经历的匹配度
  - 自动生成个性化的打招呼语
  - 基于GPT的职位筛选

- 🚀 多平台支持
  - Boss直聘
  - 猎聘网


- 🛠 智能化功能
  - 自动登录与Cookie管理
  - 智能简历投递
  - 职位黑名单过滤
  - HR活跃度检测
  - 薪资范围匹配
  - 投递进度跟踪

## 环境要求

- Node.js >= 16
- Chrome浏览器
- OpenAI API Key

## 快速开始

1. 克隆项目
```bash
git clone https://github.com/yourusername/get_jobs-dev.git
cd get_jobs-dev
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
cp .env.example .env
# 编辑.env文件，填入你的OpenAI API Key和其他配置
```

4. 修改配置文件
```bash
# 编辑 config/default.yaml
# 配置你的求职意向和筛选条件
```

5. 运行程序
```bash
npm start
```

## 配置说明

### Boss直聘配置
```yaml
boss:
  keywords: ["Java", "Python", "大模型"]  # 搜索关键词
  cityCode: ["上海"]                      # 目标城市
  experience: ["3-5年"]                   # 工作经验要求
  salary: "20-50K"                       # 期望薪资范围
  degree: ["本科", "硕士"]                # 学历要求
  enableAI: true                         # 是否启用AI分析
```

### AI配置
```yaml
ai:
  introduce: "你的个人介绍"              # 个人技能介绍
  prompt: "AI分析模板"                   # AI分析提示词
```

## 项目结构

```
get_jobs-dev/
├── src/
│   ├── ai/                 # AI服务相关
│   ├── platforms/          # 各招聘平台实现
│   ├── common/            # 通用工具和服务
│   └── main.ts            # 入口文件
├── config/                # 配置文件
├── data/                 # 数据存储
└── tests/               # 测试文件
```

## 注意事项

1. 请合理设置投递频率，避免被平台封禁
2. 首次使用需要手动扫码登录
3. 建议使用企业微信机器人接收投递通知
4. 如遇到验证码，程序会自动暂停等待手动处理

## 贡献指南

欢迎提交Issue和Pull Request，一起改进项目。

## 免责声明

本项目仅供学习交流使用，请勿用于商业用途。使用本项目造成的任何问题，均与作者无关。

## License

Apache License 2.0