function identifyProtocolHandler(url) {
  //console.log("looking for handler-able requests")
  if (routerHost(url)) {
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

var handlerSetup = async function(requestDetails) {
  //console.log("checking protocol handler listener")
  var rwurl = identifyProtocolHandler(requestDetails.url);
  if (rwurl != false) {
    console.log("handler rewrite URL requested", rwurl);
    requestDetails.redirectUrl = rwurl;
    requestDetails.url = rwurl;
  }
  return requestDetails;
};

browser.webRequest.onBeforeRequest.addListener(
  handlerSetup,
  { urls: ["<all_urls>"] },
  ["blocking"]
);
