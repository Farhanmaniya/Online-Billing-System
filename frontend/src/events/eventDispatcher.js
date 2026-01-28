const listeners = [];

function registerListener(listener) {
    listeners.push(listener);
}

function emitEvent(eventType, payload) {
    console.log(`[EVENT] ${eventType}`, payload);

    listeners.forEach((listener) => {
        listener(eventType, payload);
    });
}

module.exports = {
    registerListener,
    emitEvent
}