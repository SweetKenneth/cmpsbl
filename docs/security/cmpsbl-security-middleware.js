/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  CMPSBL Security Middleware Stack                           ║
 * ║  Drop-in hardening for Express/Node infrastructure          ║
 * ║  Version: 1.0.0                                            ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * STATUS: Reference architecture document.
 * CMPSBL runs as a client-side SPA with Supabase Edge Functions.
 * This middleware is for future Express/Node deployment scenarios
 * (e.g., self-hosted API gateway, CLI server, or SSR layer).
 *
 * CURRENT COVERAGE (via Edge Functions + DEFENSE Layer):
 * - Rate limiting: ✅ defense_events table + auth_rate_limits
 * - CORS: ✅ Edge function corsHeaders
 * - Input sanitization: ✅ formatChatMessage escapeHtml + Zod validation
 * - Security headers: ⚠️ Partial (CDN-level, not app-level)
 * - Request logging: ✅ analytics_events + auth_events tables
 * - Suspicious pattern detection: ✅ DEFENSE Layer rules
 * - Auth brute force: ✅ auth_rate_limits table + 5-failure lockout
 *
 * Install required packages:
 * npm install helmet cors express-rate-limit hpp express-mongo-sanitize
 * validator winston morgan bcrypt jsonwebtoken dotenv
 *
 * Usage:
 * const { applySecurity } = require('./cmpsbl-security');
 * applySecurity(app);
 */

const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const winston = require('winston');
const morgan = require('morgan');

// ── Security Logger ─────────────────────────────────────────────

const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'cmpsbl-security' },
  transports: [
    new winston.transports.File({
      filename: 'logs/security-errors.log',
      level: 'error',
      maxsize: 5242880,
      maxFiles: 10
    }),
    new winston.transports.File({
      filename: 'logs/security-audit.log',
      maxsize: 5242880,
      maxFiles: 20
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  securityLogger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// ── Rate Limiters ───────────────────────────────────────────────

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: 'Too many requests',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    securityLogger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      userAgent: req.get('user-agent')
    });
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: '15 minutes'
    });
  }
});

const ascensionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Ascension rate limit exceeded' },
  keyGenerator: (req) => req.user?.id || req.ip,
  handler: (req, res) => {
    securityLogger.error('Ascension rate limit exceeded', {
      ip: req.ip,
      user: req.user?.id,
      path: req.path
    });
    res.status(429).json({ error: 'Ascension rate limit exceeded' });
  }
});

const memoryStreamLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 30,
  keyGenerator: (req) => req.user?.id || req.ip,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    securityLogger.error('Auth brute force detected', {
      ip: req.ip,
      email: req.body?.email ? '[REDACTED]' : undefined
    });
    res.status(429).json({ error: 'Too many login attempts' });
  }
});

const stripeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 50,
});

// ── CORS Configuration ─────────────────────────────────────────

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://cmpsbl.com',
      'https://www.cmpsbl.com',
      'https://security.cmpsbl.com',
      'https://robotics.cmpsbl.com',
      'https://agency.cmpsbl.com',
      'https://marketplace.cmpsbl.com',
      'https://quantum.cmpsbl.com',
      'https://media.cmpsbl.com',
      'https://llm.cmpsbl.com',
      'https://ultimate.cmpsbl.com',
      'https://edu.cmpsbl.com',
      'https://health.cmpsbl.com',
      'https://gaming.cmpsbl.com',
      'https://legal.cmpsbl.com',
    ];

    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin) ||
        origin.endsWith('.cmpsbl.com')) {
      callback(null, true);
    } else {
      securityLogger.warn('CORS rejection', { origin });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CMPSBL-Key', 'X-Request-ID'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  maxAge: 86400,
};

// ── Input Sanitization ──────────────────────────────────────────

const sanitizeInput = (req, res, next) => {
  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);
  next();
};

function sanitizeObject(obj) {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = obj[key].replace(/\0/g, '');
      obj[key] = obj[key].replace(/[$]/g, '');
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  }
}

// ── Request ID Tracking ─────────────────────────────────────────

