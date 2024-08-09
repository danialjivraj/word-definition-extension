let selectedText = "";

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});

chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["./frontend/content.js"],
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSelectedText") {
    selectedText = request.selectedText;
  }
  sendResponse({ selectedText: selectedText });
});
