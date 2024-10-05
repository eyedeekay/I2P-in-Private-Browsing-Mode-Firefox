var titlepref = chrome.i18n.getMessage("titlePreface");

function checkPeerConnection() {
  let getting = browser.privacy.network.peerConnectionEnabled.get({});
  getting.then((got) => {
    let webrtc = got.value;
    console.log("(info) checking webrtc", webrtc);
    if (document.getElementById("enable-web-rtc") !== null)
      document.getElementById("enable-web-rtc").checked = webrtc;
  });
}

checkPeerConnection();

function checkSnowflake() {
  try {
    function snowflake(snowflake) {
      console.log(
        "(info) snowflake plugin found, leaving WebRTC alone",
        snowflake
      );
      AssurePeerConnection();
    }
    var snowflakeInfo = browser.management.get(
      "{b11bea1f-a888-4332-8d8a-cec2be7d24b9}"
    );
    snowflakeInfo.then(snowflake);
  } catch (err) {
    console.log("(info) snowflake not found", err);
  }
}

checkSnowflake();

function checkHistory() {
  let getting = browser.storage.local.get("disable_history");
  getting.then((got) => {
    let disable_history = got.disable_history;
    if (disable_history == undefined) {
      disable_history = false;
    }
    console.log("(info) checking history", disable_history);
    if (document.getElementById("disable-history") !== null)
      document.getElementById("disable-history").checked = disable_history;
  });
}

checkHistory();

function checkReferer() {
  let getting = browser.storage.local.get("disable_referer");
  getting.then((got) => {
    let disable_referer = got.disable_referer;
    if (disable_referer == undefined) {
      disable_referer = false;
    }
    console.log("(info) checking referer", disable_referer);
    if (document.getElementById("disable-referer") !== null)
      document.getElementById("disable-referer").checked = disable_referer;
  });
}

checkReferer();

document.addEventListener("click", clickHandler);

function clickHandler(clickEvent) {
  const targetId = clickEvent.target.id;

  if (
    targetId === "window-create-help-panel" ||
    targetId === "window-create-news-panel"
  ) {
    const createData = { type: "panel", incognito: true };
    browser.tabs.create(createData).then(() => {
      console.log(`The ${targetId.split("-")[2]} panel has been created`);
    });
  } else if (targetId === "visit-irc") {
    browser.sidebarAction.setPanel({ panel: "http://127.0.0.1:7669" });
    browser.sidebarAction.open();
  } else if (targetId === "generate-fresh-tunnel") {
    function refreshIdentity() {
      console.log("(info) Generating new identity");
      const Http = new XMLHttpRequest();
      const url = `http://${controlHost}:${controlPort}`;
      Http.open("GET", url);
      Http.send();
      Http.onreadystatechange = () => {
        console.log(Http.responseText);
      };
    }
    refreshIdentity();
  } else if (targetId.startsWith("label-router")) {
    const listId = `label-${targetId.split("-")[2]}-list`;
    const list = document.getElementById(listId);

    if (list.style.display !== "none") {
      console.log(`hiding ${listId}`);
      list.style.display = "none";
    } else {
      console.log(`showing ${listId}`);
      list.style.display = "block";
    }
  } else if (targetId === "search-submit") {
    console.log("(info) attempting to create search tab");
    goSearch();
  } else if (targetId === "url-submit") {
    console.log("(info) attempting to create search tab");
    goURL();
  } else if (targetId === "browser-action") {
    console.log("(info) showing a browser action");
    showBrowsing();
  } else if (targetId === "torrent-action" || targetId === "torrentui-opener") {
    console.log("(info) showing a torrent action");
    showTorrentsMenu();
  } else if (targetId.startsWith("window-visit")) {
    const page = targetId.split("-")[2];
    console.log(`attempting to create ${page} tab`);
    switch (page) {
      case "homepage":
      case "help":
        goHome();
        break;
      case "index":
        goIndex();
        break;
      case "torrent":
        goTorrent();
        break;
      case "console":
        goConsole();
        break;
      case "i2ptunnel":
        goTunnel();
        break;
      case "i2p":
        goHomepage();
        break;
      case "susimail":
        goMail();
        break;
      case "snark":
        goSnark();
        break;
    }
  } else if (targetId === "clear-browser-data") {
    forgetBrowsingData();
  } else if (targetId === "enable-web-rtc") {
    const isWebRTCEnabled = clickEvent.target.checked;
    browser.runtime.sendMessage({
      rtc: isWebRTCEnabled ? "enableWebRTC" : "disableWebRTC",
    });
    checkPeerConnection();
    return;
  } else if (targetId === "disable-history") {
    const isHistoryEnabled = !clickEvent.target.checked;
    browser.runtime.sendMessage({
      history: isHistoryEnabled ? "enableHistory" : "disableHistory",
    });
    return;
  } else if (targetId === "disable-referer") {
    const isRefererEnabled = !clickEvent.target.checked;
    browser.runtime.sendMessage({
      referers: isRefererEnabled ? "enableReferer" : "disableReferer",
    });
    return;
  }

  clickEvent.preventDefault();
}

window.onload = function (e) {
  if (document.getElementById("label-peers-list") != null) {
    document.getElementById("label-peers-list").style.display = "none";
  }
  if (document.getElementById("label-bandwidth-list") != null) {
    document.getElementById("label-bandwidth-list").style.display = "none";
  }
};

