let players = [];

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('addPlayers').addEventListener('click', function() {
        addSelectedPlayers();
        updatePlayerList(); // Update the displayed player list
    });

    document.getElementById('generateSchedule').addEventListener('click', function() {
        generateSchedule();
    });

    // Initial call to set up the "No Players Selected" message
    updateSelectedPlayersDisplay();
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
                checkbox.checked = false;
                return;
            }
            checkbox.checked = false; // Always uncheck after processing
        }
    });
     updateSelectedPlayersDisplay();
}


function updateSelectedPlayersDisplay() {
    const selectedPlayersDiv = document.getElementById('selectedPlayers');
    const selected = Array.from(document.querySelectorAll('.dropdown-content input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value); // Get values of *checked* checkboxes

    // Update the text content to show selected players, or the default message
    selectedPlayersDiv.textContent = selected.length > 0
        ? 'Selected: ' + selected.join(', ')
        : 'No Players Selected';
}

function updatePlayerList() {
    const playerList = document.getElementById('playerList');
    playerList.innerHTML = '';

    players.forEach(player => {
        const li = document.createElement('li');
        li.textContent = `<span class="math-inline">\{player\.name\} \(</span>{player.rank})`;
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
        while (periodPlayers.length <
