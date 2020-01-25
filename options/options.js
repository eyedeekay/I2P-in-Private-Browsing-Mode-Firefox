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

function getRPCHost() {
  rpc_host = document.getElementById("rpchost").value;
  console.log("(options)Got i2pcontrol rpc host:", rpc_host);
  if (rpc_host == undefined) {
    return "127.0.0.1";
  }
  return rpc_host;
}

function getRPCPort() {
  rpc_port = document.getElementById("rpcport").value;
  console.log("(options)Got i2pcontrol rpc port:", rpc_port);
  if (rpc_port == undefined) {
    return "7657";
  }
  return rpc_port;
}

function getRPCPath() {
  rpc_path = document.getElementById("rpcpath").value;
  console.log("(options)Got i2pcontrol rpc path:", rpc_path);
  if (rpc_path == undefined) {
    return "jsonrpc";
  }
  return rpc_path;
}

function getRPCPass() {
  rpc_pass = document.getElementById("rpcpass").value;
  console.log("(options)Got i2pcontrol rpc password:");
  if (rpc_pass == undefined) {
    return "itoopie";
  }
  return rpc_pass;
}

function getBTRPCHost() {
  bt_rpc_host = document.getElementById("btrpchost").value;
  console.log("(options)Got torrent rpc host:", bt_rpc_host);
  if (bt_rpc_host == undefined) {
    return "127.0.0.1";
  }
  return bt_rpc_host;
}

function getBTRPCPort() {
  bt_rpc_port = document.getElementById("btrpcport").value;
  console.log("(options)Got torrent rpc port:", bt_rpc_port);
  if (bt_rpc_port == undefined) {
    return "7657";
  }
  return bt_rpc_port;
}

function getBTRPCPath() {
  bt_rpc_path = document.getElementById("btrpcpath").value;
  console.log("(options)Got torrent rpc path:", bt_rpc_path);
  if (bt_rpc_path == undefined) {
    return "transmission/rpc";
  }
  return bt_rpc_path;
}