function proxyReadiness() {
  console.log(this.responseText);
}

var gettingInfo = browser.runtime.getPlatformInfo();
gettingInfo.then((got) => {
  if (got.os != "android") {
    browser.history.onVisited.addListener(onVisited);
  }
});

function showBrowsing() {
  var x = document.getElementById("browserpanel");
  x.style.display = "block";
  var y = document.getElementById("torrentpanel");
  y.style.display = "none";
}

function showTorrentsMenu() {
  var x = document.getElementById("browserpanel");
  x.style.display = "none";
  var y = document.getElementById("torrentpanel");
  y.style.display = "block";
}

function goHome() {
  function onTabError() {
    console.log("(info) Help tab not created");
  }
  let createData = {
    url: "home.html",
  };
  console.log("(info) visiting homepage");
  let creating = browser.tabs.create(createData);
  creating.then(onTabCreated, onTabError);
}

function goIndex() {
  function onTabError() {
    console.log("(info) Help tab not created");
  }
  let createData = {
    url: "index.html",
  };
  console.log("(info) visiting help");
  let creating = browser.tabs.create(createData);
  creating.then(onTabCreated, onTabError);
}

function goTorrent() {
  function onTabError() {
    console.log("(info) Torrent Help tab not created");
  }
  let createData = {
    url: "torrent/index.html",
  };
  console.log("(info) visiting torrent help");
  let creating = browser.tabs.create(createData);
  creating.then(onTabCreated, onTabError);
}

function goHomepage() {
  function onTabError() {
    console.log("(info) i2p-projekt tab not created");
  }
  let createData = {
    url: "http://i2p-projekt.i2p",
  };
  console.log("(info) visiting i2p-projekt");
  let creating = browser.tabs.create(createData);
  creating.then(onTabCreated, onTabError);
}

function goHelp() {
  function onTabError() {
    console.log("(info) Torrent Help tab not created");
  }
  let createData = {
    url: "i2pcontrol/index.html",
  };
  console.log("(info) visiting torrent help");
  let creating = browser.tabs.create(createData);
  creating.then(onTabCreated, onTabError);
}

function onTabCreated() {
  console.log("(info) Tab Created");
}

function goSearch() {
  function onTabError() {
    console.log("(info) Search tab created");
  }
  let createData = {
    url:
      "http://cuss2sgthm5wfipnnztrjdvtaczb22hnmr2ohnaqqqz3jf6ubf3a.b32.i2p/yacysearch.html?" +
      "query=" +
      document.getElementById("search-query").value,
  };
  console.log("(info) visiting legwork");
  let creating = browser.tabs.create(createData);
  creating.then(onTabCreated, onTabError);
}

function goURL() {
  function onTabError() {
    console.log("(info) Search tab created");
  }

  function createNewURLTab(context) {
    console.log("(info) visiting URL");
    let createData = {
      url: document.getElementById("url-query").value,
      cookieStoreId: context[0].cookieStoreId,
    };
    let creating = browser.tabs.create(createData);
    creating.then(onTabCreated, onTabError);
  }
  let context = browser.contextualIdentities.query({
    name: titlepref,
  });
  context.then(createNewURLTab, onTabError);
}

function routerAddr() {
  try {
    return control_host() + ":" + control_port();
  } catch {
    return "127.0.0.1:7657";
  }
}

function goConsole() {
  function onTabError() {
    console.log("(info) Console tab not created");
  }
  let createData = {
    url: "http://" + routerAddr() + "/home",
  };
  console.log("(info) visiting router console");
  let creating = browser.tabs.create(createData);
  creating.then(onTabCreated, onTabError);
}

function goTunnel() {
  function onTabError() {
    console.log("(info) I2PTunnel tab created");
  }
  let createData = {
    url: "http://" + routerAddr() + "/i2ptunnel",
  };
  console.log("(info) visiting i2ptunnel");
  let creating = browser.tabs.create(createData);
  creating.then(onTabCreated, onTabError);
}

function goMail() {
  function onTabError() {
    console.log("(info) Mail tab created");
  }
  let createData = {
    url: "http://" + routerAddr() + "/susimail",
  };
  console.log("(info) visiting mail");
  let creating = browser.tabs.create(createData);
  creating(onTabCreated, onTabError);
}

function goSnark() {
  function onTabError() {
    console.log("(info) Snark tab created");
  }
  let createData = {
    url: "http://" + routerAddr() + "/i2psnark",
  };
  console.log("(info) visiting snark");
  let creating = browser.tabs.create(createData);
  creating.then(onTabCreated, onTabError);
}

function onVisited(historyItem) {
  function onCleaned(results) {
    if (results.length) {
      console.log("(info)  was not removed");
    } else {
      console.log("(info)  was removed");
    }
  }

  function onRemoved() {
    var searching = browser.history.search({
      text: historyItem.url,
      startTime: 0,
    });
    searching.then(onCleaned);
  }
  if (!history) {
    if (i2pHost(historyItem)) {
      var deletingUrl = browser.history.deleteUrl(historyItem.url);
    }
    deletingUrl.then(onRemoved);
  }
}

/*
if (UpdateContents !== undefined) UpdateContents();
*/
const minutes = 0.2;
const interval = minutes * 60 * 1000;

setInterval(function () {
  if (UpdateContents !== undefined) UpdateContents();
}, interval);
