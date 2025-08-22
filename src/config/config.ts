import dotenv from 'dotenv';

dotenv.config();

export const config = {
  notion: {
    token: process.env.NOTION_TOKEN,
    databaseIds: {
      tasks: process.env.NOTION_TASKS_DB_ID,
      notes: process.env.NOTION_NOTES_DB_ID,
      projects: process.env.NOTION_PROJECTS_DB_ID,
      habits: process.env.NOTION_HABITS_DB_ID,
      calendar: process.env.NOTION_CALENDAR_DB_ID
    }
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 2000
  },
  server: {
    port: parseInt(process.env.PORT) || 3000,
    host: process.env.HOST || 'localhost'
  },
  automation: {
    enabled: process.env.AUTOMATION_ENABLED === 'true',
    cronJobs: {
      dailyReview: process.env.DAILY_REVIEW_CRON || '0 18 * * *',
      weeklyPlanning: process.env.WEEKLY_PLANNING_CRON || '0 9 * * 1',
      habitTracking: process.env.HABIT_TRACKING_CRON || '0 22 * * *'
    }
  },
  features: {
    nlpProcessing: true,
    smartSuggestions: true,
    autoTagging: true,
    contextAwareness: true,
    learningMode: true
  }
};

export type Config = typeof config;