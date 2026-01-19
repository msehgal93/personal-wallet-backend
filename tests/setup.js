const database = require('../src/config/database');

beforeAll(async () => {
  // Setup test database
});

afterAll(async () => {
  // Cleanup test database
  await database.disconnect();
});
