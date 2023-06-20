document.addEventListener("DOMContentLoaded", consoleStatus, false);

function consoleStatus() {
  let recv = fetch("http://127.0.0.1:7657/welcome");
  recv.then(routerConsoleSuccess, routerConsoleError);
}

function routerConsoleSuccess(myJson) {
  console.warn("(consoleinfo)", myJson);
  contentUpdateById("router-check", "consoleSuccessStatus");
  let routerness = document.querySelectorAll(".routerness");
  if (routerness !== null) {
    unhide(routerness);
  }
}

function routerConsoleError(error) {
  console.error("(consoleinfo)", error);
  contentUpdateById("router-check", "consoleFailedStatus");
  let routerness = document.querySelectorAll(".routerness");
  if (routerness !== null) {
    hide(routerness);
  }
}

function hide(elementsToHide) {
  const elements = Array.isArray(elementsToHide)
    ? elementsToHide
    : [elementsToHide];
  elements.forEach((element) => {
    console.log("(consoleinfo) hiding")
    el.classList.add("hidden");
  });
}

function unhide(elementsToShow) {
  const elements = Array.isArray(elementsToShow)
    ? elementsToShow
    : [elementsToShow];
  elements.forEach((element) => {
    if (element.style) {
      console.log("(consoleinfo) unhiding")
      el.classList.remove("hidden");
    }
  });
}
