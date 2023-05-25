/* eslint-disable max-len */
function SetBookButton() {
  /*   var bmid = document.getElementById("bookmark");
     bmid.textContent = chrome.i18n.getMessage("bookmarkButton"); */
}

function SetHostText() {
  var hostid = document.getElementById("hostText");
  if (hostid != undefined) {
    hostid.textContent = chrome.i18n.getMessage("hostText");
  }
}

function SetPortText() {
  var portid = document.getElementById("portText");
  if (portid != undefined) {
    portid.textContent = chrome.i18n.getMessage("portText");
  }
}

function SetPortHelpText() {
  var portid = document.getElementById("proxyHelpText");
  if (portid != undefined) {
    portid.textContent = chrome.i18n.getMessage("proxyHelpText");
  }
}

function SetControlHostText() {
  var controlhostid = document.getElementById("controlHostText");
  if (controlhostid != undefined) {
    controlhostid.textContent = chrome.i18n.getMessage("controlHostText");
  }
}

function SetControlPortText() {
  var controlportid = document.getElementById("controlPortText");
  if (controlportid != undefined) {
    controlportid.textContent = chrome.i18n.getMessage("controlPortText");
  }
}

function SetControlHelpText() {
  var portid = document.getElementById("controlHelpText");
  if (portid != undefined) {
    portid.textContent = chrome.i18n.getMessage("controlHelpText");
  }
}

function getBoolFromStorage(key) {
  let key_state = localStorage.getItem(key);
  console.info("(options) Got i2p settings key state", key, key_state);
  if (key_state == undefined) {
    return false;
  }
  if (key_state.value == "false") {
    return false;
  }
  if (key_state.value == "true") {
    return true;
  }
  return key_state.value;
}

function getStringFromStorage(key, valdef) {
  let key_state = localStorage.getItem(key);
  console.info("(options) Got i2p settings key state", key, key_state);
  if (key_state == undefined) {
    return valdef;
  }
  return key_state;
}

function getFromStorageBookmarksCreated() {
  let bookmarks_state = getBoolFromStorage("bookmarks_created");
  console.info("(options)Got i2p bookmarks state:", bookmarks_state);
  return bookmarks_state;
}

function getFromHTMLValueBookmarksCreated() {
  let bookmarks_state = document.getElementById("bookmarks");
  console.log("(options)Got i2p bookmarks state:", bookmarks_state);
  if (bookmarks_state == undefined) {
    return false;
  }
  if (bookmarks_state.value == "false") {
    return false;
  }
  if (bookmarks_state.value == "true") {
    return true;
  }
  return false;
}

function getFromStorageProxyScheme() {
  let proxy_scheme = getStringFromStorage("proxy_scheme", "http");
  console.info("(options)Got i2p proxy scheme:", proxy_scheme);
  return proxy_scheme;
}

function getFromHTMLValueScheme() {
  const proxy_scheme = document.querySelector("#proxy_scheme");
  console.log("(options)Got i2p proxy scheme:", proxy_scheme.value);
  if (proxy_scheme.value == "HTTP") {
    return "http";
  }
  if (proxy_scheme.value == "SOCKS") {
    return "socks";
  }
  if (proxy_scheme.value == "http") {
    return "http";
  }
  if (proxy_scheme.value == "socks") {
    return "socks";
  } else {
    return "http";
  }
}

function getFromStorageHost() {
  let proxy_host = getStringFromStorage("proxy_host", "127.0.0.1");
  console.info("(options)Got i2p proxy host:", proxy_host);
  return proxy_host;
}

function getFromHTMLValueHost() {
  let proxy_host = document.getElementById("host").value;
  console.log("(options)Got i2p proxy host:", proxy_host);
  if (proxy_host == undefined) {
    return "127.0.0.1";
  }
  return proxy_host;
}

function getFromStoragePort() {
  let proxy_port = getStringFromStorage("proxy_port", 4444);
  console.info("(options)Got i2p proxy port:", proxy_port);
  return proxy_port;
}

function getFromHTMLValuePort() {
  let proxy_port = document.getElementById("port").value;
  console.log("(options)Got i2p proxy port:", proxy_port);
  if (proxy_port == undefined) {
    return "4444";
  }
  return proxy_port;
}

function getFromStorageControlHost() {
  let control_host = getStringFromStorage("control_host", "127.0.0.1");
  console.info("(options)Got i2p control host:", control_host);
  return control_host;
}

