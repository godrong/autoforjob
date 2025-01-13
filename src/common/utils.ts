export class JobUtils {
  // 语义匹配功能
  static semanticMatch(patterns: string[], content: string): string | null {
    for (const pattern of patterns) {
      if (!pattern) continue;
      // 排除"不xx"或"无xx"的否定词
      const re = new RegExp(`(?<!(不|无).{0,5})${pattern}(?!系统|软件|工具|服务)`);
      if (re.test(content)) {
        return pattern;
      }
    }
    return null;
  }

  // HR活跃度检查
  static isHrActive(activeText: string): boolean {
    return !(activeText.includes("月") || activeText.includes("年"));
  }

  // 随机延迟
  static getRandomDelay(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // URL参数解析
  static parseJobUrl(url: string): {
    securityId: string;
    jobId: string;
    lid: string;
  } {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/');
    return {
      jobId: pathSegments[2].replace('.html', ''),
      securityId: urlObj.searchParams.get('securityId') || '',
      lid: urlObj.searchParams.get('lid') || ''
    };
  }
} 