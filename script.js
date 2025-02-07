let players = [];

document.addEventListener('DOMContentLoaded', function() {
    // --- Event Listeners ---
    document.getElementById('addPlayers').addEventListener('click', function() {
        addSelectedPlayers();
        updatePlayerList();
    });

    document.getElementById('generateSchedule').addEventListener('click', generateSchedule);

    // --- Select All Functionality ---
    document.getElementById('selectAll').addEventListener('change', function() {
        const playerCheckboxes = document.querySelectorAll('.player-checkbox');
        playerCheckboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
        });
        updateSelectedPlayersDisplay();
    });

    // --- Update selected players display when individual checkboxes change ---
    document.getElementById('dropdownContent').addEventListener('change', function(event) {
        if (event.target.classList.contains('player-checkbox')) {
            updateSelectedPlayersDisplay();
        }
    });


    updateSelectedPlayersDisplay(); // Initialize
});



function addSelectedPlayers() {
    const checkboxes = document.querySelectorAll('.player-checkbox:checked'); // Only checked players
    checkboxes.forEach(checkbox => {
        const playerName = checkbox.value;
        const playerRank = checkbox.dataset.rank; // Get rank from data-rank

        if (!players.some(p => p.name === playerName)) {
            players.push({ name: playerName, rank: playerRank });
        }
        checkbox.checked = false; // Uncheck after adding
    });
    updateSelectedPlayersDisplay(); // after unchecking
    document.getElementById('selectAll').checked = false; //reset select all
}


function updateSelectedPlayersDisplay() {
    const selectedPlayersDiv = document.getElementById('selectedPlayers');
    const selected = Array.from(document.querySelectorAll('.player-checkbox:checked'))
        .map(checkbox => `${checkbox.value} (${checkbox.dataset.rank})`); // Include rank

    selectedPlayersDiv.textContent = selected.length > 0
        ? 'Selected: ' + selected.join(', ')
        : 'No Players Selected';
}



function updatePlayerList() {
    const playerList = document.getElementById('playerList');
    playerList.innerHTML = '';
    players.forEach(player => {
        const li = document.createElement('li');
        li.textContent = `${player.name} (${player.rank})`;
        li.classList.add(player.rank === 'A' ? 'rank-a' : 'rank-b');
        playerList.appendChild(li);
    });
}


function generateSchedule() {
    const numPlayers = players.length;
    const numPeriods = 8;
    const schedule = [];
    const playerPeriodCounts = players.map(() => ({ plays: 0, periodsPlayed: [] }));

    const findPlayerWithMinPlays = (period, rank = null) => {
        let minPlays = Infinity;
        let selectedPlayer = -1;
        for (let i = 0; i < numPlayers; i++) {
            if (!playerPeriodCounts[i].periodsPlayed.includes(period)) {
                if (rank === null || players[i].rank === rank) {
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

            if (aCount <= bCount && players.some(p => p.rank === 'A')) {
                playerIndex = findPlayerWithMinPlays(period, 'A');
                if (playerIndex !== -1) aCount++;
            }
            if (playerIndex === -1 && bCount <= aCount && players.some(p => p.rank === 'B')) {
                playerIndex = findPlayerWithMinPlays(period, 'B');
                if (playerIndex !== -1) bCount++;
            }

            if (playerIndex === -1) {
                playerIndex = findPlayerWithMinPlays(period);
            }

            if (playerIndex !== -1) {
                periodPlayers.push(players[playerIndex]);
                playerPeriodCounts[playerIndex].plays++;
                playerPeriodCounts[playerIndex].periodsPlayed.push(period);
            } else {
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
