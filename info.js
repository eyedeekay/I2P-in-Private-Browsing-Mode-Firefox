function checkPeerConnection() {
  let getting = browser.privacy.network.peerConnectionEnabled.get({});
  getting.then(got => {
    let webrtc = got.value;
    console.log("checking webrtc", webrtc);
    if (document.getElementById("enable-web-rtc") !== null)
      document.getElementById("enable-web-rtc").checked = webrtc;
  });
}

checkPeerConnection();

function checkSnowflake() {
  try {
    function snowflake(snowflake) {
      console.log("snowflake plugin found, leaving WebRTC alone", snowflake);
      EnablePeerConnection();
    }
    var snowflakeInfo = browser.management.get(
      "{b11bea1f-a888-4332-8d8a-cec2be7d24b9}" // string
    );
    snowflakeInfo.then(snowflake);
  } catch {
    console.log("snowflake not found");
  }
}

checkSnowflake();

function checkHistory() {
  let getting = browser.storage.local.get("disable_history");
  getting.then(got => {
    let disable_history = got.disable_history;
    if (disable_history == undefined) {
      disable_history = false;
    }
    console.log("checking history", disable_history);
    if (document.getElementById("disable-history") !== null)
      document.getElementById("disable-history").checked = disable_history;
  });
}

checkHistory();

document.addEventListener("click", clickEvent => {
  if (clickEvent.target.id === "window-create-help-panel") {
    let createData = {
      type: "panel",
      incognito: true
    };
    let creating = browser.tabs.create(createData);
    creating.then(() => {
      console.log("The help panel has been created");
    });
  } else if (clickEvent.target.id === "window-create-news-panel") {
    let createData = {
      type: "panel",
      incognito: true
    };
    let creating = browser.tabs.create(createData);
    creating.then(() => {
      console.log("The news panel has been created");
    });
  } else if (clickEvent.target.id === "generate-fresh-tunnel") {
    function refreshIdentity() {
      console.log("Generating new identity");
      const Http = new XMLHttpRequest();
      const url = "http://" + controlHost + ":" + controlPort;
      Http.open("GET", url);
      Http.send();
      Http.onreadystatechange = event => {
        console.log(Http.responseText);
      };
    }
    refreshIdentity();
  } else if (clickEvent.target.id === "label-router-restart") {
    console.log("attempting to initiate graceful restart");
    RouterManager("RestartGraceful");
  } else if (clickEvent.target.id === "label-router-shutdown") {
    console.log("attempting to initiate graceful shutdown");
    RouterManager("ShutdownGraceful");
  } else if (clickEvent.target.id === "search-submit") {
    console.log("attempting to create search tab");
    goSearch();
  } else if (clickEvent.target.id === "browser-action") {
    console.log("showing a browser action");
    showBrowsing();
  } else if (clickEvent.target.id === "torrent-action") {
    console.log("showing a torrent action");
    showTorrents();
  } else if (clickEvent.target.id === "window-preface-title") {
    console.log("attempting to create homepage tab");
    goHome();
  } else if (clickEvent.target.id === "window-visit-index") {
    console.log("attempting to create index tab");
    goIndex();
  } else if (clickEvent.target.id === "window-visit-homepage") {
    console.log("attempting to create homepage tab");
    goHome();
  } else if (clickEvent.target.id === "window-visit-toopie") {
    console.log("attempting to create toopie tab");
    goToopie();
  } else if (clickEvent.target.id === "window-visit-i2ptunnel") {
    console.log("attempting to create i2ptunnel tab");
    goTunnel();
  } else if (clickEvent.target.id === "window-visit-susimail") {
    console.log("attempting to create susimail tab");
    goMail();
  } else if (clickEvent.target.id === "window-visit-snark") {
    console.log("attempting to create snark tab");
    goSnark();
  } else if (clickEvent.target.id === "clear-browser-data") {
    forgetBrowsingData();
  } else if (clickEvent.target.id === "check-i2p-control") {
    //echo("I2P Router Detected", "panel-section-i2pcontrol-check");
  } else if (clickEvent.target.id === "enable-web-rtc") {
    if (clickEvent.target.checked) {
      browser.runtime.sendMessage({ rtc: "enableWebRTC" });
    } else {
      browser.runtime.sendMessage({ rtc: "disableWebRTC" });
    }
    checkPeerConnection();
    return;
  } else if (clickEvent.target.id === "disable-history") {
    if (clickEvent.target.checked) {
      browser.runtime.sendMessage({ history: "disableHistory" });
    } else {
      browser.runtime.sendMessage({ history: "enableHistory" });
    }
    return;
  }

  clickEvent.preventDefault();
});

