import express from 'express';
import { PodcastService } from '../services/PodcastService';
import { CategoryService } from '../services/CategoryService';
import { GeminiService } from '../services/GeminiService';
import { ElevenLabsService } from '../services/ElevenLabsService';
import supabase from '../config/supabase';

const router = express.Router();

// GET /content/daily-mix
router.get('/daily-mix', async (req, res) => {
  try {
    const { language = 'en' } = req.query;

    if (language !== 'en' && language !== 'tr') {
      return res.status(400).json({
        error: 'Invalid language. Must be "en" or "tr"',
      });
    }

    const podcasts = await PodcastService.getDailyMix(language as 'en' | 'tr');
    const nextUpdate = await PodcastService.getNextRefreshTime();

    res.json({
      podcasts: podcasts.map(podcast => ({
        id: podcast.id,
        title: podcast.title,
        description: podcast.description,
        audio_file_url: podcast.audio_file_url,
        audio_duration: podcast.audio_duration,
        category_id: podcast.category_id,
        language: podcast.language,
        created_at: podcast.created_at,
        play_count: podcast.play_count,
        is_featured: podcast.is_featured,
      })),
      next_update: nextUpdate,
      total_count: podcasts.length,
    });
  } catch (error) {
    console.error('Get daily mix error:', error);
    res.status(500).json({
      error: 'Failed to get daily mix',
    });
  }
});

// POST /content/generate-today (TR) → Generate news podcast and upload audio to Supabase Storage
router.post('/generate-today', async (req, res) => {
  try {
    const language: 'en' | 'tr' = 'tr';
    // Resolve category UUID by slug/name
    const categorySlug = 'current_affairs';
    let { data: catRow, error: catErr } = await (supabase as any)
      .from('categories')
      .select('id')
      .eq('name', categorySlug)
      .single();
    if (catErr || !catRow?.id) {
      // Fallback: create category if not exists
      const insertPayload = {
        name: categorySlug,
        display_name_en: 'Current Affairs',
        display_name_tr: 'Gündem',
        description_en: 'Daily news and current events',
        description_tr: 'Günlük haberler ve güncel olaylar',
        color_hex: '#1E90FF',
        is_active: true,
      };
      const { data: createdCat, error: createErr } = await (supabase as any)
        .from('categories')
        .insert(insertPayload)
        .select('id')
        .single();
      if (createErr || !createdCat?.id) {
        throw new Error(`Category not found for name '${categorySlug}'`);
      }
      catRow = createdCat;
    }
    const categoryId: string = catRow.id;

    // 1) Generate script with Gemini
    const script = await GeminiService.generatePodcastScript(categoryId, language);

    // 2) Generate audio buffer with ElevenLabs
    const audioBuffer = await ElevenLabsService.generatePodcastAudioBuffer(script.content, language);

    // 3) Upload to Supabase Storage
    const fileName = `podcasts/${Date.now()}_today_tr.mp3`;
    const { data: uploadData, error: uploadError } = await (supabase as any).storage
      .from('lurkingpods')
      .upload(fileName, audioBuffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'audio/mpeg',
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const { data: publicUrlData } = await (supabase as any).storage
      .from('lurkingpods')
      .getPublicUrl(fileName);

    const audioUrl = publicUrlData?.publicUrl;

    // 4) Save podcast row
    const podcast = await PodcastService.createPodcast({
      category_id: categoryId,
      title: script.title,
      description: script.description,
      script_content: script.content,
      audio_url: audioUrl,
      audio_duration: script.duration,
      language,
      speaker_1_voice_id: script.speaker_1_voice_id,
      speaker_2_voice_id: script.speaker_2_voice_id,
      quality_score: script.quality_score,
    } as any);

    res.status(201).json({ podcast, audioUrl });
  } catch (error) {
    console.error('Generate today error:', error);
    res.status(500).json({ error: 'Failed to generate today podcast' });
  }
});

// GET /content/categories
router.get('/categories', async (req, res) => {
  try {
    const { language = 'en' } = req.query;

    if (language !== 'en' && language !== 'tr') {
      return res.status(400).json({
        error: 'Invalid language. Must be "en" or "tr"',
      });
    }

    const categories = await CategoryService.getAllCategories(language as 'en' | 'tr');

    res.json(categories.map(category => ({
      id: category.id,
      name: category.name,
      display_name: CategoryService.getCategoryDisplayName(category, language as 'en' | 'tr'),
      description: CategoryService.getCategoryDescription(category, language as 'en' | 'tr'),
      icon_url: category.icon_url,
      color_hex: category.color_hex,
      is_active: category.is_active,
      sort_order: category.sort_order,
    })));
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      error: 'Failed to get categories',
    });
  }
});

// GET /content/category/:categoryId
router.get('/category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { language = 'en' } = req.query;

    if (language !== 'en' && language !== 'tr') {
      return res.status(400).json({
        error: 'Invalid language. Must be "en" or "tr"',
      });
    }

    const podcasts = await PodcastService.getPodcastsByCategory(categoryId, language as 'en' | 'tr');

    res.json({
      category_id: categoryId,
      podcasts: podcasts.map(podcast => ({
        id: podcast.id,
        title: podcast.title,
        description: podcast.description,
        audio_file_url: podcast.audio_file_url,
        audio_duration: podcast.audio_duration,
        language: podcast.language,
        created_at: podcast.created_at,
        play_count: podcast.play_count,
        is_featured: podcast.is_featured,
      })),
      total_count: podcasts.length,
    });
  } catch (error) {
    console.error('Get category podcasts error:', error);
    res.status(500).json({
      error: 'Failed to get category podcasts',
    });
  }
});

// GET /content/podcast/:id
router.get('/podcast/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const podcast = await PodcastService.getPodcastById(id);

    if (!podcast) {
      return res.status(404).json({
        error: 'Podcast not found',
      });
    }

    res.json({
      id: podcast.id,
      title: podcast.title,
      description: podcast.description,
      script_content: podcast.script_content,
      audio_file_url: podcast.audio_file_url,
      audio_duration: podcast.audio_duration,
      category_id: podcast.category_id,
      language: podcast.language,
      speaker_1_voice_id: podcast.speaker_1_voice_id,
      speaker_2_voice_id: podcast.speaker_2_voice_id,
      created_at: podcast.created_at,
      play_count: podcast.play_count,
      is_featured: podcast.is_featured,
    });
  } catch (error) {
    console.error('Get podcast error:', error);
    res.status(500).json({
      error: 'Failed to get podcast',
    });
  }
});

// POST /content/podcast/:id/play
router.post('/podcast/:id/play', async (req, res) => {
  try {
    const { id } = req.params;

    const podcast = await PodcastService.incrementPlayCount(id);

    res.json({
      id: podcast.id,
      play_count: podcast.play_count,
    });
  } catch (error) {
    console.error('Increment play count error:', error);
    res.status(500).json({
      error: 'Failed to increment play count',
    });
  }
});

export default router;
