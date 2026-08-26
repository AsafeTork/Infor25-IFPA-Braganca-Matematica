/* ============================================================
   core/touchIntegration.js
   Example integration of touch optimization with existing components
   ============================================================ */

import { Plot, formatExactValue } from './plotEngine.js';
import { 
  Device, 
  Thresholds, 
  Haptics, 
  GestureRecognizer, 
  TouchPlot, 
  TouchToolSystem, 
  A11y, 
  ResponsiveCanvas 
} from './touchOptimization.js';

/* ── Example: Enhanced Professor Page ───────────────────── */
export function initProfessorTouchSupport() {
  // Ensure A11y announcer exists
  A11y.ensureAnnouncer();

  const canvas = document.getElementById('plot-canvas');
  if (!canvas) return;

  const plot = new Plot(canvas, { xmin: -6, xmax: 6, ymin: -4, ymax: 4 });

  // Enable touch optimization if on touch device
  let touchPlot = null;
  let toolSystem = null;

  if (Device.isTouch) {
    // Initialize touch-optimized plot
    touchPlot = new TouchPlot(plot, {
      enablePinchZoom: true,
      enableLongPress: true,
      enableSwipeUndo: true,
      enableHaptics: true,

      onLongPress: (x, y) => {
        // Show context menu at coordinates
        showContextMenu(x, y);
        A11y.announce('Context menu opened');
      },

      onDoubleTap: (x, y) => {
        // Reset view on double tap
        plot.reset();
        Haptics.success();
        A11y.announce('View reset');
      },

      onSwipe: (data) => {
        // Handle swipe gestures
        if (data.direction === 'left') {
          undoLastAction();
          A11y.announce('Undo');
        } else if (data.direction === 'right') {
          redoLastAction();
          A11y.announce('Redo');
        }
      },
    });

    // Initialize touch-optimized tool system
    toolSystem = new TouchToolSystem(canvas, plot, {
      enableHaptics: true,
    });

    // Handle tool change events
    canvas.addEventListener('toolchange', (e) => {
      const { tool } = e.detail;
      updateToolUI(tool);
      A11y.announce(tool ? `${tool} tool selected` : 'Tool deselected');
    });

    // Handle tool action events
    canvas.addEventListener('toolaction', (e) => {
      const { tool, x, y } = e.detail;
      handleToolAction(tool, x, y);
    });

    // Setup responsive canvas
    const container = canvas.parentElement;
    ResponsiveCanvas.observe(canvas, container, (size) => {
      plot.W = size.cssWidth;
      plot.H = size.cssHeight;
      plot.draw();
    });
  } else {
    // Desktop: use existing resize logic
    plot.resize();
    window.addEventListener('resize', () => plot.resize());
  }

  // Setup keyboard navigation for accessibility
  setupKeyboardNavigation(plot, toolSystem);

  // Setup probe callback
  plot.onProbe = (x, y) => {
    document.getElementById('readout').textContent =
      `x = ${formatExactValue(x)}   y = ${formatExactValue(y)}`;
  };

  return { plot, touchPlot, toolSystem };
}

/* ── Context Menu ───────────────────────────────────────── */
function showContextMenu(x, y) {
  // Create context menu if it doesn't exist
  let menu = document.getElementById('context-menu');
  if (!menu) {
    menu = document.createElement('div');
    menu.id = 'context-menu';
    menu.className = 'context-menu';
    menu.innerHTML = `
      <button class="context-menu-item" data-action="mark">Marcar ponto</button>
      <button class="context-menu-item" data-action="vline">Linha vertical</button>
      <button class="context-menu-item" data-action="area">Sombrear área</button>
      <button class="context-menu-item" data-action="reset">Resetar vista</button>
    `;
    document.body.appendChild(menu);

    // Add event listeners
    menu.querySelectorAll('.context-menu-item').forEach(item => {
      item.addEventListener('click', () => {
        const action = item.dataset.action;
        handleContextMenuAction(action, x, y);
        hideContextMenu();
      });
    });
  }

  // Position menu
  const rect = canvas.getBoundingClientRect();
  menu.style.left = (rect.left + x) + 'px';
  menu.style.top = (rect.top + y) + 'px';
  menu.classList.remove('hidden');

  // Close on outside click
  setTimeout(() => {
    document.addEventListener('click', hideContextMenu, { once: true });
  }, 10);
}

function hideContextMenu() {
  const menu = document.getElementById('context-menu');
  if (menu) {
    menu.classList.add('hidden');
  }
}

function handleContextMenuAction(action, x, y) {
  switch (action) {
    case 'mark':
      overlays.push({ type: 'marker', x, y, color: toolColor, label: formatExactValue(x) });
      break;
    case 'vline':
      overlays.push({ type: 'vline', x, color: toolColor });
      break;
    case 'area':
      // Start area selection
      toolSystem.setTool('area');
      areaStart = x;
      break;
    case 'reset':
      plot.reset();
      break;
  }
  plot.draw();
  Haptics.light();
}

