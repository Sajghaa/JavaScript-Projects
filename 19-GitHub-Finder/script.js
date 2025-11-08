const searchBtn = document.getElementById('searchBtn');
const usernameInput = document.getElementById('username');
const profileContainer = document.getElementById('profile');

async function fetchGitHubUser(username) {
  try {
    const userRes = await fetch(`https://api.github.com/users/${username}`);
    if (!userRes.ok) throw new Error("User not found");
    const userData = await userRes.json();

    const repoRes = await fetch(`https://api.github.com/users/${username}/repos?sort=created&per_page=5`);
    const repos = await repoRes.json();

    displayProfile(userData, repos);
  } catch (error) {
    profileContainer.innerHTML = `<p class="error">⚠️ ${error.message}</p>`;
  }
}

function displayProfile(user, repos) {
  profileContainer.innerHTML = `
    <div class="profile-card">
      <img src="${user.avatar_url}" alt="${user.login}" />
      <div class="profile-info">
        <h2>${user.name || user.login}</h2>
        <p>${user.bio || 'No bio available.'}</p>
        <div class="stats">
          <span>👥 ${user.followers} Followers</span>
          <span>🔁 ${user.following} Following</span>
          <span>📦 ${user.public_repos} Repos</span>
        </div>
        <a href="${user.html_url}" target="_blank" class="btn">View Profile</a>
      </div>
    </div>

    <div class="repo-list">
      <h3>Latest Repositories:</h3>
      ${repos.map(repo => `
        <div class="repo">
          <a href="${repo.html_url}" target="_blank">${repo.name}</a>
          ⭐ ${repo.stargazers_count}
        </div>
      `).join('')}
    </div>
  `;
}

searchBtn.addEventListener('click', () => {
  const username = usernameInput.value.trim();
  if (username) {
    fetchGitHubUser(username);
    usernameInput.value = "";
  } else {
    profileContainer.innerHTML = `<p class="error">⚠️ Please enter a username.</p>`;
  }
});
