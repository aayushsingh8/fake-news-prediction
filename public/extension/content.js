// Content script - runs on every page
let overlayElement = null;

function createOverlay(data) {
  // Remove existing overlay
  if (overlayElement) {
    overlayElement.remove();
  }
  
  const isReal = data.label === 'REAL';
  const confidence = Math.round(data.score * 100);
  
  overlayElement = document.createElement('div');
  overlayElement.id = 'truth-guard-overlay';
  overlayElement.innerHTML = `
    <div class="tg-overlay ${isReal ? 'tg-real' : 'tg-fake'}">
      <div class="tg-header">
        <span class="tg-logo">🛡️ Truth Guard</span>
        <button class="tg-close" id="tg-close">×</button>
      </div>
      <div class="tg-body">
        <div class="tg-label">${data.label}</div>
        <div class="tg-confidence">${confidence}% Confidence</div>
        <div class="tg-explanation">${data.explanation || ''}</div>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlayElement);
  
  // Close button handler
  document.getElementById('tg-close').addEventListener('click', () => {
    overlayElement.remove();
    overlayElement = null;
  });
  
  // Auto-hide after 30 seconds
  setTimeout(() => {
    if (overlayElement) {
      overlayElement.classList.add('tg-fade-out');
      setTimeout(() => {
        if (overlayElement) {
          overlayElement.remove();
          overlayElement = null;
        }
      }, 300);
    }
  }, 30000);
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SHOW_RESULT') {
    createOverlay(message.data);
    sendResponse({ success: true });
  }
});
