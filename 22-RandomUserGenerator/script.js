const generateBtn = document.getElementById('generateBtn');
const userContainer = document.getElementById('userContainer');
const genderFilter = document.getElementById('genderFilter');
const natFilter = document.getElementById('natFilter');
const searchInput = document.getElementById('searchInput');
const ageSort = document.getElementById('ageSort');

let users = [];

async function generateUsers() {
  userContainer.innerHTML = `<p>Loading users... ⏳</p>`;
  try {
    const res = await fetch('https://randomuser.me/api/?results=12');
    const data = await res.json();
    users = data.results;
    renderUsers();
  } catch (error) {
    userContainer.innerHTML = `<p> Failed to fetch users.</p>`;
    console.error(error);
  }
}

function renderUsers() {
  let filteredUsers = [...users];

  const gender = genderFilter.value;
  const nat = natFilter.value;
  const searchTerm = searchInput.value.toLowerCase();

  if (gender) filteredUsers = filteredUsers.filter(u => u.gender === gender);
  if (nat) filteredUsers = filteredUsers.filter(u => u.nat === nat);
  if (searchTerm) {
    filteredUsers = filteredUsers.filter(u => 
      u.name.first.toLowerCase().includes(searchTerm) || 
      u.name.last.toLowerCase().includes(searchTerm)
    );
  }


  if (ageSort.value === 'asc') {
    filteredUsers.sort((a, b) => a.dob.age - b.dob.age);
  } else if (ageSort.value === 'desc') {
    filteredUsers.sort((a, b) => b.dob.age - a.dob.age);
  }

  if (filteredUsers.length === 0) {
    userContainer.innerHTML = `<p>No users match the current filters/search.</p>`;
    return;
  }

  userContainer.innerHTML = filteredUsers
    .map(user => `
      <div class="user-card">
        <img src="${user.picture.large}" alt="${user.name.first}" />
        <h2>${user.name.first} ${user.name.last}</h2>
        <p> ${user.email}</p>
        <p> ${user.location.city}, ${user.location.country}</p>
        <p> ${user.dob.age} years old</p>
        <p> Gender: ${user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}</p>
      </div>
    `).join('');
}

generateBtn.addEventListener('click', generateUsers);
genderFilter.addEventListener('change', renderUsers);
natFilter.addEventListener('change', renderUsers);
searchInput.addEventListener('input', renderUsers);
ageSort.addEventListener('change', renderUsers);
