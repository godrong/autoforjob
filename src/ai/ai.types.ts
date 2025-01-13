export interface IAiConfig {
  introduce: string;
  prompt: string;
}

export interface IAiFilter {
  result: boolean;
  message?: string;
}

export interface IAiResponse {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
    index: number;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface IAiError {
  code: string;
  message: string;
  type: string;
  param?: string;
}
