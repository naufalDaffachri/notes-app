import { describe, it, expect, beforeEach } from "vitest";
import { createStore } from "../../src/storage.js";

// Pengganti localStorage untuk tes (tes berjalan di Node.js)
function fakeStorage() {
  const data = {};

  return {
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      data[key] = String(value);
    },
  };
}

describe("storage (WO-1)", () => {
  let store;

  beforeEach(() => {
    store = createStore(fakeStorage());
  });

  it("menyimpan catatan baru dengan id", () => {
    const note = store.save({
      title: "Belanja",
      body: "Susu, roti",
    });

    expect(note.id).toBeTruthy();
    expect(store.list()).toHaveLength(1);
  });

  it("memperbarui catatan yang sudah ada", () => {
    const note = store.save({
      title: "Belanja",
      body: "Susu",
    });

    store.save({ ...note, body: "Susu, telur" });

    expect(store.list()).toHaveLength(1);
    expect(store.list()[0].body).toBe("Susu, telur");
  });

  it("menghapus catatan", () => {
    const note = store.save({
      title: "Sementara",
      body: "",
    });

    store.remove(note.id);

    expect(store.list()).toHaveLength(0);
  });
});

