require("dotenv").config();
const app = require("./src/app");
const registerListeners = require("./src/events/listeners");

// Initialize Event Listeners
registerListeners();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})