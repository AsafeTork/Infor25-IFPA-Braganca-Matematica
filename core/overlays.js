/* ============================================================
   core/overlays.js
   Sistema de overlays para o módulo do Professor.
   Gerencia marcadores, linhas, áreas, triângulos, textos, setas
   e círculos sobre o gráfico, com undo/redo, serialização e
   padrão observador para notificação de mudanças.
   ============================================================ */

/** @type {Readonly<Record<string, string>>} */
export const OverlayType = Object.freeze({
  MARKER:   "marker",
  VLINE:    "vline",
  HLINE:    "hline",
  AREA:     "area",
  TRIANGLE: "triangle",
  TEXT:     "text",
  ARROW:    "arrow",
  CIRCLE:   "circle",
});

/**
 * Valores padrão para cada tipo de overlay.
 * @type {Record<string, object>}
 */
const DEFAULTS = {
  [OverlayType.MARKER]: {
    color: "#ffa500",
    size: 6,
    label: "",
    x: 0,
    y: 0,
  },
  [OverlayType.VLINE]: {
    color: "#ffa500",
    width: 1.5,
    dash: [],
    x: 0,
    label: "",
  },
  [OverlayType.HLINE]: {
    color: "#ffa500",
    width: 1.5,
    dash: [],
    y: 0,
    label: "",
  },
  [OverlayType.AREA]: {
    color: "#ffa500",
    opacity: 0.25,
    x1: 0,
    x2: 1,
    fn: null,
  },
  [OverlayType.TRIANGLE]: {
    color: "#ffa500",
    opacity: 0.25,
    stroke: "#ffa500",
    points: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0.5, y: 1 },
    ],
  },
  [OverlayType.TEXT]: {
    color: "#ffa500",
    fontSize: 14,
    fontFamily: "monospace",
    x: 0,
    y: 0,
    text: "",
  },
  [OverlayType.ARROW]: {
    color: "#ffa500",
    width: 2,
    x1: 0,
    y1: 0,
    x2: 1,
    y2: 0,
    label: "",
  },
  [OverlayType.CIRCLE]: {
    color: "#ffa500",
    opacity: 0.25,
    stroke: "#ffa500",
    cx: 0,
    cy: 0,
    rx: 1,
    ry: 1,
  },
};

/** @type {number} */
const MAX_HISTORY = 50;

/**
 * @typedef {Object} OverlayData
 * @property {string} id
 * @property {string} type
 * @property {string} targetId
 * @property {Record<string, any>} props
 * @property {number} createdAt
 * @property {number} updatedAt
 */

/**
 * @typedef {"add"|"remove"|"update"|"clear"} ActionType
 */

/**
 * @typedef {Object} HistoryEntry
 * @property {ActionType} action
 * @property {OverlayData|null} overlay - clone do overlay (null para "clear")
 * @property {OverlayData[]} snapshot - snapshot de todos os overlays no momento
 */

/**
 * OverlayManager — gerencia overlays sobre o gráfico do professor.
 *
 * Suporta:
 * - Criar, ler, atualizar e remover overlays (CRUD)
 * - Undo/redo com histórico de até 50 passos
 * - Padrão observador para notificação de mudanças
 * - Serialização JSON para salvar/carregar estado
 * - Registro de targets (engines/canvases) associados aos overlays
 *
 * @example
 * const mgr = new OverlayManager();
 * mgr.onChange((overlays) => console.log("overlays:", overlays.length));
 * const id = mgr.add(OverlayType.MARKER, "plot-main", { x: Math.PI, y: 0, label: "π" });
 * mgr.undo();
 */
export class OverlayManager {
  /** @type {Map<string, OverlayData>} */
  #overlays = new Map();

  /** @type {Map<string, {type: string, engine: any}>} */
  #targets = new Map();

  /** @type {HistoryEntry[]} */
  #undoStack = [];

  /** @type {HistoryEntry[]} */
  #redoStack = [];

  /** @type {Array<(overlays: OverlayData[]) => void>} */
  #listeners = [];

  /* ────────────────────────────── CRUD ────────────────────────────── */

