const STORAGE_KEY = 'chat_realistic';
let currentUser = 'A';

let state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
  rooms: [{ id: crypto.randomUUID(), name: 'General', messages: [] }],
  activeRoom: null
};

state.activeRoom ||= state.rooms[0].id;

const chat = document.getElementById('chat');
const roomsEl = document.getElementById('rooms');
const messageInput = document.getElementById('message');
const typingEl = document.getElementById('typing');
const roomTitle = document.getElementById('roomTitle');

renderRooms();
renderMessages();

function setUser(u) { currentUser = u; }

function getRoom() {
  return state.rooms.find(r => r.id === state.activeRoom);
}

function newRoom() {
  const name = prompt('Room name');
  if (!name) return;
  state.rooms.push({ id: crypto.randomUUID(), name, messages: [] });
  state.activeRoom = state.rooms.at(-1).id;
  save();
  renderRooms();
  renderMessages();
}

function renderRooms() {
  roomsEl.innerHTML = '';
  state.rooms.forEach(r => {
    const div = document.createElement('div');
    div.className = 'room ' + (r.id === state.activeRoom ? 'active' : '');
    div.textContent = r.name;
    div.onclick = () => {
      state.activeRoom = r.id;
      save();
      renderRooms();
      renderMessages();
    };
    roomsEl.appendChild(div);
  });
}

function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;

  const msg = {
    user: currentUser,
    text,
    time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
    status: '✓'
  };

  getRoom().messages.push(msg);
  save();
  renderMessages();
  messageInput.value = '';

  setTimeout(() => msg.status = '✓✓', 400);
  setTimeout(() => msg.status = '✓✓', 900);

  fakeAIReply(text);
}

function renderMessages() {
  chat.innerHTML = '';
  const room = getRoom();
  roomTitle.textContent = room.name;

  room.messages.forEach(m => {
    const div = document.createElement('div');
    div.className = 'message ' + m.user;
    div.innerHTML = `${m.text}<div class="meta">${m.time} ${m.user==='A'?m.status:''}</div>`;
    chat.appendChild(div);
  });
  chat.scrollTop = chat.scrollHeight;
}

function fakeAIReply(text) {
  if (currentUser !== 'A') return;

  typingEl.textContent = 'typing...';

  setTimeout(() => {
    const replies = ['Okay.', 'Hmm...', 'Interesting.', 'Got it.', 'Tell me more'];

    getRoom().messages.push({
      user: 'B',
      text: replies[Math.floor(Math.random()*replies.length)],
      time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
      status: ''
    });

    typingEl.textContent = '';
    save();
    renderMessages();
  }, 1200);
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

messageInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') sendMessage();
});