/// <reference path="../types/elevenlabs.d.ts" />
import * as ElevenLabsNode from 'elevenlabs-node';

export interface AudioGenerationResult {
  audioUrl: string;
  duration: number;
  quality: number;
}

export class ElevenLabsService {
  private static client: any;

  static initialize(apiKey: string): void {
    // elevenlabs-node modülü doğrudan kullanılabilir, constructor yok
    this.client = ElevenLabsNode;
  }

  static isInitialized(): boolean {
    return !!this.client;
  }

  static async generatePodcastAudio(script: string, language: 'en' | 'tr'): Promise<string> {
    if (!this.client) {
      throw new Error('ElevenLabs service not initialized');
    }

    try {
      // Split script into speaker segments
      const segments = this.parseScriptSegments(script);
      
      // Generate audio for each segment
      const audioSegments: Buffer[] = [];
      
      for (const segment of segments) {
        const audioBuffer = await this.generateSegmentAudio(segment.text, segment.speaker, language);
        audioSegments.push(audioBuffer);
      }

      // Combine audio segments
      const combinedAudio = this.combineAudioSegments(audioSegments);
      
      // Upload to CDN (placeholder - would use actual CDN service)
      const audioUrl = await this.uploadToCDN(combinedAudio);
      
      return audioUrl;
    } catch (error) {
      throw new Error(`Failed to generate audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static parseScriptSegments(script: string): Array<{ text: string; speaker: number }> {
    const segments: Array<{ text: string; speaker: number }> = [];
    const lines = script.split('\n').filter(line => line.trim());

    for (const line of lines) {
      if (line.startsWith('Speaker 1:')) {
        segments.push({
          text: line.replace('Speaker 1:', '').trim(),
          speaker: 1,
        });
      } else if (line.startsWith('Speaker 2:')) {
        segments.push({
          text: line.replace('Speaker 2:', '').trim(),
          speaker: 2,
        });
      }
    }

    return segments;
  }

  private static async generateSegmentAudio(text: string, speaker: number, language: 'en' | 'tr'): Promise<Buffer> {
    const voiceId = this.getVoiceId(speaker, language);
    
    try {
      const audioBuffer = await this.client.textToSpeech.convert(voiceId, text, {
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      });

      return audioBuffer;
    } catch (error) {
      throw new Error(`Failed to generate segment audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static getVoiceId(speaker: number, language: 'en' | 'tr'): string {
    const voiceMap: Record<string, Record<number, string>> = {
      en: {
        1: 'voice_1_en',
        2: 'voice_2_en',
      },
      tr: {
        1: 'voice_1_tr',
        2: 'voice_2_tr',
      },
    };

    return voiceMap[language]?.[speaker] || 'default_voice';
  }

  private static combineAudioSegments(segments: Buffer[]): Buffer {
    // Placeholder implementation - would use actual audio processing library
    // For now, return the first segment as a placeholder
    return segments[0] || Buffer.alloc(0);
  }

  private static async uploadToCDN(audioBuffer: Buffer): Promise<string> {
    // Placeholder implementation - would use actual CDN service
    // For now, return a mock URL
    const timestamp = Date.now();
    return `https://cdn.lurkingpods.com/audio/${timestamp}.mp3`;
  }

  static async getAvailableVoices(language: 'en' | 'tr'): Promise<Array<{ id: string; name: string; language: string }>> {
    if (!this.client) {
      throw new Error('ElevenLabs service not initialized');
    }

    try {
      const voices = await this.client.voices.getAll();
      
      return voices
        .filter((voice: any) => voice.labels?.language === language)
        .map((voice: any) => ({
          id: voice.voice_id,
          name: voice.name,
          language: voice.labels?.language || 'unknown',
        }));
    } catch (error) {
      throw new Error(`Failed to get voices: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async validateVoiceId(voiceId: string): Promise<boolean> {
    if (!this.client) {
      throw new Error('ElevenLabs service not initialized');
    }

    try {
      const voices = await this.client.voices.getAll();
      const voice = voices.find((v: any) => v.voice_id === voiceId);
      return !!voice;
    } catch (error) {
      return false;
    }
  }
}
