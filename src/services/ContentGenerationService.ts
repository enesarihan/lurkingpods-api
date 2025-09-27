import { supabase } from '../config/supabase';
import { ContentGenerationJob, CreateContentGenerationJobData, UpdateContentGenerationJobData, ContentGenerationJobModel } from '../models/ContentGenerationJob';
import { PodcastService } from './PodcastService';
import { GeminiService } from './GeminiService';
import { ElevenLabsService } from './ElevenLabsService';

export class ContentGenerationService {
  static async createJob(jobData: CreateContentGenerationJobData): Promise<ContentGenerationJob> {
    const { data, error } = await supabase
      .from('content_generation_jobs')
      .insert({
        ...jobData,
        status: 'pending',
        started_at: new Date(),
        completed_at: null,
        error_message: null,
        retry_count: 0,
        max_retries: jobData.max_retries || 3,
        generated_podcast_id: null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create job: ${error.message}`);
    }

    return data;
  }

  static async getJobById(id: string): Promise<ContentGenerationJob | null> {
    const { data, error } = await supabase
      .from('content_generation_jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return null;
    }

    return data;
  }

  static async getPendingJobs(): Promise<ContentGenerationJob[]> {
    const { data, error } = await supabase
      .from('content_generation_jobs')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to get pending jobs: ${error.message}`);
    }

    return data || [];
  }

  static async updateJob(id: string, updateData: UpdateContentGenerationJobData): Promise<ContentGenerationJob> {
    const { data, error } = await supabase
      .from('content_generation_jobs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update job: ${error.message}`);
    }

    return data;
  }

  static async markJobAsStarted(id: string): Promise<ContentGenerationJob> {
    const job = await this.getJobById(id);
    
    if (!job) {
      throw new Error('Job not found');
    }

    const updatedJob = ContentGenerationJobModel.markAsStarted(job);
    
    return await this.updateJob(id, {
      status: updatedJob.status,
      started_at: updatedJob.started_at,
    });
  }

  static async markJobAsCompleted(id: string, podcastId: string): Promise<ContentGenerationJob> {
    const job = await this.getJobById(id);
    
    if (!job) {
      throw new Error('Job not found');
    }

    const updatedJob = ContentGenerationJobModel.markAsCompleted(job, podcastId);
    
    return await this.updateJob(id, {
      status: updatedJob.status,
      completed_at: updatedJob.completed_at,
      generated_podcast_id: updatedJob.generated_podcast_id,
    });
  }

  static async markJobAsFailed(id: string, errorMessage: string): Promise<ContentGenerationJob> {
    const job = await this.getJobById(id);
    
    if (!job) {
      throw new Error('Job not found');
    }

    const updatedJob = ContentGenerationJobModel.markAsFailed(job, errorMessage);
    
    return await this.updateJob(id, {
      status: updatedJob.status,
      completed_at: updatedJob.completed_at,
      error_message: updatedJob.error_message,
      retry_count: updatedJob.retry_count,
    });
  }

  static async processJob(jobId: string): Promise<void> {
    const job = await this.getJobById(jobId);
    
    if (!job) {
      throw new Error('Job not found');
    }

    if (!ContentGenerationJobModel.validateStatusTransition(job.status, 'generating')) {
      throw new Error('Invalid status transition');
    }

    try {
      // Mark as started
      await this.markJobAsStarted(jobId);

      // Generate script using Gemini
      const script = await GeminiService.generatePodcastScript(
        job.category_id,
        job.language
      );

      // Generate audio using ElevenLabs
      const audioUrl = await ElevenLabsService.generatePodcastAudio(
        script.content,
        job.language
      );

      // Create podcast
      const podcast = await PodcastService.createPodcast({
        category_id: job.category_id,
        language: job.language,
        title: script.title,
        description: script.description,
        script_content: script.content,
        audio_file_url: audioUrl,
        audio_duration: script.duration,
        speaker_1_voice_id: script.speaker_1_voice_id,
        speaker_2_voice_id: script.speaker_2_voice_id,
        quality_score: script.quality_score,
      });

      // Mark job as completed
      await this.markJobAsCompleted(jobId, podcast.id);

    } catch (error) {
      await this.markJobAsFailed(jobId, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  static async retryFailedJob(jobId: string): Promise<void> {
    const job = await this.getJobById(jobId);
    
    if (!job) {
      throw new Error('Job not found');
    }

    if (!ContentGenerationJobModel.canRetry(job)) {
      throw new Error('Job cannot be retried');
    }

    // Reset job status to pending
    await this.updateJob(jobId, {
      status: 'pending',
      started_at: new Date(),
      completed_at: null,
      error_message: null,
    });

    // Process the job again
    await this.processJob(jobId);
  }
}
