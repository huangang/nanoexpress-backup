const nanoexpress = require('..');

const app = nanoexpress();

app.get('/', (req, res) => {
  res.status(404).end('hello 404');
});

app.listen(4000);
