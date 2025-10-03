/// <reference path="../types/elevenlabs.d.ts" />
// Switch to REST API per ElevenLabs model guidance

export interface AudioGenerationResult {
  audioUrl: string;
  duration: number;
  quality: number;
}

export class ElevenLabsService {
  static initialize(_apiKey: string): void {}

  static isInitialized(): boolean {
    return true;
  }

  static async generatePodcastAudio(script: string, language: 'en' | 'tr'): Promise<string> {
    // Using REST API; no client required

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

  // Returns combined audio as Buffer for external upload (e.g., Supabase Storage)
  static async generatePodcastAudioBuffer(script: string, language: 'en' | 'tr'): Promise<Buffer> {
    // Using REST API; no client required

    try {
      const segments = this.parseScriptSegments(script);
      const audioSegments: Buffer[] = [];

      for (const segment of segments) {
        const audioBuffer = await this.generateSegmentAudio(segment.text, segment.speaker, language);
        audioSegments.push(audioBuffer);
      }

      const combinedAudio = this.combineAudioSegments(audioSegments);
      return combinedAudio;
    } catch (error) {
      throw new Error(`Failed to generate audio buffer: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error('ElevenLabs API key missing');
    }
    try {
      const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          // Per docs: prefer eleven_v3 (alpha) or flash v2.5
          // https://elevenlabs.io/docs/models#eleven-v3-alpha
          model_id: 'eleven_v3',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      });
      if (!resp.ok) {
        const errTxt = await resp.text().catch(() => '');
        throw new Error(`HTTP ${resp.status} ${resp.statusText} ${errTxt}`);
      }
      const arrayBuffer = await resp.arrayBuffer();
      return Buffer.from(arrayBuffer);
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

  static async getAvailableVoices(_language: 'en' | 'tr'): Promise<Array<{ id: string; name: string; language: string }>> {
    return [];
  }

  static async validateVoiceId(_voiceId: string): Promise<boolean> {
    return true;
  }
}
