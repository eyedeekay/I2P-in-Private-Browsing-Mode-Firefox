document.addEventListener("click", (e) => {
  var helpInfoTitle = browser.i18n.getMessage("infoTitle");
  var helpInfoMessage = browser.i18n.getMessage("infoMessage");
  var helpNewsMessage = browser.i18n.getMessage("newsMessage");
  //var helpResetMessage q2= browser.i18n.getMessage("resetMessage");
 // console.log(helpInfoTitle);

  function getCurrentWindow() {
    return browser.windows.getCurrent();
  }

  if (e.target.id === "window-create-panel") {
    let createData = {
      type: "panel",
      incognito: true,
    };
    let creating = browser.windows.create(createData);
    creating.then(() => {
      console.log("The panel has been created");
    });
  }

  else if (e.target.id === "window-remove") {
    getCurrentWindow().then((currentWindow) => {
      browser.windows.remove(currentWindow.id);
    });
  } else if (e.target.id === "window-preface-title") {
    getCurrentWindow().then((currentWindow) => {
      let updateInfo = {
        titlePreface: "I2P Help | "
      }
      browser.windows.update(currentWindow.id, updateInfo);
    });
  }

  e.preventDefault();

  var infoTitle = document.getElementById('text-section-header');
  infoTitle.textContent = helpInfoTitle;

  var infoMessage = document.getElementById('panel-section-helptext');
  infoMessage.textContent = helpInfoMessage;

  //var newsMessage = document.getElementById('window-create-help-panel');
  //newsMessage.textContent = helpNewsMessage;

  //var resetLinkID = document.getElementById('controlHostText');
  //resetLinkId.textContent = controlhosttext;

});
