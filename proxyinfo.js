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
  const elems = Array.isArray(elements) ? elements : [elements];
  elems.forEach((elem) => {
    if (elem.style) {
      elem.style.display = "none";
    }
  });
}

function unhide(elements) {
  const elems = Array.isArray(elements) ? elements : [elements];
  elems.forEach((elem) => {
    if (elem.style) {
      elem.style.display = "inline-block";
    }
  });
}

//TODO: Don't hard-code this.
/*fetch("http://127.0.0.1:7657/themes/console/light/images/i2plogo.png")
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
*/
