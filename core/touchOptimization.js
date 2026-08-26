/* ============================================================
   core/touchOptimization.js
   Touch Optimization System for Graphics Engine
   - Pinch-zoom gesture recognition
   - Adaptive touch thresholds
   - Gesture recognition (long-press, swipe)
   - Haptic feedback
   - Accessibility integration
   ============================================================ */

/* ── Constants ──────────────────────────────────────────── */
const PI = Math.PI;
const TWO_PI = 2 * PI;

/* ── Device Detection ───────────────────────────────────── */
export const Device = {
  _isTouch: null,
  _isCoarse: null,
  _isMobile: null,
  _isTablet: null,

  get isTouch() {
    if (this._isTouch === null) {
      this._isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
    return this._isTouch;
  },

  get isCoarse() {
    if (this._isCoarse === null) {
      this._isCoarse = window.matchMedia('(pointer: coarse)').matches;
    }
    return this._isCoarse;
  },

  get isMobile() {
    if (this._isMobile === null) {
      this._isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    return this._isMobile;
  },

  get isTablet() {
    if (this._isTablet === null) {
      this._isTablet = window.matchMedia('(pointer: coarse)').matches && 
                       Math.min(window.innerWidth, window.innerHeight) >= 768;
    }
    return this._isTablet;
  },

  get pixelRatio() {
    return window.devicePixelRatio || 1;
  },

  get viewportWidth() {
    return window.innerWidth;
  },

  get viewportHeight() {
    return window.innerHeight;
  },

  reset() {
    this._isTouch = null;
    this._isCoarse = null;
    this._isMobile = null;
    this._isTablet = null;
  }
};

/* ── Adaptive Thresholds ────────────────────────────────── */
export const Thresholds = {
  // Base thresholds (in pixels)
  HIT_RADIUS: {
    FINGER: 48,      // Default finger hit radius
    THUMB: 56,       // Larger for thumb zone
    FINE: 36,        // Smaller for precision input
    STYLUS: 12,      // Fine point for stylus
  },

  // Adaptive thresholds based on device
  get hitRadius() {
    if (Device.isTablet) return this.HIT_RADIUS.THUMB;
    if (Device.isMobile) return this.HIT_RADIUS.FINGER;
    return this.HIT_RADIUS.FINE;
  },

  // Gesture thresholds
  GESTURE: {
    LONG_PRESS_MS: 500,           // Long press duration
    LONG_PRESS_MOVE_TOLERANCE: 10,// Max movement during long press (px)
    SWIPE_VELOCITY: 0.5,          // Min velocity for swipe (px/ms)
    SWIPE_DISTANCE: 50,           // Min distance for swipe (px)
    PINCH_SCALE_MIN: 0.25,       // Min pinch scale
    PINCH_SCALE_MAX: 4.0,        // Max pinch scale
    DOUBLE_TAP_DELAY_MS: 300,    // Max delay between taps for double tap
    TAP_DISTANCE_TOLERANCE: 10,  // Max movement for tap
  },

  // Touch zones
  ZONES: {
    EDGE_PX: 20,                  // Edge swipe zone width
    CORNER_PX: 40,               // Corner zone for system gestures
  }
};

/* ── Haptic Feedback ────────────────────────────────────── */
export const Haptics = {
  _supported: null,

  get supported() {
    if (this._supported === null) {
      this._supported = 'vibrate' in navigator;
    }
    return this._supported;
  },

  light() {
    if (this.supported) navigator.vibrate(10);
  },

  medium() {
    if (this.supported) navigator.vibrate(20);
  },

  heavy() {
    if (this.supported) navigator.vibrate(40);
  },

  success() {
    if (this.supported) navigator.vibrate([10, 30, 10]);
  },

  error() {
    if (this.supported) navigator.vibrate([50, 30, 50]);
  },

  selection() {
    if (this.supported) navigator.vibrate(5);
  }
};

/* ── Gesture Recognizer ─────────────────────────────────── */
export class GestureRecognizer {
  constructor(element) {
    this.element = element;
    this.listeners = new Map();
    this._state = {
      pointers: new Map(),
      gesture: null,
      startTime: 0,
      lastTapTime: 0,
      startPos: null,
      pinchStartDistance: 0,
      pinchStartScale: 1,
      longPressTimer: null,
      longPressTriggered: false,
      swipeStartPos: null,
      swipeStartTime: 0,
    };
    this._boundHandlers = {};
    this._init();
  }

  _init() {
    this._boundHandlers = {
      pointerdown: this._onPointerDown.bind(this),
      pointermove: this._onPointerMove.bind(this),
      pointerup: this._onPointerUp.bind(this),
      pointercancel: this._onPointerCancel.bind(this),
    };

    this.element.addEventListener('pointerdown', this._boundHandlers.pointerdown, { passive: false });
    this.element.addEventListener('pointermove', this._boundHandlers.pointermove, { passive: false });
    this.element.addEventListener('pointerup', this._boundHandlers.pointerup, { passive: false });
    this.element.addEventListener('pointercancel', this._boundHandlers.pointercancel, { passive: false });
  }

  _onPointerDown(e) {
    e.preventDefault();
    this._state.pointers.set(e.pointerId, {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      startX: e.clientX,
      startY: e.clientY,
      pressure: e.pressure,
      timestamp: Date.now(),
    });

    this.element.setPointerCapture(e.pointerId);

    // Start long press timer
    if (this._state.pointers.size === 1) {
      this._state.startTime = Date.now();
      this._state.startPos = { x: e.clientX, y: e.clientY };
      this._startLongPress(e);
    }

    // Handle pinch start
    if (this._state.pointers.size === 2) {
      this._clearLongPress();
      const pointers = Array.from(this._state.pointers.values());
      this._state.pinchStartDistance = this._getDistance(pointers[0], pointers[1]);
      this._state.pinchStartScale = 1;
      this._emit('pinchstart', {
        center: this._getCenter(pointers[0], pointers[1]),
        distance: this._state.pinchStartDistance,
      });
    }

    this._emit('pointerdown', { pointer: this._state.pointers.get(e.pointerId) });
  }

  _onPointerMove(e) {
    if (!this._state.pointers.has(e.pointerId)) return;

    const pointer = this._state.pointers.get(e.pointerId);
    const prevX = pointer.x;
    const prevY = pointer.y;
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.pressure = e.pressure;

    // Check long press movement tolerance
    if (this._state.pointers.size === 1 && !this._state.longPressTriggered) {
      const dx = e.clientX - this._state.startPos.x;
      const dy = e.clientY - this._state.startPos.y;
      if (Math.hypot(dx, dy) > Thresholds.GESTURE.LONG_PRESS_MOVE_TOLERANCE) {
        this._clearLongPress();
      }
    }

    // Handle pinch move
    if (this._state.pointers.size === 2) {
      const pointers = Array.from(this._state.pointers.values());
      const currentDistance = this._getDistance(pointers[0], pointers[1]);
      const scale = currentDistance / this._state.pinchStartDistance;
      const center = this._getCenter(pointers[0], pointers[1]);

      this._emit('pinchmove', {
        center,
        scale: Math.max(Thresholds.GESTURE.PINCH_SCALE_MIN, 
               Math.min(Thresholds.GESTURE.PINCH_SCALE_MAX, scale)),
        distance: currentDistance,
      });
    }

    // Emit pointermove
    this._emit('pointermove', {
      pointer,
      deltaX: pointer.x - prevX,
      deltaY: pointer.y - prevY,
      totalDeltaX: pointer.x - pointer.startX,
      totalDeltaY: pointer.y - pointer.startY,
    });
  }

  _onPointerUp(e) {
    if (!this._state.pointers.has(e.pointerId)) return;

    const pointer = this._state.pointers.get(e.pointerId);
    const duration = Date.now() - this._state.startTime;

    // Handle long press release
    this._clearLongPress();

    // Handle pinch end
    if (this._state.pointers.size === 2) {
      const pointers = Array.from(this._state.pointers.values());
      this._emit('pinchend', {
        center: this._getCenter(pointers[0], pointers[1]),
        scale: this._state.pinchStartScale,
      });
    }

    // Detect tap
    if (this._state.pointers.size === 1) {
      const dx = pointer.x - pointer.startX;
      const dy = pointer.y - pointer.startY;
      const distance = Math.hypot(dx, dy);
      const isTap = distance < Thresholds.GESTURE.TAP_DISTANCE_TOLERANCE && 
                    duration < Thresholds.GESTURE.LONG_PRESS_MS;

      if (isTap) {
        const now = Date.now();
        const isDoubleTap = (now - this._state.lastTapTime) < Thresholds.GESTURE.DOUBLE_TAP_DELAY_MS;
        
        this._state.lastTapTime = now;
        
        this._emit('tap', {
          x: e.clientX,
          y: e.clientY,
          double: isDoubleTap,
          pointer,
        });

        Haptics.selection();
      }
    }

    // Detect swipe
    if (this._state.pointers.size === 1 && duration < 300) {
      const dx = pointer.x - pointer.startX;
      const dy = pointer.y - pointer.startY;
      const distance = Math.hypot(dx, dy);
      const velocity = distance / duration;

      if (distance > Thresholds.GESTURE.SWIPE_DISTANCE && 
          velocity > Thresholds.GESTURE.SWIPE_VELOCITY) {
        let direction;
        if (Math.abs(dx) > Math.abs(dy)) {
          direction = dx > 0 ? 'right' : 'left';
        } else {
          direction = dy > 0 ? 'down' : 'up';
        }

        this._emit('swipe', {
          direction,
          velocity,
          distance,
          startX: pointer.startX,
          startY: pointer.startY,
          endX: pointer.x,
          endY: pointer.y,
        });

        Haptics.light();
      }
    }

    this._emit('pointerup', { pointer, duration });

    this._state.pointers.delete(e.pointerId);
    this.element.releasePointerCapture(e.pointerId);
  }

  _onPointerCancel(e) {
    this._clearLongPress();
    this._state.pointers.delete(e.pointerId);
    this.element.releasePointerCapture(e.pointerId);
  }

  _startLongPress(e) {
    this._clearLongPress();
    this._state.longPressTriggered = false;

    this._state.longPressTimer = setTimeout(() => {
      this._state.longPressTriggered = true;
      this._emit('longpress', {
        x: e.clientX,
        y: e.clientY,
        pointer: this._state.pointers.get(e.pointerId),
      });
      Haptics.medium();
    }, Thresholds.GESTURE.LONG_PRESS_MS);
  }

  _clearLongPress() {
    if (this._state.longPressTimer) {
      clearTimeout(this._state.longPressTimer);
      this._state.longPressTimer = null;
    }
  }

  _getDistance(p1, p2) {
    return Math.hypot(p2.x - p1.x, p2.y - p1.y);
  }

  _getCenter(p1, p2) {
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    };
  }

  _emit(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(cb => cb(data));
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  destroy() {
    this._clearLongPress();
    this.element.removeEventListener('pointerdown', this._boundHandlers.pointerdown);
    this.element.removeEventListener('pointermove', this._boundHandlers.pointermove);
    this.element.removeEventListener('pointerup', this._boundHandlers.pointerup);
    this.element.removeEventListener('pointercancel', this._boundHandlers.pointercancel);
    this.listeners.clear();
  }
}

/* ── Touch-Optimized Plot Extension ─────────────────────── */
export class TouchPlot {
  constructor(plot, opts = {}) {
    this.plot = plot;
    this.cv = plot.cv;
    this.opts = {
      enablePinchZoom: opts.enablePinchZoom ?? true,
      enableLongPress: opts.enableLongPress ?? true,
      enableSwipeUndo: opts.enableSwipeUndo ?? true,
      enableHaptics: opts.enableHaptics ?? true,
      onLongPress: opts.onLongPress ?? null,
      onSwipe: opts.onSwipe ?? null,
      onDoubleTap: opts.onDoubleTap ?? null,
      ...opts,
    };

    this._gesture = new GestureRecognizer(this.cv);
    this._setupGestureHandlers();
    this._setupResponsiveCanvas();
  }

  _setupGestureHandlers() {
    // Pinch zoom
    if (this.opts.enablePinchZoom) {
      this._gesture.on('pinchmove', (data) => {
        this._handlePinchZoom(data);
      });
    }

    // Long press
    if (this.opts.enableLongPress) {
      this._gesture.on('longpress', (data) => {
        if (this.opts.onLongPress) {
          const rect = this.cv.getBoundingClientRect();
          const x = this.plot.invX(data.x - rect.left);
          const y = this.plot.invY(data.y - rect.top);
          this.opts.onLongPress(x, y, data);
        }
      });
    }

    // Swipe
    if (this.opts.enableSwipeUndo) {
      this._gesture.on('swipe', (data) => {
        if (this.opts.onSwipe) {
          this.opts.onSwipe(data);
        }
      });
    }

    // Double tap
    this._gesture.on('tap', (data) => {
      if (data.double && this.opts.onDoubleTap) {
        const rect = this.cv.getBoundingClientRect();
        const x = this.plot.invX(data.x - rect.left);
        const y = this.plot.invY(data.y - rect.top);
        this.opts.onDoubleTap(x, y, data);
      }
    });
  }

  _handlePinchZoom(data) {
    const { center, scale } = data;
    const rect = this.cv.getBoundingClientRect();
    const cx = this.plot.invX(center.x - rect.left);
    const cy = this.plot.invY(center.y - rect.top);

    // Calculate scale factor relative to 1 (no zoom)
    const factor = 1 / scale;

    // Apply zoom centered on pinch point
    const v = this.plot.view;
    v.xmin = cx + (v.xmin - cx) * factor;
    v.xmax = cx + (v.xmax - cx) * factor;
    v.ymin = cy + (v.ymin - cy) * factor;
    v.ymax = cy + (v.ymax - cy) * factor;

    this.plot.draw();

    if (this.opts.enableHaptics) {
      Haptics.selection();
    }
  }

  _setupResponsiveCanvas() {
    // Auto-resize based on viewport
    const resize = () => {
      const dpr = Device.pixelRatio;
      const r = this.cv.getBoundingClientRect();
      this.cv.width = r.width * dpr;
      this.cv.height = r.height * dpr;
      this.plot.W = r.width;
      this.plot.H = r.height;
      this.plot.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.plot.draw();
    };

    // Initial setup
    resize();

    // Observe container size changes
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(resize);
      ro.observe(this.cv.parentElement || this.cv);
    } else {
      window.addEventListener('resize', resize);
    }
  }

  destroy() {
    this._gesture.destroy();
  }
}

/* ── Touch-Optimized Tool System ────────────────────────── */
export class TouchToolSystem {
  constructor(canvas, plot, opts = {}) {
    this.canvas = canvas;
    this.plot = plot;
    this.opts = {
      enableHaptics: opts.enableHaptics ?? true,
      toolChangeDelay: opts.toolChangeDelay ?? 50, // ms to prevent accidental activation
      ...opts,
    };

    this._gesture = new GestureRecognizer(canvas);
    this._currentTool = null;
    this._toolStartTime = 0;
    this._setupToolHandlers();
  }

  _setupToolHandlers() {
    // Tool activation via tap
    this._gesture.on('tap', (data) => {
      if (this._currentTool) {
        this._handleToolAction(data);
      }
    });

    // Tool preview on hover/move
    this._gesture.on('pointermove', (data) => {
      if (this._currentTool) {
        this._handleToolPreview(data);
      }
    });

    // Cancel tool on swipe
    this._gesture.on('swipe', (data) => {
      if (this._currentTool) {
        this.setTool(null);
      }
    });
  }

  setTool(tool) {
    const prevTool = this._currentTool;
    this._currentTool = tool;
    this._toolStartTime = Date.now();

    // Update cursor
    this.canvas.style.cursor = tool ? 'crosshair' : '';

    // Haptic feedback
    if (this.opts.enableHaptics && tool !== prevTool) {
      Haptics.selection();
    }

    // Emit tool change event
    this.canvas.dispatchEvent(new CustomEvent('toolchange', {
      detail: { tool, prevTool }
    }));
  }

  getTool() {
    return this._currentTool;
  }

  _handleToolAction(data) {
    if (!this._currentTool) return;

    const rect = this.canvas.getBoundingClientRect();
    const mx = data.x - rect.left;
    const my = data.y - rect.top;
    const x = this.plot.invX(mx);
    const y = this.plot.invY(my);

    // Emit tool action event
    this.canvas.dispatchEvent(new CustomEvent('toolaction', {
      detail: {
        tool: this._currentTool,
        x,
        y,
        mx,
        my,
        timestamp: Date.now(),
      }
    }));

    if (this.opts.enableHaptics) {
      Haptics.light();
    }
  }

  _handleToolPreview(data) {
    const rect = this.canvas.getBoundingClientRect();
    const mx = data.x - rect.left;
    const my = data.y - rect.top;

    // Emit tool preview event
    this.canvas.dispatchEvent(new CustomEvent('toolpreview', {
      detail: {
        tool: this._currentTool,
        mx,
        my,
        x: this.plot.invX(mx),
        y: this.plot.invY(my),
      }
    }));
  }

  destroy() {
    this._gesture.destroy();
  }
}

/* ── Accessibility Helpers ──────────────────────────────── */
export const A11y = {
  // Announce to screen readers
  announce(message, priority = 'polite') {
    const el = document.getElementById('a11y-announcer');
    if (el) {
      el.setAttribute('aria-live', priority);
      el.textContent = message;
      // Clear after announcement
      setTimeout(() => { el.textContent = ''; }, 1000);
    }
  },

  // Create screen reader announcer if not present
  ensureAnnouncer() {
    if (!document.getElementById('a11y-announcer')) {
      const el = document.createElement('div');
      el.id = 'a11y-announcer';
      el.setAttribute('aria-live', 'polite');
      el.setAttribute('aria-atomic', 'true');
      el.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);';
      document.body.appendChild(el);
    }
  },

  // Focus management
  setFocus(element, options = {}) {
    if (element) {
      element.focus({ preventScroll: options.preventScroll ?? false });
      if (options.announce) {
        this.announce(options.announce);
      }
    }
  },

  // Keyboard navigation helpers
  handleKeyboardNavigation(e, handlers) {
    const key = e.key;
    const shift = e.shiftKey;
    const ctrl = e.ctrlKey || e.metaKey;

    // Map keys to actions
    const keyMap = {
      'ArrowLeft': handlers.left,
      'ArrowRight': handlers.right,
      'ArrowUp': handlers.up,
      'ArrowDown': handlers.down,
      'Enter': handlers.select,
      ' ': handlers.select,
      'Escape': handlers.cancel,
      'Delete': handlers.delete,
      'Backspace': handlers.delete,
      'Home': handlers.home,
      'End': handlers.end,
    };

    const handler = keyMap[key];
    if (handler) {
      e.preventDefault();
      handler({ shift, ctrl, key });
      return true;
    }

    return false;
  }
};

