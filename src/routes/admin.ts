import express from 'express';
import { ContentGenerationService } from '../services/ContentGenerationService';
import { PodcastService } from '../services/PodcastService';
import { CategoryService } from '../services/CategoryService';

const router = express.Router();

// POST /admin/generate-content
router.post('/generate-content', async (req, res) => {
  try {
    const { category_id, language } = req.body;

    if (!category_id || !language) {
      return res.status(400).json({
        error: 'Missing required fields: category_id, language',
      });
    }

    if (language !== 'en' && language !== 'tr') {
      return res.status(400).json({
        error: 'Invalid language. Must be "en" or "tr"',
      });
    }

    // Create content generation job
    const job = await ContentGenerationService.createJob({
      category_id,
      language,
      max_retries: 3,
    });

    // Process the job
    await ContentGenerationService.processJob(job.id);

    res.json({
      job_id: job.id,
      status: 'completed',
      message: 'Content generation completed successfully',
    });
  } catch (error) {
    console.error('Generate content error:', error);
    res.status(500).json({
      error: 'Failed to generate content',
    });
  }
});

// GET /admin/jobs
router.get('/jobs', async (req, res) => {
  try {
    const { status = 'pending' } = req.query;

    if (status === 'pending') {
      const jobs = await ContentGenerationService.getPendingJobs();
      res.json({
        jobs: jobs.map(job => ({
          id: job.id,
          category_id: job.category_id,
          language: job.language,
          status: job.status,
          created_at: job.created_at,
          started_at: job.started_at,
          completed_at: job.completed_at,
          error_message: job.error_message,
          retry_count: job.retry_count,
          max_retries: job.max_retries,
        })),
        total_count: jobs.length,
      });
    } else {
      res.status(400).json({
        error: 'Invalid status filter',
      });
    }
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      error: 'Failed to get jobs',
    });
  }
});

// POST /admin/jobs/:id/retry
router.post('/jobs/:id/retry', async (req, res) => {
  try {
    const { id } = req.params;

    await ContentGenerationService.retryFailedJob(id);

    res.json({
      job_id: id,
      status: 'retrying',
      message: 'Job retry initiated',
    });
  } catch (error) {
    console.error('Retry job error:', error);
    res.status(500).json({
      error: 'Failed to retry job',
    });
  }
});

// DELETE /admin/podcasts/expired
router.delete('/podcasts/expired', async (req, res) => {
  try {
    const deletedCount = await PodcastService.deleteExpiredPodcasts();

    res.json({
      deleted_count: deletedCount,
      message: 'Expired podcasts deleted successfully',
    });
  } catch (error) {
    console.error('Delete expired podcasts error:', error);
    res.status(500).json({
      error: 'Failed to delete expired podcasts',
    });
  }
});

// GET /admin/stats
router.get('/stats', async (req, res) => {
  try {
    // Get basic statistics
    const stats = {
      total_podcasts: 0, // Would query actual count
      active_categories: 0, // Would query actual count
      pending_jobs: 0, // Would query actual count
      failed_jobs: 0, // Would query actual count
      last_generation: new Date(), // Would query actual last generation time
    };

    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      error: 'Failed to get statistics',
    });
  }
});

// POST /admin/categories
router.post('/categories', async (req, res) => {
  try {
    const { name, display_name_en, display_name_tr, description_en, description_tr, icon_url, color_hex, sort_order } = req.body;

    if (!name || !display_name_en || !display_name_tr || !description_en || !description_tr || !icon_url || !color_hex || !sort_order) {
      return res.status(400).json({
        error: 'Missing required fields',
      });
    }

    const category = await CategoryService.createCategory({
      name,
      display_name_en,
      display_name_tr,
      description_en,
      description_tr,
      icon_url,
      color_hex,
      sort_order,
    });

    res.status(201).json({
      id: category.id,
      name: category.name,
      display_name_en: category.display_name_en,
      display_name_tr: category.display_name_tr,
      description_en: category.description_en,
      description_tr: category.description_tr,
      icon_url: category.icon_url,
      color_hex: category.color_hex,
      is_active: category.is_active,
      sort_order: category.sort_order,
      created_at: category.created_at,
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      error: 'Failed to create category',
    });
  }
});

export default router;
