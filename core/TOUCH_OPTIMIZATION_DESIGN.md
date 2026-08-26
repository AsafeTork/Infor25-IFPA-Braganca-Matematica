# Touch Optimization Strategy for Graphics System

## Executive Summary

This document outlines a comprehensive touch optimization strategy for the graphics system, addressing pinch-zoom, adaptive thresholds, gesture recognition, haptic feedback, and accessibility. The strategy is designed to enhance the mobile user experience while maintaining backward compatibility with existing code.

---

## 1. Pinch-Zoom Implementation

### 1.1 Gesture Recognition Architecture

The pinch-zoom system uses a `GestureRecognizer` class that tracks multiple pointer events simultaneously:

```javascript
// From core/touchOptimization.js
export class GestureRecognizer {
  constructor(element) {
    this._state = {
      pointers: new Map(),
      pinchStartDistance: 0,
      pinchStartScale: 1,
      // ... other state
    };
  }

  _onPointerDown(e) {
    this._state.pointers.set(e.pointerId, {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      startX: e.clientX,
      startY: e.clientY,
    });

    // When two pointers detected, start pinch tracking
    if (this._state.pointers.size === 2) {
      const pointers = Array.from(this._state.pointers.values());
      this._state.pinchStartDistance = this._getDistance(pointers[0], pointers[1]);
      this._emit('pinchstart', {
        center: this._getCenter(pointers[0], pointers[1]),
        distance: this._state.pinchStartDistance,
      });
    }
  }

  _onPointerMove(e) {
    // Calculate pinch scale
    if (this._state.pointers.size === 2) {
      const pointers = Array.from(this._state.pointers.values());
      const currentDistance = this._getDistance(pointers[0], pointers[1]);
      const scale = currentDistance / this._state.pinchStartDistance;
      
      this._emit('pinchmove', {
        center: this._getCenter(pointers[0], pointers[1]),
        scale: Math.max(0.25, Math.min(4.0, scale)), // Clamp scale
      });
    }
  }
}
```

### 1.2 Viewport Transform Integration

The `TouchPlot` class integrates pinch-zoom with the Plot engine:

```javascript
export class TouchPlot {
  constructor(plot, opts = {}) {
    this.plot = plot;
    this._gesture = new GestureRecognizer(plot.cv);
    
    this._gesture.on('pinchmove', (data) => {
      this._handlePinchZoom(data);
    });
  }

  _handlePinchZoom(data) {
    const { center, scale } = data;
    const rect = this.cv.getBoundingClientRect();
    
    // Convert pinch center to plot coordinates
    const cx = this.plot.invX(center.x - rect.left);
    const cy = this.plot.invY(center.y - rect.top);
    
    // Calculate zoom factor (invert scale for intuitive feel)
    const factor = 1 / scale;
    
    // Apply zoom centered on pinch point
    const v = this.plot.view;
    v.xmin = cx + (v.xmin - cx) * factor;
    v.xmax = cx + (v.xmax - cx) * factor;
    v.ymin = cy + (v.ymin - cy) * factor;
    v.ymax = cy + (v.ymax - cy) * factor;
    
    this.plot.draw();
  }
}
```

### 1.3 Integration with Plot Engine

Modify `plotEngine.js` to support pinch-zoom:

```javascript
// In core/plotEngine.js, add to Plot class:
import { TouchPlot } from './touchOptimization.js';

export class Plot {
  constructor(canvas, opts = {}) {
    // ... existing constructor code ...
    
    // Enable touch optimization if on touch device
    if (Device.isTouch) {
      this._touchPlot = new TouchPlot(this, {
        enablePinchZoom: true,
        enableLongPress: true,
        onLongPress: (x, y, data) => {
          // Show context menu at coordinates
          this._showContextMenu(x, y);
        },
        onDoubleTap: (x, y) => {
          // Reset view on double tap
          this.reset();
        },
      });
    }
  }
  
  _showContextMenu(x, y) {
    // Implementation for context menu
    this.cv.dispatchEvent(new CustomEvent('contextmenu', {
      detail: { x, y }
    }));
  }
}
```

