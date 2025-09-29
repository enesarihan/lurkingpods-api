import { GoogleGenerativeAI } from '@google/generative-ai';

export interface PodcastScript {
  title: string;
  description: string;
  content: string;
  duration: number;
  speaker_1_voice_id: string;
  speaker_2_voice_id: string;
  quality_score: number;
}

export class GeminiService {
  private static genAI: GoogleGenerativeAI;

  static initialize(apiKey: string): void {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  static isInitialized(): boolean {
    return !!this.genAI;
  }

  static async generatePodcastScript(categoryId: string, language: 'en' | 'tr'): Promise<PodcastScript> {
    if (!this.genAI) {
      throw new Error('Gemini service not initialized');
    }

    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const categoryName = this.getCategoryName(categoryId);
    const languageCode = language === 'en' ? 'English' : 'Turkish';

    const prompt = this.buildPrompt(categoryName, languageCode);

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseScriptResponse(text, language);
    } catch (error) {
      throw new Error(`Failed to generate script: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static getCategoryName(categoryId: string): string {
    const categoryMap: Record<string, string> = {
      'sports': 'Sports',
      'finance': 'Finance',
      'current_affairs': 'Current Affairs',
      'technology': 'Technology',
      'entertainment': 'Entertainment',
      'health': 'Health',
    };

    return categoryMap[categoryId] || 'General';
  }

  private static buildPrompt(categoryName: string, languageCode: string): string {
    return `
Generate a 60-second dialogue podcast script about ${categoryName} in ${languageCode}.

Requirements:
- Two distinct speakers with different personalities
- Engaging conversation about current ${categoryName} topics
- Natural dialogue flow
- Approximately 60 seconds of speaking time
- Include speaker indicators (Speaker 1:, Speaker 2:)
- Make it informative and entertaining

Format the response as JSON with these fields:
{
  "title": "Podcast title",
  "description": "Brief description",
  "content": "Full script with speaker indicators",
  "duration": 60,
  "speaker_1_voice_id": "voice_id_1",
  "speaker_2_voice_id": "voice_id_2",
  "quality_score": 0.8
}

Generate the script now:
    `.trim();
  }

  private static parseScriptResponse(text: string, language: 'en' | 'tr'): PodcastScript {
    try {
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const scriptData = JSON.parse(jsonMatch[0]);

      // Validate required fields
      if (!scriptData.title || !scriptData.content) {
        throw new Error('Invalid script format');
      }

      return {
        title: scriptData.title,
        description: scriptData.description || '',
        content: scriptData.content,
        duration: scriptData.duration || 60,
        speaker_1_voice_id: scriptData.speaker_1_voice_id || 'voice_1',
        speaker_2_voice_id: scriptData.speaker_2_voice_id || 'voice_2',
        quality_score: scriptData.quality_score || 0.8,
      };
    } catch (error) {
      throw new Error(`Failed to parse script response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
