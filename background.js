// Listen for extension icon clicks
chrome.action.onClicked.addListener(async (tab) => {
  // Check if we're on a Twitter/X.com page
  if (!tab.url || (!tab.url.includes('x.com') && !tab.url.includes('twitter.com'))) {
    // Show error badge for non-Twitter pages
    chrome.action.setBadgeText({ text: '!', tabId: tab.id });
    chrome.action.setBadgeBackgroundColor({ color: '#FF0000', tabId: tab.id });
    
    setTimeout(() => {
      chrome.action.setBadgeText({ text: '', tabId: tab.id });
    }, 2000);
    return;
  }
  
  try {
    // Send message to content script to parse the thread
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'parseThread' });
    
    if (response && response.success) {
      // Show success badge
      chrome.action.setBadgeText({ text: '✓', tabId: tab.id });
      chrome.action.setBadgeBackgroundColor({ color: '#00D000', tabId: tab.id });
      
      // Clear badge after 2 seconds
      setTimeout(() => {
        chrome.action.setBadgeText({ text: '', tabId: tab.id });
      }, 2000);
    } else {
      // Show error badge
      chrome.action.setBadgeText({ text: '!', tabId: tab.id });
      chrome.action.setBadgeBackgroundColor({ color: '#FF0000', tabId: tab.id });
      
      setTimeout(() => {
        chrome.action.setBadgeText({ text: '', tabId: tab.id });
      }, 2000);
    }
  } catch (error) {
    console.error('Error:', error);
    
    // Try to inject the content script if it's not loaded
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['parseThread.js', 'content.js']
      });
      
      // Try again after injection
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'parseThread' });
      
      if (response && response.success) {
        chrome.action.setBadgeText({ text: '✓', tabId: tab.id });
        chrome.action.setBadgeBackgroundColor({ color: '#00D000', tabId: tab.id });
        
        setTimeout(() => {
          chrome.action.setBadgeText({ text: '', tabId: tab.id });
        }, 2000);
      }
    } catch (injectError) {
      // Show error badge
      chrome.action.setBadgeText({ text: '!', tabId: tab.id });
      chrome.action.setBadgeBackgroundColor({ color: '#FF0000', tabId: tab.id });
      
      setTimeout(() => {
        chrome.action.setBadgeText({ text: '', tabId: tab.id });
      }, 2000);
    }
  }
});