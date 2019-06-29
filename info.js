
var control_host = "127.0.0.1"

function getControlHost() {
  if (control_host == undefined) {
    return "127.0.0.1"
  }
  console.log("Got i2p control host:", control_host);
  return control_host;
}

var control_port = "7951"

function getControlPort() {
  if (control_port == undefined) {
    return "7951"
  }
  console.log("Got i2p control port:", control_port);
  return control_port;
}

function checkStoredSettings(storedSettings) {
  let defaultSettings = {};
  if (!storedSettings.control_host) {
    defaultSettings["control_host"] = "127.0.0.1"
  }
  if (!storedSettings.control_port) {
    defaultSettings["control_port"] = 7951
  }
  chrome.storage.local.set(defaultSettings);
}

function update(restoredSettings) {
  console.log("restoring control host:", control_host)
  control_port = restoredSettings.control_port
  console.log("restoring control port:", control_port)
}

chrome.storage.local.get(function(got) {
  checkStoredSettings(got)
  update(got)
});

document.addEventListener("click", (e) => {
  function getCurrentWindow() {
    return chrome.windows.getCurrent();
  }

  if (e.target.id === "window-create-help-panel") {
    let createData = {
      type: "panel",
      incognito: true,
    };
    let creating = chrome.windows.create(createData);
    creating.then(() => {
      console.log("The help panel has been created");
    });
  } else if (e.target.id === "window-create-news-panel") {
    let createData = {
      type: "panel",
      incognito: true,
    };
    let creating = chrome.windows.create(createData);
    creating.then(() => {
      console.log("The news panel has been created");
    });
  } else if (e.target.id === "generate-fresh-tunnel") {
    function RefreshIdentity() {
      console.log("Generating new identity")
      const Http = new XMLHttpRequest();
      const url = 'http://' + getControlHost() + ":" + getControlPort()
      Http.open("GET", url);
      Http.send();
      Http.onreadystatechange = (e) => {
        console.log(Http.responseText)
      }
    }
    RefreshIdentity();
  } else if (e.target.id === "window-preface-title") {
    getCurrentWindow().then((currentWindow) => {
      let updateInfo = {
        titlePreface: "I2P Help | "
      }
      chrome.windows.update(currentWindow.id, updateInfo);
    });
  } else if (e.target.id === "clear-browser-data") {
    forgetBrowsingData()
  }

  e.preventDefault();

});
