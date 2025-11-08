// Simple in-memory log storage for debugging
export const emailLogs: Array<{
  timestamp: Date;
  level: 'info' | 'error';
  message: string;
  data?: any;
}> = [];

const MAX_LOGS = 100;

export function logEmail(level: 'info' | 'error', message: string, data?: any) {
  emailLogs.unshift({
    timestamp: new Date(),
    level,
    message,
    data,
  });
  
  // Keep only last 100 logs
  if (emailLogs.length > MAX_LOGS) {
    emailLogs.pop();
  }
  
  // Also log to console
  if (level === 'error') {
    console.error(`[Email] ${message}`, data || '');
  } else {
    console.log(`[Email] ${message}`, data || '');
  }
}

export function getEmailLogs() {
  return emailLogs;
}

export function clearEmailLogs() {
  emailLogs.length = 0;
}
