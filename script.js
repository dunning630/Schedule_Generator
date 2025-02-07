let players = [];

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('addPlayers').addEventListener('click', function() {
        addSelectedPlayers();
        updatePlayerList();
    });

    document.getElementById('generateSchedule').addEventListener('click', function() {
        generateSchedule();
    });
});

function addSelectedPlayers() {
    const checkboxes = document.querySelectorAll('.dropdown-content input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            const playerName = checkbox.value;
            // Prompt for rank when a player is checked.  Crucially, get the rank *here*.
            const playerRank = prompt(`Enter rank for ${playerName} (A or B):`, 'A').toUpperCase(); // Prompt for rank

            if (playerRank === 'A' || playerRank === 'B') {
                if (!players.some(p => p.name === playerName)) { // Check for duplicates using the new structure
                  players.push({ name: playerName, rank: playerRank });
                }
            } else {
                alert("Invalid rank. Please enter 'A' or 'B'.");
                checkbox.checked = false; // uncheck if invalid rank
                return; // prevent adding this
            }
            checkbox.checked = false;
        }
    });
    updateSelectedPlayersDisplay();  //Update after each player
}

function updateSelectedPlayersDisplay() {
  const selectedPlayersDiv = document.getElementById('selectedPlayers');
    const selected = Array.from(document.querySelectorAll('.dropdown-content input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);
    selectedPlayersDiv.textContent = selected.length > 0 ? 'Selected: ' + selected.join(', ') : 'No Players Selected';
}
function updatePlayerList() {
    const playerList = document.getElementById('playerList');
    playerList.innerHTML = ''; // Clear previous list

    players.forEach(player => {
        const li = document.createElement('li');
        li.textContent = `${player.name} (${player.rank})`; // Display name and rank

        // Optional: Style based on rank (add to your CSS if you like)
        if (player.rank === 'A') {
            li.classList.add('rank-a');
        } else if (player.rank === 'B') {
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

     const findPlayerWithMinPlays = (period, rank) => {
        let minPlays = Infinity;
        let selectedPlayer = -1;

        for (let i = 0; i < numPlayers; i++) {
            // Check if the player matches the desired rank and has not played in this period
            if (players[i].rank === rank && playerPeriodCounts[i].plays < minPlays && !playerPeriodCounts[i].periodsPlayed.includes(period)) {
                minPlays = playerPeriodCounts[i].plays;
                selectedPlayer = i;
            }
        }
        return selectedPlayer;
    };

    for (let period = 0; period < numPeriods; period++) {
        const periodPlayers = [];
        let aCount = 0;
        let bCount = 0;

        // Prioritize getting a balance of A and B players
        while (periodPlayers.length < 5) {
            let playerIndex;
            if (aCount <= bCount && aCount < 3) {
                // Try to add an 'A' player
              playerIndex = findPlayerWithMinPlays(period, 'A');
              if (playerIndex !== -1) {
                  aCount++;
              }
            }
             if (bCount <= aCount && bCount < 3 && playerIndex == -1){
                playerIndex = findPlayerWithMinPlays(period, 'B');
                if (playerIndex !== -1) {
                  bCount++;
              }

            }

            //if we still haven't found an a or b player, then just find the first available player
            if(playerIndex == -1){
                playerIndex = findPlayerWithMinPlays(period)
            }

            if (playerIndex !== -1) {
                periodPlayers.push(players[playerIndex]);
                playerPeriodCounts[playerIndex].plays++;
                playerPeriodCounts[playerIndex].periodsPlayed.push(period);

            } else {
                // Break if no more eligible players
                break;
            }
        }
        schedule.push({ period: period + 1, players: periodPlayers.map(p => p.name) }); // Store only player names
    }

    displaySchedule(schedule);
}
function displaySchedule(schedule) {
    const scheduleOutput = document.getElementById('scheduleOutput');
    scheduleOutput.innerHTML = ''; // Clear previous output

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
