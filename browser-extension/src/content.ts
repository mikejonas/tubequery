console.log("Content script running");

// src/content.ts
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === "modifyDOM") {
    document.body.style.backgroundColor = "yellow";
    sendResponse({ status: "DOM modified" });
  }
});
