  var infoTitle = document.getElementById('text-section-header');
  infoTitle.textContent = chrome.i18n.getMessage("infoTitle");

  var infoMessage = document.getElementById('text-section-helptext');
  infoMessage.textContent = chrome.i18n.getMessage("infoMessage");

  var helpMessage = document.getElementById('window-create-help-panel');
  helpMessage.textContent = chrome.i18n.getMessage("helpMessage");

  var newsMessage = document.getElementById('window-create-news-panel');
  newsMessage.textContent = chrome.i18n.getMessage("newsMessage");
