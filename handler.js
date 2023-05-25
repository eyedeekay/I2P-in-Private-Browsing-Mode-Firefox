function trimHost(url) {
  let hostname = "";
  let prefix = "";
  if (url.indexOf("://") > -1) {
    prefix = url.substr(0, url.indexOf("://") + 3);
    hostname = url.split("/")[2];
  } else {
    hostname = url.split("/")[0];
  }
  let path = url.replace(prefix + hostname, "");
  console.log("(handler) path", prefix + hostname, path);
  return path;
}

var handlerSetup = function (requestDetails) {
  //console.log("checking protocol handler listener")
  let rwurl = identifyProtocolHandler(requestDetails.url);
  if (rwurl != false) {
    console.log("(handler) rewrite URL requested", rwurl);
    requestDetails.redirectUrl = rwurl;
    requestDetails.url = trimHost(rwurl);
    requestDetails.originUrl = trimHost(rwurl);
  }
  return requestDetails;
};
/*
browser.webRequest.onBeforeRequest.addListener(handlerSetup, {
  urls: ['<all_urls>'],
});
*/
