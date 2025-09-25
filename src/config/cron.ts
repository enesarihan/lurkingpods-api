import cron from 'node-cron';

// Daily content generation at 00:00 UTC
export const dailyGenerationCron = '0 0 * * *';

// Content cleanup at 01:00 UTC (after generation)
export const contentCleanupCron = '0 1 * * *';

// Notification sending at 00:05 UTC
export const notificationCron = '5 0 * * *';

export { cron };
export default cron;
