import { ElevenLabs } from 'elevenlabs-node';

const apiKey = process.env.ELEVENLABS_API_KEY || '';

if (!apiKey) {
  throw new Error('Missing ElevenLabs API key');
}

export const elevenLabs = new ElevenLabs({
  apiKey: apiKey,
});

export default elevenLabs;
