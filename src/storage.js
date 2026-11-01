function createMemoryStorage() {
  const map = new Map();

  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(key, String(value));
    },
    removeItem(key) {
      map.delete(key);
    },
    clear() {
      map.clear();
    },
  };
}

function resolveStorage(storage) {
  if (storage) {
    return storage;
  }

  if (typeof globalThis !== "undefined" && "localStorage" in globalThis) {
    return globalThis.localStorage;
  }

  return createMemoryStorage();
}

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `note-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createStore(storage = null) {
  const store = resolveStorage(storage);
  const key = "notes-app.notes";

  function readAll() {
    try {
      const raw = store.getItem(key);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function writeAll(notes) {
    store.setItem(key, JSON.stringify(notes));
  }

  function normalizeNote(note) {
    const title = String(note?.title ?? "").trim();
    const body = String(note?.body ?? "");

    return {
      id: note?.id ?? createId(),
      title,
      body,
      updatedAt: new Date().toISOString(),
    };
  }

  return {
    list() {
      return [...readAll()].sort((a, b) => {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
    },

    save(note) {
      const notes = readAll();
      const item = normalizeNote(note);
      const existingIndex = notes.findIndex((entry) => entry.id === item.id);

      if (existingIndex >= 0) {
        const existing = notes[existingIndex];
        const updated = {
          ...existing,
          ...item,
          title: item.title,
          body: item.body,
          updatedAt: new Date().toISOString(),
        };

        notes[existingIndex] = updated;
        writeAll(notes);
        return updated;
      }

      notes.push(item);
      writeAll(notes);
      return item;
    },

    remove(id) {
      const notes = readAll().filter((entry) => entry.id !== id);
      writeAll(notes);
      return true;
    },

    search(text = "") {
      const query = String(text ?? "").trim().toLowerCase();
      const items = this.list();

      if (!query) {
        return items;
      }

      return items.filter((entry) => {
        const title = String(entry.title ?? "").toLowerCase();
        const body = String(entry.body ?? "").toLowerCase();
        return title.includes(query) || body.includes(query);
      });
    },
  };
}
