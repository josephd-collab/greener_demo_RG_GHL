const path = require('path');

// Load environment variables with validation
require('./env');

const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  allowedOrigins: process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:3000', 'http://localhost:5173'],
  
  // RealGreen API
  realGreen: {
    apiKey: process.env.REALGREEN_API_KEY,
    companyId: process.env.REALGREEN_COMPANY_ID,
    baseUrl: process.env.REALGREEN_BASE_URL || 'https://saapi.realgreen.com',
    webhookSecret: process.env.REALGREEN_WEBHOOK_SECRET,
    // RealGreen API endpoints (from swagger)
    endpoints: {
      customers: '/company/{companyId}/customers',
      customer: '/company/{companyId}/customers/{customerId}',
      appointments: '/company/{companyId}/appointments',
      appointment: '/company/{companyId}/appointments/{appointmentId}',
      appointmentSlots: '/company/{companyId}/appointments/slots',
      services: '/company/{companyId}/services',
      service: '/company/{companyId}/services/{serviceId}',
      invoices: '/company/{companyId}/invoices',
      invoice: '/company/{companyId}/invoices/{invoiceId}',
      payments: '/company/{companyId}/payments',
      properties: '/company/{companyId}/properties',
      serviceTypes: '/company/{companyId}/servicetypes',
      technicians: '/company/{companyId}/technicians',
      routes: '/company/{companyId}/routes',
      health: '/health'
    }
  },
  
  // GoHighLevel API
  goHighLevel: {
    apiKey: process.env.GHL_API_KEY,
    locationId: process.env.GHL_LOCATION_ID,
    baseUrl: process.env.GHL_BASE_URL || 'https://services.leadconnectorhq.com',
    version: '2021-07-28',
    webhookSecret: process.env.GHL_WEBHOOK_SECRET,
    // GHL API endpoints
    endpoints: {
      contacts: '/contacts',
      contact: '/contacts/{contactId}',
      conversations: '/conversations',
      messages: '/conversations/messages',
      appointments: '/appointments',
      appointment: '/appointments/{appointmentId}',
      opportunities: '/opportunities',
      opportunity: '/opportunities/{opportunityId}',
      pipelines: '/opportunities/pipelines',
      workflows: '/workflows/events',
      calendars: '/calendars',
      companies: '/companies',
      users: '/users'
    }
  },
  
  // Anthropic/Claude AI
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
    maxTokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS, 10) || 4096
  },
  
  // Database
  database: {
    url: process.env.MONGODB_URI || process.env.DATABASE_URL,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: parseInt(process.env.DB_POOL_SIZE, 10) || 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    }
  },
  
  // Redis/Cache
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD,
    ttl: parseInt(process.env.REDIS_TTL, 10) || 3600 // 1 hour
  },
  
  // Queue/Bull
  queue: {
    redis: process.env.REDIS_URL || 'redis://localhost:6379',
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000
      },
      removeOnComplete: 100,
      removeOnFail: 1000
    }
  },
  
  // Security
  security: {
    jwtSecret: process.env.JWT_SECRET,
    apiKeyHeader: 'X-API-Key',
    webhookSignatureHeader: 'X-Signature',
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100
    }
  },
  
  // Sync Configuration
  sync: {
    // Bidirectional sync modes
    mode: process.env.SYNC_MODE || 'hybrid', // 'realgreen-led', 'ghl-led', 'hybrid'
    
    // RealGreen to GHL sync rules
    realGreenToGHL: {
      enabled: process.env.SYNC_RG_TO_GHL !== 'false',
      batchSize: parseInt(process.env.SYNC_BATCH_SIZE, 10) || 50,
      interval: parseInt(process.env.SYNC_INTERVAL, 10) || 300000, // 5 minutes
      maxRetries: parseInt(process.env.SYNC_MAX_RETRIES, 10) || 3
    },
    
    // GHL to RealGreen sync rules
    ghlToRealGreen: {
      enabled: process.env.SYNC_GHL_TO_RG !== 'false',
      batchSize: parseInt(process.env.SYNC_BATCH_SIZE, 10) || 50,
      interval: parseInt(process.env.SYNC_INTERVAL, 10) || 300000,
      maxRetries: parseInt(process.env.SYNC_MAX_RETRIES, 10) || 3
    },
    
    // Field mappings
    fieldMappings: {
      customer: {
        firstName: 'firstName',
        lastName: 'lastName',
        phone: 'phone',
        email: 'email',
        address: 'address'
      },
      appointment: {
        date: 'scheduledDate',
        serviceType: 'serviceType',
        notes: 'notes',
        status: 'status'
      }
    }
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
    maxSize: process.env.LOG_MAX_SIZE || '10m',
    maxFiles: process.env.LOG_MAX_FILES || '14d'
  },
  
  // Monitoring
  monitoring: {
    enabled: process.env.MONITORING_ENABLED === 'true',
    port: parseInt(process.env.MONITORING_PORT, 10) || 9090,
    metricsPath: '/metrics'
  }
};

// Validate required configuration
const requiredConfig = [
  'REALGREEN_API_KEY',
  'REALGREEN_COMPANY_ID',
  'GHL_API_KEY',
  'GHL_LOCATION_ID',
  'ANTHROPIC_API_KEY'
];

requiredConfig.forEach(key => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

module.exports = config;
