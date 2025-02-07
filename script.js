let players = [];

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('addPlayers').addEventListener('click', function() {
        addSelectedPlayers();
        updatePlayerList();
    });

    document.getElementById('generateSchedule').addEventListener('click', function() {
        generateSchedule();
    });

    updateSelectedPlayersDisplay(); // Initialize the "No Players Selected" message
});

function addSelectedPlayers() {
    const checkboxes = document.querySelectorAll('.dropdown-content input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            const playerName = checkbox.value;
            const playerRank = prompt(`Enter rank for ${playerName} (A or B):`, 'A').toUpperCase();

            if (playerRank === 'A' || playerRank === 'B') {
                if (!players.some(p => p.name === playerName)) {
                    players.push({ name: playerName, rank: playerRank });
                }
            } else {
                alert("Invalid rank. Please enter 'A' or 'B'.");
                checkbox.checked = false; // Uncheck if invalid
                return; // Stop processing this checkbox
            }
            checkbox.checked = false; // Uncheck after adding
        }
    });
    updateSelectedPlayersDisplay();
}

function updateSelectedPlayersDisplay() {
    const selectedPlayersDiv = document.getElementById('selectedPlayers');
    const selected = Array.from(document.querySelectorAll('.dropdown-content input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);
    selectedPlayersDiv.textContent = selected.length > 0 ? 'Selected: ' + selected.join(', ') : 'No Players Selected';
}

function updatePlayerList() {
    const playerList = document.getElementById('playerList');
    playerList.innerHTML = '';
    players.forEach(player => {
        const li = document.createElement('li');
        li.textContent = `${player.name} (${player.rank})`;
        if (player.rank === 'A') {
            li.classList.add('rank-a');
        } else {
            li.classList.add('rank-b');
        }
        playerList.appendChild(li);
    });
}

function generateSchedule() {
    const numPlayers = players.length;
    const numPeriods = 8;
    const schedule = [];
    const playerPeriodCounts = players.map(() => ({ plays: 0, periodsPlayed: [] }));

    const findPlayerWithMinPlays = (period, rank = null) => { // rank is now optional
        let minPlays = Infinity;
        let selectedPlayer = -1;
        for (let i = 0; i < numPlayers; i++) {
            if (!playerPeriodCounts[i].periodsPlayed.includes(period)) {
                if (rank === null || players[i].rank === rank) { // Check rank if provided
                    if (playerPeriodCounts[i].plays < minPlays) {
                        minPlays = playerPeriodCounts[i].plays;
                        selectedPlayer = i;
                    }
                }
            }
        }
        return selectedPlayer;
    };

    for (let period = 0; period < numPeriods; period++) {
        const periodPlayers = [];
        let aCount = 0;
        let bCount = 0;

        while (periodPlayers.length < 5) {
            let playerIndex = -1;

            // Try to maintain balance, but don't get stuck if not enough A/B
            if (aCount <= bCount && players.some(p => p.rank === 'A')) {
                playerIndex = findPlayerWithMinPlays(period, 'A');
                if (playerIndex !== -1) aCount++;
            }
            if (playerIndex === -1 && bCount <= aCount && players.some(p => p.rank === 'B')) {
                playerIndex = findPlayerWithMinPlays(period, 'B');
                if (playerIndex !== -1) bCount++;
            }

            // If still no player, find *any* available player
            if (playerIndex === -1) {
                playerIndex = findPlayerWithMinPlays(period);
            }

            if (playerIndex !== -1) {
                periodPlayers.push(players[playerIndex]);
                playerPeriodCounts[playerIndex].plays++;
                playerPeriodCounts[playerIndex].periodsPlayed.push(period);
            } else {
                // Break if absolutely no eligible players
                break;
            }
        }
        schedule.push({ period: period + 1, players: periodPlayers.map(p => p.name) });
    }
    displaySchedule(schedule);
}

function displaySchedule(schedule) {
    const scheduleOutput = document.getElementById('scheduleOutput');
    scheduleOutput.innerHTML = '';
    schedule.forEach(periodData => {
        const periodDiv = document.createElement('div');
        periodDiv.className = 'period';
        periodDiv.innerHTML = `<div class="period-title">Period ${periodData.period}</div>`;
        periodData.players.forEach(playerName => {
            const playerDiv = document.createElement('div');
            playerDiv.textContent = playerName;
            periodDiv.appendChild(playerDiv);
        });
        scheduleOutput.appendChild(periodDiv);
    });
}
