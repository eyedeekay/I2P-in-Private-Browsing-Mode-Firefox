var titlepref = chrome.i18n.getMessage("titlePreface");

function onSet(result) {
  if (result) {
    console.log("->: Value was updated");
  } else {
    console.log("-X: Value was not updated");
  }
}

/* This disables queries to centralized databases of bad URLs to screen for
   risky sites in your browser */
function disableHyperlinkAuditing() {
  var setting = browser.privacy.websites.hyperlinkAuditingEnabled.set({
    value: false,
  });
  console.log("Disabling hyperlink auditing/val=", {
    value: false,
  });
  setting.then(onSet);
}

// UNINSTALL ONLY
function enableHyperlinkAuditing() {
  var setting = browser.privacy.websites.hyperlinkAuditingEnabled.clear();
  console.log("Disabling hyperlink auditing/val=", {
    value: false,
  });
  setting.then(onSet);
}

// This enables first-party isolation
function enableFirstPartyIsolation() {
  var setting = browser.privacy.websites.firstPartyIsolate.set({
    value: true,
  });
  console.log("Enabling first party isolation/val=", {
    value: true,
  });
  setting.then(onSet);
}

// UNINSTALL ONLY
function disableFirstPartyIsolation() {
  var setting = browser.privacy.websites.firstPartyIsolate.clear();
  console.log("Enabling first party isolation/val=", {
    value: true,
  });
  setting.then(onSet);
}

/* This rejects tracking cookies and third-party cookies but it
   LEAVES "Persistent" Cookies unmodified in favor of an option in the content
   interface for now */
function disableEvilCookies() {
  var getting = browser.privacy.websites.cookieConfig.get({});
  getting.then((got) => {
    var setting = browser.privacy.websites.cookieConfig.set({
      value: {
        behavior: "reject_third_party",
        nonPersistentCookies: got.value.nonPersistentCookies,
      },
    });
    console.log("Setting cookie behavior/val=", {
      value: {
        behavior: "reject_third_party",
        nonPersistentCookies: got.value.nonPersistentCookies,
      },
    });
    setting.then(onSet);
  });
}

function enableEvilCookies() {
  var getting = browser.privacy.websites.cookieConfig.clear();
}

// Make sure that they're gone
/*function disableBadCookies(){
    var setting = browser.privacy.websites.thirdPartyCookiesAllowed.set({
      value: false
    });
    console.log("Disabling third party cookies/val=", {
      value: false
    })
    setting.then(onSet);
}*/

// this disables the use of referrer headers
function disableReferrers() {
  var setting = browser.privacy.websites.referrersEnabled.set({
    value: false,
  });
  console.log("Disabling referrer headers/val=", {
    value: false,
  });
  setting.then(onSet);
}

// UNINSATALL ONLY
function enableReferrers() {
  var setting = browser.privacy.websites.referrersEnabled.clear();
  console.log("Disabling referrer headers/val=", {
    value: false,
  });
  setting.then(onSet);
}

// enable fingerprinting resistent features(letterboxing and stuff)
function enableResistFingerprinting() {
  var setting = browser.privacy.websites.resistFingerprinting.set({
    value: true,
  });
  console.log("Enabling resist fingerprinting/val=", {
    value: true,
  });
  setting.then(onSet);
}

// UNINSTALL ONLY
function disableResistFingerprinting() {
  var setting = browser.privacy.websites.resistFingerprinting.clear();
  console.log("Enabling resist fingerprinting/val=", {
    value: false,
  });
  setting.then(onSet);
}

// This is essentially a blocklist of clearnet web-sites known to do bad tracking
function enableTrackingProtection() {
  var setting = browser.privacy.websites.trackingProtectionMode.set({
    value: "always",
  });
  console.log("Enabling tracking protection/val=", {
    value: "always",
  });
  setting.then(onSet);
}

// UNINSTALL ONLY
function disableTrackingProtection() {
  var setting = browser.privacy.websites.trackingProtectionMode.clear();
  console.log("Enabling tracking protection/val=", {
    value: "always",
  });
  setting.then(onSet);
}

/* This disables protected content, which is a form of digital restrictions
   management dependent on identifying information */
function disableDigitalRestrictionsManagement() {
  var gettingInfo = browser.runtime.getPlatformInfo();
  gettingInfo.then((got) => {
    if (got.os == "win") {
      var setting = browser.privacy.websites.protectedContentEnabled.set({
        value: false,
      });
      console.log(
        "Setting Protected Content(Digital Restrictions Management) false/val=",
        {
          value: false,
        }
      );
      setting.then(onSet);
    }
  });
}

