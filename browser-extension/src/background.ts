// src/background.ts
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});

// src/background.ts
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log("Message received in background:", message);
  sendResponse({ status: "Received in background" });
});