---

## 2. Adaptive Thresholds and Hit Zones

### 2.1 Device Detection

```javascript
export const Device = {
  get isTouch() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },
  
  get isCoarse() {
    return window.matchMedia('(pointer: coarse)').matches;
  },
  
  get isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },
  
  get isTablet() {
    return this.isCoarse && Math.min(window.innerWidth, window.innerHeight) >= 768;
  }
};
```

### 2.2 Threshold Configuration

```javascript
export const Thresholds = {
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
    LONG_PRESS_MS: 500,
    LONG_PRESS_MOVE_TOLERANCE: 10,
    SWIPE_VELOCITY: 0.5,
    SWIPE_DISTANCE: 50,
    PINCH_SCALE_MIN: 0.25,
    PINCH_SCALE_MAX: 4.0,
    DOUBLE_TAP_DELAY_MS: 300,
    TAP_DISTANCE_TOLERANCE: 10,
  }
};
```

### 2.3 Usage in TrigCircle

Update `trigVisuals.js` to use adaptive thresholds:

```javascript
// In mountTrigCircle function:
cv.addEventListener("pointerdown", (e) => {
  const rect = cv.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  
  // Use adaptive threshold instead of hardcoded 48
  const threshold = Thresholds.hitRadius;
  
  const ppx = _cx + _r * Math.cos(theta);
  const ppy = _cy - _r * Math.sin(theta);
  const dist = Math.hypot(mx - ppx, my - ppy);
  
  if (dist > threshold) return;
  
  e.preventDefault();
  cv.setPointerCapture(e.pointerId);
  prevAngle = evAngle(e);
});
```

---

## 3. Touch-First Tool Interaction Model

### 3.1 Tool System Architecture

```javascript
export class TouchToolSystem {
  constructor(canvas, plot, opts = {}) {
    this.canvas = canvas;
    this.plot = plot;
    this._gesture = new GestureRecognizer(canvas);
    this._currentTool = null;
    
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
    this._currentTool = tool;
    this.canvas.style.cursor = tool ? 'crosshair' : '';
    
    // Emit tool change event
    this.canvas.dispatchEvent(new CustomEvent('toolchange', {
      detail: { tool }
    }));
  }

  _handleToolAction(data) {
    const rect = this.canvas.getBoundingClientRect();
    const x = this.plot.invX(data.x - rect.left);
    const y = this.plot.invY(data.y - rect.top);
    
    // Emit tool action event
    this.canvas.dispatchEvent(new CustomEvent('toolaction', {
      detail: {
        tool: this._currentTool,
        x,
        y,
      }
    }));
  }
}
```

### 3.2 Integration with Professor.html

Update tool button handlers to use touch events:

```javascript
// In professor.html, replace click handlers with touch-optimized handlers:
const toolSystem = new TouchToolSystem(canvas, plot);

// Tool buttons
document.querySelectorAll('.tool-btn').forEach(btn => {
  btn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    const tool = btn.id.replace('tool-', '');
    toolSystem.setTool(tool === toolSystem.getTool() ? null : tool);
  });
});

// Handle tool actions
canvas.addEventListener('toolaction', (e) => {
  const { tool, x, y } = e.detail;
  
  if (tool === 'marker') {
    overlays.push({ type: 'marker', x, y, color: toolColor, label: formatExactValue(x) });
    plot.draw();
  } else if (tool === 'vline') {
    overlays.push({ type: 'vline', x, color: toolColor });
    plot.draw();
  }
  // ... other tool handlers
});
```

---

## 4. Gesture Mapping

### 4.1 Gesture Definitions

