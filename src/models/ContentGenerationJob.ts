export interface ContentGenerationJob {
  id: string;
  category_id: string;
  language: 'en' | 'tr';
  status: 'pending' | 'generating' | 'completed' | 'failed';
  started_at: Date;
  completed_at: Date | null;
  error_message: string | null;
  retry_count: number;
  max_retries: number;
  generated_podcast_id: string | null;
  created_at: Date;
}

export interface CreateContentGenerationJobData {
  category_id: string;
  language: 'en' | 'tr';
  max_retries?: number;
}

export interface UpdateContentGenerationJobData {
  status?: 'pending' | 'generating' | 'completed' | 'failed';
  started_at?: Date;
  completed_at?: Date | null;
  error_message?: string | null;
  retry_count?: number;
  generated_podcast_id?: string | null;
}

export class ContentGenerationJobModel {
  static validateRetryCount(retryCount: number, maxRetries: number): boolean {
    return retryCount <= maxRetries;
  }

  static validateStatusTransition(currentStatus: string, newStatus: string): boolean {
    const validTransitions: Record<string, string[]> = {
      'pending': ['generating', 'failed'],
      'generating': ['completed', 'failed'],
      'completed': [],
      'failed': ['pending'], // Allow retry
    };
    
    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  static isPending(job: ContentGenerationJob): boolean {
    return job.status === 'pending';
  }

  static isGenerating(job: ContentGenerationJob): boolean {
    return job.status === 'generating';
  }

  static isCompleted(job: ContentGenerationJob): boolean {
    return job.status === 'completed';
  }

  static isFailed(job: ContentGenerationJob): boolean {
    return job.status === 'failed';
  }

  static canRetry(job: ContentGenerationJob): boolean {
    return job.status === 'failed' && job.retry_count < job.max_retries;
  }

  static markAsStarted(job: ContentGenerationJob): ContentGenerationJob {
    return {
      ...job,
      status: 'generating',
      started_at: new Date(),
    };
  }

  static markAsCompleted(job: ContentGenerationJob, podcastId: string): ContentGenerationJob {
    return {
      ...job,
      status: 'completed',
      completed_at: new Date(),
      generated_podcast_id: podcastId,
    };
  }

  static markAsFailed(job: ContentGenerationJob, errorMessage: string): ContentGenerationJob {
    return {
      ...job,
      status: 'failed',
      completed_at: new Date(),
      error_message: errorMessage,
      retry_count: job.retry_count + 1,
    };
  }
}