/* ── Responsive Canvas Sizing ───────────────────────────── */
export const ResponsiveCanvas = {
  // Calculate optimal canvas size based on container and device
  calculateSize(container, opts = {}) {
    const dpr = Device.pixelRatio;
    const rect = container.getBoundingClientRect();
    
    const width = rect.width;
    const height = opts.height ?? rect.height;
    
    // Adjust for high DPI
    return {
      width: width * dpr,
      height: height * dpr,
      cssWidth: width,
      cssHeight: height,
      dpr,
    };
  },

  // Apply responsive sizing to canvas
  apply(canvas, container, opts = {}) {
    const size = this.calculateSize(container, opts);
    
    canvas.width = size.width;
    canvas.height = size.height;
    canvas.style.width = size.cssWidth + 'px';
    canvas.style.height = size.cssHeight + 'px';
    
    const ctx = canvas.getContext('2d');
    ctx.setTransform(size.dpr, 0, 0, size.dpr, 0, 0);
    
    return size;
  },

  // Auto-resize observer
  observe(canvas, container, callback, opts = {}) {
    const resize = () => {
      const size = this.apply(canvas, container, opts);
      if (callback) callback(size);
    };

    resize();

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(resize);
      ro.observe(container);
      return () => ro.disconnect();
    } else {
      window.addEventListener('resize', resize);
      return () => window.removeEventListener('resize', resize);
    }
  }
};

