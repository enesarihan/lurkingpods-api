export interface Podcast {
  id: string;
  category_id: string;
  language: 'en' | 'tr';
  title: string;
  description: string;
  script_content: string;
  audio_file_url: string;
  audio_duration: number;
  speaker_1_voice_id: string;
  speaker_2_voice_id: string;
  generation_date: Date;
  created_at: Date;
  expires_at: Date;
  quality_score: number;
  play_count: number;
  is_featured: boolean;
}

export interface CreatePodcastData {
  category_id: string;
  language: 'en' | 'tr';
  title: string;
  description: string;
  script_content: string;
  audio_file_url: string;
  audio_duration: number;
  speaker_1_voice_id: string;
  speaker_2_voice_id: string;
  quality_score: number;
}

export interface UpdatePodcastData {
  play_count?: number;
  is_featured?: boolean;
}

export class PodcastModel {
  static validateTitle(title: string): boolean {
    return title.length >= 3 && title.length <= 100;
  }

  static validateScriptContent(script: string): boolean {
    return script.length >= 100 && script.length <= 5000;
  }

  static validateAudioDuration(duration: number): boolean {
    return duration >= 45 && duration <= 75;
  }

  static validateQualityScore(score: number): boolean {
    return score >= 0.0 && score <= 1.0;
  }

  static createExpirationDate(): Date {
    const now = new Date();
    return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
  }

  static isExpired(podcast: Podcast): boolean {
    return new Date() > podcast.expires_at;
  }

  static incrementPlayCount(podcast: Podcast): Podcast {
    return {
      ...podcast,
      play_count: podcast.play_count + 1,
    };
  }
}
