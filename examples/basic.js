const nanoexpress = require('..');

const app = nanoexpress();

app.get('/', (req, res) => {
  res.end('hello world');
});

app.listen(4000);
