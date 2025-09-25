import express from 'express';
import { PodcastService } from '../services/PodcastService';
import { CategoryService } from '../services/CategoryService';

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