// UNINSTALL ONLY
function disableDigitalRestrictionsManagement() {
  var gettingInfo = browser.runtime.getPlatformInfo();
  gettingInfo.then((got) => {
    if (got.os == "win") {
      var setting = browser.privacy.websites.protectedContentEnabled.clear();
      console.log(
        "Setting Protected Content(Digital Restrictions Management) false/val=",
        {
          value: true,
        }
      );
      setting.then(onSet);
    }
  });
}

function unsetAllPrivacy() {
  enableHyperlinkAuditing();
  disableFirstPartyIsolation();
  enableEvilCookies();
  enableReferrers();
  disableTrackingProtection();
  disableResistFingerprinting();
  enableDigitalRestrictionsManagement();
  UnsetPeerConnection();
  EnableSavePasswords();
}

browser.management.onUninstalled.addListener((info) => {
  function gotSelf(selfinfo) {
    if (info.name == selfinfo.name) {
      unsetAllPrivacy();
    }
  }
  var gettingSelf = browser.management.getSelf();
  gettingSelf.then(gotSelf);
});

function setAllPrivacy() {
  disableHyperlinkAuditing();
  enableFirstPartyIsolation();
  disableEvilCookies();
  disableReferrers();
  enableTrackingProtection();
  enableResistFingerprinting();
  disableDigitalRestrictionsManagement();
}

setAllPrivacy();

function ResetPeerConnection() {
  function reset(snowflake) {
    var webrtc = true;
    console.log("No snowflake plugin found, pre-disabled WebRTC");
    var rtc = browser.privacy.network.peerConnectionEnabled.set({
      value: webrtc,
    });
    rtc.then(AssurePeerConnection);
  }

  function snowflake(snowflake) {
    console.log("snowflake plugin found, leaving WebRTC alone", snowflake);
    AssurePeerConnection();
  }
  var snowflakeInfo = browser.management.get(
    "{b11bea1f-a888-4332-8d8a-cec2be7d24b9}" // string
  );
  snowflakeInfo.then(snowflake, reset);
}

function AssurePeerConnection() {
  function assure(webrtc) {
    browser.privacy.network.peerConnectionEnabled.set({
      value: true,
    });
    chrome.privacy.network.webRTCIPHandlingPolicy.set({
      value: "disable_non_proxied_udp",
    });
  }
  let rtc = browser.privacy.network.peerConnectionEnabled.get({});
  rtc.then(assure);
}

// UNINSTALL ONLY
function UnsetPeerConnection() {
  function assure(webrtc) {
    browser.privacy.network.peerConnectionEnabled.set({
      value: true,
    });
    chrome.privacy.network.webRTCIPHandlingPolicy.set({
      value: "default",
    });
  }
  let rtc = browser.privacy.network.peerConnectionEnabled.get({});
  rtc.then(assure);
}

var gettingInfo = browser.runtime.getPlatformInfo();
gettingInfo.then((got) => {
  if (got.os == "android") {
    browser.tabs.onCreated.addListener(ResetPeerConnection);
  } else {
    browser.windows.onCreated.addListener(ResetPeerConnection);
  }
});
//AssurePeerConnection();

function ResetDisableSavePasswords() {
  browser.privacy.services.passwordSavingEnabled.set({
    value: false,
  });
  console.log("Re-disabled saved passwords");
}

function EnableSavePasswords() {
  browser.privacy.services.passwordSavingEnabled.clear();
  console.log("Enabled saved passwords");
}

//ResetDisableSavePasswords()

var defaultSettings = {
  since: "forever",
  dataTypes: ["downloads", "passwords", "formData", "localStorage", "history"],
};

function onError(therror) {
  console.error(therror);
}

