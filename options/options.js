/**
 * @fileoverview I2P Browser Extension Options Management
 * Handles proxy configuration and UI settings for I2P container contexts
 */

// Constants and Types
const DEFAULT_SETTINGS = {
  proxy_scheme: 'http',
  proxy_host: '127.0.0.1',
  proxy_port: 4444,
  control_host: '127.0.0.1',
  control_port: 7657,
  bookmarks_state: false,
};

/**
 * Gets proxy scheme from HTML select element
 * @return {string}
 */
function getFromHTMLValueScheme() {
  const proxy_scheme = document.querySelector('#proxy_scheme');
  if (!proxy_scheme) return 'http';

  switch (proxy_scheme.value.toLowerCase()) {
    case 'http':
    case 'socks':
      return proxy_scheme.value.toLowerCase();
    default:
      return 'http';
  }
}

/**
 * Checks stored settings and applies defaults if necessary
 * @param {Object} storedSettings
 * @return {Promise<Object>}
 */
async function checkStoredSettings(storedSettings) {
  try {
    const proxyInfo = await browser.proxy.settings.get({});
    const { http } = proxyInfo.value;

    if (!http) {
      return DEFAULT_SETTINGS;
    }

    const[host, portStr] = http.split(":");
    const port = parseInt(portStr);

    return {
      bookmarks_state: storedSettings.bookmarks_state || false,
      proxy_scheme: storedSettings.proxy_scheme || "http",
      proxy_host: storedSettings.proxy_host || host || "127.0.0.1",
      proxy_port: storedSettings.proxy_port || (port === 7644 ? port : 4444),
      control_host: storedSettings.control_host || host || "127.0.0.1",
      control_port: storedSettings.control_port || 7657,
    };
  } catch (error) {
    console.error("Error in checkStoredSettings:", error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Checks and applies Android-specific stored settings
 * @param {Object} settings
 * @returns {Object}
 */
function checkAndroidStoredSettings(settings) {
  const mergedSettings = {
    ...DEFAULT_SETTINGS,
    ...settings,
  };

  // Determine correct proxy port with clear logic
  function determineProxyPort(port) {
    if (!port) {
      return 4444;
    }
    if (port === 7644) {
      return 7644;
    }
    return 4444;
  }

  mergedSettings.proxy_port = determineProxyPort(mergedSettings.proxy_port);

  console.info("Android settings merged:", mergedSettings);
  chrome.storage.local.set(mergedSettings);
  return mergedSettings;
}

/**
 * Updates UI text elements with localized messages
 */
function initializeUI() {
  const textElements = [
    { id: "hostText", msgKey: "hostText" },
    { id: "portText", msgKey: "portText" },
    { id: "proxyHelpText", msgKey: "proxyHelpText" },
    { id: "controlHostText", msgKey: "controlHostText" },
    { id: "controlPortText", msgKey: "controlPortText" },
    { id: "controlHelpText", msgKey: "controlHelpText" },
  ];

  textElements.forEach(({ id, msgKey }) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = chrome.i18n.getMessage(msgKey);
    }
  });
}

/**
 * Updates UI elements with stored settings
 * @param {Object} settings
 */
function updateUI(settings) {
  const elements = {
    proxy_scheme: document.querySelector("#proxy_scheme"),
    bookmarks_state: document.getElementById("bookmarksState"),
    host: document.getElementById("host"),
    port: document.getElementById("port"),
    controlhost: document.getElementById("controlhost"),
    controlport: document.getElementById("controlport"),
  };

  Object.entries(elements).forEach(([key, element]) => {
    if (element === null || element === undefined) {
      return;
    }

    if (element.type === "checkbox") {
      element.checked = settings[key];
    } else {
      element.value = settings[key];
    }
  });

  initializeUI();
}

/**
 * Gets value from element with fallback to default
 * @param {HTMLElement|null} element
 * @param {string|number} defaultValue
 * @returns {string|number}
 */
function getElementValueWithDefault(element, defaultValue) {
  if (!element) {
    return defaultValue;
  }
  return element.value || defaultValue;
}

/**
 * Gets numeric value from element with fallback to default
 * @param {HTMLElement|null} element
 * @param {number} defaultValue
 * @returns {number}
 */
function getNumericValueWithDefault(element, defaultValue) {
  if (!element || !element.value) {
    return defaultValue;
  }
  return parseInt(element.value) || defaultValue;
}

/**
 * Stores current settings to browser storage
 * @returns {Promise<void>}
 */
async function storeSettings() {
  const elements = {
    host: document.getElementById("host"),
    port: document.getElementById("port"),
    controlhost: document.getElementById("controlhost"),
    controlport: document.getElementById("controlport"),
    bookmarks: document.getElementById("bookmarksState"),
  };

  const settings = {
    proxy_scheme: getFromHTMLValueScheme(),
    proxy_host: getElementValueWithDefault(
      elements.host,
      DEFAULT_SETTINGS.proxy_host
    ),
    proxy_port: getNumericValueWithDefault(
      elements.port,
      DEFAULT_SETTINGS.proxy_port
    ),
    control_host: getElementValueWithDefault(
      elements.controlhost,
      DEFAULT_SETTINGS.control_host
    ),
    control_port: getNumericValueWithDefault(
      elements.controlport,
      DEFAULT_SETTINGS.control_port
    ),
    bookmarks_state: elements.bookmarks ? elements.bookmarks.checked : false,
  };

  try {
    await browser.storage.local.set(settings);
    console.info("Settings stored successfully:", settings);
  } catch (error) {
    console.error("Failed to store settings:", error);
    throw error;
  }
}

/**
 * Error handler for async operations
 * @param {Error} error
 */
function onError(error) {
  console.error("Operation failed:", error);
}

/**
 * Initializes settings based on platform
 */
async function initializeSettings() {
  try {
    const platform = await browser.runtime.getPlatformInfo();

    if (platform.os === "android") {
      chrome.storage.local.get(function (gotSettings) {
        const settings = checkAndroidStoredSettings(gotSettings);
        updateUI(settings);
      });
    } else {
      chrome.storage.local.get(function (gotSettings) {
        checkStoredSettings(gotSettings).then(updateUI).catch(onError);
      });
    }
  } catch (error) {
    console.error("Platform detection failed:", error);
    onError(error);
  }
}

/**
 * Retrieves a setting from local storage
 * @param {string} key - The key to retrieve
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {any} The stored value or default value
 */
function getSetting(key, defaultValue) {
  try {
    const value = localStorage.getItem(key);
    if (value === null || value === undefined) {
      return defaultValue;
    }
    return value;
  } catch (error) {
    console.error(`Failed to get setting: ${key}`, error);
    return defaultValue;
  }
}


function getFromStorageProxyScheme() {
  return getSetting("proxy_scheme", DEFAULT_SETTINGS.proxy_scheme);
}
function getFromStorageHost() {
  return getSetting("proxy_host", DEFAULT_SETTINGS.proxy_host);
}
function getFromStoragePort() {
  return getSetting("proxy_port", DEFAULT_SETTINGS.proxy_port);
}
function getFromStorageControlHost() {
  return getSetting("control_host", DEFAULT_SETTINGS.control_host);
}
function getFromStorageControlPort() {
  return getSetting("control_port", DEFAULT_SETTINGS.control_port);
}
function getFromStorageRPCHost() {
  return getSetting("rpc_host", DEFAULT_SETTINGS.rpc_host);
}
function getFromStorageRPCPort() {
  return getSetting("rpc_port", DEFAULT_SETTINGS.rpc_port);
}
function getFromStorageRPCPath() {
  return getSetting("rpc_path", DEFAULT_SETTINGS.rpc_path);
}
function getFromStorageRPCPass() {
  return getSetting("rpc_pass", DEFAULT_SETTINGS.rpc_pass);
}
function getFromStorageBTRPCHost() {
  return getSetting("bt_rpc_host", DEFAULT_SETTINGS.bt_rpc_host);
}
function getFromStorageBTRPCPort() {
  return getSetting("bt_rpc_port", DEFAULT_SETTINGS.bt_rpc_port);
}
function getFromStorageBTRPCPath() {
  return getSetting("bt_rpc_path", DEFAULT_SETTINGS.bt_rpc_path);
}
function getFromStorageBTRPCPass() {
  return getSetting("bt_rpc_pass", DEFAULT_SETTINGS.bt_rpc_pass);
}
function getFromStorageBookmarksState() {
  return getSetting("bookmarks_state", DEFAULT_SETTINGS.bookmarks_state);
}

// Event Listeners
const saveButton = document.querySelector("#save-button");
if (saveButton) {
  saveButton.addEventListener("click", storeSettings);
}
document.addEventListener("DOMContentLoaded", initializeSettings);
