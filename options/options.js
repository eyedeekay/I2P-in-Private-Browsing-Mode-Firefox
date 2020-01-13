function SetHostText() {
  var hostid = document.getElementById("hostText");
  hostid.textContent = chrome.i18n.getMessage("hostText");
}

function SetPortText() {
  var portid = document.getElementById("portText");
  portid.textContent = chrome.i18n.getMessage("portText");
}

function SetPortHelpText() {
  var portid = document.getElementById("proxyHelpText");
  portid.textContent = chrome.i18n.getMessage("proxyHelpText");
}

function SetControlHostText() {
  var controlhostid = document.getElementById("controlHostText");
  controlhostid.textContent = chrome.i18n.getMessage("controlHostText");
}

function SetControlPortText() {
  var controlportid = document.getElementById("controlPortText");
  controlportid.textContent = chrome.i18n.getMessage("controlPortText");
}

function SetControlHelpText() {
  var portid = document.getElementById("controlHelpText");
  portid.textContent = chrome.i18n.getMessage("controlHelpText");
}

function getScheme() {
  const proxy_scheme = document.querySelector("#proxy_scheme");
  console.log("(options)Got i2p proxy scheme:", proxy_scheme.value);
  if (proxy_scheme.value == "HTTP") {
    return "http";
  }
  if (proxy_scheme.value == "SOCKS") {
    return "socks";
  }
  if (proxy_scheme.value == "http") return "http";
  if (proxy_scheme.value == "socks") return "socks";
  else return "http";
}

function getHost() {
  proxy_host = document.getElementById("host").value;
  console.log("(options)Got i2p proxy host:", proxy_host);
  if (proxy_host == undefined) {
    return "127.0.0.1";
  }
  return proxy_host;
}

function getPort() {
  proxy_port = document.getElementById("port").value;
  console.log("(options)Got i2p proxy port:", proxy_port);
  if (proxy_port == undefined) {
    return "4444";
  }
  return proxy_port;
}

function getControlHost() {
  control_host = document.getElementById("controlhost").value;
  console.log("(options)Got i2p control host:", control_host);
  if (control_host == undefined) {
    return "127.0.0.1";
  }
  return control_host;
}

function getControlPort() {
  control_port = document.getElementById("controlport").value;
  console.log("(options)Got i2p control port:", control_port);
  if (control_port == undefined) {
    return "4444";
  }
  return control_port;
}

function checkStoredSettings(storedSettings) {
  function gotProxyInfo(info) {
    let defaultSettings = {};
    let host = info.value.http.split(":")[0];
    let port = info.value.http.split(":")[1];
    if (port != 7644) {
      port = undefined;
    }
    console.log("(options)proxy", "'" + host + "'", ":", port);
    if (!storedSettings["proxy_scheme"])
      defaultSettings["proxy_scheme"] = "http";
    else defaultSettings["proxy_scheme"] = storedSettings["proxy_scheme"];
    if (!storedSettings["proxy_host"]) {
      if (host == "") defaultSettings["proxy_host"] = "127.0.0.1";
      else defaultSettings["proxy_host"] = host;
    } else {
      defaultSettings["proxy_host"] = storedSettings["proxy_host"];
    }
    if (!storedSettings["proxy_port"]) {
      if (port == undefined) defaultSettings["proxy_port"] = 4444;
      else if (port == 7644) defaultSettings["proxy_port"] = port;
      else defaultSettings["proxy_port"] = 4444;
    } else {
      defaultSettings["proxy_port"] = storedSettings.proxy_port;
    }
    if (!storedSettings["control_host"]) {
      if (host == "") defaultSettings["control_host"] = "127.0.0.1";
      else defaultSettings["control_host"] = host;
    } else {
      defaultSettings["control_host"] = storedSettings.control_host;
    }
    if (!storedSettings["control_port"]) {
      defaultSettings["control_port"] = 7657;
    } else {
      defaultSettings["control_port"] = storedSettings.control_port;
    }
    console.log("(options)(browserinfo) NATIVE PROXYSETTINGS", info.value);
    console.log(
      "(options)",
      defaultSettings["proxy_sheme"],
      defaultSettings["proxy_host"],
      defaultSettings["proxy_port"],
      defaultSettings["control_host"],
      defaultSettings["control_port"]
    );
    chrome.storage.local.set(defaultSettings);
    return defaultSettings;
  }
  var gettingInfo = browser.proxy.settings.get({});
  return gettingInfo.then(gotProxyInfo);
}

