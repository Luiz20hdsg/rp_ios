const events = {};

export const on = (eventName, callback) => {
  if (!events[eventName]) {
    events[eventName] = [];
  }
  events[eventName].push(callback);
};

export const off = (eventName, callback) => {
  if (events[eventName]) {
    events[eventName] = events[eventName].filter(cb => cb !== callback);
  }
};

export const emit = (eventName, data) => {
  if (events[eventName]) {
    events[eventName].forEach(callback => {
      callback(data);
    });
  }
};