function getBTRPCPass() {
  bt_rpc_pass = document.getElementById("btrpcpass").value;
  console.log("(options)Got torrent rpc password:");
  if (bt_rpc_pass == undefined) {
    return "itoopie";
  }
  return bt_rpc_pass;
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
    } else defaultSettings["proxy_host"] = storedSettings["proxy_host"];

    if (!storedSettings["proxy_port"]) {
      if (port == undefined) defaultSettings["proxy_port"] = 4444;
      else if (port == 7644) defaultSettings["proxy_port"] = port;
      else defaultSettings["proxy_port"] = 4444;
    } else defaultSettings["proxy_port"] = storedSettings.proxy_port;

    if (!storedSettings["control_host"]) {
      if (host == "") defaultSettings["control_host"] = "127.0.0.1";
      else defaultSettings["control_host"] = host;
    } else defaultSettings["control_host"] = storedSettings.control_host;

    if (!storedSettings["control_port"]) {
      defaultSettings["control_port"] = 7657;
    } else defaultSettings["control_port"] = storedSettings.control_port;

    if (!storedSettings["rpc_host"]) {
      if (host == "") defaultSettings["rpc_host"] = "127.0.0.1";
      else defaultSettings["rpc_host"] = host;
    } else defaultSettings["rpc_host"] = storedSettings.rpc_host;

    if (!storedSettings["rpc_port"]) {
      defaultSettings["rpc_port"] = 7657;
    } else defaultSettings["rpc_port"] = storedSettings.rpc_port;

    if (!storedSettings["rpc_path"]) {
      defaultSettings["rpc_path"] = "jsonrpc";
    } else defaultSettings["rpc_path"] = storedSettings.rpc_path;

    if (!storedSettings["rpc_pass"]) {
      defaultSettings["rpc_pass"] = "itoopie";
    } else defaultSettings["rpc_pass"] = storedSettings.rpc_pass;

    if (!storedSettings["bt_rpc_host"]) {
      if (host == "") defaultSettings["bt_rpc_host"] = "127.0.0.1";
      else defaultSettings["bt_rpc_host"] = host;
    } else defaultSettings["bt_rpc_host"] = storedSettings.bt_rpc_host;

    if (!storedSettings["bt_rpc_port"]) {
      defaultSettings["bt_rpc_port"] = 7657;
    } else defaultSettings["bt_rpc_port"] = storedSettings.bt_rpc_port;

    if (!storedSettings["bt_rpc_path"]) {
      defaultSettings["bt_rpc_path"] = "transmission/rpc";
    } else defaultSettings["bt_rpc_path"] = storedSettings.bt_rpc_path;

    if (!storedSettings["bt_rpc_pass"]) {
      defaultSettings["bt_rpc_pass"] = "transmission";
    } else defaultSettings["bt_rpc_pass"] = storedSettings.bt_rpc_pass;

    console.log("(options)(browserinfo) NATIVE PROXYSETTINGS", info.value);
    defaultSettings["base_url"] =
      "http://" +
      defaultSettings["bt_rpc_host"] +
      ":" +
      defaultSettings["bt_rpc_port"] +
      "/" +
      defaultSettings["bt_rpc_path"];
    console.log(
      "(options)",
      defaultSettings["proxy_scheme"],
      defaultSettings["proxy_host"],
      defaultSettings["proxy_port"],
      defaultSettings["control_host"],
      defaultSettings["control_port"],
      defaultSettings["base_url"]
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
  } else defaultSettings["proxy_host"] = storedSettings["proxy_host"];

  if (!storedSettings["proxy_port"]) {
    if (port == undefined) defaultSettings["proxy_port"] = 4444;
    else if (port == 7644) defaultSettings["proxy_port"] = port;
    else defaultSettings["proxy_port"] = 4444;
  } else defaultSettings["proxy_port"] = storedSettings.proxy_port;

  if (!storedSettings["control_host"]) {
    if (host == "") defaultSettings["control_host"] = "127.0.0.1";
    else defaultSettings["control_host"] = host;
  } else defaultSettings["control_host"] = storedSettings.control_host;

  if (!storedSettings["control_port"]) {
    defaultSettings["control_port"] = 7657;
  } else defaultSettings["control_port"] = storedSettings.control_port;

  if (!storedSettings["rpc_host"]) {
    if (host == "") defaultSettings["rpc_host"] = "127.0.0.1";
    else defaultSettings["rpc_host"] = host;
  } else defaultSettings["rpc_host"] = storedSettings.rpc_host;

  if (!storedSettings["rpc_port"]) {
    defaultSettings["rpc_port"] = 7657;
  } else defaultSettings["rpc_port"] = storedSettings.rpc_port;

  if (!storedSettings["rpc_path"]) {
    defaultSettings["rpc_path"] = "jsonrpc";
  } else defaultSettings["rpc_path"] = storedSettings.rpc_path;

  if (!storedSettings["rpc_pass"]) {
    defaultSettings["rpc_pass"] = "itoopie";
  } else defaultSettings["rpc_pass"] = storedSettings.rpc_pass;

  if (!storedSettings["bt_rpc_host"]) {
    if (host == "") defaultSettings["bt_rpc_host"] = "127.0.0.1";
    else defaultSettings["bt_rpc_host"] = host;
  } else defaultSettings["bt_rpc_host"] = storedSettings.bt_rpc_host;

  if (!storedSettings["bt_rpc_port"]) {
    defaultSettings["bt_rpc_port"] = 7657;
  } else defaultSettings["bt_rpc_port"] = storedSettings.bt_rpc_port;

  if (!storedSettings["bt_rpc_path"]) {
    defaultSettings["bt_rpc_path"] = "transmission/rpc";
  } else defaultSettings["bt_rpc_path"] = storedSettings.bt_rpc_path;

  if (!storedSettings["bt_rpc_pass"]) {
    defaultSettings["bt_rpc_pass"] = "transmission";
  } else defaultSettings["bt_rpc_pass"] = storedSettings.bt_rpc_pass;

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
  let rpc_host = getRPCHost();
  let rpc_port = getRPCPort();
  let rpc_path = getRPCPath();
  let rpc_pass = getRPCPass();
  let bt_rpc_host = getBTRPCHost();
  let bt_rpc_port = getBTRPCPort();
  let bt_rpc_path = getBTRPCPath();
  let bt_rpc_pass = getBTRPCPass();
  let base_url =
    "http://" + bt_rpc_host + ":" + bt_rpc_port + "/" + bt_rpc_path;
  chrome.storage.local.set({
    proxy_scheme,
    proxy_host,
    proxy_port,
    control_host,
    control_port,
    rpc_host,
    rpc_port,
    rpc_path,
    rpc_pass,
    bt_rpc_host,
    bt_rpc_port,
    bt_rpc_path,
    bt_rpc_pass
  });
}

