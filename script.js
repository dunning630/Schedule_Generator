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
            if (!players.includes(checkbox.value)) {
                players.push(checkbox.value);
            }
            checkbox.checked = false;
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
        li.textContent = player;
        playerList.appendChild(li);
    });
}

function generateSchedule() {
    const numPlayers = players.length;
    const numPeriods = 8;
    const schedule = [];
    const playerPeriodCounts = players.map(() => ({ plays: 0, periodsPlayed: [] }));

    const findPlayerWithMinPlays = (period) => {
        let minPlays = Infinity;
        let selectedPlayer = -1;
        for (let i = 0; i < numPlayers; i++) {
            if (playerPeriodCounts[i].plays < minPlays && !playerPeriodCounts[i].periodsPlayed.includes(period)) {
                minPlays = playerPeriodCounts[i].plays;
                selectedPlayer = i;
            }
        }
        return selectedPlayer;
    };

    for (let period = 0; period < numPeriods; period++) {
        let playersInPeriod = 0;
        const periodPlayers = [];

        while (playersInPeriod < 5) {
            const playerIndex = findPlayerWithMinPlays(period);
            if (playerIndex !== -1) {
                periodPlayers.push(players[playerIndex]);
                playerPeriodCounts[playerIndex].plays++;
                playerPeriodCounts[playerIndex].periodsPlayed.push(period);
                playersInPeriod++;
            } else {
                break;
            }
        }
        schedule.push({ period: period + 1, players: periodPlayers });
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
        periodData.players.forEach(player => {
            const playerDiv = document.createElement('div');
            playerDiv.textContent = player;
            periodDiv.appendChild(playerDiv);
        });
        scheduleOutput.appendChild(periodDiv);
    });
}