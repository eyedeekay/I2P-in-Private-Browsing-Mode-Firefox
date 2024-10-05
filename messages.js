function contentUpdateById(id, message) {
  let infoTitle = document.getElementById(id);
  let messageContent = chrome.i18n.getMessage(message);
  if (infoTitle === null) {
    console.log("content error", id, messageContent);
    return;
  }
  infoTitle.textContent = messageContent;
}
contentUpdateById("CertLabel", "CertLabel");
contentUpdateById("SignedLabel", "SignedLabel");
contentUpdateById("TorrentTypeLabel", "TorrentTypeLabel");
contentUpdateById("TypeLabel", "TypeLabel");
contentUpdateById("aboutconsole", "aboutconsole");
contentUpdateById("abouthome", "abouthome");
contentUpdateById("addresstype", "addresstype");
contentUpdateById("applicationExplain", "applicationExplain");
contentUpdateById("applicationHeader", "applicationHeader");
contentUpdateById("beta", "beta");
contentUpdateById("bookmarksButton", "bookmarksButton");
contentUpdateById("btRpcHostText", "btRpcHostText");
contentUpdateById("btRpcPathText", "btRpcPathText");
contentUpdateById("btRpcPortText", "btRpcPortText");
contentUpdateById("controlExplain", "controlExplain");
contentUpdateById("controlHeader", "controlHeader");
contentUpdateById("controlHelpText", "controlHelpText");
contentUpdateById("controlHostText", "controlHostText");
contentUpdateById("controlPortText", "controlPortText");
contentUpdateById("description", "description");
contentUpdateById("description2", "description2");
contentUpdateById("fliplinks", "fliplinks");
contentUpdateById("headline", "headline");
contentUpdateById("histDesc", "histDesc");
contentUpdateById("hostText", "hostText");
contentUpdateById("i2ppage", "i2ppage");
contentUpdateById("i2ptunnel", "i2ptunnel");
contentUpdateById("label-router-activepeers", "label-router-activepeers");
contentUpdateById("label-router-bandwidth", "label-router-bandwidth");
contentUpdateById("label-router-bw-inbound-15s", "label-router-bw-inbound-15s");
contentUpdateById("label-router-bw-inbound-1s", "label-router-bw-inbound-1s");
contentUpdateById(
  "label-router-bw-outbound-15s",
  "label-router-bw-outbound-15s"
);
contentUpdateById("label-router-bw-outbound-1s", "label-router-bw-outbound-1s");
contentUpdateById(
  "label-router-net-tunnels-participating",
  "label-router-net-tunnels-participating"
);
contentUpdateById(
  "label-router-netdb-fastpeers",
  "label-router-netdb-fastpeers"
);
contentUpdateById(
  "label-router-netdb-highcapacitypeers",
  "label-router-netdb-highcapacitypeers"
);
contentUpdateById(
  "label-router-netdb-isreseeding",
  "label-router-netdb-isreseeding"
);
contentUpdateById(
  "label-router-netdb-knownpeers",
  "label-router-netdb-knownpeers"
);
contentUpdateById("label-router-peers", "label-router-peers");
contentUpdateById("label-router-status", "label-router-status");
contentUpdateById("label-router-uptime", "label-router-uptime");
contentUpdateById("label-router-version", "label-router-version");
contentUpdateById("links", "links");
contentUpdateById("linksExplain", "linksExplain");
contentUpdateById("onboardingButtonFive", "onboardingButtonFive");
contentUpdateById("onboardingButtonFour", "onboardingButtonFour");
contentUpdateById("onboardingButtonOne", "onboardingButtonOne");
contentUpdateById("onboardingButtonThree", "onboardingButtonThree");
contentUpdateById("onboardingButtonTwo", "onboardingButtonTwo");
contentUpdateById("onboardingButtonZero", "onboardingButtonZero");
contentUpdateById("onboardingContentFive", "onboardingContentFive");
contentUpdateById("onboardingContentFour", "onboardingContentFour");
contentUpdateById("onboardingContentOne", "onboardingContentOne");
contentUpdateById("onboardingContentThree", "onboardingContentThree");
contentUpdateById("onboardingContentTwo", "onboardingContentTwo");
contentUpdateById("onboardingContentZero", "onboardingContentZero");
contentUpdateById("onboardingFive", "onboardingFive");
contentUpdateById("onboardingFour", "onboardingFour");
contentUpdateById("onboardingOne", "onboardingOne");
contentUpdateById("onboardingThree", "onboardingThree");
contentUpdateById("onboardingTitle", "onboardingTitle");
contentUpdateById("onboardingTwo", "onboardingTwo");
contentUpdateById("onboardingZero", "onboardingZero");
contentUpdateById("portText", "portText");
contentUpdateById("proxy-check", "proxy-check");
contentUpdateById("releases", "releases");
contentUpdateById("returnhome", "returnhome");
contentUpdateById("router-net-bw-inbound-15s", "router-net-bw-inbound-15s");
contentUpdateById("router-net-bw-inbound-1s", "router-net-bw-inbound-1s");
contentUpdateById("router-net-bw-outbound-15s", "router-net-bw-outbound-15s");
contentUpdateById("router-net-bw-outbound-1s", "router-net-bw-outbound-1s");
contentUpdateById(
  "router-net-tunnels-participating",
  "router-net-tunnels-participating"
);
contentUpdateById("router-netdb-activepeers", "router-netdb-activepeers");
contentUpdateById("router-netdb-fastpeers", "router-netdb-fastpeers");
contentUpdateById(
  "router-netdb-highcapacitypeers",
  "router-netdb-highcapacitypeers"
);
contentUpdateById("router-netdb-isreseeding", "router-netdb-isreseeding");
contentUpdateById("router-netdb-knownpeers", "router-netdb-knownpeers");
contentUpdateById("router-restart", "router-restart");
contentUpdateById("router-shutdown", "router-shutdown");
contentUpdateById("router-status", "router-status");
contentUpdateById("router-uptime", "router-uptime");
contentUpdateById("router-version", "router-version");
contentUpdateById("routerConsole", "routerConsole");
contentUpdateById("rpcHelpText", "rpcHelpText");
contentUpdateById("rpcHostText", "rpcHostText");
contentUpdateById("rpcPassText", "rpcPassText");
contentUpdateById("rpcPathText", "rpcPathText");
contentUpdateById("rpcPortText", "rpcPortText");
contentUpdateById("signingcert", "signingcert");
contentUpdateById("sitecert", "sitecert");
contentUpdateById("snark", "snark");
contentUpdateById("sourcehead", "sourcehead");
contentUpdateById("sources", "sources");
contentUpdateById("susimail", "susimail");
contentUpdateById("text-section-header", "text-section-header");
contentUpdateById(
  "text-section-proxyerr-header",
  "text-section-proxyerr-header"
);
contentUpdateById(
  "text-section-torrents-header",
  "text-section-torrents-header"
);
contentUpdateById("toopie", "toopie");
contentUpdateById("torrentui-opener", "torrentui-opener");
contentUpdateById("visit-irc", "visit-irc");
contentUpdateById("webpage", "webpage");
contentUpdateById("window-visit-console", "window-visit-console");
contentUpdateById("window-visit-help", "window-visit-help");
contentUpdateById("window-visit-homepage", "window-visit-homepage");
contentUpdateById("window-visit-i2p", "window-visit-i2p");
contentUpdateById("window-visit-i2ptunnel", "window-visit-i2ptunnel");
contentUpdateById("window-visit-index", "window-visit-index");
contentUpdateById("window-visit-releases", "window-visit-releases");
contentUpdateById("window-visit-router", "window-visit-router");
contentUpdateById("window-visit-snark", "window-visit-snark");
contentUpdateById("window-visit-sources", "window-visit-sources");
contentUpdateById("window-visit-susimail", "window-visit-susimail");
contentUpdateById("window-visit-torrent", "window-visit-torrent");