  /**
   * Adiciona um novo overlay.
   * @param {string} type - Tipo do overlay (use OverlayType).
   * @param {string} targetId - ID do target registrado.
   * @param {Record<string, any>} [props={}] - Propriedades do overlay.
   * @returns {string} ID do overlay criado.
   * @throws {Error} Se o tipo for inválido ou o target não estiver registrado.
   */
  add(type, targetId, props = {}) {
    if (!Object.values(OverlayType).includes(type)) {
      throw new Error(`OverlayType inválido: "${type}"`);
    }
    if (!this.#targets.has(targetId)) {
      throw new Error(`Target não registrado: "${targetId}"`);
    }

    const id = crypto.randomUUID();
    const defaults = DEFAULTS[type] || {};
    const now = Date.now();

    /** @type {OverlayData} */
    const overlay = {
      id,
      type,
      targetId,
      props: { ...defaults, ...props },
      createdAt: now,
      updatedAt: now,
    };

    this.#pushUndo({ action: "add", overlay: this.#clone(overlay), snapshot: this.#snapshot() });
    this.#overlays.set(id, overlay);
    this.#emit();
    return id;
  }

  /**
   * Remove um overlay pelo ID.
   * @param {string} id - ID do overlay.
   * @returns {boolean} true se removido, false se não encontrado.
   */
  remove(id) {
    const overlay = this.#overlays.get(id);
    if (!overlay) return false;

    this.#pushUndo({ action: "remove", overlay: this.#clone(overlay), snapshot: this.#snapshot() });
    this.#overlays.delete(id);
    this.#emit();
    return true;
  }

  /**
   * Atualiza propriedades de um overlay existente.
   * @param {string} id - ID do overlay.
   * @param {Record<string, any>} props - Novas propriedades (merge).
   * @returns {boolean} true se atualizado, false se não encontrado.
   */
  update(id, props) {
    const overlay = this.#overlays.get(id);
    if (!overlay) return false;

    this.#pushUndo({ action: "update", overlay: this.#clone(overlay), snapshot: this.#snapshot() });
    overlay.props = { ...overlay.props, ...props };
    overlay.updatedAt = Date.now();
    this.#emit();
    return true;
  }

  /**
   * Retorna um overlay pelo ID.
   * @param {string} id
   * @returns {OverlayData|undefined}
   */
  get(id) {
    return this.#overlays.get(id);
  }

