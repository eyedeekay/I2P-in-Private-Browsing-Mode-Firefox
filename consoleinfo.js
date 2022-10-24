document.addEventListener(
  "DOMContentLoaded",
  function () {
    fetch("http://127.0.0.1:7657/welcome").then(
      (myJson) => {
        console.warn("(consoleinfo)", myJson);
        contentUpdateById("router-check", "consoleSuccessStatus");
        let routerness = document.querySelectorAll(".routerness");
        if (routerness !== null) {
          unhide(routerness);
        }
      },
      (error) => {
        console.error("(consoleinfo)", error);
        contentUpdateById("router-check", "consoleFailedStatus");
        let routerness = document.querySelectorAll(".routerness");
        if (routerness !== null) {
          hide(routerness);
        }
      }
    );
  },
  false
);

function hide(elements) {
  elements = elements.length ? elements : [elements];
  for (var index = 0; index < elements.length; index++) {
    if (elements[index].style !== undefined) {
      elements[index].style.display = "none";
    }
  }
}

function unhide(elements) {
  elements = elements.length ? elements : [elements];
  for (var index = 0; index < elements.length; index++) {
    if (elements[index].style !== undefined) {
      elements[index].style.display = "inline-block";
    }
  }
}

//TODO: Don't hard-code this.
/*
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
*/
