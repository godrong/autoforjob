export class RetryHandler {
  static async withRetry<T>(
    operation: () => Promise<T>,
    {
      retries = 3,
      delay = 1000,
      onRetry = (error: Error, attempt: number) => void 0
    } = {}
  ): Promise<T> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === retries) throw error;
        
        const waitTime = delay * Math.pow(2, attempt - 1);
        onRetry(error, attempt);
        await new Promise(r => setTimeout(r, waitTime));
      }
    }
    throw new Error('Retry failed');
  }
} 