const p = require('process');
let curr = Object.getPrototypeOf(p);
while (curr && curr !== Object.prototype) {
  Object.getOwnPropertyNames(curr).forEach(k => {
    if (typeof curr[k] === 'function' && !p.hasOwnProperty(k)) {
      Object.defineProperty(p, k, {
        value: curr[k].bind(p),
        writable: true,
        configurable: true,
        enumerable: true
      });
    }
  });
  curr = Object.getPrototypeOf(curr);
}
