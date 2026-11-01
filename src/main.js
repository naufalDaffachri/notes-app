import "./style.css";
import { createStore } from "./storage.js";

const store = createStore();
const app = document.querySelector("#app");
let editingId = null;

app.innerHTML = `
  <main class="page-shell">
    <header class="page-header">
      <div>
        <p class="eyebrow">RUANG PRIBADI</p>
        <h1>Catatan</h1>
      </div>
      <button class="button button-primary" id="add-note" type="button">
        <span aria-hidden="true">+</span> Tambah catatan
      </button>
    </header>

    <section class="notes-section" aria-labelledby="notes-heading">
      <div class="section-heading">
        <h2 id="notes-heading">Semua catatan</h2>
        <label class="search-field">
          <span class="visually-hidden">Cari</span>
          <input id="search" type="search" aria-label="Cari" placeholder="Cari catatan" />
        </label>
      </div>
      <div id="notes-list" class="notes-list" aria-live="polite"></div>
      <p id="empty-state" class="empty-state" hidden>Belum ada catatan. Mulai dengan menulis sesuatu.</p>
    </section>

    <section id="editor" class="editor" aria-labelledby="editor-heading" hidden>
      <div class="editor-heading">
        <div>
          <p class="eyebrow">CATATAN BARU</p>
          <h2 id="editor-heading">Tulis catatan</h2>
        </div>
        <button class="icon-button" id="close-editor" type="button" aria-label="Tutup editor">×</button>
      </div>
      <form id="note-form">
        <div class="field-group">
          <label for="title">Judul</label>
          <input id="title" name="title" type="text" autocomplete="off" />
        </div>
        <div class="field-group">
          <label for="body">Isi</label>
          <textarea id="body" name="body" rows="7"></textarea>
        </div>
        <div class="editor-actions">
          <button class="button button-primary" type="submit">Simpan</button>
          <button class="button button-danger" id="delete-note" type="button" hidden>Hapus</button>
        </div>
      </form>
    </section>
  </main>
`;

const notesList = app.querySelector("#notes-list");
const emptyState = app.querySelector("#empty-state");
const searchInput = app.querySelector("#search");
const editor = app.querySelector("#editor");
const form = app.querySelector("#note-form");
const titleInput = app.querySelector("#title");
const bodyInput = app.querySelector("#body");
const deleteButton = app.querySelector("#delete-note");

function renderNotes() {
  const query = searchInput.value.trim();
  const notes = store.search(query);
  notesList.replaceChildren();
  emptyState.hidden = notes.length > 0;
  emptyState.textContent = query
    ? "Tidak ada catatan yang cocok."
    : "Belum ada catatan. Mulai dengan menulis sesuatu.";

  for (const note of notes) {
    const item = document.createElement("article");
    item.className = "note-item";

    const openButton = document.createElement("button");
    openButton.className = "note-open";
    openButton.type = "button";
    openButton.dataset.noteId = note.id;

    const noteTitle = document.createElement("span");
    noteTitle.className = "note-title";
    noteTitle.textContent = note.title || "Tanpa judul";

    const noteBody = document.createElement("span");
    noteBody.className = "note-body";
    noteBody.textContent = note.body;

    openButton.append(noteTitle, noteBody);
    item.append(openButton);
    notesList.append(item);
  }
}

function openEditor(note = null) {
  editingId = note?.id ?? null;
  titleInput.value = note?.title ?? "";
  bodyInput.value = note?.body ?? "";
  deleteButton.hidden = !note;
  editor.querySelector("#editor-heading").textContent = note ? "Edit catatan" : "Tulis catatan";
  editor.querySelector(".eyebrow").textContent = note ? "PERBARUI CATATAN" : "CATATAN BARU";
  editor.hidden = false;
  titleInput.focus();
}

function closeEditor() {
  editor.hidden = true;
  form.reset();
  editingId = null;
}

app.querySelector("#add-note").addEventListener("click", () => openEditor());
app.querySelector("#close-editor").addEventListener("click", closeEditor);
searchInput.addEventListener("input", renderNotes);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  store.save({ id: editingId, title: titleInput.value, body: bodyInput.value });
  closeEditor();
  renderNotes();
});

notesList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-note-id]");
  if (!button) return;

  const note = store.list().find((item) => item.id === button.dataset.noteId);
  if (note) openEditor(note);
});

deleteButton.addEventListener("click", () => {
  if (!editingId) return;

  store.remove(editingId);
  closeEditor();
  renderNotes();
});

renderNotes();