function forgetBrowsingData(storedSettings) {
  function getSince(selectedSince) {
    if (selectedSince === "forever") {
      return 0;
    }

    const times = {
      hour: () => 1000 * 60 * 60,
      day: () => 1000 * 60 * 60 * 24,
      week: () => 1000 * 60 * 60 * 24 * 7,
    };

    const sinceMilliseconds = times[selectedSince].call();
    return Date.now() - sinceMilliseconds;
  }

  function getTypes(selectedTypes) {
    let dataTypes = {};
    for (let item of selectedTypes) {
      dataTypes[item] = true;
    }
    return dataTypes;
  }

  const since = getSince(defaultSettings.since);
  const dataTypes = getTypes(defaultSettings.dataTypes);

  function notify() {
    let dataTypesString = Object.keys(dataTypes).join(", ");
    let sinceString = new Date(since).toLocaleString();
    browser.notifications.create({
      type: "basic",
      title: "Removed browsing data",
      message: `Removed ${dataTypesString}\n for I2P Browsing`,
    });
  }

  function deepCleanHistory(historyItems) {
    console.log("Deep cleaning history");
    for (let item of historyItems) {
      if (i2pCheck(item.url)) {
        browser.history.deleteUrl({
          url: item.url,
        });
        browser.browsingData.removeCache({});
        console.log("cleared Cache");
        browser.browsingData
          .removePasswords({
            hostnames: [i2pHostName(item.url)],
            since,
          })
          .then(onContextGotLog);
        console.log("cleared Passwords");
        browser.browsingData
          .removeDownloads({
            hostnames: [i2pHostName(item.url)],
            since,
          })
          .then(onContextGotLog);
        console.log("cleared Downloads");
        browser.browsingData
          .removeFormData({
            hostnames: [i2pHostName(item.url)],
            since,
          })
          .then(onContextGotLog);
        console.log("cleared Form Data");
        browser.browsingData
          .removeLocalStorage({
            hostnames: [i2pHostName(item.url)],
            since,
          })
          .then(onContextGotLog);
        console.log("cleared Local Storage");

        let contexts = browser.contextualIdentities.query({
          name: titlepref,
        });

        function deepCleanCookies(cookies) {
          for (let cookie of cookies) {
            var removing = browser.cookies.remove({
              firstPartyDomain: cookie.firstPartyDomain,
              name: cookie.name,
              url: item.url,
            });
            removing.then(onContextGotLog, onError);
          }
          console.log("Cleared cookies");
        }

        function deepCleanContext(cookieStoreIds) {
          for (let cookieStoreId of cookieStoreIds) {
            var removing = browser.cookies.getAll({
              firstPartyDomain: null,
              storeId: cookieStoreId.cookieStoreId,
            });
            removing.then(deepCleanCookies, onError);
          }
        }

        contexts.then(deepCleanContext, onError);
      }
    }
    notify();
  }

  var searching = browser.history.search({
    text: "i2p",
    startTime: 0,
  });

  searching.then(deepCleanHistory);

  setAllPrivacy();
  ResetPeerConnection();
}

function i2pHostName(url) {
  let hostname = "";
  console.log("(hosts)", url);
  let u = new URL(url);
  if (u.host.endsWith(".i2p")) {
    hostname = u.host;
  } else if (url.includes("=")) {
    if (url.includes(".i2p")) {
      lsit = url.split("=");
      for (let item in lsit) {
        var items = lsit[item].split(`\ % `); //"\%")
        for (let p in items) {
          if (items[p].includes(".i2p")) {
            hostname = items[p].replace("3D", 1);
          }
          break;
        }
        if (hostname != "") {
          break;
        }
      }
    }
  } else if (url.indexOf("://") > -1) {
    hostname = url.split("/")[2];
  } else {
    hostname = url.split("/")[0];
  }
  return hostname;
}

function i2pCheck(url) {
  let hostname = i2pHostName(url);
  let postname = hostname.split(":")[0];
  if (postname.endsWith(".i2p")) {
    console.log("(hostname) i2p", postname);
  }
  return postname.endsWith(".i2p");
}

function onContextGotLog(contexts) {
  if (contexts != null) {
    console.log(contexts);
  }
}

browser.runtime.onMessage.addListener(message);

function enableHistory() {
  function checkStoredSettings(storedSettings) {
    storedSettings["disable_history"] = false;
    console.log(storedSettings);

    function enablehistory(settings) {
      console.log("Store History:", settings);
    }
    let setting = browser.storage.local.set(storedSettings);
    setting.then(enablehistory);
  }
  const gettingStoredSettings = browser.storage.local.get();
  gettingStoredSettings.then(checkStoredSettings, onError);
}

function disableHistory() {
  function checkStoredSettings(storedSettings) {
    storedSettings["disable_history"] = true;
    console.log(storedSettings);

    function enablehistory(settings) {
      console.log("Store History:", settings);
    }
    var setting = browser.storage.local.set(storedSettings);
    setting.then(enablehistory);
  }
  const gettingStoredSettings = browser.storage.local.get();
  gettingStoredSettings.then(checkStoredSettings, onError);
}

function message(recieved) {
  console.log(recieved);
  if (recieved.rtc === "enableWebRTC") {
    console.log("enableWebRTC");
    AssurePeerConnection();
  } else if (recieved.rtc === "disableWebRTC") {
    console.log("disableWebRTC");
    ResetPeerConnection();
  }
  if (recieved.history === "enableHistory") {
    console.log("enableHistory");
    enableHistory();
  } else if (recieved.history === "disableHistory") {
    console.log("disableHistory");
    disableHistory();
  }
}
