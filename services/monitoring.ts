// Error monitoring with Sentry
// In production, install: npm install @sentry/react-native

const SENTRY_DSN = process.env.SENTRY_DSN;

class MonitoringService {
  initialized = false;

  async initialize() {
    if (this.initialized) return;

    if (!SENTRY_DSN) {
      console.warn('Sentry DSN not configured');
      return;
    }

    // In production:
    // import * as Sentry from '@sentry/react-native';
    // Sentry.init({
    //   dsn: SENTRY_DSN,
    //   tracesSampleRate: 1.0,
    //   enableAutoSessionTracking: true,
    //   environment: __DEV__ ? 'development' : 'production',
    // });

    this.initialized = true;
    console.log('Monitoring initialized');
  }

  captureException(error: Error, context?: Record<string, any>) {
    console.error('Error captured:', error, context);

    // In production:
    // Sentry.captureException(error, {
    //   extra: context,
    // });
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    console.log(`[${level.toUpperCase()}] ${message}`);

    // In production:
    // Sentry.captureMessage(message, level);
  }

  setUser(userId: string, email?: string, username?: string) {
    // In production:
    // Sentry.setUser({
    //   id: userId,
    //   email,
    //   username,
    // });

    console.log('Monitoring user set:', userId);
  }

  addBreadcrumb(message: string, data?: Record<string, any>) {
    // In production:
    // Sentry.addBreadcrumb({
    //   message,
    //   data,
    //   timestamp: Date.now() / 1000,
    // });

    console.log('Breadcrumb:', message, data);
  }
}

export const monitoring = new MonitoringService();

