var infoTitle = document.getElementById("text-section-header");
infoTitle.textContent = chrome.i18n.getMessage("infoTitle");
/*
var helpMessage = document.getElementById("window-create-forum-panel");
helpMessage.textContent = chrome.i18n.getMessage("forumMessage");
*/
/*
var helpMessage = document.getElementById('window-create-help-panel');
helpMessage.textContent = chrome.i18n.getMessage("helpMessage")
*/
/*
var newsMessage = document.getElementById("window-create-news-panel");
newsMessage.textContent = chrome.i18n.getMessage("newsMessage");
*/
var clearData = document.getElementById("clear-browser-data");
clearData.textContent = chrome.i18n.getMessage("clearData");
/*
document.addEventListener("click", e => {
  browser.runtime.sendMessage({ url: "http://proxy.i2p" });
});

function proxyContent(message) {
  var proxyData = document.getElementById("proxy-health");
  proxyData.textContent = message;
  console.log("Event occurred", message);
}

browser.runtime.onMessage.addListener(proxyContent);
*/

/*
function signalWebRTC(val){
    console.log("signal", val)
}
*/
