// Require the framework and instantiate it
const nanoexpress = require('..');
const app = nanoexpress();

app.register(require('./our-first-route'), { prefix:  '/a' });

// Run the server!
app.listen(4000);
