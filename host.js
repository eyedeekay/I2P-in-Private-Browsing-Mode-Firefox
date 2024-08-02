function isProxyHost(requestDetails) {
  let requestUrl = new URL(requestDetails.url);
  let hostname = requestUrl.hostname;
  console.debug("(proxy) proxyinfo proxy.i2p check", hostname);
  if (
    hostname === "proxy.i2p"
  ) {
    console.log("(proxy) proxyinfo proxy.i2p positive", hostname);
    return true;
  }
  console.log("(proxy) proxyinfo proxy.i2p check negative", hostname);
  return false;
}

function isLocalHost(url) {
  console.debug("(host) checking local host", url);
  if (!url.startsWith("http")){
    url = "http://" + url
  }
  let requestUrl = new URL(url);
  let hostname = requestUrl.hostname;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return hostname+":"+requestUrl.port;
  }
  return false;
}

function tidyLocalHost(url) {
  let hostPort = isLocalHost(url)
  if (hostPort) {
    return hostPort.replace("127.0.0.1", "localhost")
  }
  return url.hostname+":"+url.port
}

function isTorHost(url) {
  let host = isLocalHost(url)
  if (host.includes(":7695")) {
    return "tor";
  }
  return false
}

function isBlogHost(url) {
  let host = isLocalHost(url)
  if (host.includes(":8084")) {
    return "blog";
  }
  return false
}

function isIRCHost(url) {
  let host = isLocalHost(url)
  if (host.includes(":7669")) {
    return "irc";
  }
  return false
}

function isExtensionHost(url) {
  const extensionPrefix = browser.runtime
    .getURL("")
    .replace("moz-extension://", "")
    .replace("/", "");
  let isHost = false;

  if (url.originUrl !== undefined) {
    const originUrl = url.originUrl
      .replace("moz-extension://", "")
      .replace("/", "");
    isHost = originUrl.startsWith(extensionPrefix);
  } else if (url.documentUrl !== undefined) {
    const documentUrl = url.documentUrl
      .replace("moz-extension://", "")
      .replace("/", "");
    isHost = documentUrl.startsWith(extensionPrefix);
  }
  console.debug(`(urlcheck) Is URL from extension host? ${isHost}`);
  return isHost;
}

function i2pHostName(url) {
  let hostname = false;
  const requestUrl = new URL(url);
  if (u.host.endsWith(".i2p")) {
    hostname = requestUrl.host;
  }
  return hostname;
}

function i2pHost(url) {
  if (isProxyHost(url)) {
    console.warn("(host) proxy.i2p", url.url);
    return false;
  }
  console.log("(host) i2p", url.url);
  let requestUrl = new URL(url.url);
  return requestUrl.hostname.endsWith(".i2p")
}

function notAnImage(url, path) {
  if (!url.includes(".png")) {
    return path;
  }
}

function getFirstPathElement(url) {
  let requestUrl = new URL(url);
  let path = requestUrl.pathname
  while (path.startsWith("/")) {
    path = path.substring(1)
  }
  return path.split("/")[0]
}

function getPathApplication(url) {
  const path = getFirstPathElement(url)
  if (path === "i2ptunnelmgr" || path === "i2ptunnel") {
    return "i2ptunnelmgr";
  }
  console.debug("(host) router path name",path)

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
    path.startsWith("config") ||
    path === ""
  ) {
    return "routerconsole";
  }
  console.warn("(host) unknown path", path);
  return true;
}

function isRouterHost(url) {
  let requestUrl = new URL(url);
  let hostname = requestUrl.hostname;
  let port = requestUrl.port;
  if (identifyProtocolHandler(url)) {
    const newUrl = identifyProtocolHandler(url);
    console.log("(host) testing router host protocol handler identified");
    return isRouterHost(newUrl);
  }
  const controlHost = control_host();
  const controlPort = control_port();
  console.log("(host) testing router hostname", tidyLocalHost(`${hostname}:${port}`) ,"against", tidyLocalHost(`${controlHost}:${controlPort}`));
  if (tidyLocalHost(`${hostname}:${port}`) === tidyLocalHost(`${controlHost}:${controlPort}`)) {
    return getPathApplication(url);
  }
  return false;
}

function identifyProtocolHandler(url) {
  //console.log("looking for handler-able requests")
    if (url.includes(encodeURIComponent("ext+rc:"))) {
      return url.replace(encodeURIComponent("ext+rc:"), "");
    } else if (url.includes("ext+rc:")) {
      return url.replace("ext+rc:", "");
    }
  return false;
}
