import fs from 'node:fs';
import cron from 'node-cron';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { taskT } from '#types/shared.types.js';

type taskImportT = {
  default: taskT
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class CronScheduler {
  constructor() {
    this.loadTasks();
  }

  private async loadTasks() {
    const tasksDir = path.join(__dirname, 'tasks');
    const taskFiles = fs.readdirSync(tasksDir);
    for (const file of taskFiles)
    {
      const filePath = path.join(tasksDir, file);

      try
      {
        const importedFuncData = await import(filePath) as taskImportT;
        if (typeof importedFuncData.default === 'object')
        {
          const { default: { expression, task } } = importedFuncData
          cron.schedule(expression, task, { timezone: 'Europe/Moscow' });
        }
      } catch (error)
      {
        console.error(`Ошибка при импорте задачи из ${filePath}:`, error);
      }
    }
  }
}

export default CronScheduler;