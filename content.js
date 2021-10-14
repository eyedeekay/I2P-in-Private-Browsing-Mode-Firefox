function contentUpdateById(id, message) {
  let infoTitle = document.getElementById(id);
  let messageContent = chrome.i18n.getMessage(message);
  if (infoTitle === null) {
    console.log('content error', id, messageContent);
    return;
  }
  infoTitle.textContent = messageContent;
}

// Information Section
contentUpdateById('text-section-header', 'extensionName');
contentUpdateById('description', 'extensionDescription');
contentUpdateById('i2pbrowser-version', 'extensionVersion');
contentUpdateById('proxy-check', 'proxyFailedStatus');

// Control Section
contentUpdateById('controlHeader', 'controlHeader');
contentUpdateById('controlExplain', 'controlExplain');
contentUpdateById('clear-browser-data', 'clearData');
contentUpdateById('clear-desc', 'clearDesc');
contentUpdateById('enable-web-rtc', 'enableWebRTC');
contentUpdateById('rtcDesc', 'rtcDesc');
contentUpdateById('disable-history', 'disableHistory');
contentUpdateById('histDesc', 'histDesc');

// Application Section
contentUpdateById('applicationHeader', 'applicationHeader');
contentUpdateById('applicationExplain', 'applicationExplain');
contentUpdateById('window-visit-index', 'windowVisitHelppage');
contentUpdateById('help', 'help');
contentUpdateById('window-visit-router', 'windowVisitConsole');
contentUpdateById('routerConsole', 'routerConsole');
contentUpdateById('window-visit-homepage', 'windowVisitHomepage');
contentUpdateById('abouthome', 'abouthome');
contentUpdateById('window-visit-i2ptunnel', 'windowVisitI2ptunnel');
contentUpdateById('i2ptunnel', 'i2ptunnel');
contentUpdateById('window-visit-susimail', 'windowVisitSusiMail');
contentUpdateById('susimail', 'susimail');
contentUpdateById('window-visit-snark', 'windowVisitSnark');
contentUpdateById('snark', 'snark');

// Homepage Section
contentUpdateById('window-visit-webpage', 'windowVisitWebPage');
contentUpdateById('webpage', 'help');
contentUpdateById('window-visit-sources', 'windowVisitSources');
contentUpdateById('sources', 'sources');
contentUpdateById('window-visit-releases', 'windowVisitReleases');
contentUpdateById('releases', 'releases');

fetch('http://proxy.i2p').then((myJson) => {
  contentUpdateById('proxy-check', 'proxySuccessStatus');
  let readyness = document.querySelectorAll('.readyness');
  if (readyness != null) {
    hide(readyness);
  }
});

function hide(elements) {
  elements = elements.length ? elements : [elements];
  for (var index = 0; index < elements.length; index++) {
    elements[index].style.display = "none";
  }
}

function unhide(elements) {
  elements = elements.length ? elements : [elements];
  for (var index = 0; index < elements.length; index++) {
    elements[index].style.display = "inline-block";
  }
}

//TODO: Don't hard-code this.
fetch("http://127.0.0.1:7657/themes/console/light/images/i2plogo.png")
  .then((myJson) => {
    var consoleLinks = document.querySelectorAll(".application-info");
    unhide(consoleLinks);
  })
  .catch((error) => {
    var consoleLinks = document.querySelectorAll(".application-info");
    hide(consoleLinks);
  });

fetch("http://127.0.0.1:7657/jsonrpc/")
  .then((myJson) => {
    var toopieLinks = document.querySelectorAll(".window-visit-toopie");
    unhide(toopieLinks);
  })
  .catch((error) => {
    var toopieLinks = document.querySelectorAll(".window-visit-toopie");
    hide(toopieLinks);
  });