function checkAndroidStoredSettings(storedSettings) {
  let defaultSettings = {};
  let host = "";
  let port = "";
  if (!storedSettings["proxy_scheme"]) defaultSettings["proxy_scheme"] = "http";
  else defaultSettings["proxy_scheme"] = storedSettings["proxy_scheme"];
  if (!storedSettings["proxy_host"]) {
    if (host == "") defaultSettings["proxy_host"] = "127.0.0.1";
    else defaultSettings["proxy_host"] = host;
  } else {
    defaultSettings["proxy_host"] = storedSettings["proxy_host"];
  }
  if (!storedSettings["proxy_port"]) {
    if (port == undefined) defaultSettings["proxy_port"] = 4444;
    else if (port == 7644) defaultSettings["proxy_port"] = port;
    else defaultSettings["proxy_port"] = 4444;
  } else {
    defaultSettings["proxy_port"] = storedSettings.proxy_port;
  }
  if (!storedSettings["control_host"]) {
    if (host == "") defaultSettings["control_host"] = "127.0.0.1";
    else defaultSettings["control_host"] = host;
  } else {
    defaultSettings["control_host"] = storedSettings.control_host;
  }
  if (!storedSettings["control_port"]) {
    defaultSettings["control_port"] = 7657;
  } else {
    defaultSettings["control_port"] = storedSettings.control_port;
  }
  console.log("(options)(browserinfo) NATIVE PROXYSETTINGS", info.value);
  console.log(
    "(options)",
    defaultSettings["proxy_scheme"],
    defaultSettings["proxy_host"],
    defaultSettings["proxy_port"],
    defaultSettings["control_host"],
    defaultSettings["control_port"]
  );
  chrome.storage.local.set(defaultSettings);
  return defaultSettings;
}

function onError(e) {
  console.error(e);
}

function storeSettings() {
  let proxy_scheme = getScheme();
  let proxy_host = getHost();
  let proxy_port = getPort();
  let control_host = getControlHost();
  let control_port = getControlPort();
  chrome.storage.local.set({
    proxy_scheme,
    proxy_host,
    proxy_port,
    control_host,
    control_port
  });
  storeSettings();
}

function updateUI(restoredSettings) {
  const selectList = document.querySelector("#proxy_scheme");
  selectList.value = restoredSettings.proxy_scheme;
  console.log("(options)showing proxy scheme:", selectList.value);

  const hostitem = document.getElementById("host");
  hostitem.value = restoredSettings.proxy_host;
  console.log("(options)showing proxy host:", hostitem.value);

  const portitem = document.getElementById("port");
  portitem.value = restoredSettings.proxy_port;
  console.log("(options)showing proxy port:", portitem.value);

  const controlhostitem = document.getElementById("controlhost");
  controlhostitem.value = restoredSettings.control_host;
  console.log("(options)showing control host:", controlhostitem.value);

  const controlportitem = document.getElementById("controlport");
  controlportitem.value = restoredSettings.control_port;
  console.log("(options)showing control port:", controlportitem.value);

  SetHostText();
  SetPortText();
  SetPortHelpText();
  SetControlHostText();
  SetControlPortText();
  SetControlHelpText();
}

function onError(e) {
  console.error(e);
}

var gettingInfo = browser.runtime.getPlatformInfo();
gettingInfo.then(got => {
  if (got.os != "android") {
    chrome.storage.local.get(function(got) {
      let settings = checkStoredSettings(got);
      settings.then(updateUI);
    });
  } else {
    chrome.storage.local.get(function(got) {
      checkAndroidStoredSettings(got);
      updateUI(got);
    });
  }
});

const saveButton = document.querySelector("#save-button");
saveButton.addEventListener("click", storeSettings);