function updateUI(restoredSettings) {
  const selectList = document.querySelector("#proxy_scheme");
  if (selectList == undefined) selectList.value = restoredSettings.proxy_scheme;
  //console.log("(options)showing proxy scheme:", selectList.value);

  const hostitem = document.getElementById("host");
  if (hostitem == undefined) hostitem.value = restoredSettings.proxy_host;
  //console.log("(options)showing proxy host:", hostitem.value);

  const portitem = document.getElementById("port");
  if (portitem == undefined) portitem.value = restoredSettings.proxy_port;
  //console.log("(options)showing proxy port:", portitem.value);

  const controlhostitem = document.getElementById("controlhost");
  if (controlhostitem == undefined)
    controlhostitem.value = restoredSettings.control_host;
  //console.log("(options)showing control host:", controlhostitem.value);

  const controlportitem = document.getElementById("controlport");
  if (controlportitem == undefined)
    controlportitem.value = restoredSettings.control_port;
  //console.log("(options)showing control port:", controlportitem.value);

  const rpchostitem = document.getElementById("rpchost");
  if (rpchostitem == undefined) rpchostitem.value = restoredSettings.rpc_host;
  //console.log("(options)showing rpc host:", rpchostitem.value);

  const rpcportitem = document.getElementById("rpcport");
  if (rpcportitem == undefined) rpcportitem.value = restoredSettings.rpc_port;
  //console.log("(options)showing rpc port:", rpcportitem.value);

  const rpcpathitem = document.getElementById("rpcpath");
  if (rpcpathitem == undefined) rpcpathitem.value = restoredSettings.rpc_path;
  //console.log("(options)showing rpc path:", rpcpathitem.value);

  const rpcpassitem = document.getElementById("rpcpass");
  if (rpcpassitem == undefined) rpcpassitem.value = restoredSettings.rpc_pass;
  //console.log("(options)showing rpc pass:");

  const btrpchostitem = document.getElementById("btrpchost");
  if (btrpchostitem == undefined)
    btrpchostitem.value = restoredSettings.rpc_host;
  //console.log("(options)showing bt rpc host:", btrpchostitem.value);

  const btrpcportitem = document.getElementById("btrpcport");
  if (btrpcportitem == undefined)
    btrpcportitem.value = restoredSettings.rpc_port;
  //console.log("(options)showing rbt pc port:", rpcportitem.value);

  const btrpcpathitem = document.getElementById("btrpcpath");
  if (btrpcpathitem == undefined)
    btrpcpathitem.value = restoredSettings.rpc_path;
  //console.log("(options)showing bt rpc path:", btrpcpathitem.value);

  const btrpcpassitem = document.getElementById("btrpcpass");
  if (btrpcpassitem == undefined)
    btrpcpassitem.value = restoredSettings.rpc_pass;
  //console.log("(options)showing bt rpc pass:");

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
