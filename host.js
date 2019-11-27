function proxyHost(url) {
  let hostname = "";
  if (url.indexOf("://") > -1) {
    hostname = url.split("/")[2];
  } else {
    hostname = url.split("/")[0];
  }
  if (hostname == "proxy.i2p") {
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
  if (hostname === "127.0.0.1") {
    return true;
  } else if (hostname === "localhost") {
    return true;
  }

  return false;
}

function extensionHost(url) {
  var res = url.startsWith(browser.runtime.getURL(""));
  console.log("Extension URL?", res, url, browser.runtime.getURL(""));
  return res;
}

function i2pHostName(url) {
  let hostname = "";
  if (url.indexOf("://") > -1) {
    hostname = url.split("/")[2];
  } else {
    hostname = url.split("/")[0];
  }
  return hostname;
}

function i2pHost(url) {
  let hostname = i2pHostName(url);
  return hostname.endsWith(".i2p");
}

function routerHost(url) {
  let hostname = "";
  let path = "";
  function pathcheck(str) {
    if (str != undefined) {
      let final = str.split("/")[0];
      if (final === "i2ptunnelmgr" || final === "i2ptunnel") {
        console.log("(urlcheck) application path", final);
        return "i2ptunnelmgr";
      } else if (final === "i2psnark" || final === "torrents") {
        console.log("(urlcheck) application path", final);
        return "i2psnark";
      } else if (final === "webmail" || final === "susimail") {
        console.log("(urlcheck) application path", final);
        return "webmail";
      } else if (
        final === "home" ||
        final === "console" ||
        final.startsWith("config")
      ) {
        console.log("(urlcheck) application path", final);
        return "routerconsole";
      }
    }
    return true;
  }
  if (url.indexOf("://") > -1) {
    hostname = url.split("/")[2];
    prefix = url.substr(0, url.indexOf("://") + 3);
    path = url.replace(prefix + hostname + "/", "");
  } else if (identifyProtocolHandler(url)) {
    url = identifyProtocolHandler(url);
    return routerHost(url);
  } else {
    hostname = url.split("/")[0];
    path = url.replace(hostname + "/", "");
  }
  if (hostname === control_host + ":" + control_port) {
    console.log("(hostcheck) router console found on configured ports");
    return pathcheck(path);
  } else if (hostname === "127.0.0.1:7657") {
    return pathcheck(path);
  } else if (hostname === "localhost:7657") {
    return pathcheck(path);
  }

  if (hostname === "127.0.0.1:7647") {
    return pathcheck(path);
  } else if (hostname === "localhost:7647") {
    return pathcheck(path);
  }

  if (hostname === "127.0.0.1:7070") {
    return pathcheck(path);
  } else if (hostname === "localhost:7070") {
    return pathcheck(path);
  }

  return false;
}
