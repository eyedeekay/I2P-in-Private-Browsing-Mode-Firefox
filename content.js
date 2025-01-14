function contentUpdateById(id, message) {
  let infoTitle = document.getElementById(id);
  let messageContent = chrome.i18n.getMessage(message);
  if (infoTitle === null) {
    console.log("content error", id, messageContent);
    return;
  }
  infoTitle.textContent = messageContent;
}

// Information Section
contentUpdateById("text-section-header", "extensionName");
contentUpdateById("description", "extensionDescription");
contentUpdateById("i2pbrowser-version", browser.runtime.getManifest().version);

// Control Section
contentUpdateById("controlHeader", "controlHeader");
contentUpdateById("controlExplain", "controlExplain");
contentUpdateById("clear-browser-data", "clearData");
contentUpdateById("clear-desc", "clearDesc");
contentUpdateById("enable-web-rtc", "enableWebRTC");
contentUpdateById("rtcDesc", "rtcDesc");
contentUpdateById("disable-history", "disableHistory");
//contentUpdateById("disable-referers", "disableReferers");
contentUpdateById("histDesc", "histDesc");

// Application Section
contentUpdateById("applicationHeader", "applicationHeader");
contentUpdateById("applicationExplain", "applicationExplain");
contentUpdateById("window-visit-index", "windowVisitHelppage");
contentUpdateById("help", "help");
contentUpdateById("window-visit-router", "windowVisitConsole");
contentUpdateById("routerConsole", "routerConsole");
contentUpdateById("window-visit-homepage", "extensionName");
contentUpdateById("abouthome", "abouthome");
contentUpdateById("window-visit-i2ptunnel", "windowVisitI2ptunnel");
contentUpdateById("i2ptunnel", "i2ptunnel");
contentUpdateById("window-visit-susimail", "windowVisitSusiMail");
contentUpdateById("susimail", "susimail");
contentUpdateById("window-visit-snark", "windowVisitSnark");
contentUpdateById("snark", "snark");

// Homepage Section
contentUpdateById("window-visit-webpage", "windowVisitWebPage");
contentUpdateById("webpage", "help");
contentUpdateById("window-visit-sources", "windowVisitSources");
contentUpdateById("sources", "sources");
contentUpdateById("window-visit-releases", "windowVisitReleases");
contentUpdateById("releases", "releases");

function hide(elements) {
  const elems = Array.isArray(elements) ? elements : [elements];
  for (let i = 0; i < elems.length; i++) {
    const el = elems[i];
    if (el.style) {
      console.log("(content) hiding");
      el.classList.add("hidden");
    }
  }
}

function unhide(elements) {
  const elems = Array.isArray(elements) ? elements : [elements];
  elems.forEach((el) => {
    if (el.style) {
      //el.style.display = "inline-block";
      console.log("(content) unhiding");
      el.classList.remove("hidden");
    }
  });
}
