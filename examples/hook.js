const nanoexpress = require('..');

nanoexpress()
  .addHook('onRequest', (req, res, next) => {
    // console.log(req.query);
    // console.log(req.body);
    // res.send('Hello onRequest1');
    console.log('onRequest1');
    next();
  })
  .addHook('onRequest', (req, res, next) => {
    console.log('onRequest2');
    // res.send('Hello onRequest2');
    next();
  })
  .addHook('preParsing',  (req, res, next) => {
    console.log('preParsing');
    // res.send('Hello preParsing');
    next();
  })
  .addHook('preValidation',  (req, res, next) => {
    console.log('preValidation');
    res.send('Hello preValidation');
    next();
  })
  .addHook('preHandler',  (req, res, next) => {
    console.log('preHandler');
    // res.send('Hello preHandler');
    next();
  })
  .addHook('preSend',  (req, res, payload, next) => {
    console.log('preSend', payload);
    payload += ' preSend';
    next();
  })
  .addHook('onResponse',  (req, res, next) => {
    console.log('onResponse1');
    next();
  })
  .addHook('onResponse',  (req, res, next) => {
    console.log('onResponse2');
    next();
  })
  .get('/', (req, res) => {
    console.log('in get');
    res.send('Hello');
  })
  .post('/', (req, res) => {
    console.log('in post');
    console.log(req.body);
    res.send('World');
  })
  .listen(3000);
