require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { rateLimiter } = require('./src/middleware/rate-limiter');
const { errorHandler } = require('./src/middleware/error-handler');
const { logger } = require('./src/utils/logger');
const config = require('/src/config');



// Routes

const apiRoutes = require('./src/api/routes');
const webhookRoutes = require('./src/api/webhooks/routes');
const syncRoutes = require('./src/api/sync/routes');
const healthroutes = require('./src/api/health/routes');

const { initializeSyncService } = require('./src/services/sync-service');
const { initializeSyncCache } = require('./src/services/cache_service');
const { initializeSyncQueue } = require('./src/services/queue-service');

const app = express();



// Secure

app.use(helmet({
  contentSecurityPolicy: {
  	directives: {
  	  defaultSrc: ["'self'"],
  	  styleSrc: ["'self'", "'unsafe-inline'"],
  	  scriptSrc: ["'self'"],
  	  imgSrc: ["'self'", "data", "https:"]

  	}
  }
})); 


// CORS
app.use(cors({
  origin: config.allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));



// Logs


app.use(morgan('combined', { stream: logger.stream }));


// Rate Limiter

app.use('/api/', rateLimiter);




// ROUTES


// Health
app.use('/health', healthRoutes);


//V1 Routes
app.use('/api/v1', apiRoutes);


//Webhook ENDPOINTS
app.use('/webhooks', webhookRoutes);


// Sync endpoints
app.use('/api/v1/sync', syncRoutes);



// ERROR HANDLING

app.use((req, res) => {
  res.status(404).json({
  	success: false,
  	error: 'Resource not found',
  	path: req.path,
  	timestamp: new Date().toISOString()
  });
}); 

app.use(errorHandler);



// Server

const PORT = config.port || 3000
async function startServer() {
  try {
  	// Initialize services
  	logger.info('Initializing services...');


  	await initializeSyncCache();
  	logger.info(' Cache service initialize');

  	// Queue
  	await initializeSyncQueue();
  	logger.info('Queue service initialized');


    // Sync 
    await initializeSyncService();
    logger.info('Sync service initialized');


    // Start server
    app.listen(PORT, () => {
      logger.info('Hybrid server running');


    });



    // shutdown

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
  	logger.error('Failed to start server:', error);
  	process.exit(1);
  }

} 
async function gracefulShutdown() {
  logger.info('Starting graceful shutdown...');


    // Close server
  	server.close(() => {
  	  logger.info('HTTP server closed');


  	// close db connection
  	if (mongoose.connection.readyState === 1) {
  	  mongoose.connection.close(false, () => {
  	    logger.info('MongoDB connection closed');
  	    process.exit(0);
  	  });
  	} else {
      process.exit(0);
    }
  });

  // Force shutdown after 20 seconds
  setTimeout(() => {
  	logger.error('Could not close connection in time, forcing shutdown');
  	process.exit(1);
  }, 10000);

}


// Start the server

if (require.main === module) {
  startServer();

}


module.exports = app; // testing purposes





































































































