
function getChrome() {
  if (browser.runtime.getBrowserInfo == undefined) {
    return true
  }
  return false
}

function isDroid() {
  if (!getChrome()) {
    var gettingInfo = browser.runtime.getPlatformInfo();
    gettingInfo.then((got) => {
      if (got.os == "android") {
        console.log("android detected")
        return true
      } else {
        console.log("desktop detected")
        return false
      }
    });
  }
  return false
}

if (!isDroid()) {
  chrome.windows.onCreated.addListener(themeWindow);
}

var titlepref = chrome.i18n.getMessage("titlePreface");
var titleprefpriv = chrome.i18n.getMessage("titlePrefacePrivate");

function themeWindow(window) {
  // Check if the window is in private browsing
  if (window.incognito) {
    chrome.theme.update(window.id, {
      colors: {
        frame: "#2D4470",
        toolbar: "#2D4470",
      }
    });
    chrome.windows.update(window.id, {
      titlePreface: titleprefpriv
    });
  } else {
    chrome.theme.update(window.id, {
      colors: {
        frame: "#9DABD5",
        toolbar: "#9DABD5",
      }
    });
    chrome.windows.update(window.id, {
      titlePreface: titlepref
    });
  }
}

function setTitle(window) {
  if (window.incognito) {
    chrome.windows.update(window.id, {
      titlePreface: titleprefpriv
    });
  } else {
    chrome.windows.update(window.id, {
      titlePreface: titlepref
    });
  }
}

function setTitleError(window) {
  alert("plugin error setting title on", window.id)
}

chrome.windows.onCreated.addListener(() => {
  const gettingStoredSettings = chrome.storage.local.get();
  gettingStoredSettings.then(setupProxy, onError);
});

chrome.tabs.onCreated.addListener(() => {
  const getting = browser.windows.getCurrent({
    populate: true
  });
  getting.then(setTitle, setTitleError);
});
