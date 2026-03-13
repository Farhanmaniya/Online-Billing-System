// Entry point for the backend HTTP server.
// This file wires together the Express app and the event‑driven infrastructure
// by loading environment configuration, bootstrapping routes, and registering
// all event listeners before starting to accept incoming requests.
require("dotenv").config();
const app = require("./src/app");
const registerListeners = require("./src/events/listeners");

// Initialize domain event listeners once at startup.
// Listeners subscribe to events (e.g., invoice created) and handle side‑effects
// like sending emails or notifications without coupling that logic to controllers.
registerListeners();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})
