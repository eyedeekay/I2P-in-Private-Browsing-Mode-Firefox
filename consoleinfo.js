/**
 * @fileoverview I2P Router Console Status Manager
 * Handles router console connectivity checking and UI updates
 */

// Constants
const CONSOLE_CONFIG = {
  ROUTER_URL: "http://127.0.0.1:7657",
  WELCOME_PATH: "/welcome",
  FETCH_OPTIONS: {
    method: "GET",
    cache: "no-store",
    redirect: "follow",
  },
};

const UI_ELEMENTS = {
  ROUTER_STATUS: "router-check",
  ROUTER_CLASS: ".routerness",
  HIDDEN_CLASS: "hidden",
};

const MESSAGE_KEYS = {
  SUCCESS: "consoleSuccessStatus",
  FAILURE: "consoleFailedStatus",
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
  static toggleVisibility(elements, show) {
    try {
      if (!elements) {
        throw new Error("Elements parameter is null or undefined");
      }

      const elementArray =
        elements instanceof NodeList ? Array.from(elements) : [elements];

      elementArray.forEach((element) => {
        if (element && element.style !== undefined && element.style !== null) {
          const action = show ? "remove" : "add";
          element.classList[action](UI_ELEMENTS.HIDDEN_CLASS);
          console.debug(`(consoleinfo) ${show ? "showing" : "hiding"} element`);
        } else {
          console.warn(
            "(consoleinfo) Invalid element encountered during visibility toggle"
          );
        }
      });
    } catch (error) {
      console.error("Visibility toggle failed:", error);
      throw error;
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
 * Router Console Manager
 */
class RouterConsoleManager {
  /**
   * Check router console connectivity
   * @return {Promise<void>}
   */
  static async checkConsoleStatus() {
    console.info("(consoleinfo) Checking router console status");
    try {
      const response = await fetch(
        `${CONSOLE_CONFIG.ROUTER_URL}${CONSOLE_CONFIG.WELCOME_PATH}`,
        CONSOLE_CONFIG.FETCH_OPTIONS
      );

      if (!response.ok) {
        throw new Error(`Console response not OK : ${response.status}`);
      }

      await this.handleConsoleSuccess(response);
    } catch (error) {
      await this.handleConsoleError(error);
    }
  }

  /**
   * Handle successful console connection
   * @param {Response} response - Fetch response
   */
  static async handleConsoleSuccess(response) {
    console.info("(consoleinfo) Router console check successful");

    try {
      UIManager.updateContent(UI_ELEMENTS.ROUTER_STATUS, MESSAGE_KEYS.SUCCESS);

      const routerElements = UIManager.getElements(UI_ELEMENTS.ROUTER_CLASS);
      if (routerElements) {
        UIManager.toggleVisibility(routerElements, true);
      }
    } catch (error) {
      console.error("Console success handling failed:", error);
    }
  }

  /**
   * Handle console connection failure
   * @param {Error} error - Connection error
   */
  static async handleConsoleError(error) {
    console.error("(consoleinfo) Router console check failed:", error);

    try {
      UIManager.updateContent(UI_ELEMENTS.ROUTER_STATUS, MESSAGE_KEYS.FAILURE);

      const routerElements = UIManager.getElements(UI_ELEMENTS.ROUTER_CLASS);
      if (routerElements) {
        UIManager.toggleVisibility(routerElements, false);
      }
    } catch (additionalError) {
      console.error("Console error handling failed:", additionalError);
    }
  }

  /**
   * Initialize console monitoring
   */
  static initialize() {
    try {
      this.checkConsoleStatus();
      console.info("(consoleinfo) Router console monitoring initialized");
    } catch (error) {
      console.error("Console initialization failed:", error);
    }
  }
}

// Event Listeners
document.addEventListener(
  "DOMContentLoaded",
  () => {
    RouterConsoleManager.initialize();
  },
  {
    passive: true,
    capture: false,
  }
);

// Export for testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    RouterConsoleManager,
    UIManager,
    CONSOLE_CONFIG,
    UI_ELEMENTS,
    MESSAGE_KEYS,
  };
}
