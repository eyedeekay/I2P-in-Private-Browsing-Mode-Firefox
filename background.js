browser.windows.onCreated.addListener(themeWindow);

// Theme all currently open windows
browser.windows.getAll().then(wins => wins.forEach(themeWindow));

function themeWindow(window) {
  // Check if the window is in private browsing
  if (window.incognito) {
    browser.theme.update(window.id, {
      images: {
        headerURL: "",
      },
      colors: {
        accentcolor: "#A0A0DE",
        textcolor: "white",
        toolbar: "#A0A0DE",
        toolbar_text: "white"
      }
    });
  }
  // Reset to the default theme otherwise
  else {
    browser.theme.update(window.id, {
      images: {
        headerURL: "",
      },
      colors: {
        accentcolor: "#BFA0DE",
        textcolor: "white",
        toolbar: "#BFA0DE",
        toolbar_text: "white"
      }
    });
  }
}