| Gesture | Action | Context |
|---------|--------|---------|
| **Tap** | Select/Place | Tool mode |
| **Double Tap** | Reset view | Plot canvas |
| **Long Press** | Context menu | Any element |
| **Swipe Left** | Undo | Tool mode |
| **Swipe Right** | Redo | Tool mode |
| **Swipe Up** | Zoom in | Plot canvas |
| **Swipe Down** | Zoom out | Plot canvas |
| **Pinch** | Zoom in/out | Plot canvas |
| **Two-finger Pan** | Pan | Plot canvas |

### 4.2 Gesture Handler Implementation

```javascript
// Example: Long press for context menu
gesture.on('longpress', (data) => {
  const rect = canvas.getBoundingClientRect();
  const x = plot.invX(data.x - rect.left);
  const y = plot.invY(data.y - rect.top);
  
  // Show context menu
  showContextMenu(x, y, data);
});

// Example: Swipe for undo
gesture.on('swipe', (data) => {
  if (data.direction === 'left' && currentTool) {
    undoLastAction();
    Haptics.light();
  }
});

// Example: Double tap to reset
gesture.on('tap', (data) => {
  if (data.double) {
    plot.reset();
    Haptics.success();
  }
});
```

---

## 5. Responsive Canvas Sizing

### 5.1 ResponsiveCanvas System

```javascript
export const ResponsiveCanvas = {
  calculateSize(container, opts = {}) {
    const dpr = Device.pixelRatio;
    const rect = container.getBoundingClientRect();
    
    return {
      width: rect.width * dpr,
      height: (opts.height ?? rect.height) * dpr,
      cssWidth: rect.width,
      cssHeight: opts.height ?? rect.height,
      dpr,
    };
  },

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
    }
  }
};
```

### 5.2 Integration with Plot

```javascript
// In Plot constructor:
constructor(canvas, opts = {}) {
  // ... existing code ...
  
  // Setup responsive sizing
  if (Device.isTouch) {
    const container = canvas.parentElement || canvas;
    ResponsiveCanvas.observe(canvas, container, (size) => {
      this.W = size.cssWidth;
      this.H = size.cssHeight;
      this.draw();
    });
  } else {
    this.resize();
  }
  
  window.addEventListener('resize', () => this.resize());
}
```

---

## 6. Haptic Feedback

### 6.1 Haptics API

```javascript
export const Haptics = {
  get supported() {
    return 'vibrate' in navigator;
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
```

### 6.2 Haptic Integration Points

| Action | Haptic Pattern | Implementation |
|--------|---------------|----------------|
| Tool selection | `selection()` | `setTool()` method |
| Point snap | `light()` | `trySnap()` callback |
| Long press | `medium()` | Gesture recognizer |
| Pinch start | `light()` | Pinch handler |
| Double tap | `success()` | Tap handler |
| Error | `error()` | Invalid action |

---

## 7. Accessibility Considerations

### 7.1 Screen Reader Support

```javascript
export const A11y = {
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

  announce(message, priority = 'polite') {
    const el = document.getElementById('a11y-announcer');
    if (el) {
      el.setAttribute('aria-live', priority);
      el.textContent = message;
      setTimeout(() => { el.textContent = ''; }, 1000);
    }
  },

  handleKeyboardNavigation(e, handlers) {
    const key = e.key;
    const handler = {
      'ArrowLeft': handlers.left,
      'ArrowRight': handlers.right,
      'ArrowUp': handlers.up,
      'ArrowDown': handlers.down,
      'Enter': handlers.select,
      ' ': handlers.select,
      'Escape': handlers.cancel,
    }[key];

    if (handler) {
      e.preventDefault();
      handler({ shift: e.shiftKey, ctrl: e.ctrlKey || e.metaKey });
      return true;
    }
    return false;
  }
};
```

### 7.2 Keyboard Navigation

Implement keyboard shortcuts for all touch gestures:

