const API_BASE = 'https://hgswaoguurogqayjinap.supabase.co/functions/v1';

document.getElementById('analyzeBtn').addEventListener('click', async () => {
  const btn = document.getElementById('analyzeBtn');
  const loading = document.getElementById('loading');
  const result = document.getElementById('result');
  const error = document.getElementById('error');
  
  btn.disabled = true;
  loading.classList.add('show');
  result.classList.remove('show');
  error.classList.remove('show');
  
  try {
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = tab.url;
    
    // Validate URL
    if (!url || url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.startsWith('about:')) {
      throw new Error('Cannot analyze browser internal pages. Please navigate to a news article.');
    }
    
    // First extract the URL content
    const extractResponse = await fetch(`${API_BASE}/extract-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    
    if (!extractResponse.ok) {
      const errData = await extractResponse.json().catch(() => ({}));
      throw new Error(errData.error || `Failed to extract article (${extractResponse.status})`);
    }
    
    const extractData = await extractResponse.json();
    
    // Check if we got valid text
    if (!extractData.text || extractData.text.trim().length < 50) {
      throw new Error('Could not extract enough text from this page. Try a different article.');
    }
    
    // Show result
    const isReal = extractData.label === 'REAL';
    result.className = `result show ${isReal ? 'real' : 'fake'}`;
    document.getElementById('resultLabel').textContent = extractData.label;
    document.getElementById('resultConfidence').textContent = 
      `Confidence: ${Math.round(extractData.score * 100)}%`;
    document.getElementById('resultExplanation').textContent = 
      extractData.explanation || '';
    
    // Also send to content script to show overlay
    chrome.tabs.sendMessage(tab.id, {
      type: 'SHOW_RESULT',
      data: extractData
    }).catch(() => {
      // Content script might not be loaded on some pages
      console.log('Could not send to content script');
    });
    
  } catch (err) {
    error.textContent = err.message || 'Something went wrong';
    error.classList.add('show');
  } finally {
    btn.disabled = false;
    loading.classList.remove('show');
  }
});