function getFromHTMLValueControlHost() {
  let control_host = document.getElementById("controlhost").value;
  console.log("(options)Got i2p control host:", control_host);
  if (control_host == undefined) {
    return "127.0.0.1";
  }
  return control_host;
}

function getFromStorageControlPort() {
  let control_port = getStringFromStorage("control_port", 7657);
  console.info("(options)Got i2p control port:", control_port);
  return control_port;
}

function getFromHTMLValueControlPort() {
  let control_port = document.getElementById("controlport").value;
  console.log("(options)Got i2p control port:", control_port);
  if (control_port == undefined) {
    return "4444";
  }
  return control_port;
}

function getFromStorageRPCHost() {
  let rpc_host = getStringFromStorage("rpc_host", "127.0.0.1");
  console.info("(options)Got i2pcontrol rpc host:", rpc_host);
  return rpc_host;
}

function getFromHTMLValueRPCHost() {
  let rpc_host = document.getElementById("rpchost").value;
  console.log("(options)Got i2pcontrol rpc host:", rpc_host);
  if (rpc_host == undefined) {
    return "127.0.0.1";
  }
  return rpc_host;
}

function getFromStorageRPCPort() {
  let rpc_port = getStringFromStorage("rpc_port", "7657");
  console.info("(options)Got i2pcontrol rpc port:", rpc_port);
  return rpc_port;
}

function getFromHTMLValueRPCPort() {
  let rpc_port = document.getElementById("rpcport").value;
  console.log("(options)Got i2pcontrol rpc port:", rpc_port);
  if (rpc_port == undefined) {
    return "7657";
  }
  return rpc_port;
}

function getFromStorageRPCPath() {
  let rpc_path = getStringFromStorage("rpc_path", "jsonrpc");
  console.info("(options)Got i2pcontrol rpc path:", rpc_path);
  return rpc_path;
}

function getFromHTMLValueRPCPath() {
  let rpc_path = document.getElementById("rpcpath").value;
  console.log("(options)Got i2pcontrol rpc path:", rpc_path);
  if (rpc_path == undefined) {
    return "jsonrpc";
  }
  return rpc_path;
}

function getFromStorageRPCPass() {
  let rpc_pass = getStringFromStorage("rpc_pass", "itoopie");
  console.info("(options)Got i2pcontrol rpc password:", rpc_pass);
  return rpc_pass;
}

function getFromHTMLValueRPCPass() {
  let rpc_pass = document.getElementById("rpcpass").value;
  console.log("(options)Got i2pcontrol rpc password:");
  if (rpc_pass == undefined) {
    return "itoopie";
  }
  return rpc_pass;
}

function getFromStorageBTRPCHost() {
  let bt_rpc_host = getStringFromStorage("bt_rpc_host", "127.0.0.1");
  console.info("(options)Got torrent rpc host:", bt_rpc_host);
  return bt_rpc_host;
}

function getFromHTMLValueBTRPCHost() {
  let bt_rpc_host = document.getElementById("btrpchost").value;
  console.log("(options)Got torrent rpc host:", bt_rpc_host);
  if (bt_rpc_host == undefined) {
    return "127.0.0.1";
  }
  return bt_rpc_host;
}

function getFromStorageBTRPCPort() {
  let bt_rpc_port = getStringFromStorage("bt_rpc_port", "7657");
  console.info("(options)Got torrent rpc port:", bt_rpc_port);
  return bt_rpc_port;
}

function getFromHTMLValueBTRPCPort() {
  let bt_rpc_port = document.getElementById("btrpcport").value;
  console.log("(options)Got torrent rpc port:", bt_rpc_port);
  if (bt_rpc_port == undefined) {
    return "7657";
  }
  return bt_rpc_port;
}

function getFromStorageBTRPCPath() {
  let bt_rpc_path = getStringFromStorage("bt_rpc_path", "transmission/rpc");
  console.info("(options)Got torrent rpc path:", bt_rpc_path);
  return bt_rpc_path;
}

function getFromHTMLValueBTRPCPath() {
  let bt_rpc_path = document.getElementById("btrpcpath").value;
  console.log("(options)Got torrent rpc path:", bt_rpc_path);
  if (bt_rpc_path == undefined) {
    return "transmission/rpc";
  }
  return bt_rpc_path;
}

function getFromStorageBTRPCPass() {
  let bt_rpc_pass = getStringFromStorage("bt_rpc_pass", "itoopie");
  console.info("(options)Got torrent rpc password:", bt_rpc_pass);
  return bt_rpc_pass;
}