  /**
   * Retorna todos os overlays.
   * @returns {OverlayData[]}
   */
  getAll() {
    return [...this.#overlays.values()];
  }

  /**
   * Retorna overlays filtrados por target.
   * @param {string} targetId
   * @returns {OverlayData[]}
   */
  getByTarget(targetId) {
    return this.getAll().filter((o) => o.targetId === targetId);
  }

  /**
   * Retorna overlays filtrados por tipo.
   * @param {string} type
   * @returns {OverlayData[]}
   */
  getByType(type) {
    return this.getAll().filter((o) => o.type === type);
  }

  /**
   * Remove todos os overlays (registrando no histórico).
   * @returns {number} Quantidade de overlays removidos.
   */
  clear() {
    const count = this.#overlays.size;
    if (count === 0) return 0;

    this.#pushUndo({ action: "clear", overlay: null, snapshot: this.#snapshot() });
    this.#overlays.clear();
    this.#emit();
    return count;
  }

  /**
   * Quantidade total de overlays.
   * @returns {number}
   */
  get size() {
    return this.#overlays.size;
  }

  /* ────────────────────────── TARGETS ────────────────────────── */

  /**
   * Registra um target (engine/canvas) que receberá overlays.
   * @param {string} id - Identificador único do target.
   * @param {string} type - Tipo do target (ex: "plot", "canvas").
   * @param {any} engine - Referência à engine/canvas associada.
   * @throws {Error} Se o ID já estiver registrado.
   */
  registerTarget(id, type, engine) {
    if (this.#targets.has(id)) {
      throw new Error(`Target já registrado: "${id}"`);
    }
    this.#targets.set(id, { type, engine });
  }

  /**
   * Remove um target registrado.
   * @param {string} id
   * @returns {boolean}
   */
  unregisterTarget(id) {
    return this.#targets.delete(id);
  }

  /**
   * Retorna a referência de um target registrado.
   * @param {string} id
   * @returns {{type: string, engine: any}|undefined}
   */
  getTarget(id) {
    return this.#targets.get(id);
  }

  /**
   * Retorna todos os targets registrados.
   * @returns {Array<{id: string, type: string, engine: any}>}
   */
  getAllTargets() {
    return [...this.#targets.entries()].map(([id, t]) => ({ id, ...t }));
  }

  /* ──────────────────── UNDO / REDO ──────────────────── */

  /**
   * Desfaz a última ação.
   * @returns {boolean} true se desfecho, false se nada a desfazer.
   */
  undo() {
    const entry = this.#undoStack.pop();
    if (!entry) return false;

    this.#redoStack.push(this.#snapshotEntry(entry));

    this.#restoreSnapshot(entry.snapshot);
    this.#emit();
    return true;
  }

  /**
   * Refaz a última ação desfeita.
   * @returns {boolean} true se refeito, false se nada a refazer.
   */
  redo() {
    const entry = this.#redoStack.pop();
    if (!entry) return false;

    this.#undoStack.push(this.#snapshotEntry(entry));

    this.#applyAction(entry);
    this.#emit();
    return true;
  }

  /**
   * Indica se há ações para desfazer.
   * @returns {boolean}
   */
  get canUndo() {
    return this.#undoStack.length > 0;
  }

  /**
   * Indica se há ações para refazer.
   * @returns {boolean}
   */
  get canRedo() {
    return this.#redoStack.length > 0;
  }

  /**
   * Limpa todo o histórico de undo/redo.
   */
  clearHistory() {
    this.#undoStack.length = 0;
    this.#redoStack.length = 0;
  }

  /* ────────────────── OBSERVER PATTERN ────────────────── */

  /**
   * Registra um listener chamado sempre que os overlays mudam.
   * @param {(overlays: OverlayData[]) => void} callback
   * @returns {() => void} Função para cancelar o registro.
   */
  onChange(callback) {
    this.#listeners.push(callback);
    return () => this.offChange(callback);
  }

  /**
   * Remove um listener previamente registrado.
   * @param {(overlays: OverlayData[]) => void} callback
   */
  offChange(callback) {
    this.#listeners = this.#listeners.filter((fn) => fn !== callback);
  }

  /* ──────────────────── SERIALIZATION ──────────────────── */

  /**
   * Serializa todo o estado para JSON.
   * Não inclui referências de targets (apenas targetId como string).
   * Propriedades `fn` (funções) são descartadas na serialização.
   * @returns {object} Objeto serializável.
   */
  toJSON() {
    const overlays = this.getAll().map((o) => {
      const props = { ...o.props };
      if (typeof props.fn === "function") {
        delete props.fn;
      }
      return { ...o, props };
    });

    const targets = this.getAllTargets().map(({ id, type }) => ({ id, type }));

    return {
      version: 1,
      targets,
      overlays,
      undoStack: this.#undoStack.map((e) => ({
        action: e.action,
        overlay: e.overlay ? { ...e.overlay, props: { ...e.overlay.props } } : null,
      })),
      redoStack: this.#redoStack.map((e) => ({
        action: e.action,
        overlay: e.overlay ? { ...e.overlay, props: { ...e.overlay.props } } : null,
      })),
    };
  }

  /**
   * Restaura o estado a partir de um objeto JSON.
   * Targets devem ser re-registrados separadamente (só type é preservado).
   * @param {object} data - Objeto retornado por toJSON().
   * @param {Record<string, any>} [targetEngines={}] - Mapa targetId → engine para restaurar.
   * @throws {Error} Se o formato for inválido.
   */
  fromJSON(data, targetEngines = {}) {
    if (!data || typeof data !== "object") {
      throw new Error("fromJSON: dados inválidos");
    }
    if (data.version !== 1) {
      throw new Error(`fromJSON: versão não suportada: ${data.version}`);
    }

    this.#overlays.clear();
    this.#undoStack.length = 0;
    this.#redoStack.length = 0;
    this.#targets.clear();

    if (Array.isArray(data.targets)) {
      for (const t of data.targets) {
        if (t.id && t.type) {
          this.#targets.set(t.id, {
            type: t.type,
            engine: targetEngines[t.id] || null,
          });
        }
      }
    }

    if (Array.isArray(data.overlays)) {
      for (const o of data.overlays) {
        if (o.id && o.type && o.targetId) {
          this.#overlays.set(o.id, {
            id: o.id,
            type: o.type,
            targetId: o.targetId,
            props: { ...(DEFAULTS[o.type] || {}), ...(o.props || {}) },
            createdAt: o.createdAt || Date.now(),
            updatedAt: o.updatedAt || Date.now(),
          });
        }
      }
    }

    if (Array.isArray(data.undoStack)) {
      for (const e of data.undoStack) {
        if (e.action) {
          this.#undoStack.push({
            action: e.action,
            overlay: e.overlay ? { ...e.overlay, props: { ...e.overlay.props } } : null,
            snapshot: [],
          });
        }
      }
    }

    if (Array.isArray(data.redoStack)) {
      for (const e of data.redoStack) {
        if (e.action) {
          this.#redoStack.push({
            action: e.action,
            overlay: e.overlay ? { ...e.overlay, props: { ...e.overlay.props } } : null,
            snapshot: [],
          });
        }
      }
    }

    this.#emit();
  }

  /* ────────────────────── PRIVATE ────────────────────── */

  /**
   * Cria um clone raso dos props de um overlay.
   * @param {OverlayData} overlay
   * @returns {OverlayData}
   */
  #clone(overlay) {
    return {
      ...overlay,
      props: { ...overlay.props },
    };
  }

  /**
   * Captura um snapshot de todos os overlays.
   * @returns {OverlayData[]}
   */
  #snapshot() {
    return this.getAll().map((o) => this.#clone(o));
  }

  /**
   * Captura a entrada de histórico com snapshot reconstruído.
   * @param {HistoryEntry} entry
   * @returns {HistoryEntry}
   */
  #snapshotEntry(entry) {
    return {
      action: entry.action,
      overlay: entry.overlay ? { ...entry.overlay, props: { ...entry.overlay.props } } : null,
      snapshot: entry.snapshot.map((o) => ({ ...o, props: { ...o.props } })),
    };
  }

  /**
   * Restaura o estado dos overlays a partir de um snapshot.
   * @param {OverlayData[]} snapshot
   */
  #restoreSnapshot(snapshot) {
    this.#overlays.clear();
    for (const o of snapshot) {
      this.#overlays.set(o.id, this.#clone(o));
    }
  }

  /**
   * Aplica uma ação (usado no redo).
   * @param {HistoryEntry} entry
   */
  #applyAction(entry) {
    switch (entry.action) {
      case "add": {
        if (entry.overlay) {
          this.#overlays.set(entry.overlay.id, this.#clone(entry.overlay));
        }
        break;
      }
      case "remove": {
        if (entry.overlay) {
          this.#overlays.delete(entry.overlay.id);
        }
        break;
      }
      case "update": {
        if (entry.overlay) {
          const existing = this.#overlays.get(entry.overlay.id);
          if (existing) {
            existing.props = { ...existing.props, ...entry.overlay.props };
            existing.updatedAt = entry.overlay.updatedAt;
          }
        }
        break;
      }
      case "clear": {
        this.#overlays.clear();
        break;
      }
    }
  }

  /**
   * Empilha uma entrada de undo, respeitando o limite máximo.
   * Limpa o redo stack quando uma nova ação é realizada.
   * @param {HistoryEntry} entry
   */
  #pushUndo(entry) {
    this.#redoStack.length = 0;
    this.#undoStack.push(entry);
    if (this.#undoStack.length > MAX_HISTORY) {
      this.#undoStack.shift();
    }
  }

  /**
   * Emite o evento de mudança para todos os listeners.
   */
  #emit() {
    const overlays = this.getAll();
    for (const fn of this.#listeners) {
      try {
        fn(overlays);
      } catch (err) {
        console.error("[OverlayManager] listener error:", err);
      }
    }
  }
}
