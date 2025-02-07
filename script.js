let players = [];

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('addPlayers').addEventListener('click', addSelectedPlayers);

    document.getElementById('generateSchedule').addEventListener('click', generateSchedule);

    document.getElementById('selectAll').addEventListener('change', function() {
        const playerCheckboxes = document.querySelectorAll('.player-checkbox');
        playerCheckboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
        });
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
        // Check for duplicates *before* adding
        if (!players.some(p => p.name === playerName)) {
            players.push({ name: playerName, rank: 'A' }); // Default to 'A'
            checkbox.checked = false; //immediately uncheck
        }

    });
     document.getElementById('selectAll').checked = false;//reset select all

    updatePlayerList();  // Update the list *after* adding
    updateSelectedPlayersDisplay(); // And update the selected display
}

function updateSelectedPlayersDisplay() {
    const selectedPlayersDiv = document.getElementById('selectedPlayers');
    const selected = Array.from(document.querySelectorAll('.player-checkbox:checked'))
        .map(checkbox => checkbox.value);
    selectedPlayersDiv.textContent = selected.length > 0 ? 'Selected: ' + selected.join(', ') : 'No Players Selected';
}
function updatePlayerList() {
    const playerList = document.getElementById('playerList');
    playerList.innerHTML = ''; // Clear the list

    players.forEach((player, index) => {
        const li = document.createElement('li');

        // Player Name (Text)
        const nameSpan = document.createElement('span');
        nameSpan.textContent = `${player.name} `;
        li.appendChild(nameSpan);

        // Rank Dropdown
        const rankSelect = document.createElement('select');
        rankSelect.className = 'rank-select';
        rankSelect.id = `rank-${index}`; // Unique ID for each dropdown

        const optionA = document.createElement('option');
        optionA.value = 'A';
        optionA.textContent = 'A';
        rankSelect.appendChild(optionA);

        const optionB = document.createElement('option');
        optionB.value = 'B';
        optionB.textContent = 'B';
        rankSelect.appendChild(optionB);

        // Set the selected option based on the player's current rank
        rankSelect.value = player.rank;

        // Event listener for rank changes
        rankSelect.addEventListener('change', function() {
            players[index].rank = this.value; // Update the rank in the players array
            // You could add styling updates here if needed, based on the new rank
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
                break; // No more eligible players
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
