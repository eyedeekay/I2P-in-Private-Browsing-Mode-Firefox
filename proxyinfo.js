document.addEventListener("DOMContentLoaded", proxyStatus, false);

function proxyStatus() {
  console.log("(proxyinfo) checking proxy status");
  fetch("http://proxy.i2p", { cache: "no-store" }).then(
    proxyStatusSuccess,
    proxyStatusError
  );
}

function proxyStatusSuccess(myJson) {
  console.warn("(proxyinfo)", myJson);
  contentUpdateById("proxy-check", "proxySuccessStatus");
  let readyness = document.querySelectorAll(".readyness");
  if (readyness !== null) {
    unhide(readyness);
  }
}

function proxyStatusError(error) {
  console.error("(proxyinfo)", error);
  contentUpdateById("proxy-check", "proxyFailedStatus");
  let readyness = document.querySelectorAll(".readyness");
  if (readyness !== null) {
    hide(readyness);
  }
}

function hide(elements) {
  console.log("(proxyinfo) hiding", elements);
  const elems = Array.isArray(elements) ? elements : [elements];
  elems.forEach((elem) => {
    if (elem.style) {
      console.log("(proxyinfo) hiding");
      elem.classList.add("hidden");
    }
  });
}

function unhide(elements) {
  console.log("(proxyinfo) unhiding", elements);
  const elems = Array.isArray(elements) ? elements : [elements];
  elems.forEach((elem) => {
    if (elem.style) {
      console.log("(proxyinfo) unhiding");
      elem.classList.remove("hidden");
    }
  });
}

//TODO: Don't hard-code this.
fetch("http://127.0.0.1:7657/themes/console/light/images/i2plogo.png")
  .then((myJson) => {
    console.log("(proxyinfo) img test pass", myJson);
    var consoleLinks = document.querySelectorAll(".application-info");
    unhide(consoleLinks);
  })
  .catch((error) => {
    console.log("(proxyinfo) img test fail", error);
    var consoleLinks = document.querySelectorAll(".application-info");
    hide(consoleLinks);
  });

fetch("http://127.0.0.1:7657/jsonrpc/")
  .then((myJson) => {
    console.log("(proxyinfo) json test pass", myJson);
    var toopieLinks = document.querySelectorAll("#window-visit-toopie");
    unhide(toopieLinks);
    var toopieIDLinks = document.querySelectorAll(".window-visit-toopie");
    unhide(toopieIDLinks);
  })
  .catch((error) => {
    console.log("(proxyinfo) json test fail", error);
    var toopieLinks = document.querySelectorAll("#window-visit-toopie");
    hide(toopieLinks);
    var toopieIDLinks = document.querySelectorAll(".window-visit-toopie");
    hide(toopieIDLinks);
  });