function proxyReadiness() {
  console.log(this.responseText);
}

var gettingInfo = browser.runtime.getPlatformInfo();
gettingInfo.then(got => {
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

function showTorrents() {
  var x = document.getElementById("browserpanel");
  x.style.display = "none";
  var y = document.getElementById("torrentpanel");
  y.style.display = "block";
}

function goHome() {
  function gotProxyInfo(info) {
    let port = info.value.http.split(":")[1];
    if (port == "7644") {
      let createRhizomeData = {
        url: "about:I2p"
      };
      console.log("visiting homepage");
      let creating = browser.tabs.create(createRhizomeData);
      creating.then(onTabCreated, onTabError);
    } else {
      let createData = {
        url: "home.html"
      };
      console.log("visiting homepage");
      let creating = browser.tabs.create(createData);
      creating.then(onTabCreated, onTabError);
    }
    console.log("(bookmarks) adding home page bookmark");
  }
  console.log("(bookmarks) checking if we're running in an I2P Browser");
  var gettingProxyInfo = browser.proxy.settings.get({});
  gettingProxyInfo.then(gotProxyInfo);
}

function goIndex() {
  function onTabError() {
    console.log("Help tab created");
  }
  let createData = {
    url: "index.html"
  };
  console.log("visiting help");
  let creating = browser.tabs.create(createData);
  creating.then(onTabCreated, onTabError);
}

function goToopie() {
  function onTabError() {
    console.log("Toopie tab created");
  }
  console.log("visiting toopie");
  let creating = browser.sidebarAction.open();
  creating.then(onTabCreated, onTabError);
}

function onTabCreated() {
  console.log("Tab Created");
}

function goSearch() {
  function onTabError() {
    console.log("Search tab created");
  }
  let createData = {
    url:
      "http://legwork.i2p/yacysearch.html?" +
      "query=" +
      document.getElementById("search-query").value
  };
  console.log("visiting legwork");
  let creating = browser.tabs.create(createData);
  creating.then(onTabCreated, onTabError);
}

function goTunnel() {
  function onTabError() {
    console.log("I2PTunnel tab created");
  }
  let createData = {
    url: "http://" + control_host + ":" + control_port + "/i2ptunnel"
  };
  console.log("visiting i2ptunnel");
  let creating = browser.tabs.create(createData);
  creating.then(onTabCreated, onTabError);
}

function goMail() {
  function onTabError() {
    console.log("Mail tab created");
  }
  let createData = {
    url: "http://" + control_host + ":" + control_port + "/susimail"
  };
  console.log("visiting mail");
  let creating = browser.tabs.create(createData);
  creating(onTabCreated, onTabError);
}

function goSnark() {
  function onTabError() {
    console.log("Snark tab created");
  }
  let createData = {
    url: "http://" + control_host + ":" + control_port + "/i2psnark"
  };
  console.log("visiting snark");
  let creating = browser.tabs.create(createData);
  creating.then(onTabCreated, onTabError);
}

function onVisited(historyItem) {
  function onCleaned(results) {
    if (results.length) {
      console.log(" was not removed");
    } else {
      console.log(" was removed");
    }
  }

  function onRemoved() {
    var searching = browser.history.search({
      text: historyItem.url,
      startTime: 0
    });
    searching.then(onCleaned);
  }
  if (!history) {
    if (i2pHost(historyItem.url)) {
      var deletingUrl = browser.history.deleteUrl(historyItem.url);
    }
    deletingUrl.then(onRemoved);
  }
}

if (UpdateContents !== undefined) UpdateContents();

const minutes = 0.2;
const interval = minutes * 60 * 1000;

setInterval(function() {
  if (UpdateContents !== undefined) UpdateContents();
}, interval);
