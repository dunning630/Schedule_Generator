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

    // --- Helper Functions ---

    const findPlayerWithMinPlays = (period, rank = null) => {
        let minPlays = Infinity;
        let selectedPlayerIndex = -1;

        for (let i = 0; i < numPlayers; i++) {
            if (!playerPeriodCounts[i].periodsPlayed.includes(period)) {
                if (rank === null || players[i].rank === rank) {
                    if (playerPeriodCounts[i].plays < minPlays) {
                        minPlays = playerPeriodCounts[i].plays;
                        selectedPlayerIndex = i;
                    }
                }
            }
        }
        return selectedPlayerIndex;
    };

    const getEligiblePlayers = (period) => {
        const eligible = [];
        for (let i = 0; i < numPlayers; i++) {
            if (!playerPeriodCounts[i].periodsPlayed.includes(period)) {
                eligible.push(i);
            }
        }
        return eligible;
    };

    // --- Main Scheduling Logic ---

    for (let period = 0; period < numPeriods; period++) {
        const periodPlayers = [];
        let aCount = 0;
        let bCount = 0;

        // 1. Get eligible players for this period
        let eligible = getEligiblePlayers(period);

        // 2. Sort eligible players by plays (ascending)
        eligible.sort((a, b) => playerPeriodCounts[a].plays - playerPeriodCounts[b].plays);

        // 3. Fill the period, prioritizing even playing time, then rank
        while (periodPlayers.length < 5 && eligible.length > 0) {
            let bestPlayerIndex = -1;

            // Prioritize rank balance *within* the eligible players with the fewest plays
            const minPlays = playerPeriodCounts[eligible[0]].plays;
            const candidates = eligible.filter(index => playerPeriodCounts[index].plays === minPlays);

            // Filter candidates by rank and availability
            const aCandidates = candidates.filter(index => players[index].rank === 'A');
            const bCandidates = candidates.filter(index => players[index].rank === 'B');
            
            if (aCount <= bCount && aCandidates.length > 0 ) {
                bestPlayerIndex = aCandidates[0];
                aCount++;
            }
            else if(bCount <= aCount && bCandidates.length > 0){
                bestPlayerIndex = bCandidates[0];
                bCount++;
            }

            if (bestPlayerIndex === -1 && candidates.length > 0) {
                // If no A/B preference, take the first candidate (already sorted by min plays)
                bestPlayerIndex = candidates[0];
            }

            if (bestPlayerIndex !== -1) {
                periodPlayers.push(players[bestPlayerIndex]);
                playerPeriodCounts[bestPlayerIndex].plays++;
                playerPeriodCounts[bestPlayerIndex].periodsPlayed.push(period);

                // Remove the selected player from the eligible list
                eligible = eligible.filter(index => index !== bestPlayerIndex);
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
