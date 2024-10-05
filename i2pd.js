// stuff required specifically to be compatible with i2pd

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
