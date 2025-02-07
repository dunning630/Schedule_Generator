let players = [];

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('addPlayers').addEventListener('click', addSelectedPlayers);
    document.getElementById('generateSchedule').addEventListener('click', generateSchedule);

    document.getElementById('selectAll').addEventListener('change', function() {
        const playerCheckboxes = document.querySelectorAll('.player-checkbox');
        playerCheckboxes.forEach(checkbox => checkbox.checked = this.checked);
        updateSelectedPlayersDisplay();
    });

    document.getElementById('dropdownContent').addEventListener('change', function(event) {
        if (event.target.classList.contains('player-checkbox')) {
            updateSelectedPlayersDisplay();
        }
    });

    updateSelectedPlayersDisplay();
});

function addSelectedPlayers() {
    const checkboxes = document.querySelectorAll('.player-checkbox:checked');
    checkboxes.forEach(checkbox => {
        const playerName = checkbox.value;
        if (!players.some(p => p.name === playerName)) {
            players.push({ name: playerName, rank: 'A' }); // Default to 'A'
            checkbox.checked = false;
        }
    });
    document.getElementById('selectAll').checked = false; //reset select all

    updatePlayerList();
    updateSelectedPlayersDisplay();
}

function updateSelectedPlayersDisplay() {
    const selectedPlayersDiv = document.getElementById('selectedPlayers');
    const selected = Array.from(document.querySelectorAll('.player-checkbox:checked'))
        .map(checkbox => checkbox.value);
    selectedPlayersDiv.textContent = selected.length > 0 ? 'Selected: ' + selected.join(', ') : 'No Players Selected';
}

function updatePlayerList() {
    const playerList = document.getElementById('playerList');
    playerList.innerHTML = '';
    players.forEach((player, index) => {
        const li = document.createElement('li');
        const nameSpan = document.createElement('span');
        nameSpan.textContent = `${player.name} `;
        li.appendChild(nameSpan);

        const rankSelect = document.createElement('select');
        rankSelect.className = 'rank-select';
        rankSelect.id = `rank-${index}`;
        rankSelect.innerHTML = `
            <option value="A">A</option>
            <option value="B">B</option>
        `;
        rankSelect.value = player.rank;
        rankSelect.addEventListener('change', function() {
            players[index].rank = this.value;
        });
        li.appendChild(rankSelect);
        playerList.appendChild(li);
    });
}

function generateSchedule() {
    const numPlayers = players.length;
    const numPeriods = 8;
    const schedule = [];
    const playerPeriodCounts = players.map(() => ({ plays: 0, periodsPlayed: [] }));

    // *** Prioritize playing time FIRST ***
    const findPlayerWithMinPlays = (period) => {
        let minPlays = Infinity;
        let selectedPlayerIndex = -1;
        for (let i = 0; i < numPlayers; i++) {
            if (!playerPeriodCounts[i].periodsPlayed.includes(period) &&
                playerPeriodCounts[i].plays < minPlays) {
                minPlays = playerPeriodCounts[i].plays;
                selectedPlayerIndex = i;
            }
        }
        return selectedPlayerIndex;
    };

    // *** THEN balance ranks within that constraint ***
     const findBestPlayerForPeriod = (period) => {
        const eligiblePlayers = [];
        for (let i = 0; i < numPlayers; i++) {
            if (!playerPeriodCounts[i].periodsPlayed.includes(period)) {
                eligiblePlayers.push(i);
            }
        }

        if (eligiblePlayers.length === 0) {
            return -1; // No eligible players
        }

        // Sort eligible players by plays (ascending) THEN by rank (A before B)
        eligiblePlayers.sort((a, b) => {
            const playsDiff = playerPeriodCounts[a].plays - playerPeriodCounts[b].plays;
            if (playsDiff !== 0) {
                return playsDiff; // Prioritize fewer plays
            } else {
                // If plays are equal, prioritize rank (A before B)
                return players[a].rank.localeCompare(players[b].rank);
            }
        });

        return eligiblePlayers[0]; // Return index of the best player
    };


    for (let period = 0; period < numPeriods; period++) {
        const periodPlayers = [];

        while (periodPlayers.length < 5) {
            // Use the improved function
            const playerIndex = findBestPlayerForPeriod(period);

            if (playerIndex !== -1) {
                periodPlayers.push(players[playerIndex]);
                playerPeriodCounts[playerIndex].plays++;
                playerPeriodCounts[playerIndex].periodsPlayed.push(period);
            } else {
                break; // No eligible players
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
