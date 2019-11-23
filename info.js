document.addEventListener("click", e => {
  function getCurrentWindow() {
    return chrome.windows.getCurrent();
  }

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
    getCurrentWindow().then(currentWindow => {
      let updateInfo = {
        titlePreface: "I2P Help | "
      };
      chrome.windows.update(currentWindow.id, updateInfo);
    });
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
    return;
  }

  e.preventDefault();
});

function proxyReadiness() {
  console.log(this.responseText);
}

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
    url: "http://127.0.0.1:7657/i2ptunnel"
  };
  console.log("visiting homepage");
  let creating = browser.tabs.create(createData);
}

function goMail() {
  let createData = {
    url: "http://127.0.0.1:7657/susimail"
  };
  console.log("visiting homepage");
  let creating = browser.tabs.create(createData);
}

function goSnark() {
  let createData = {
    url: "http://127.0.0.1:7657/i2psnark"
  };
  console.log("visiting homepage");
  let creating = browser.tabs.create(createData);
}
/*
//document.addEventListener("onpageshow", e => {
console.log("(Check) Checking Proxy Readiness");
const Http = new XMLHttpRequest();
Http.addEventListener("load", proxyReadiness);
const url = "http://proxy.i2p"; ///themes/console/images/favicon.ico";
Http.open("GET", url);
Http.send();
//});

function transferComplete(evt) {
  console.log(
    "The transfer is complete.",
    this.status,
    this.statusText,
    this.responseText
  );
}

function transferFailed(evt) {
  console.log(
    "An error occurred while transferring the file.",
    this.status,
    this.statusText,
    this.responseText
  );
}

function transferCanceled(evt) {
  console.log(
    "The transfer has been canceled by the user.",
    this.status,
    this.statusText,
    this.responseText
  );
}

Http.addEventListener("load", transferComplete);
Http.addEventListener("error", transferFailed);
Http.addEventListener("abort", transferCanceled);
*/
