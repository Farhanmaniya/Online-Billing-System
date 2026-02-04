const EventEmitter = require('events');

class EventDispatcher extends EventEmitter {
  constructor() {
    super();
  }

  // Wrapper to emit events with logging or additional logic if needed
  dispatch(event, payload) {
    console.log(`[EventDispatcher] Emitting event: ${event}`);
    this.emit(event, payload);
  }
}

// Singleton instance
const eventDispatcher = new EventDispatcher();
module.exports = eventDispatcher;
