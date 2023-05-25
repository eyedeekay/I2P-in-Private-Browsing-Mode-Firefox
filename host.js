function proxyHost(requestDetails) {
  const originUrl = requestDetails.originUrl;
  const isWindowOrHomeUrl =
    originUrl !== browser.runtime.getURL("window.html") &&
    originUrl !== browser.runtime.getURL("home.html");

  if (isWindowOrHomeUrl) {
    return false;
  }

  const urlParts = requestDetails.url.split("/");
  const hostname = urlParts[2].indexOf("://") > -1 ? urlParts[2] : urlParts[0];

  if (
    hostname === "proxy.i2p" ||
    hostname === "c6lilt4cr5x7jifxridpkesf2zgfwqfchtp6laihr4pdqomq25iq.b32.i2p"
  ) {
    return true;
  }

  return false;
}

function isLocalHost(url) {
  //  function getLocalhostUrlType(url) {
  const urlPath = url.split("/")[2].split(":")[0];
  if (urlPath === "127.0.0.1" || urlPath === "localhost") {
    if (url.includes(":8084")) {
      return "blog";
    }
    if (url.includes(":7669")) {
      return "irc";
    }
    if (url.includes(":7695")) {
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

function isRouterHost(url) {
  let hostname = "";
  let path = "";

  if (url.indexOf("://") > -1) {
    hostname = url.split("/")[2];
    const protocol = url.substr(0, url.indexOf("://") + 3);
    path = url.replace(protocol + hostname + "/", "");
  } else if (identifyProtocolHandler(url)) {
    const newUrl = identifyProtocolHandler(url);
    return isRouterHost(newUrl);
  } else {
    hostname = url.split("/")[0];
    path = url.replace(hostname + "/", "");
  }

  const localHosts = ["localhost", "127.0.0.1"];
  const controlHost = control_host();
  const controlPort = control_port();
  const isLocalHost = localHosts.includes(hostname.split(":")[0]);

  if (hostname === `${controlHost}:${controlPort}` || isLocalHost) {
    return getPathApplication(path, url);
  }

  return false;
}


function identifyProtocolHandler(url) {
  //console.log("looking for handler-able requests")
  if (isRouterHost(url)) {
    if (url.includes(encodeURIComponent("ext+rc:"))) {
      return url.replace(encodeURIComponent("ext+rc:"), "");
    } else if (url.includes("ext+rc:")) {
      return url.replace("ext+rc:", "");
    }
  } else if (url.includes("ext+rc:")) {
    return url;
  }
  return false;
}
