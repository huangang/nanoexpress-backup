
module.exports = function (fastify, opts, next) {
  fastify.get('/test', (request, reply) => {
    reply.send({ hello: 'world' });
  });
  next();
};
