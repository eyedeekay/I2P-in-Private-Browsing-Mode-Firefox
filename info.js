function checkPeerConnection() {
  var getting = browser.privacy.network.peerConnectionEnabled.get({});
  getting.then(got => {
    webrtc = got.value;
    console.log("checking webrtc", webrtc);
    document.getElementById("enable-web-rtc").checked = webrtc;
  });
}

checkPeerConnection();

function checkHistory() {
  var getting = browser.storage.local.get("disable_history");
  getting.then(got => {
    disable_history = got.disable_history;
    if (disable_history == undefined) {
      disable_history = false;
    }
    console.log("checking history", disable_history);
    document.getElementById("disable-history").checked = disable_history;
  });
}

checkHistory();

document.addEventListener("click", e => {
  if (e.target.id === "window-create-help-panel") {
    let createData = {
      type: "panel",
      incognito: true
    };
    let creating = browser.tabs.create(createData);
    creating.then(() => {
      console.log("The help panel has been created");
    });
  } else if (e.target.id === "window-create-news-panel") {
    let createData = {
      type: "panel",
      incognito: true
    };
    let creating = browser.tabs.create(createData);
    creating.then(() => {
      console.log("The news panel has been created");
    });
  } else if (e.target.id === "generate-fresh-tunnel") {
    function RefreshIdentity() {
      console.log("Generating new identity");
      const Http = new XMLHttpRequest();
      const url = "http://" + controlHost + ":" + controlPort;
      Http.open("GET", url);
      Http.send();
      Http.onreadystatechange = e => {
        console.log(Http.responseText);
      };
    }
    RefreshIdentity();
  } else if (e.target.id === "window-preface-title") {
  } else if (e.target.id === "window-visit-homepage") {
    console.log("attempting to create homepage tab");
    goHome();
  } else if (e.target.id === "window-visit-i2ptunnel") {
    console.log("attempting to create i2ptunnel tab");
    goTunnel();
  } else if (e.target.id === "window-visit-susimail") {
    console.log("attempting to create susimail tab");
    goMail();
  } else if (e.target.id === "window-visit-snark") {
    console.log("attempting to create snark tab");
    goSnark();
  } else if (e.target.id === "clear-browser-data") {
    forgetBrowsingData();
  } else if (e.target.id === "check-i2p-control") {
    echo("I2P Router Detected", "panel-section-i2pcontrol-check");
  } else if (e.target.id === "enable-web-rtc") {
    if (e.target.checked) {
      browser.runtime.sendMessage({ rtc: "enableWebRTC" });
    } else {
      browser.runtime.sendMessage({ rtc: "disableWebRTC" });
    }
    //checkPeerConnection()
    return;
  } else if (e.target.id === "disable-history") {
    if (e.target.checked) {
      browser.runtime.sendMessage({ history: "disableHistory" });
    } else {
      browser.runtime.sendMessage({ history: "enableHistory" });
    }
    //checkHistory()
    return;
  }

  e.preventDefault();
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

function goHome() {
  function gotProxyInfo(info) {
    let host = info.value.http.split(":")[0];
    let port = info.value.http.split(":")[1];
    if (port == "7644") {
      let createData = {
        url: "about:I2p"
      };
      console.log("visiting homepage");
      let creating = browser.tabs.create(createData);
    } else {
      let createData = {
        url: "home.html"
      };
      console.log("visiting homepage");
      let creating = browser.tabs.create(createData);
    }
    console.log("(bookmarks) adding home page bookmark");
  }
  console.log("(bookmarks) checking if we're running in an I2P Browser");
  var gettingInfo = browser.proxy.settings.get({});
  gettingInfo.then(gotProxyInfo);
}

function goTunnel() {
  let createData = {
    url: "http://" + control_host + ":" + control_port + "/i2ptunnel"
  };
  console.log("visiting homepage");
  let creating = browser.tabs.create(createData);
}

function goMail() {
  let createData = {
    url: "http://" + control_host + ":" + control_port + "/susimail"
  };
  console.log("visiting homepage");
  let creating = browser.tabs.create(createData);
}

function goSnark() {
  let createData = {
    url: "http://" + control_host + ":" + control_port + "/i2psnark"
  };
  console.log("visiting homepage");
  let creating = browser.tabs.create(createData);
}

function onVisited(historyItem) {
  function onCleaned(results) {
    if (!results.length) {
      console.log(" was removed");
    } else {
      console.log(" was not removed");
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
