const uWS = require('../node_modules/uWebSockets.js');

const app = uWS.App();

app.get('/', (res) => {
  res.end('hello world');
});

app.listen(
  4005,
  (token) => token && console.debug('server started at port', 4005)
);
