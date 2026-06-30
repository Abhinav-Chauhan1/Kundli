async function healthRoutes(fastify) {
  fastify.get('/health', async (_req, _reply) => {
    return { status: 'ok', ts: Date.now() };
  });
}

module.exports = healthRoutes;