const requestId = (req, res, next) => {
  const id = req.get('X-Request-ID') ||
    `cmpsbl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  req.requestId = id;
  res.set('X-Request-ID', id);
  next();
};

// ── Security Event Logger Middleware ────────────────────────────

const securityEventLogger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;

    if (res.statusCode === 401 || res.statusCode === 403) {
      securityLogger.warn('Unauthorized access attempt', {
        requestId: req.requestId,
        ip: req.ip,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        userAgent: req.get('user-agent'),
        duration
      });
    }

    if (res.statusCode >= 500) {
      securityLogger.error('Server error', {
        requestId: req.requestId,
        ip: req.ip,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration
      });
    }
  });
  next();
};

// ── Payload Size Limits ─────────────────────────────────────────

const express = require('express');
const payloadLimits = {
  general: express.json({ limit: '1mb' }),
  upload: express.json({ limit: '50mb' }),
  ascension: express.json({ limit: '10mb' }),
};

// ── Anti-Abuse: Suspicious Pattern Detection ────────────────────

const suspiciousPatternDetector = (req, res, next) => {
  const suspicious = [
    /(%27)|(')|(--)|(%23)|(#)/i,
    /((%3C)|<)((%2F)|\/)*[a-z0-9%]+((%3E)|>)/i,
    /((%3C)|<)((%69)|i|(%49))((%6D)|m|(%4D))((%67)|g|(%47))/i,
    /(%00)/i,
    /\.\.\//i,
    /eval\s*\(/i,
    /javascript:/i,
    /vbscript:/i,
    /on\w+\s*=/i,
  ];

  const fullUrl = req.originalUrl || req.url;
  const body = JSON.stringify(req.body || {});
  const testString = `${fullUrl} ${body}`;

  for (const pattern of suspicious) {
    if (pattern.test(testString)) {
      securityLogger.error('Suspicious pattern detected', {
        requestId: req.requestId,
        ip: req.ip,
        method: req.method,
        path: req.path,
        pattern: pattern.toString(),
        userAgent: req.get('user-agent')
      });
      return res.status(400).json({ error: 'Invalid request' });
    }
  }

  next();
};

// ══════════════════════════════════════════════════════════════════
// MAIN: Apply all security middleware
// ══════════════════════════════════════════════════════════════════

function applySecurity(app, options = {}) {
  const {
    enableCors = true,
    enableRateLimiting = true,
    enableLogging = true,
    trustProxy = true,
  } = options;

  if (trustProxy) {
    app.set('trust proxy', 1);
  }

  // Layer 1: Request tracking
  app.use(requestId);

  // Layer 2: Security headers via Helmet
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'nonce-cmpsbl'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://*.cmpsbl.com", "https://api.stripe.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: { policy: "same-site" },
    dnsPrefetchControl: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xContentTypeOptions: true,
    xFrameOptions: { action: "deny" },
    xXssProtection: true,
    permissionsPolicy: {
      features: {
        camera: ["'none'"],
        microphone: ["'none'"],
        geolocation: ["'none'"],
        payment: ["'self'"],
      },
    },
  }));

  app.disable('x-powered-by');

  // Layer 3: CORS
  if (enableCors) {
    app.use(cors(corsOptions));
  }

  // Layer 4: Body parsing with limits
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));

  // Layer 5: Input sanitization
  app.use(mongoSanitize());
  app.use(hpp());
  app.use(sanitizeInput);

  // Layer 6: Suspicious pattern detection
  app.use(suspiciousPatternDetector);

  // Layer 7: Rate limiting
  if (enableRateLimiting) {
    app.use('/api/', generalLimiter);
    app.use('/api/ascension', ascensionLimiter);
    app.use('/api/memory-stream', memoryStreamLimiter);
    app.use('/api/dream', memoryStreamLimiter);
    app.use('/api/auth', authLimiter);
    app.use('/api/stripe', stripeLimiter);
  }

  // Layer 8: Logging
  if (enableLogging) {
    app.use(morgan('combined', {
      stream: {
        write: (message) => securityLogger.info(message.trim())
      }
    }));
    app.use(securityEventLogger);
  }

  // Layer 9: Security response headers
  app.use((req, res, next) => {
    res.set('X-CMPSBL-Security', 'active');
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Surrogate-Control', 'no-store');
    next();
  });

  securityLogger.info('CMPSBL Security Stack initialized', {
    cors: enableCors,
    rateLimiting: enableRateLimiting,
    logging: enableLogging,
    timestamp: new Date().toISOString()
  });

  return app;
}

// ── Exports ─────────────────────────────────────────────────────

module.exports = {
  applySecurity,
  securityLogger,
  limiters: {
    general: generalLimiter,
    ascension: ascensionLimiter,
    memoryStream: memoryStreamLimiter,
    auth: authLimiter,
    stripe: stripeLimiter,
  },
  corsOptions,
};
