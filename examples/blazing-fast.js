const nanoexpress = require('..');

const app = nanoexpress();

app.get('/', { isRaw: true }, (req, res) => {
  res.end('hello world');
});

app.listen(4000);
