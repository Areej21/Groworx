/**
 * Server entry point.
 * Only starts listening here — keeps app.js importable in tests without
 * binding to a port.
 */
const app = require("./app");

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Node refactor server running on http://localhost:${PORT}`);
});
