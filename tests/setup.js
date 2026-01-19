const database = require('../src/config/database');

beforeAll(async () => {
  await database.connect();
});

afterAll(async () => {
  await database.disconnect();
});
