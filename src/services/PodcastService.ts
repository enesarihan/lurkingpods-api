import { supabase } from '../config/supabase';
import { Podcast, CreatePodcastData, UpdatePodcastData, PodcastModel } from '../models/Podcast';

export class PodcastService {
  static async createPodcast(podcastData: CreatePodcastData): Promise<Podcast> {
    // Validate input
    if (!PodcastModel.validateTitle(podcastData.title)) {
      throw new Error('Title must be between 3 and 100 characters');
    }
    
    if (!PodcastModel.validateScriptContent(podcastData.script_content)) {
      throw new Error('Script content must be between 100 and 5000 characters');
    }
    
    if (!PodcastModel.validateAudioDuration(podcastData.audio_duration)) {
      throw new Error('Audio duration must be between 45 and 75 seconds');
    }
    
    if (!PodcastModel.validateQualityScore(podcastData.quality_score)) {
      throw new Error('Quality score must be between 0.0 and 1.0');
    }

    const expires_at = PodcastModel.createExpirationDate();

    const { data, error } = await supabase
      .from('podcasts')
      .insert({
        ...podcastData,
        generation_date: new Date(),
        expires_at,
        play_count: 0,
        is_featured: false,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create podcast: ${error.message}`);
    }

    return data;
  }

  static async getPodcastById(id: string): Promise<Podcast | null> {
    const { data, error } = await supabase
      .from('podcasts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return null;
    }

    return data;
  }

  static async getPodcastsByCategory(categoryId: string, language?: 'en' | 'tr'): Promise<Podcast[]> {
    let query = supabase
      .from('podcasts')
      .select('*')
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false });

    if (language) {
      query = query.eq('language', language);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get podcasts: ${error.message}`);
    }

    return data || [];
  }

  static async getDailyMix(language: 'en' | 'tr'): Promise<Podcast[]> {
    const { data, error } = await supabase
      .from('podcasts')
      .select(`
        *,
        categories!inner(*)
      `)
      .eq('language', language)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(6);

    if (error) {
      throw new Error(`Failed to get daily mix: ${error.message}`);
    }

    return data || [];
  }

  static async updatePodcast(id: string, updateData: UpdatePodcastData): Promise<Podcast> {
    const { data, error } = await supabase
      .from('podcasts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update podcast: ${error.message}`);
    }

    return data;
  }

  static async incrementPlayCount(id: string): Promise<Podcast> {
    const podcast = await this.getPodcastById(id);
    
    if (!podcast) {
      throw new Error('Podcast not found');
    }

    const updatedPodcast = PodcastModel.incrementPlayCount(podcast);
    
    return await this.updatePodcast(id, {
      play_count: updatedPodcast.play_count,
    });
  }

  static async deleteExpiredPodcasts(): Promise<number> {
    const { data, error } = await supabase
      .from('podcasts')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select('id');

    if (error) {
      throw new Error(`Failed to delete expired podcasts: ${error.message}`);
    }

    return data?.length || 0;
  }

  static async getNextRefreshTime(): Promise<Date> {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    return tomorrow;
  }
}
