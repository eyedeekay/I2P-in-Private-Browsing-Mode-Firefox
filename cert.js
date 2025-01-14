/**
 * @fileoverview Certificate and Host Verification Module
 * Handles I2P certificate verification and host information display
 */

// Constants
const I2P_SUFFIX = ".i2p";
const B32_SUFFIX = "b32.i2p";
const HTTPS_PREFIX = "https";
const HOST_LENGTH_THRESHOLD = 51;

/**
 * Message keys for i18n
 * @enum {string}
 */
const MessageKeys = {
  SITE_LABEL: "siteLabel",
  CERT_LABEL: "CertLabel",
  IS_HOSTNAME: "isHostName",
  IS_BASE32: "isBase32",
  CERT_PRESENT: "certPresent",
  CERT_ABSENT: "certAbsent",
};

/**
 * DOM element IDs
 * @enum {string}
 */
const ElementIds = {
  TYPE_LABEL: "TypeLabel",
  CERT_LABEL: "CertLabel",
  ADDRESS_INFO: "AddressInfo",
  ADDRESS_CERT_INFO: "AddressCertInfo",
  SIGNED_LABEL: "SignedLabel",
};

/**
 * Updates element content with i18n message
 * @param {string} elementId - Target DOM element ID
 * @param {string} messageKey - i18n message key
 * @return {void}
 */
function updateContent(elementId, messageKey) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Element not found : ${elementId}`);
    return;
  }

  const message = chrome.i18n.getMessage(messageKey);
  if (!message) {
    console.warn(`Translation missing for: ${messageKey}`);
    return;
  }

  element.textContent = message;
}

/**
 * Clears content of specified element
 * @param {string} elementId - Target DOM element ID
 * @return {void}
 */
function clearContent(elementId) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Element not found : ${elementId}`);
    return;
  }
  element.textContent = "";
}

/**
 * Extracts I2P host from URL
 * @param {string} url - Full URL
 * @return {string} I2P host
 */
function extractI2PHost(url) {
  const baseHost = url.split(I2P_SUFFIX)[0] + I2P_SUFFIX;
  return baseHost;
}

/**
 * Determines host type and updates UI
 * @param {string} host - I2P host
 * @return {void}
 */
function updateHostTypeInfo(host) {
  if (host.length < HOST_LENGTH_THRESHOLD) {
    updateContent(ElementIds.ADDRESS_INFO, MessageKeys.IS_HOSTNAME);
  } else if (host.endsWith(B32_SUFFIX)) {
    updateContent(ElementIds.ADDRESS_INFO, MessageKeys.IS_BASE32);
  }
}

/**
 * Handles certificate verification and UI updates
 * @param {string} url - Page URL
 * @param {string} host - I2P host
 * @return {Promise<void>}
 */
async function handleCertificateVerification(url, host) {
  if (url.startsWith(HTTPS_PREFIX)) {
    updateContent(ElementIds.ADDRESS_CERT_INFO, MessageKeys.CERT_PRESENT);
    try {
      const response = await fetch(host);
      console.info("Certificate verification completed:", response);
    } catch (error) {
      console.error("Certificate verification failed:", error);
    }
  } else {
    updateContent(ElementIds.ADDRESS_CERT_INFO, MessageKeys.CERT_ABSENT);
    clearContent(ElementIds.SIGNED_LABEL);
  }
}

/**
 * Processes active tab information
 * @param {browser.tabs.Tab[]} tabs - Active tab information
 * @return {Promise<void>}
 */
async function processActiveTab(tabs) {
  if (!tabs || !tabs[0] || !tabs[0].url) {
    console.error("Invalid tab information");
    return;
  }

  const url = tabs[0].url;
  const host = extractI2PHost(url);

  updateHostTypeInfo(host);
  await handleCertificateVerification(url, host);
}

/**
 * Initializes the certificate verification UI
 * @return {void}
 */
function initializeCertUI() {
  updateContent(ElementIds.TYPE_LABEL, MessageKeys.SITE_LABEL);
  updateContent(ElementIds.CERT_LABEL, MessageKeys.CERT_LABEL);

  browser.tabs
    .query({ active: true })
    .then(processActiveTab)
    .catch((error) => console.error("Tab processing failed:", error));
}

// Initialize certificate verification
initializeCertUI();
