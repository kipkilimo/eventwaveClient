// src/utils/polyfills.js
// Comprehensive polyfills for Node.js modules in browser environment

// 1️⃣ Polyfill for util.inherits
if (typeof window !== "undefined") {
  if (!window.util) {
    window.util = {};
  }

  if (!window.util.inherits) {
    window.util.inherits = function (ctor, superCtor) {
      if (ctor === undefined || ctor === null) {
        throw new TypeError(
          'The constructor to "inherits" must not be null or undefined',
        );
      }

      if (superCtor === undefined || superCtor === null) {
        throw new TypeError(
          'The super constructor to "inherits" must not be null or undefined',
        );
      }

      if (superCtor.prototype === undefined) {
        throw new TypeError(
          'The super constructor to "inherits" must have a prototype',
        );
      }

      ctor.super_ = superCtor;

      if (Object.create) {
        ctor.prototype = Object.create(superCtor.prototype, {
          constructor: {
            value: ctor,
            enumerable: false,
            writable: true,
            configurable: true,
          },
        });
      } else {
        // Fallback for older browsers
        function TempCtor() {}
        TempCtor.prototype = superCtor.prototype;
        ctor.prototype = new TempCtor();
        ctor.prototype.constructor = ctor;
      }
    };
  }
}

// 2️⃣ Polyfill for process
if (typeof window !== "undefined" && !window.process) {
  window.process = {
    env: {},
    browser: true,
    version: "",
    versions: {},
    platform: "browser",
    nextTick: function (callback, ...args) {
      setTimeout(() => callback(...args), 0);
    },
    cwd: () => "/",
    hrtime: (previousTime) => {
      const now = Date.now() * 1000;
      if (previousTime) {
        return [now - previousTime[0], 0];
      }
      return [now, 0];
    },
  };
}

// 3️⃣ Polyfill for Buffer
if (typeof window !== "undefined" && !window.Buffer) {
  class BufferPolyfill {
    constructor(data) {
      this.data = data;
      this.length = data ? data.length : 0;
    }

    static from(data, encoding) {
      return new BufferPolyfill(data);
    }

    static isBuffer(obj) {
      return obj instanceof BufferPolyfill;
    }

    toString(encoding) {
      if (typeof this.data === "string") return this.data;
      if (Array.isArray(this.data)) return String.fromCharCode(...this.data);
      return String(this.data);
    }
  }

  window.Buffer = BufferPolyfill;
}

// 4️⃣ Polyfill for global
if (typeof global === "undefined") {
  window.global = window;
}

// 5️⃣ Polyfill for setImmediate (used by some Node.js modules)
if (typeof window !== "undefined" && !window.setImmediate) {
  window.setImmediate = function (callback, ...args) {
    return setTimeout(() => callback(...args), 0);
  };

  window.clearImmediate = function (id) {
    clearTimeout(id);
  };
}

// 6️⃣ Polyfill for require (to prevent errors if something tries to use it)
if (typeof window !== "undefined" && !window.require) {
  window.require = function (module) {
    console.warn(
      `require() called with module: ${module} - but not supported in browser`,
    );
    return null;
  };
}

// Log that polyfills are loaded
console.log("Node.js polyfills loaded successfully");

// Export for module systems
export default {
  util: window.util,
  process: window.process,
  Buffer: window.Buffer,
  global: window.global,
};
