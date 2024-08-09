if (document instanceof Document) {
  window.addEventListener("mouseup", wordSelected);
}

function wordSelected() {
  let selectedText = window.getSelection().toString().trim();
  if (selectedText.length > 0) {
    let message = {
      action: "getSelectedText",
      selectedText: selectedText,
    };
    chrome.runtime.sendMessage(message);
  }
}