/* ── Touch-Optimized TrigCircle Extension ───────────────── */
export function enhanceTrigCircle(circleController, canvas, opts = {}) {
  const gesture = new GestureRecognizer(canvas);
  
  // Enhanced hit detection
  const originalPointerDown = circleController._handlePointerDown;
  if (originalPointerDown) {
    circleController._handlePointerDown = function(e) {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      
      // Use adaptive threshold
      const threshold = Thresholds.hitRadius;
      
      // Calculate distance to point P
      const cx = canvas.width / (2 * Device.pixelRatio);
      const cy = canvas.height / (2 * Device.pixelRatio);
      const r = Math.min(cx, cy) - 40;
      const px = cx + r * Math.cos(circleController.getTheta());
      const py = cy - r * Math.sin(circleController.getTheta());
      
      const dist = Math.hypot(mx - px, my - py);
      if (dist > threshold) return;
      
      originalPointerDown.call(this, e);
    };
  }
  
  // Add long press for context menu
  gesture.on('longpress', (data) => {
    if (opts.onLongPress) {
      opts.onLongPress(circleController.getTheta(), data);
    }
  });
  
  // Add double tap to reset
  gesture.on('tap', (data) => {
    if (data.double && opts.onDoubleTap) {
      opts.onDoubleTap(circleController.getTheta(), data);
    }
  });
  
  return {
    destroy: () => gesture.destroy()
  };
}

/* ── Export all ─────────────────────────────────────────── */
export default {
  Device,
  Thresholds,
  Haptics,
  GestureRecognizer,
  TouchPlot,
  TouchToolSystem,
  A11y,
  ResponsiveCanvas,
  enhanceTrigCircle,
};
