/**
 * @fileoverview I2P Proxy Status Manager
 * Handles proxy connectivity checking and UI updates for I2P extension
 */

// Constants
const PROXY_CONFIG = {
  PROXY_URL: "http://proxy.i2p",
  CONSOLE_URL: "http://127.0.0.1:7657",
  LOGO_PATH: "/themes/console/light/images/i2plogo.png",
  FETCH_OPTIONS: { cache: "no-store" },
};

const UI_ELEMENTS = {
  PROXY_STATUS: "proxy-check",
  READINESS_CLASS: ".readyness",
  CONSOLE_LINKS: ".application-info",
  HIDDEN_CLASS: "hidden",
};

const MESSAGE_KEYS = {
  SUCCESS: "proxySuccessStatus",
  FAILURE: "proxyFailedStatus",
};

/**
 * UI Manager for handling element visibility
 */
class UIManager {
  /**
   * Toggle element visibility
   * @param {Element|NodeList} elements - Elements to modify
   * @param {boolean} show - Whether to show or hide
   */
  /**
   * Toggle element visibility with strict null checking
   * @param {Element|NodeList} elements - Elements to modify
   * @param {boolean} show - Whether to show or hide
   */
  static toggleVisibility(elements, show) {
    try {
      // Validate input
      if (!elements) {
        throw new Error("Elements parameter is null or undefined");
      }

      // Convert to array if NodeList
      const elementArray =
        elements instanceof NodeList ? Array.from(elements) : [elements];

      elementArray.forEach((element) => {
        // Explicit null check for element and style property
        if (element && element.style !== undefined && element.style !== null) {
          const action = show ? "remove" : "add";
          element.classList[action](UI_ELEMENTS.HIDDEN_CLASS);
          console.debug(`(proxyinfo) ${show ? "showing" : "hiding"} element`);
        } else {
          console.warn(
            "(proxyinfo) Invalid element encountered during visibility toggle"
          );
        }
      });
    } catch (error) {
      console.error("Visibility toggle failed:", error);
      throw error; // Re-throw for error boundary handling
    }
  }

  /**
   * Update element content by ID
   * @param {string} elementId - Target element ID
   * @param {string} messageKey - i18n message key
   */
  static updateContent(elementId, messageKey) {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element not found : ${elementId}`);
      }
      element.textContent = chrome.i18n.getMessage(messageKey);
    } catch (error) {
      console.error("Content update failed:", error);
    }
  }

  /**
   * Get elements by selector
   * @param {string} selector - CSS selector
   * @return {?NodeList}
   */
  static getElements(selector) {
    try {
      return document.querySelectorAll(selector);
    } catch (error) {
      console.error("Element selection failed:", error);
      return null;
    }
  }
}

/**
 * Proxy Status Manager
 */
class ProxyStatusManager {
  /**
   * Check proxy connectivity
   * @return {Promise<void>}
   */
  static async checkProxyStatus() {
    console.info("(proxyinfo) Checking proxy status");
    try {
      const response = await fetch(
        PROXY_CONFIG.PROXY_URL,
        PROXY_CONFIG.FETCH_OPTIONS
      );
      await this.handleProxySuccess(response);
    } catch (error) {
      await this.handleProxyError(error);
    }
  }

  /**
   * Handle successful proxy connection
   * @param {Response} response - Fetch response
   */
  static async handleProxySuccess(response) {
    console.info("(proxyinfo) Proxy check successful");
    UIManager.updateContent(UI_ELEMENTS.PROXY_STATUS, MESSAGE_KEYS.SUCCESS);

    const readinessElements = UIManager.getElements(
      UI_ELEMENTS.READINESS_CLASS
    );
    if (readinessElements) {
      UIManager.toggleVisibility(readinessElements, true);
    }
  }

  /**
   * Handle proxy connection failure
   * @param {Error} error - Connection error
   */
  static async handleProxyError(error) {
    console.error("(proxyinfo) Proxy check failed:", error);
    UIManager.updateContent(UI_ELEMENTS.PROXY_STATUS, MESSAGE_KEYS.FAILURE);

    const readinessElements = UIManager.getElements(
      UI_ELEMENTS.READINESS_CLASS
    );
    if (readinessElements) {
      UIManager.toggleVisibility(readinessElements, false);
    }
  }

  /**
   * Check console connectivity
   * @return {Promise<void>}
   */
  static async checkConsoleStatus() {
    const logoUrl = `${PROXY_CONFIG.CONSOLE_URL}${PROXY_CONFIG.LOGO_PATH}`;
    console.info("(proxyinfo) Checking console status");

    try {
      await fetch(logoUrl);
      const consoleLinks = UIManager.getElements(UI_ELEMENTS.CONSOLE_LINKS);
      if (consoleLinks) {
        UIManager.toggleVisibility(consoleLinks, true);
      }
      console.info("(proxyinfo) Console check successful");
    } catch (error) {
      const consoleLinks = UIManager.getElements(UI_ELEMENTS.CONSOLE_LINKS);
      if (consoleLinks) {
        UIManager.toggleVisibility(consoleLinks, false);
      }
      console.error("(proxyinfo) Console check failed:", error);
    }
  }
}

/**
 * Initialize proxy status checking
 */
function initializeProxyChecks() {
  try {
    ProxyStatusManager.checkProxyStatus();
    ProxyStatusManager.checkConsoleStatus();
  } catch (error) {
    console.error("Proxy initialization failed:", error);
  }
}

// Event Listeners
document.addEventListener("DOMContentLoaded", initializeProxyChecks, {
  passive: true,
  capture: false,
});

// Export for testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    ProxyStatusManager,
    UIManager,
    PROXY_CONFIG,
    UI_ELEMENTS,
  };
}