/* ── Tool UI Updates ────────────────────────────────────── */
function updateToolUI(tool) {
  document.querySelectorAll('.tool-btn').forEach(btn => {
    const btnTool = btn.id.replace('tool-', '');
    btn.classList.toggle('active', btnTool === tool);
  });
}

function handleToolAction(tool, x, y) {
  switch (tool) {
    case 'marker':
      overlays.push({ type: 'marker', x, y, color: toolColor, label: formatExactValue(x) });
      plot.draw();
      break;
    case 'vline':
      overlays.push({ type: 'vline', x, color: toolColor });
      plot.draw();
      break;
    case 'area':
      if (areaStart === null) {
        areaStart = x;
      } else {
        overlays.push({ 
          type: 'area', 
          x: Math.min(areaStart, x), 
          x2: Math.max(areaStart, x), 
          color: toolColor, 
          opacity: areaOpacity 
        });
        areaStart = null;
        toolSystem.setTool(null);
        plot.draw();
      }
      break;
    case 'triangle':
      overlays.push({ type: 'triangle', x, y, color: toolColor });
      toolSystem.setTool(null);
      plot.draw();
      break;
  }
}

/* ── Keyboard Navigation ────────────────────────────────── */
function setupKeyboardNavigation(plot, toolSystem) {
  const handlers = {
    left: () => {
      const dx = (plot.view.xmax - plot.view.xmin) * 0.1;
      plot.view.xmin -= dx;
      plot.view.xmax -= dx;
      plot.draw();
      A11y.announce('Pan left');
    },
    right: () => {
      const dx = (plot.view.xmax - plot.view.xmin) * 0.1;
      plot.view.xmin += dx;
      plot.view.xmax += dx;
      plot.draw();
      A11y.announce('Pan right');
    },
    up: () => {
      const dy = (plot.view.ymax - plot.view.ymin) * 0.1;
      plot.view.ymin += dy;
      plot.view.ymax += dy;
      plot.draw();
      A11y.announce('Pan up');
    },
    down: () => {
      const dy = (plot.view.ymax - plot.view.ymin) * 0.1;
      plot.view.ymin -= dy;
      plot.view.ymax -= dy;
      plot.draw();
      A11y.announce('Pan down');
    },
    select: () => {
      if (toolSystem) {
        const tool = toolSystem.getTool();
        if (tool) {
          // Place at center of view
          const x = (plot.view.xmin + plot.view.xmax) / 2;
          const y = (plot.view.ymin + plot.view.ymax) / 2;
          handleToolAction(tool, x, y);
          A11y.announce(`${tool} placed at center`);
        }
      }
    },
    cancel: () => {
      if (toolSystem) {
        toolSystem.setTool(null);
        A11y.announce('Tool cancelled');
      }
    },
  };

  document.addEventListener('keydown', (e) => {
    // Only handle if canvas or tool button is focused
    if (document.activeElement?.tagName === 'CANVAS' ||
        document.activeElement?.classList.contains('tool-btn')) {
      A11y.handleKeyboardNavigation(e, handlers);
    }
  });
}

/* ── Undo/Redo System ───────────────────────────────────── */
const undoStack = [];
const redoStack = [];

function undoLastAction() {
  if (undoStack.length > 0) {
    const action = undoStack.pop();
    redoStack.push(action);
    // Revert action
    revertAction(action);
    plot.draw();
    Haptics.light();
  }
}

function redoLastAction() {
  if (redoStack.length > 0) {
    const action = redoStack.pop();
    undoStack.push(action);
    // Reapply action
    applyAction(action);
    plot.draw();
    Haptics.light();
  }
}

function applyAction(action) {
  // Implementation depends on action type
  overlays.push(action);
}

function revertAction(action) {
  // Implementation depends on action type
  const idx = overlays.indexOf(action);
  if (idx !== -1) {
    overlays.splice(idx, 1);
  }
}

/* ── CSS for Context Menu ───────────────────────────────── */
const contextMenuCSS = `
.context-menu {
  position: fixed;
  z-index: 1000;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.5rem 0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  min-width: 150px;
}

.context-menu.hidden {
  display: none;
}

.context-menu-item {
  display: block;
  width: 100%;
  padding: 0.5rem 1rem;
  text-align: left;
  background: none;
  border: none;
  color: var(--text);
  cursor: pointer;
  font-size: 0.875rem;
}

.context-menu-item:hover {
  background: var(--surface-2);
}

.context-menu-item:active {
  background: var(--accent-soft);
  color: var(--accent);
}
`;

// Inject CSS
const style = document.createElement('style');
style.textContent = contextMenuCSS;
document.head.appendChild(style);

/* ── Export ──────────────────────────────────────────────── */
export default {
  initProfessorTouchSupport,
  showContextMenu,
  hideContextMenu,
};