function getFromHTMLValueBTRPCPass() {
  let bt_rpc_pass = document.getElementById("btrpcpass").value;
  console.log("(options)Got torrent rpc password:");
  if (bt_rpc_pass == undefined) {
    return "itoopie";
  }
  return bt_rpc_pass;
}

function checkStoredSettings(storedSettings) {
  function gotProxyInfo(info) {
    const settings = {};
    const { http } = info.value;
    const host = http.split(":")[0];
    let port = http.split(":")[1];
    if (port != 7644) {
      port = undefined;
    }

    settings.bookmarks_state = storedSettings.bookmarks_state || false;
    settings.proxy_scheme = storedSettings.proxy_scheme || "http";
    settings.proxy_host =
      storedSettings.proxy_host || (host === "" ? "127.0.0.1" : host);
    settings.proxy_port =
      storedSettings.proxy_port ||
      (port === undefined ? 4444 : port === 7644 ? port : 4444);
    settings.control_host =
      storedSettings.control_host || (host === "" ? "127.0.0.1" : host);
    settings.control_port = storedSettings.control_port || 7657;
    settings.rpc_host =
      storedSettings.rpc_host || (host === "" ? "127.0.0.1" : host);
    settings.rpc_port = storedSettings.rpc_port || 7657;
    settings.rpc_path = storedSettings.rpc_path || "jsonrpc";
    settings.rpc_pass = storedSettings.rpc_pass || "itoopie";
    settings.bt_rpc_host =
      storedSettings.bt_rpc_host || (host === "" ? "127.0.0.1" : host);
    settings.bt_rpc_port = storedSettings.bt_rpc_port || 7657;
    settings.bt_rpc_path = storedSettings.bt_rpc_path || "transmission/";
    settings.bt_rpc_pass = storedSettings.bt_rpc_pass || "transmission";

    settings.base_url = `http://${settings.bt_rpc_host}:${settings.bt_rpc_port}/${settings.bt_rpc_path}`;

    browser.storage.local.set(settings);
    return settings;
  }
  const gettingInfo = browser.proxy.settings.get({});
  return gettingInfo.then(gotProxyInfo).catch((error) => {
    console.error(error);
    throw new Error("Error in checkStoredSettings");
  });
}

function checkAndroidStoredSettings(settings) {
  const defaults = {
    bookmarksState: false,
    proxyScheme: "http",
    proxyHost: "127.0.0.1",
    proxyPort: 4444,
    controlHost: "127.0.0.1",
    controlPort: 7657,
    rpcHost: "127.0.0.1",
    rpcPort: 7657,
    rpcPath: "jsonrpc",
    rpcPass: "itoopie",
    btRpcHost: "127.0.0.1",
    btRpcPort: 7657,
    btRpcPath: "transmission/rpc",
    btRpcPass: "transmission",
  };

  const mergedSettings = { ...defaults, ...settings };
  const { proxyHost: host, proxyPort: port } = mergedSettings;

  mergedSettings.proxyHost = host || defaults.proxyHost;
  mergedSettings.proxyPort =
    port === undefined ? 4444 : port === 7644 ? port : 4444;

  console.log("Merged settings:", mergedSettings);

  chrome.storage.local.set(mergedSettings);
  return mergedSettings;
}

function storeSettings() {
  let storableSettings = {};
  storableSettings["bookmarks_state"] = getFromHTMLValueBookmarksCreated();
  storableSettings["proxy_scheme"] = getFromHTMLValueScheme();
  storableSettings["proxy_host"] = getFromHTMLValueHost();
  storableSettings["proxy_port"] = getFromHTMLValuePort();
  storableSettings["control_host"] = getFromHTMLValueControlHost();
  storableSettings["control_port"] = getFromHTMLValueControlPort();
  storableSettings["rpc_host"] = getFromHTMLValueRPCHost();
  storableSettings["rpc_port"] = getFromHTMLValueRPCPort();
  storableSettings["rpc_path"] = getFromHTMLValueRPCPath();
  storableSettings["rpc_pass"] = getFromHTMLValueRPCPass();
  storableSettings["bt_rpc_host"] = getFromHTMLValueBTRPCHost();
  storableSettings["bt_rpc_port"] = getFromHTMLValueBTRPCPort();
  storableSettings["bt_rpc_path"] = getFromHTMLValueBTRPCPath();
  storableSettings["bt_rpc_pass"] = getFromHTMLValueBTRPCPass();
  storableSettings["base_url"] =
    "http://" +
    storableSettings["rpc_host"] +
    ":" +
    storableSettings["bt_rpc_port"] +
    "/" +
    storableSettings["bt_rpc_path"];
  console.log("storing", storableSettings);
  chrome.storage.local.set(storableSettings);
}

