const editor = document.getElementById("editor");
const preview = document.getElementById("preview");

const STORAGE_KEY = "lavish_markdown_draft";

editor.value = localStorage.getItem(STORAGE_KEY) || "";
render();

editor.addEventListener("input", () => {
  render();
  localStorage.setItem(STORAGE_KEY, editor.value);
});

function render() {
  preview.innerHTML = marked.parse(
    editor.value || " Start typing markdown to see the magic..."
  );
}

function saveDraft() {
  localStorage.setItem(STORAGE_KEY, editor.value);
  alert("Draft saved locally ✨");
}

function clearDraft() {
  if (confirm("Clear editor and local draft?")) {
    editor.value = "";
    localStorage.removeItem(STORAGE_KEY);
    render();
  }
}
