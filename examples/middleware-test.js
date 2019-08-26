const nanoexpress = require('..');

function one(req, res, next) {
  // console.log(req.query);
  console.log('one');
  req.one = true;
  next();
}

function two(req, res, next) {
  console.log('two');
  req.two = true;
  next();
}

nanoexpress()
  .addHook('onRequest', (req, res, next) => {
    // console.log(req.query);
    // console.log(req.body);
    console.log('onRequest');
    next();
  })
  .use(one)
  .use('/', two)
  // .get('/favicon.ico', async (req) => {}) // eslint-disable-line no-unused-vars
  .get('/', (req, res) => {
    console.log('in get');
    res.send('Hello');
  })
  .get('/2', {
    schema: {},
    handler: (req, res) => {
      res.send('222');
    }
  })
  .post('/', (req, res) => {
    console.log('in post');
    console.log(req.body);
    res.send('World');
  })
  .get('/user/:id', (req, res) => {
    res.end(`User: ${req.params.id}`);
  })
  .listen(3000);