function updateUI(restoredSettings) {
  const selectList = document.querySelector("#proxy_scheme");
  if (selectList != undefined) {
    selectList.value = restoredSettings.proxy_scheme;
  }
  //console.log("(options)showing proxy scheme:", selectList.value);

  console.log(restoredSettings);
  const bms = document.getElementById("bookmarksState");
  if (bms != undefined) {
    bms.checked = restoredSettings.bookmarks_state;
  }

  const hostitem = document.getElementById("host");
  if (hostitem != undefined) {
    hostitem.value = restoredSettings.proxy_host;
  }
  //console.log("(options)showing proxy host:", hostitem.value);

  const portitem = document.getElementById("port");
  if (portitem != undefined) {
    portitem.value = restoredSettings.proxy_port;
  }
  //console.log("(options)showing proxy port:", portitem.value);

  const controlhostitem = document.getElementById("controlhost");
  if (controlhostitem != undefined) {
    controlhostitem.value = restoredSettings.control_host;
  }
  //console.log("(options)showing control host:", controlhostitem.value);

  const controlportitem = document.getElementById("controlport");
  if (controlportitem != undefined) {
    controlportitem.value = restoredSettings.control_port;
  }
  //console.log("(options)showing control port:", controlportitem.value);

  const rpchostitem = document.getElementById("rpchost");
  if (rpchostitem != undefined) {
    rpchostitem.value = restoredSettings.rpc_host;
  }
  //console.log("(options)showing rpc host:", rpchostitem.value);

  const rpcportitem = document.getElementById("rpcport");
  if (rpcportitem != undefined) {
    rpcportitem.value = restoredSettings.rpc_port;
  }
  //console.log("(options)showing rpc port:", rpcportitem.value);

  const rpcpathitem = document.getElementById("rpcpath");
  if (rpcpathitem != undefined) {
    rpcpathitem.value = restoredSettings.rpc_path;
  }
  //console.log("(options)showing rpc path:", rpcpathitem.value);

  const rpcpassitem = document.getElementById("rpcpass");
  if (rpcpassitem != undefined) {
    rpcpassitem.value = restoredSettings.rpc_pass;
  }
  //console.log("(options)showing rpc pass:");

  const btrpchostitem = document.getElementById("btrpchost");
  if (btrpchostitem != undefined) {
    btrpchostitem.value = restoredSettings.bt_rpc_host;
  }
  //console.log("(options)showing bt rpc host:", btrpchostitem.value);

  const btrpcportitem = document.getElementById("btrpcport");
  if (btrpcportitem != undefined) {
    btrpcportitem.value = restoredSettings.bt_rpc_port;
  }
  //console.log("(options)showing rbt pc port:", rpcportitem.value);

  const btrpcpathitem = document.getElementById("btrpcpath");
  if (btrpcpathitem != undefined) {
    btrpcpathitem.value = restoredSettings.bt_rpc_path;
  }
  //console.log("(options)showing bt rpc path:", btrpcpathitem.value);

  const btrpcpassitem = document.getElementById("btrpcpass");
  if (btrpcpassitem != undefined) {
    btrpcpassitem.value = restoredSettings.bt_rpc_pass;
  }
  //console.log("(options)showing bt rpc pass:");

  SetBookButton();
  SetHostText();
  SetPortText();
  SetPortHelpText();
  SetControlHostText();
  SetControlPortText();
  SetControlHelpText();
}

function onError(err) {
  console.error(err);
}

var gettingInfo = browser.runtime.getPlatformInfo();
gettingInfo.then(function (gotPlatform) {
  if (gotPlatform.os == "android") {
    browser.storage.local.get(function (gotSettings) {
      checkAndroidStoredSettings(gotSettings);
      updateUI(gotSettings, onError);
    });
  } else {
    chrome.storage.local.get(function (gotSettings) {
      let settings = checkStoredSettings(gotSettings);
      settings.then(updateUI, onError);
    });
  }
});

const saveButton = document.querySelector("#save-button");
if (saveButton != undefined) {
  saveButton.addEventListener("click", storeSettings);
}
