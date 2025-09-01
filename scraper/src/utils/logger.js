import fs from 'fs';
import path from 'path';

class Logger {
  constructor() {
    this.logsDir = path.join(process.cwd(), 'logs');
    this.ensureLogsDirectory();
  }

  ensureLogsDirectory() {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...(data && { data })
    };
    return JSON.stringify(logEntry) + '\n';
  }

  writeToFile(filename, content) {
    const filePath = path.join(this.logsDir, filename);
    fs.appendFileSync(filePath, content);
  }

  log(level, message, data = null) {
    const logMessage = this.formatMessage(level, message, data);
    console.log(`[${level.toUpperCase()}] ${message}`, data || '');
    
    // Écrire dans le fichier de log général
    this.writeToFile('scraper.log', logMessage);
    
    // Écrire dans le fichier de log spécifique au niveau
    if (['error', 'warn'].includes(level)) {
      this.writeToFile(`${level}.log`, logMessage);
    }
  }

  info(message, data = null) {
    this.log('info', message, data);
  }

  error(message, data = null) {
    this.log('error', message, data);
  }

  warn(message, data = null) {
    this.log('warn', message, data);
  }

  success(message, data = null) {
    this.log('success', message, data);
  }

  debug(message, data = null) {
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', message, data);
    }
  }
}

export default new Logger();