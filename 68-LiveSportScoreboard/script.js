document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const scoreboardEl = document.querySelector('.scoreboard');
    const upcomingListEl = document.querySelector('.upcoming-list');
    const notificationsListEl = document.getElementById('notificationsList');
    const refreshBtn = document.getElementById('refreshBtn');
    const autoRefreshCheckbox = document.getElementById('autoRefresh');
    const leagueFilter = document.getElementById('leagueFilter');
    const lastUpdatedSpan = document.querySelector('#lastUpdated span');
    const statsContainer = document.getElementById('statsContainer');
    
    // State
    let autoRefreshInterval;
    let matches = [];
    let notifications = [];
    let selectedMatchId = null;
    let currentView = 'cards';
    let darkMode = false;
    
    // Initialize the app
    init();
    
    function init() {
        // Load initial data
        fetchLiveMatches();
        loadUpcomingMatches();
        loadStandings();
        
        // Set up auto-refresh if enabled
        if (autoRefreshCheckbox.checked) {
            startAutoRefresh();
        }
        
        // Set up event listeners
        setupEventListeners();
        
        // Add a few initial notifications
        addNotification('System', 'Live scoreboard initialized. Tracking matches in real-time.', 'system');
    }
    
    function setupEventListeners() {
        // Refresh button
        refreshBtn.addEventListener('click', function() {
            fetchLiveMatches();
            addNotification('System', 'Scores manually refreshed.', 'system');
        });
        
        // Auto-refresh toggle
        autoRefreshCheckbox.addEventListener('change', function() {
            if (this.checked) {
                startAutoRefresh();
                addNotification('System', 'Auto-refresh enabled (every 30 seconds).', 'system');
            } else {
                stopAutoRefresh();
                addNotification('System', 'Auto-refresh disabled.', 'system');
            }
        });
        
        // League filter
        leagueFilter.addEventListener('change', function() {
            renderLiveMatches();
        });
        
        // Match selection
        scoreboardEl.addEventListener('click', function(e) {
            const matchCard = e.target.closest('.match-card');
            if (matchCard) {
                const matchId = parseInt(matchCard.dataset.id);
                if (matchId) {
                    selectMatch(matchId);
                }
            }
        });
        
        // Theme toggle
        setupThemeToggle();
        
        // View toggle
        setupViewToggle();
        
        // Standings tabs
        setupStandingsTabs();
    }
    
    function setupThemeToggle() {
        const themeBtn = document.createElement('button');
        themeBtn.className = 'theme-btn';
        themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
        themeBtn.title = 'Toggle dark mode';
        
        const themeToggleDiv = document.createElement('div');
        themeToggleDiv.className = 'theme-toggle';
        themeToggleDiv.appendChild(themeBtn);
        
        document.querySelector('.header').appendChild(themeToggleDiv);
        
        themeBtn.addEventListener('click', function() {
            darkMode = !darkMode;
            document.body.classList.toggle('dark-mode', darkMode);
            
            const icon = this.querySelector('i');
            icon.className = darkMode ? 'fas fa-sun' : 'fas fa-moon';
            
            const mode = darkMode ? 'Dark' : 'Light';
            addNotification('Theme Changed', `${mode} mode activated`, 'system');
        });
    }
    
    function setupViewToggle() {
        const viewToggleDiv = document.createElement('div');
        viewToggleDiv.className = 'view-toggle';
        viewToggleDiv.innerHTML = `
            <button class="view-btn active" data-view="cards">
                <i class="fas fa-th-large"></i> Cards
            </button>
            <button class="view-btn" data-view="list">
                <i class="fas fa-list"></i> List
            </button>
        `;
        
        document.querySelector('.controls').appendChild(viewToggleDiv);
        
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                currentView = this.dataset.view;
                scoreboardEl.classList.toggle('list-view', currentView === 'list');
                
                document.querySelectorAll('.match-card').forEach(card => {
                    card.classList.toggle('list-view', currentView === 'list');
                });
                
                addNotification('View Changed', `${currentView === 'cards' ? 'Card' : 'List'} view activated`, 'system');
            });
        });
    }
    
    function setupStandingsTabs() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                const league = this.dataset.league;
                document.querySelectorAll('.standings-table').forEach(table => {
                    table.style.display = 'none';
                });
                document.getElementById(`${league}Table`).style.display = 'block';
            });
        });
    }
    
    function startAutoRefresh() {
        if (autoRefreshInterval) {
            clearInterval(autoRefreshInterval);
        }
        
        autoRefreshInterval = setInterval(fetchLiveMatches, 30000);
    }
    
    function stopAutoRefresh() {
        if (autoRefreshInterval) {
            clearInterval(autoRefreshInterval);
            autoRefreshInterval = null;
        }
    }
    
    // Fetch live matches (simulated data for demo)
    function fetchLiveMatches() {
        if (matches.length > 0) {
            updateMatchesWithRandomEvents();
        } else {
            matches = getSampleMatches();
        }
        
        renderLiveMatches();
        
        const now = new Date();
        lastUpdatedSpan.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    
    function renderLiveMatches() {
        const selectedLeague = leagueFilter.value;
        
        let filteredMatches = matches;
        if (selectedLeague !== 'all') {
            filteredMatches = matches.filter(match => match.league === selectedLeague);
        }
        
        scoreboardEl.innerHTML = '';
        
        filteredMatches.forEach(match => {
            const matchCard = createMatchCard(match);
            scoreboardEl.appendChild(matchCard);
        });
        
        if (filteredMatches.length === 0) {
            scoreboardEl.innerHTML = `
                <div class="no-matches">
                    <p>No matches found for the selected league.</p>
                </div>
            `;
        }
        
        // Re-apply view mode
        scoreboardEl.classList.toggle('list-view', currentView === 'list');
        document.querySelectorAll('.match-card').forEach(card => {
            card.classList.toggle('list-view', currentView === 'list');
        });
    }
    
    function createMatchCard(match) {
        const matchCard = document.createElement('div');
        matchCard.className = `match-card ${match.status} ${selectedMatchId === match.id ? 'selected' : ''}`;
        matchCard.dataset.id = match.id;
        
        let statusText = '';
        if (match.status === 'live') {
            statusText = `${match.minute}'`;
        } else if (match.status === 'upcoming') {
            statusText = 'Upcoming';
        } else {
            statusText = 'FT';
        }
        
        matchCard.innerHTML = `
            <div class="match-header">
                <div class="league-info">
                    <i class="fas ${getLeagueIcon(match.league)}"></i>
                    <span>${match.leagueName}</span>
                </div>
                <div class="match-status ${match.status}">${statusText}</div>
            </div>
            <div class="match-content">
                <div class="teams">
                    <div class="team">
                        <div class="team-logo">
                            <i class="fas ${match.homeTeam.logo}"></i>
                        </div>
                        <div class="team-name">${match.homeTeam.name}</div>
                        <div class="team-record">${match.homeTeam.record}</div>
                    </div>
                    
                    <div class="score">
                        <div class="score-value">${match.homeScore} - ${match.awayScore}</div>
                        <div class="score-time">${match.status === 'live' ? 'Live' : match.time}</div>
                    </div>
                    
                    <div class="team">
                        <div class="team-logo">
                            <i class="fas ${match.awayTeam.logo}"></i>
                        </div>
                        <div class="team-name">${match.awayTeam.name}</div>
                        <div class="team-record">${match.awayTeam.record}</div>
                    </div>
                </div>
                <div class="match-details">
                    <div class="match-venue">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${match.venue}</span>
                    </div>
                    <div class="match-referee">
                        <i class="fas fa-whistle"></i>
                        <span>${match.referee}</span>
                    </div>
                </div>
            </div>
        `;
        
        return matchCard;
    }
    
    function selectMatch(matchId) {
        // Remove selection from all matches
        document.querySelectorAll('.match-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        selectedMatchId = matchId;
        const match = matches.find(m => m.id === matchId);
        
        if (match) {
            // Add selection to clicked match
            const selectedCard = document.querySelector(`.match-card[data-id="${matchId}"]`);
            if (selectedCard) {
                selectedCard.classList.add('selected');
            }
            
            renderMatchStatistics(match);
            addNotification('Match Selected', `Viewing details for ${match.homeTeam.name} vs ${match.awayTeam.name}`, 'system');
        }
    }
    
    function renderMatchStatistics(match) {
        const homePossession = 45 + Math.floor(Math.random() * 15);
        const homeShots = 5 + Math.floor(Math.random() * 10);
        const awayShots = 5 + Math.floor(Math.random() * 10);
        const homeCorners = Math.floor(Math.random() * 8);
        const awayCorners = Math.floor(Math.random() * 8);
        const homeFouls = 8 + Math.floor(Math.random() * 10);
        const awayFouls = 8 + Math.floor(Math.random() * 10);
        
        statsContainer.innerHTML = `
            <div class="match-stats">
                <div class="stat-item">
                    <div class="stat-value">${homePossession}%</div>
                    <div class="stat-label">Possession</div>
                    <div class="stat-bars">
                        <div class="stat-bar">
                            <span class="bar-label">${match.homeTeam.name}</span>
                            <div class="bar-container">
                                <div class="bar-fill" style="width: ${homePossession}%"></div>
                            </div>
                            <span class="bar-value">${homePossession}%</span>
                        </div>
                        <div class="stat-bar">
                            <span class="bar-label">${match.awayTeam.name}</span>
                            <div class="bar-container">
                                <div class="bar-fill" style="width: ${100-homePossession}%"></div>
                            </div>
                            <span class="bar-value">${100-homePossession}%</span>
                        </div>
                    </div>
                </div>
                
                <div class="stat-item">
                    <div class="stat-value">${homeShots + awayShots}</div>
                    <div class="stat-label">Total Shots</div>
                    <div class="stat-bars">
                        <div class="stat-bar">
                            <span class="bar-label">${match.homeTeam.name}</span>
                            <div class="bar-container">
                                <div class="bar-fill" style="width: ${(homeShots/(homeShots+awayShots))*100}%"></div>
                            </div>
                            <span class="bar-value">${homeShots}</span>
                        </div>
                        <div class="stat-bar">
                            <span class="bar-label">${match.awayTeam.name}</span>
                            <div class="bar-container">
                                <div class="bar-fill" style="width: ${(awayShots/(homeShots+awayShots))*100}%"></div>
                            </div>
                            <span class="bar-value">${awayShots}</span>
                        </div>
                    </div>
                </div>
                
                <div class="stat-item">
                    <div class="stat-value">${homeCorners + awayCorners}</div>
                    <div class="stat-label">Corners</div>
                    <div class="stat-bars">
                        <div class="stat-bar">
                            <span class="bar-label">${match.homeTeam.name}</span>
                            <div class="bar-container">
                                <div class="bar-fill" style="width: ${(homeCorners/(homeCorners+awayCorners))*100}%"></div>
                            </div>
                            <span class="bar-value">${homeCorners}</span>
                        </div>
                        <div class="stat-bar">
                            <span class="bar-label">${match.awayTeam.name}</span>
                            <div class="bar-container">
                                <div class="bar-fill" style="width: ${(awayCorners/(homeCorners+awayCorners))*100}%"></div>
                            </div>
                            <span class="bar-value">${awayCorners}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="timeline">
                <h3>Match Events</h3>
                ${generateMatchEvents(match)}
            </div>
        `;
    }
    
    function generateMatchEvents(match) {
        const events = [];
        
        if (match.homeScore > 0) {
            for (let i = 1; i <= match.homeScore; i++) {
                events.push({
                    minute: Math.floor(Math.random() * match.minute),
                    type: 'goal',
                    team: 'home',
                    player: getRandomPlayer(match.homeTeam.name)
                });
            }
        }
        
        if (match.awayScore > 0) {
            for (let i = 1; i <= match.awayScore; i++) {
                events.push({
                    minute: Math.floor(Math.random() * match.minute),
                    type: 'goal',
                    team: 'away',
                    player: getRandomPlayer(match.awayTeam.name)
                });
            }
        }
        
        const yellowCards = Math.floor(Math.random() * 4);
        for (let i = 0; i < yellowCards; i++) {
            events.push({
                minute: Math.floor(Math.random() * match.minute),
                type: 'yellow',
                team: Math.random() > 0.5 ? 'home' : 'away',
                player: getRandomPlayer(Math.random() > 0.5 ? match.homeTeam.name : match.awayTeam.name)
            });
        }
        
        events.sort((a, b) => a.minute - b.minute);
        
        let eventsHtml = '';
        events.forEach(event => {
            const icon = event.type === 'goal' ? 'fa-futbol' : 
                        event.type === 'yellow' ? 'fa-square yellow-card' : 'fa-exchange-alt';
            const iconClass = event.type === 'goal' ? 'goal' : 
                            event.type === 'yellow' ? 'card' : 'sub';
            const teamName = event.team === 'home' ? match.homeTeam.name : match.awayTeam.name;
            const eventText = event.type === 'goal' ? 
                `${event.player} scores for ${teamName}` :
                `${event.player} receives a yellow card`;
            
            eventsHtml += `
                <div class="timeline-item">
                    <div class="timeline-time">${event.minute}'</div>
                    <div class="timeline-icon ${iconClass}">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div class="timeline-text">${eventText}</div>
                </div>
            `;
        });
        
        return eventsHtml || '<p>No events recorded yet.</p>';
    }
    
    function updateMatchesWithRandomEvents() {
        matches.forEach(match => {
            if (match.status === 'live') {
                if (Math.random() > 0.7) {
                    const scoringTeam = Math.random() > 0.5 ? 'home' : 'away';
                    
                    if (scoringTeam === 'home') {
                        match.homeScore++;
                        
                        const scorer = getRandomPlayer(match.homeTeam.name);
                        addNotification(
                            'GOAL!',
                            `${scorer} scores for ${match.homeTeam.name}! ${match.homeScore}-${match.awayScore}`,
                            'goal'
                        );
                        
                        // Animate score update
                        const scoreElement = document.querySelector(`.match-card[data-id="${match.id}"] .score-value`);
                        if (scoreElement) {
                            scoreElement.classList.add('score-update');
                            setTimeout(() => scoreElement.classList.remove('score-update'), 500);
                        }
                    } else {
                        match.awayScore++;
                        
                        const scorer = getRandomPlayer(match.awayTeam.name);
                        addNotification(
                            'GOAL!',
                            `${scorer} scores for ${match.awayTeam.name}! ${match.homeScore}-${match.awayScore}`,
                            'goal'
                        );
                        
                        // Animate score update
                        const scoreElement = document.querySelector(`.match-card[data-id="${match.id}"] .score-value`);
                        if (scoreElement) {
                            scoreElement.classList.add('score-update');
                            setTimeout(() => scoreElement.classList.remove('score-update'), 500);
                        }
                    }
                    
                    match.minute = Math.min(90, match.minute + Math.floor(Math.random() * 5) + 1);
                }
                
                if (match.minute >= 90 && Math.random() > 0.8) {
                    match.status = 'finished';
                    match.time = 'FT';
                    
                    addNotification(
                        'Match Ended',
                        `${match.homeTeam.name} ${match.homeScore}-${match.awayScore} ${match.awayTeam.name}`,
                        'system'
                    );
                }
            } else if (match.status === 'upcoming' && Math.random() > 0.9) {
                match.status = 'live';
                match.minute = 1;
                match.time = 'Live';
                
                addNotification(
                    'Match Started',
                    `${match.homeTeam.name} vs ${match.awayTeam.name} has kicked off!`,
                    'system'
                );
            }
        });
    }
    
    function loadUpcomingMatches() {
        const upcomingMatches = [
            {
                time: '20:00',
                homeTeam: { name: 'AC Milan', logo: 'fa-shield-alt' },
                awayTeam: { name: 'Inter Milan', logo: 'fa-star' },
                league: 'Serie A'
            },
            {
                time: '21:00',
                homeTeam: { name: 'Bayern Munich', logo: 'fa-certificate' },
                awayTeam: { name: 'Borussia Dortmund', logo: 'fa-bullseye' },
                league: 'Bundesliga'
            },
            {
                time: '22:00',
                homeTeam: { name: 'Real Madrid', logo: 'fa-crown' },
                awayTeam: { name: 'Barcelona', logo: 'fa-gem' },
                league: 'La Liga'
            },
            {
                time: '23:00',
                homeTeam: { name: 'PSG', logo: 'fa-tower' },
                awayTeam: { name: 'Manchester City', logo: 'fa-city' },
                league: 'Champions League'
            }
        ];
        
        upcomingListEl.innerHTML = '';
        
        upcomingMatches.forEach(match => {
            const matchItem = document.createElement('div');
            matchItem.className = 'upcoming-item';
            
            matchItem.innerHTML = `
                <div class="upcoming-teams">
                    <span class="upcoming-team">${match.homeTeam.name}</span>
                    <span>vs</span>
                    <span class="upcoming-team">${match.awayTeam.name}</span>
                </div>
                <div class="upcoming-details">
                    <span class="upcoming-league">${match.league}</span>
                    <span class="upcoming-time">${match.time}</span>
                </div>
            `;
            
            upcomingListEl.appendChild(matchItem);
        });
    }
    
    function loadStandings() {
        const standings = {
            'premier': [
                { position: 1, team: 'Manchester City', played: 30, won: 22, drawn: 5, lost: 3, points: 71 },
                { position: 2, team: 'Liverpool', played: 30, won: 21, drawn: 7, lost: 2, points: 70 },
                { position: 3, team: 'Chelsea', played: 29, won: 17, drawn: 8, lost: 4, points: 59 },
                { position: 4, team: 'Arsenal', played: 29, won: 17, drawn: 4, lost: 8, points: 55 },
                { position: 5, team: 'Manchester United', played: 30, won: 15, drawn: 8, lost: 7, points: 53 }
            ],
            'la-liga': [
                { position: 1, team: 'Real Madrid', played: 29, won: 21, drawn: 6, lost: 2, points: 69 },
                { position: 2, team: 'Barcelona', played: 28, won: 18, drawn: 5, lost: 5, points: 59 },
                { position: 3, team: 'Atlético Madrid', played: 29, won: 16, drawn: 6, lost: 7, points: 54 },
                { position: 4, team: 'Sevilla', played: 29, won: 14, drawn: 12, lost: 3, points: 54 },
                { position: 5, team: 'Real Betis', played: 29, won: 16, drawn: 5, lost: 8, points: 53 }
            ],
            'serie-a': [
                { position: 1, team: 'AC Milan', played: 30, won: 20, drawn: 6, lost: 4, points: 66 },
                { position: 2, team: 'Inter Milan', played: 29, won: 18, drawn: 8, lost: 3, points: 62 },
                { position: 3, team: 'Napoli', played: 29, won: 18, drawn: 6, lost: 5, points: 60 },
                { position: 4, team: 'Juventus', played: 30, won: 17, drawn: 8, lost: 5, points: 59 },
                { position: 5, team: 'Roma', played: 30, won: 16, drawn: 6, lost: 8, points: 54 }
            ]
        };
        
        Object.keys(standings).forEach(league => {
            const tableEl = document.getElementById(`${league}Table`);
            if (tableEl) {
                tableEl.innerHTML = createStandingsTable(standings[league]);
            }
        });
    }
    
    function createStandingsTable(teams) {
        return `
            <table>
                <thead>
                    <tr>
                        <th class="position">#</th>
                        <th>Team</th>
                        <th>P</th>
                        <th>W</th>
                        <th>D</th>
                        <th>L</th>
                        <th class="points">PTS</th>
                    </tr>
                </thead>
                <tbody>
                    ${teams.map(team => `
                        <tr>
                            <td class="position">${team.position}</td>
                            <td>
                                <div class="team-cell">
                                    <div class="team-logo-small">
                                        <i class="fas ${getTeamLogo(team.team)}"></i>
                                    </div>
                                    ${team.team}
                                </div>
                            </td>
                            <td>${team.played}</td>
                            <td>${team.won}</td>
                            <td>${team.drawn}</td>
                            <td>${team.lost}</td>
                            <td class="points">${team.points}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
    
    function addNotification(title, text, type) {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const notification = {
            id: Date.now(),
            time: timeString,
            title: title,
            text: text,
            type: type
        };
        
        notifications.unshift(notification);
        
        if (notifications.length > 10) {
            notifications.pop();
        }
        
        renderNotifications();
    }
    
    function renderNotifications() {
        notificationsListEl.innerHTML = '';
        
        notifications.forEach(notification => {
            const notificationEl = document.createElement('div');
            notificationEl.className = `notification ${notification.type} slide-in`;
            
            notificationEl.innerHTML = `
                <div class="notification-time">${notification.time}</div>
                <div class="notification-text">
                    <strong>${notification.title}</strong> ${notification.text}
                </div>
            `;
            
            notificationsListEl.appendChild(notificationEl);
        });
    }
    
    // Helper functions
    function getLeagueIcon(league) {
        const icons = {
            'premier': 'fa-trophy',
            'la-liga': 'fa-futbol',
            'serie-a': 'fa-flag',
            'bundesliga': 'fa-medal',
            'champions': 'fa-star'
        };
        
        return icons[league] || 'fa-trophy';
    }
    
    function getTeamLogo(teamName) {
        const logos = {
            'Manchester City': 'fa-city',
            'Liverpool': 'fa-feather-alt',
            'Chelsea': 'fa-chess-knight',
            'Arsenal': 'fa-gun',
            'Manchester United': 'fa-redo',
            'Real Madrid': 'fa-crown',
            'Barcelona': 'fa-gem',
            'Atlético Madrid': 'fa-atom',
            'Sevilla': 'fa-castle',
            'Real Betis': 'fa-crown',
            'AC Milan': 'fa-shield-alt',
            'Inter Milan': 'fa-star',
            'Napoli': 'fa-ankh',
            'Juventus': 'fa-chess-rook',
            'Roma': 'fa-archway'
        };
        return logos[teamName] || 'fa-futbol';
    }
    
    function getRandomPlayer(teamName) {
        const players = {
            'Manchester United': ['Bruno Fernandes', 'Marcus Rashford', 'Jadon Sancho', 'Cristiano Ronaldo'],
            'Liverpool': ['Mohamed Salah', 'Sadio Mané', 'Virgil van Dijk', 'Diogo Jota'],
            'Real Madrid': ['Karim Benzema', 'Vinicius Jr.', 'Luka Modrić', 'Thibaut Courtois'],
            'Barcelona': ['Robert Lewandowski', 'Pedri', 'Frenkie de Jong', 'Ansu Fati'],
            'Bayern Munich': ['Robert Lewandowski', 'Thomas Müller', 'Joshua Kimmich', 'Manuel Neuer'],
            'AC Milan': ['Zlatan Ibrahimović', 'Rafael Leão', 'Theo Hernández', 'Mike Maignan'],
            'Manchester City': ['Kevin De Bruyne', 'Phil Foden', 'Rúben Dias', 'Ederson'],
            'Chelsea': ['Mason Mount', 'Kai Havertz', 'N\'Golo Kanté', 'Edouard Mendy'],
            'Arsenal': ['Bukayo Saka', 'Martin Ødegaard', 'Gabriel Jesus', 'Aaron Ramsdale']
        };
        
        const teamPlayers = players[teamName] || ['Player'];
        return teamPlayers[Math.floor(Math.random() * teamPlayers.length)];
    }
    
    function getSampleMatches() {
        return [
            {
                id: 1,
                league: 'premier',
                leagueName: 'Premier League',
                status: 'live',
                minute: 65,
                time: 'Live',
                homeTeam: {
                    name: 'Manchester United',
                    logo: 'fa-redo',
                    record: 'W15 D5 L8'
                },
                awayTeam: {
                    name: 'Liverpool',
                    logo: 'fa-feather-alt',
                    record: 'W22 D8 L3'
                },
                homeScore: 2,
                awayScore: 1,
                venue: 'Old Trafford',
                referee: 'Michael Oliver'
            },
            {
                id: 2,
                league: 'la-liga',
                leagueName: 'La Liga',
                status: 'live',
                minute: 78,
                time: 'Live',
                homeTeam: {
                    name: 'Real Madrid',
                    logo: 'fa-crown',
                    record: 'W20 D6 L2'
                },
                awayTeam: {
                    name: 'Barcelona',
                    logo: 'fa-gem',
                    record: 'W18 D9 L1'
                },
                homeScore: 1,
                awayScore: 1,
                venue: 'Santiago Bernabéu',
                referee: 'Antonio Mateu Lahoz'
            },
            {
                id: 3,
                league: 'serie-a',
                leagueName: 'Serie A',
                status: 'live',
                minute: 42,
                time: 'Live',
                homeTeam: {
                    name: 'AC Milan',
                    logo: 'fa-shield-alt',
                    record: 'W19 D7 L4'
                },
                awayTeam: {
                    name: 'Juventus',
                    logo: 'fa-chess-rook',
                    record: 'W17 D9 L4'
                },
                homeScore: 1,
                awayScore: 0,
                venue: 'San Siro',
                referee: 'Daniele Orsato'
            },
            {
                id: 4,
                league: 'bundesliga',
                leagueName: 'Bundesliga',
                status: 'upcoming',
                minute: 0,
                time: '20:30',
                homeTeam: {
                    name: 'Bayern Munich',
                    logo: 'fa-certificate',
                    record: 'W24 D3 L1'
                },
                awayTeam: {
                    name: 'RB Leipzig',
                    logo: 'fa-bullseye',
                    record: 'W17 D6 L5'
                },
                homeScore: 0,
                awayScore: 0,
                venue: 'Allianz Arena',
                referee: 'Felix Zwayer'
            },
            {
                id: 5,
                league: 'champions',
                leagueName: 'Champions League',
                status: 'finished',
                minute: 90,
                time: 'FT',
                homeTeam: {
                    name: 'Chelsea',
                    logo: 'fa-chess-knight',
                    record: 'W16 D8 L4'
                },
                awayTeam: {
                    name: 'PSG',
                    logo: 'fa-tower',
                    record: 'W22 D5 L1'
                },
                homeScore: 2,
                awayScore: 2,
                venue: 'Stamford Bridge',
                referee: 'Danny Makkelie'
            }
        ];
    }
});