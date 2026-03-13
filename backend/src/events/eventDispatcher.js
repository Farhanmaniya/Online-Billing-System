// Central event bus for the backend.
// This wrapper around Node's EventEmitter is the single place where domain
// events are dispatched and listened to, enabling a loosely coupled,
// event‑driven architecture between core business logic and side‑effects
// such as emails or notifications.
const EventEmitter = require('events');

class EventDispatcher extends EventEmitter {
  constructor() {
    super();
  }

  // Dispatches a named domain event with a payload.
  // This method exists so that all emission goes through a single point,
  // making it easy to add cross‑cutting concerns (logging, metrics, tracing)
  // without touching the business logic that triggers events.
  dispatch(event, payload) {
    console.log(`[EventDispatcher] Emitting event: ${event}`);
    this.emit(event, payload);
  }
}

// Export a singleton so every module shares the same event bus instance.
// Using a shared dispatcher ensures that emitters and listeners can
// communicate without needing a direct reference to one another.
const eventDispatcher = new EventDispatcher();
module.exports = eventDispatcher;
