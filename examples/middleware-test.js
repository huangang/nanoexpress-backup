const nanoexpress = require('..');

function one(req, res, next) {
  console.log(req.query)
  req.one = true;
  next();
}

function two(req, res, next) {
  console.log('two')
  req.two = true;
  next();
}

nanoexpress()
  .use(one)
  .use('/', two)
  // .get('/favicon.ico', async (req) => {}) // eslint-disable-line no-unused-vars
  .get('/', (req, res) => res.send('Hello'))
  .post('/', (req, res) => res.send('World'))
  .get('/user/:id', (req, res) => {
    res.end(`User: ${req.params.id}`);
  })
  .listen(3000);
