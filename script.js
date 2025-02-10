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
     document.getElementById('selectAll').checked = false;
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
    const playerPeriodCounts = players.map(() => ({ plays: 0, periodsPlayed: [], combinations: new Set()}));

    // --- Helper Functions ---

    const getEligiblePlayers = (period) => {
        return players.reduce((eligible, player, index) => {
            if (!playerPeriodCounts[index].periodsPlayed.includes(period)) {
                eligible.push(index);
            }
            return eligible;
        }, []);
    };

    const hasPlayedTogether = (playerIndex1, playerIndex2, playerPeriodCounts) => {
        return playerPeriodCounts[playerIndex1].combinations.has(playerIndex2);
    };

    // --- Main Scheduling Logic ---

    for (let period = 0; period < numPeriods; period++) {
        const periodPlayers = [];
        let aCount = 0;
        let bCount = 0;

        let eligible = getEligiblePlayers(period);
        eligible.sort((a, b) => playerPeriodCounts[a].plays - playerPeriodCounts[b].plays);

        while (periodPlayers.length < 5 && eligible.length > 0) {
            const minPlays = playerPeriodCounts[eligible[0]].plays;
            let candidates = eligible.filter(index => playerPeriodCounts[index].plays === minPlays);
            let bestPlayerIndex = -1;

            // --- Prioritize Avoiding Repeated Combinations & Balancing Ranks ---
            if (candidates.length > 1) {
                candidates.sort((a, b) => {
                    let aCombos = 0;
                    let bCombos = 0;
                    for (const existingPlayerIndex of periodPlayers) {
                        if (hasPlayedTogether(a, existingPlayerIndex, playerPeriodCounts)) {
                            aCombos++;
                        }
                        if (hasPlayedTogether(b, existingPlayerIndex, playerPeriodCounts)) {
                            bCombos++;
                        }
                    }
                    const comboDiff = aCombos - bCombos;
                    if (comboDiff !== 0) return comboDiff;

                    // Rank balance *within* same play/combo count
                    return players[a].rank.localeCompare(players[b].rank);
                });
            }

            // --- Selection Logic ---
            if (candidates.length > 0) {
              //Find best index based on rank and counts
              let aIndex = candidates.findIndex(index => players[index].rank === 'A');
              let bIndex = candidates.findIndex(index => players[index].rank === 'B');

              if (aCount <= bCount && aIndex !== -1) {
                bestPlayerIndex = aIndex;
                aCount++;
              }
              else if (bCount <= aCount && bIndex !== -1){
                bestPlayerIndex = bIndex;
                bCount++;
              }
              else{
                bestPlayerIndex = 0;
              }
            }

            if (bestPlayerIndex !== -1) {
                const actualPlayerIndex = candidates[bestPlayerIndex];
                periodPlayers.push(players[actualPlayerIndex]);

                // Update combinations (Corrected!)
                for (const existingPlayer of periodPlayers) {
                    const existingPlayerIndex = players.indexOf(existingPlayer);
                    if (existingPlayerIndex !== actualPlayerIndex) {
                        playerPeriodCounts[actualPlayerIndex].combinations.add(existingPlayerIndex);
                        playerPeriodCounts[existingPlayerIndex].combinations.add(actualPlayerIndex);
                    }
                }

                playerPeriodCounts[actualPlayerIndex].plays++;
                playerPeriodCounts[actualPlayerIndex].periodsPlayed.push(period);
                eligible = eligible.filter(index => index !== actualPlayerIndex);
            } else {
                break; // No more eligible players
            }
        }

        schedule.push({
            period: period + 1,
            players: periodPlayers.map(p => `${p.name} (${p.rank})`)
        });
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
        periodData.players.forEach(playerInfo => {
            const playerDiv = document.createElement('div');
            playerDiv.textContent = playerInfo;
            periodDiv.appendChild(playerDiv);
        });
        scheduleOutput.appendChild(periodDiv);
    });
}
