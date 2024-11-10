const timeList = document.getElementById('time-list');
const toggleButtons = document.querySelectorAll('.toggle-container button');
const timezoneDisplay = document.getElementById('timezone');

// Set client time zone
timezoneDisplay.innerText = Intl.DateTimeFormat().resolvedOptions().timeZone;

let currentPeriod = 'daily';
let timerInterval = null;

// Function to fetch data and update the timer display
function fetchData() {
  chrome.storage.local.get(['timeData'], data => {
    const timeData = data.timeData || {};
    timeList.innerHTML = '';
    
    for (const [domain, time] of Object.entries(timeData)) {
      const timeInSeconds = time ? Math.floor(time / 1000) : 0;
      const hours = Math.floor(timeInSeconds / 3600);
      const minutes = Math.floor((timeInSeconds % 3600) / 60);
      const seconds = timeInSeconds % 60;

      const listItem = document.createElement('div');
      listItem.className = 'time-item';

      listItem.innerHTML = `
        <img src="https://${domain}/favicon.ico" alt="Favicon" class="favicon">
        <div class="details">
          <span class="domain">${domain}</span>
          <span class="time">${hours}h ${minutes}m ${seconds}s</span>
        </div>
      `;

      timeList.appendChild(listItem);
    }
  });
}

// Function to start the timer interval
function startTimer() {
  if (timerInterval) clearInterval(timerInterval);

  // Update the timer every second
  timerInterval = setInterval(fetchData, 1000);
}

// Event listeners for the toggle buttons
toggleButtons.forEach(button => {
  button.addEventListener('click', () => {
    currentPeriod = button.id;
    fetchData(); // Fetch data for the selected period
  });
});

// Default to daily view and start the timer
fetchData();
startTimer();
