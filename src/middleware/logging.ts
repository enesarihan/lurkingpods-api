import { Request, Response, NextFunction } from 'express';

interface LogEntry {
  timestamp: string;
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  userAgent?: string;
  ip?: string;
  userId?: string;
  body?: any;
  query?: any;
  params?: any;
}

class Logger {
  private static formatLogEntry(entry: LogEntry): string {
    const {
      timestamp,
      method,
      url,
      statusCode,
      responseTime,
      userAgent,
      ip,
      userId,
      body,
      query,
      params,
    } = entry;

    let logMessage = `[${timestamp}] ${method} ${url} ${statusCode} ${responseTime}ms`;
    
    if (ip) {
      logMessage += ` IP:${ip}`;
    }
    
    if (userId) {
      logMessage += ` User:${userId}`;
    }
    
    if (userAgent) {
      logMessage += ` UA:${userAgent.substring(0, 50)}`;
    }

    // Add request data for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      if (Object.keys(query || {}).length > 0) {
        logMessage += ` Query:${JSON.stringify(query)}`;
      }
      
      if (Object.keys(params || {}).length > 0) {
        logMessage += ` Params:${JSON.stringify(params)}`;
      }
      
      if (body && Object.keys(body).length > 0) {
        // Don't log sensitive data
        const sanitizedBody = this.sanitizeBody(body);
        if (Object.keys(sanitizedBody).length > 0) {
          logMessage += ` Body:${JSON.stringify(sanitizedBody)}`;
        }
      }
    }

    return logMessage;
  }

  private static sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];
    const sanitized = { ...body };

    Object.keys(sanitized).forEach(key => {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        sanitized[key] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  private static getLogLevel(statusCode: number): 'info' | 'warn' | 'error' {
    if (statusCode >= 500) return 'error';
    if (statusCode >= 400) return 'warn';
    return 'info';
  }

  static log(entry: LogEntry): void {
    const logMessage = this.formatLogEntry(entry);
    const level = this.getLogLevel(entry.statusCode);

    switch (level) {
      case 'error':
        console.error(logMessage);
        break;
      case 'warn':
        console.warn(logMessage);
        break;
      default:
        console.log(logMessage);
    }
  }
}

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  // Store original end method
  const originalEnd = res.end;
  
  // Override end method to capture response details
  res.end = function(chunk?: any, encoding?: any): any {
    const responseTime = Date.now() - startTime;
    
    const logEntry: LogEntry = {
      timestamp,
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      responseTime,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      userId: (req as any).user?.id,
      body: req.method !== 'GET' ? req.body : undefined,
      query: req.query && Object.keys(req.query).length > 0 ? req.query : undefined,
      params: req.params && Object.keys(req.params).length > 0 ? req.params : undefined,
    };

    Logger.log(logEntry);
    
    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  const timestamp = new Date().toISOString();
  
  const errorLog = {
    timestamp,
    level: 'error',
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id,
  };

  console.error(`[${timestamp}] ERROR:`, errorLog);
  
  next(err);
};

// Performance monitoring middleware
export const performanceLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    
    // Log slow requests
    if (responseTime > 1000) { // 1 second
      console.warn(`[${new Date().toISOString()}] SLOW REQUEST: ${req.method} ${req.url} took ${responseTime}ms`);
    }
    
    // Log very slow requests
    if (responseTime > 5000) { // 5 seconds
      console.error(`[${new Date().toISOString()}] VERY SLOW REQUEST: ${req.method} ${req.url} took ${responseTime}ms`);
    }
  });
  
  next();
};
