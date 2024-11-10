let activeTabId = null;
let activeDomain = null;
let startTime = null;

chrome.tabs.onActivated.addListener(activeInfo => {
  switchTab(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.active && changeInfo.status === 'complete') {
    switchTab(tabId);
  }
});

function switchTab(tabId) {
  chrome.tabs.get(tabId, tab => {
    if (tab.url) {
      const url = new URL(tab.url);
      const domain = url.hostname;

      if (domain !== activeDomain) {
        updateTimeSpent();

        activeTabId = tabId;
        activeDomain = domain;
        startTime = Date.now();
      }
    }
  });
}

function updateTimeSpent() {
  if (activeDomain && startTime) {
    const elapsedTime = Date.now() - startTime;

    chrome.storage.local.get(['timeData'], data => {
      const timeData = data.timeData || {};

      // Accumulate time or initialize if not present
      timeData[activeDomain] = (timeData[activeDomain] || 0) + elapsedTime;

      chrome.storage.local.set({ timeData });
    });
  }
}

// Listener to track idle state and update the time when the user becomes inactive
chrome.idle.onStateChanged.addListener(state => {
  if (state === 'active' && startTime === null) {
    startTime = Date.now();  // Resume timer when user becomes active
  } else if (state !== 'active') {
    updateTimeSpent();
    startTime = null;  // Pause timer when user goes idle
  }
});

chrome.tabs.onRemoved.addListener(() => {
  updateTimeSpent();
  startTime = null;
});