```javascript
// Example keyboard handlers
const keyboardHandlers = {
  left: () => plot.pan(-50, 0),
  right: () => plot.pan(50, 0),
  up: () => plot.pan(0, -50),
  down: () => plot.pan(0, 50),
  select: () => {
    // Place marker at center or selected point
    const x = (plot.view.xmin + plot.view.xmax) / 2;
    const y = (plot.view.ymin + plot.view.ymax) / 2;
    placeMarker(x, y);
  },
  cancel: () => {
    toolSystem.setTool(null);
    A11y.announce('Tool cancelled');
  },
};

document.addEventListener('keydown', (e) => {
  A11y.handleKeyboardNavigation(e, keyboardHandlers);
});
```

### 7.3 ARIA Attributes

```html
<!-- Canvas with ARIA attributes -->
<canvas 
  id="plot-canvas"
  role="img"
  aria-label="Interactive plot. Use arrow keys to pan, plus/minus to zoom."
  tabindex="0"
></canvas>

<!-- Tool buttons with ARIA -->
<button 
  class="tool-btn" 
  id="tool-marker"
  role="radio"
  aria-checked="false"
  aria-label="Mark point tool"
>
  📍 Marcar ponto
</button>
```

---

## 8. Integration Guide

### 8.1 Adding Touch Support to Existing Components

1. **Import the touch optimization module:**
   ```javascript
   import { Device, GestureRecognizer, TouchPlot } from './touchOptimization.js';
   ```

2. **Enhance Plot class:**
   ```javascript
   // In plotEngine.js
   constructor(canvas, opts = {}) {
     // ... existing code ...
     
     if (Device.isTouch) {
       this._touchPlot = new TouchPlot(this, {
         enablePinchZoom: true,
         enableLongPress: true,
       });
     }
   }
   ```

3. **Update TrigCircle thresholds:**
   ```javascript
   // In trigVisuals.js
   import { Thresholds } from './touchOptimization.js';
   
   // Replace hardcoded 48 with adaptive threshold
   const threshold = Thresholds.hitRadius;
   ```

4. **Add ARIA announcer to HTML:**
   ```html
   <div id="a11y-announcer" 
        aria-live="polite" 
        aria-atomic="true"
        style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);">
   </div>
   ```

### 8.2 Testing Checklist

- [ ] Pinch-zoom works on iOS Safari
- [ ] Pinch-zoom works on Android Chrome
- [ ] Long press triggers context menu
- [ ] Double tap resets view
- [ ] Swipe gestures work
- [ ] Tool placement is responsive
- [ ] Haptic feedback works (where supported)
- [ ] Screen reader announces changes
- [ ] Keyboard navigation works
- [ ] Adaptive thresholds adjust to device

---

## 9. Performance Considerations

1. **Debounce gesture events** during rapid movements
2. **Use requestAnimationFrame** for visual updates
3. **Throttle haptic feedback** to avoid overwhelming vibration motor
4. **Cache device detection** results to avoid repeated queries
5. **Use passive event listeners** where possible

---

## 10. Browser Compatibility

| Feature | iOS Safari | Android Chrome | Desktop |
|---------|-----------|---------------|---------|
| Pointer Events | ✅ | ✅ | ✅ |
| Pinch Zoom | ✅ | ✅ | ⚠️ Trackpad |
| Haptic Feedback | ❌ | ✅ | ❌ |
| ResizeObserver | ✅ | ✅ | ✅ |
| Touch Events | ✅ | ✅ | ❌ |

---

## 11. Migration Path

1. **Phase 1:** Add `touchOptimization.js` module (no breaking changes)
2. **Phase 2:** Update `plotEngine.js` with touch support
3. **Phase 3:** Update `trigVisuals.js` thresholds
4. **Phase 4:** Update `professor.html` tool interactions
5. **Phase 5:** Add accessibility features

Each phase is independent and can be deployed separately.

---

## 12. Future Enhancements

1. **Stylus support** with pressure sensitivity
2. **Multi-user collaboration** on touch devices
3. **Gesture customization** via settings
4. **Analytics** for gesture usage patterns
5. **AI-powered gesture prediction**

---

*Document Version: 1.0*
*Last Updated: 2026-08-26*
