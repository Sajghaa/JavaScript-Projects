// Select elements
const noteForm = document.getElementById('noteForm');
const titleInput = document.getElementById('title');
const contentInput = document.getElementById('content');
const notesContainer = document.getElementById('notes');

// Load notes from localStorage
let notes = JSON.parse(localStorage.getItem('notes')) || [];

// Display notes
function displayNotes() {
  notesContainer.innerHTML = '';
  notes.forEach((note, index) => {
    const noteDiv = document.createElement('div');
    noteDiv.classList.add('note');
    noteDiv.innerHTML = `
      <h3>${note.title}</h3>
      <p>${note.content}</p>
      <button onclick="editNote(${index})">Edit</button>
      <button onclick="deleteNote(${index})">Delete</button>
    `;
    notesContainer.appendChild(noteDiv);
  });
}

// Add or update note
noteForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  if (!title || !content) return;

  if (noteForm.dataset.editIndex !== undefined) {
    // Update note
    const index = noteForm.dataset.editIndex;
    notes[index] = { title, content };
    delete noteForm.dataset.editIndex;
  } else {
    // Add new note
    notes.push({ title, content });
  }

  localStorage.setItem('notes', JSON.stringify(notes));
  noteForm.reset();
  displayNotes();
});

// Delete note
function deleteNote(index) {
  notes.splice(index, 1);
  localStorage.setItem('notes', JSON.stringify(notes));
  displayNotes();
}

// Edit note
function editNote(index) {
  const note = notes[index];
  titleInput.value = note.title;
  contentInput.value = note.content;
  noteForm.dataset.editIndex = index;
}

// Display notes on load
displayNotes();
