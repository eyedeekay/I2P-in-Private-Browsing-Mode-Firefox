function proxyHost(requestDetails) {
  if (requestDetails.originUrl != browser.runtime.getURL("window.html")) {
  } else if (requestDetails.originUrl != browser.runtime.getURL("home.html")) {
  } else {
    return false;
  }

  let hostname = "";
  if (requestDetails.url.indexOf("://") > -1) {
    hostname = requestDetails.url.split("/")[2];
  } else {
    hostname = requestDetails.url.split("/")[0];
  }
  console.warn("(host) hostname", hostname);
  if (hostname == "proxy.i2p") {
    console.warn("(host) is proxy.i2p", hostname);
    return true;
  }

  console.warn("(host) requestDetails", requestDetails.url);
  if (
    hostname == "c6lilt4cr5x7jifxridpkesf2zgfwqfchtp6laihr4pdqomq25iq.b32.i2p"
  ) {
    return true;
  }
  return false;
}

function localHost(url) {
  let hostname = "";
  if (url.indexOf("://") > -1) {
    hostname = url.split("/")[2];
  } else {
    hostname = url.split("/")[0];
  }
  hostname = hostname.split(":")[0];
  console.log("(urlcheck) hostname localhost", hostname);
  console.log("(urlcheck) url localhost", url);
  if (hostname === "127.0.0.1") {
    if (url.indexOf(":8084") != -1) {
      return "blog";
    }
    if (url.indexOf(":7669") != -1) {
      return "irc";
    }
    if (url.indexOf(":7695") != -1) {
      return "tor";
    }
  } else if (hostname === "localhost") {
    if (url.indexOf(":8084") != -1) {
      return "blog";
    }
    if (url.indexOf(":7669") != -1) {
      return "irc";
    }
    if (url.indexOf(":7695") != -1) {
      return "tor";
    }
  }

  return false;
}

function extensionHost(url) {
  var prefix = browser.runtime
    .getURL("")
    .replace("moz-extension://", "")
    .replace("/", "");
  if (url.originUrl !== undefined) {
    var originUrl = url.originUrl
      .replace("moz-extension://", "")
      .replace("/", "");
    /*    console.log("(urlcheck) Extension application path", originUrl);
          console.log("(urlcheck) Extension application path", prefix); */
    var res = originUrl.startsWith(prefix);
    //    console.log("(urlcheck) Extension application path", res);
    if (res) {
      return res;
    }
  }
  if (url.documentUrl !== undefined) {
    /*    console.log("(urlcheck) Extension application path", originUrl);
          console.log("(urlcheck) Extension application path", prefix); */
    var res = originUrl.startsWith(prefix);
    //    console.log("(urlcheck) Extension application path", res);
    if (res) {
      return res;
    }
  }
  console.log("(urlcheck) Extension application path", url);
}

function i2pHostName(url) {
  let hostname = "";
  const u = new URL(url);
  if (u.host.endsWith(".i2p")) {
    hostname = u.host;
  } else if (url.includes("=") && url.includes(".i2p")) {
    const lsit = url.split("=");
    for (const item of lsit) {
      const items = item.split(" % "); //"\%")
      for (const p of items) {
        if (p.includes(".i2p")) {
          hostname = p.replace("3D", 1);
          break;
        }
      }
      if (hostname !== "") {
        break;
      }
    }
  } else if (url.indexOf("://") > -1) {
    hostname = url.split("/")[2];
  } else {
    hostname = url.split("/")[0];
  }
  return hostname;
}

function i2pHost(url) {
  if (proxyHost(url)) {
    console.warn("(host) proxy.i2p", url.url);
    return false;
  }
  let hostname = i2pHostName(url.url);
  let postname = hostname.split(":")[0];
  if (postname.endsWith("proxy.i2p")) {
    return false;
  }
  return postname.endsWith(".i2p");
}

function notAnImage(url, path) {
  if (!url.includes(".png")) {
    return path;
  }
}

function getPathApplication(str, url) {
  if (!str) return true;

  const path = str.split("/")[0];

  if (path === "i2ptunnelmgr" || path === "i2ptunnel") {
    return "i2ptunnelmgr";
  }

  if (
    path === "i2psnark" ||
    path === "torrents" ||
    path.startsWith("transmission") ||
    path.startsWith("tracker") ||
    url.includes(":7662")
  ) {
    return "i2psnark";
  }

  if (path === "webmail" || path === "susimail") {
    return "webmail";
  }

  if (path.startsWith("MuWire")) {
    return notAnImage("muwire");
  }

  if (path.startsWith("i2pbote")) {
    return notAnImage("i2pbote");
  }

  if (
    path === "home" ||
    path === "console" ||
    path === "dns" ||
    path === "susidns" ||
    path.startsWith("susidns") ||
    path === "sitemap" ||
    path.startsWith("config")
  ) {
    return "routerconsole";
  }

  return true;
}

function routerHost(url) {
  //  console.log("(urlcheck) HOST URL CHECK");
  let hostname = "";
  let path = "";

  if (url.indexOf("://") > -1) {
    hostname = url.split("/")[2];
    let prefix = url.substr(0, url.indexOf("://") + 3);
    path = url.replace(prefix + hostname + "/", "");
  } else if (identifyProtocolHandler(url)) {
    let newurl = identifyProtocolHandler(url);
    return routerHost(newurl);
  } else {
    hostname = url.split("/")[0];
    path = url.replace(hostname + "/", "");
  }
  if (hostname === control_host + ":" + control_port) {
    return getPathApplication(path, url);
  }
  if (hostname === "localhost:" + control_port) {
    return getPathApplication(path, url);
  }
  if (hostname === "127.0.0.1:" + control_port) {
    return getPathApplication(path, url);
  }
  if (hostname === "localhost" + ":" + 7070) {
    return getPathApplication(path, url);
  }
  if (hostname === "127.0.0.1" + ":" + 7070) {
    return getPathApplication(path, url);
  }
  if (hostname === "localhost" + ":" + 7667) {
    return getPathApplication(path, url);
  }
  if (hostname === "127.0.0.1" + ":" + 7667) {
    return getPathApplication(path, url);
  }
  return false;
}
