'use strict';

const fastify = require('fastify')({ logger: true });
const swisseph = require('swisseph');

// Set ephemeris path before any calculations
swisseph.swe_set_ephe_path(process.env.EPHE_PATH || './ephe');

// Security plugins
fastify.register(require('@fastify/helmet'));
fastify.register(require('@fastify/cors'), {
  origin: process.env.ALLOWED_ORIGIN || false,
});

// Auth middleware — all routes except /health require x-engine-key
fastify.addHook('preHandler', async (req, reply) => {
  if (req.url === '/health') return;
  const key = req.headers['x-engine-key'];
  if (!key || key !== process.env.ENGINE_API_KEY) {
    reply.status(401).send({ error: 'Unauthorized' });
  }
});

// Register routes
fastify.register(require('./routes/health'));
fastify.register(require('./routes/calculate'));
fastify.register(require('./routes/panchang'));
fastify.register(require('./routes/transit'));

// Start server
const PORT = parseInt(process.env.PORT || '3001', 10);

fastify.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Kundli Engine listening on ${address}`);
});
