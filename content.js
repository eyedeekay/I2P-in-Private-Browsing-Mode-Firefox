function contentUpdateById(id, message) {
  let infoTitle = document.getElementById(id);
  let messageContent = chrome.i18n.getMessage(message);
  if (infoTitle === null) {
    console.log("content error", id, message);
    console.log("content error", messageContent);
    return;
  }
  infoTitle.textContent = messageContent;
}

// Information Section
contentUpdateById("text-section-header", "extensionName");
contentUpdateById("description", "extensionDescription");
contentUpdateById("beta", "extensionStatus");
contentUpdateById("proxy-check", "proxyFailedStatus");

// Control Section
contentUpdateById("controlHeader", "controlHeader");
contentUpdateById("controlExplain", "controlExplain");
contentUpdateById("clear-browser-data", "clearData");
contentUpdateById("clear-desc", "clearDesc");
contentUpdateById("enable-web-rtc", "enableWebRTC");
contentUpdateById("rtcDesc", "rtcDesc");
contentUpdateById("disable-history", "disableHistory");
contentUpdateById("histDesc", "histDesc");

// Application Section
contentUpdateById("applicationHeader", "applicationHeader");
contentUpdateById("applicationExplain", "applicationExplain");
contentUpdateById("window-visit-homepage", "windowVisitHomepage");
contentUpdateById("abouthome", "abouthome");
contentUpdateById("window-visit-i2ptunnel", "windowVisitI2ptunnel");
contentUpdateById("i2ptunnel", "i2ptunnel");
contentUpdateById("window-visit-susimail", "windowVisitSusiMail");
contentUpdateById("susimail", "susimail");
contentUpdateById("window-visit-snark", "windowVisitSnark");
contentUpdateById("snark", "snark");

contentUpdateById("window-visit-webpage", "windowVisitWebPage");
contentUpdateById("webpage", "webpage");
contentUpdateById("window-visit-sources", "windowVisitSources");
contentUpdateById("sources", "sources");
contentUpdateById("window-visit-releases", "windowVisitReleases");
contentUpdateById("releases", "releases");

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
