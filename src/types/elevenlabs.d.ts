declare module 'elevenlabs-node' {
  export class ElevenLabs {
    constructor(apiKey: string);
    voices: {
      getAll(): Promise<any[]>;
    };
    textToSpeech: {
      convert(voiceId: string, text: string, options?: any): Promise<Buffer>;
    };
  }
}
