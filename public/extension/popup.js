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
    
    // First extract the URL content
    const extractResponse = await fetch(`${API_BASE}/extract-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    
    if (!extractResponse.ok) {
      const errData = await extractResponse.json();
      throw new Error(errData.error || 'Failed to extract article');
    }
    
    const extractData = await extractResponse.json();
    
    // Then predict
    const predictResponse = await fetch(`${API_BASE}/ensemble-predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        text: extractData.text,
        sourceUrl: url
      })
    });
    
    if (!predictResponse.ok) {
      const errData = await predictResponse.json();
      throw new Error(errData.error || 'Failed to analyze');
    }
    
    const predictData = await predictResponse.json();
    
    // Show result
    const isReal = predictData.label === 'REAL';
    result.className = `result show ${isReal ? 'real' : 'fake'}`;
    document.getElementById('resultLabel').textContent = predictData.label;
    document.getElementById('resultConfidence').textContent = 
      `Confidence: ${Math.round(predictData.score * 100)}%`;
    document.getElementById('resultExplanation').textContent = 
      predictData.explanation || '';
    
    // Also send to content script to show overlay
    chrome.tabs.sendMessage(tab.id, {
      type: 'SHOW_RESULT',
      data: predictData
    });
    
  } catch (err) {
    error.textContent = err.message || 'Something went wrong';
    error.classList.add('show');
  } finally {
    btn.disabled = false;
    loading.classList.remove('show');
  }
});
