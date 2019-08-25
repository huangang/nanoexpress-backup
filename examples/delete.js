const nanoexpress = require('..');

const app = nanoexpress();

app.delete('/',
  {
    schema: {
      headers: false,
      query: false,
      params: false,
      response: {
        200: {
          type: 'object',
          properties: {
            hello: { type: 'string' }
          }
        }
      }
    }
  },
  async (req, res) => {
    return { hello: 'world' }
  }
);

app.listen(4000);
