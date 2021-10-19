function saveOptions() {
  const showDebug = document.getElementById('show-debug-info').checked;
  chrome.storage.sync.set({
    showDebug: showDebug
  }, () => {
    const status = document.getElementById('status-message');
    status.innerHTML = 'Options saved!';
    
    setTimeout( () => {
      status.innerHTML = '';
    }, 1500);
  })
}

function restoreOptions() {
  chrome.storage.sync.get({
    showDebug: false,
  }, data => {
    document.getElementById('show-debug-info').checked = data.showDebug;
  })
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save-options').addEventListener('click', saveOptions);