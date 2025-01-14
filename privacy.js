/**
 * @fileoverview I2P Privacy Manager
 * Handles Firefox privacy settings and data cleanup for I2P container tabs
 */

const PRIVACY_CONFIG = {
  TITLE_PREFACE: chrome.i18n.getMessage("titlePreface"),
  SNOWFLAKE_ID: "{b11bea1f-a888-4332-8d8a-cec2be7d24b9}",
  WINDOWS: {
    OS: "win",
  },
  BROWSING_DATA: {
    SINCE: "forever",
    TYPES: ["downloads", "passwords", "formData", "localStorage", "history"],
  },
};

/**
 * Privacy Manager for handling browser privacy settings
 */
class PrivacyManager {
  /**
   * Set browser privacy settings
   * @param {Object} settings Privacy setting configuration
   * @return {Promise<boolean>}
   */
  static async setSetting(setting, value) {
    try {
      const result = await setting.set({ value });
      console.info(`Privacy setting updated : ${value}`);
      return true;
    } catch (error) {
      console.error("Privacy setting failed:", error);
      return false;
    }
  }

  /**
   * Configure hyperlink auditing
   * @param {boolean} enabled Whether to enable auditing
   */
  static async configureHyperlinkAuditing(enabled = false) {
    await this.setSetting(
      browser.privacy.websites.hyperlinkAuditingEnabled,
      enabled
    );
  }

  /**
   * Configure first party isolation
   * @param {boolean} enabled Whether to enable isolation
   */
  static async configureFirstPartyIsolation(enabled = true) {
    await this.setSetting(browser.privacy.websites.firstPartyIsolate, enabled);
  }

  /**
   * Configure cookie behavior
   * @param {boolean} allowThirdParty Whether to allow third party cookies
   */
  static async configureCookies(allowThirdParty = false) {
    try {
      const cookieConfig = await browser.privacy.websites.cookieConfig.get({});
      await browser.privacy.websites.cookieConfig.set({
        value: {
          behavior: allowThirdParty ? "allow_all" : "reject_third_party",
          nonPersistentCookies: cookieConfig.value.nonPersistentCookies,
        },
      });
    } catch (error) {
      console.error("Cookie configuration failed:", error);
    }
  }

  /**
   * Configure referrer policy
   * @param {boolean} enabled Whether to enable referrers
   */
  static async configureReferrers(enabled = false) {
    await this.setSetting(browser.privacy.websites.referrersEnabled, enabled);
  }

  /**
   * Configure fingerprinting resistance
   * @param {boolean} enabled Whether to enable resistance
   */
  static async configureFingerprinting(enabled = true) {
    await this.setSetting(
      browser.privacy.websites.resistFingerprinting,
      enabled
    );
  }

  /**
   * Configure tracking protection
   * @param {boolean} enabled Whether to enable protection
   */
  static async configureTrackingProtection(enabled = true) {
    await this.setSetting(
      browser.privacy.websites.trackingProtectionMode,
      enabled ? "always" : "never"
    );
  }

  /**
   * Configure DRM content
   * @param {boolean} enabled Whether to enable DRM
   */
  static async configureDRM(enabled = false) {
    const platformInfo = await browser.runtime.getPlatformInfo();
    if (platformInfo.os === PRIVACY_CONFIG.WINDOWS.OS) {
      await this.setSetting(
        browser.privacy.websites.protectedContentEnabled,
        enabled
      );
    }
  }

  /**
   * Configure WebRTC
   * @param {boolean} enabled Whether to enable WebRTC
   */
  static async configureWebRTC(enabled = false) {
    try {
      const snowflake = await browser.management.get(
        PRIVACY_CONFIG.SNOWFLAKE_ID
      );
      console.info("Snowflake detected, preserving WebRTC");
      return;
    } catch {
      await this.setSetting(
        browser.privacy.network.peerConnectionEnabled,
        enabled
      );
      await this.setSetting(
        chrome.privacy.network.webRTCIPHandlingPolicy,
        enabled ? "disable_non_proxied_udp" : "default"
      );
    }
  }

  /**
   * Configure password saving
   * @param {boolean} enabled Whether to enable password saving
   */
  static async configurePasswordSaving(enabled = false) {
    await this.setSetting(
      browser.privacy.services.passwordSavingEnabled,
      enabled
    );
  }

  /**
   * Apply recommended privacy settings
   */
  static async applyRecommendedSettings() {
    await Promise.all([
      this.configureHyperlinkAuditing(false),
      this.configureFirstPartyIsolation(true),
      this.configureCookies(false),
      this.configureFingerprinting(true),
      this.configureTrackingProtection(true),
      this.configureDRM(false),
      this.configureWebRTC(false),
      this.configurePasswordSaving(false),
    ]);
  }

  /**
   * Reset all privacy settings to defaults
   */
  static async resetAllSettings() {
    await Promise.all([
      browser.privacy.websites.hyperlinkAuditingEnabled.clear(),
      browser.privacy.websites.firstPartyIsolate.clear(),
      browser.privacy.websites.cookieConfig.clear(),
      browser.privacy.websites.referrersEnabled.clear(),
      browser.privacy.websites.resistFingerprinting.clear(),
      browser.privacy.websites.trackingProtectionMode.clear(),
      browser.privacy.websites.protectedContentEnabled.clear(),
      browser.privacy.network.peerConnectionEnabled.clear(),
      browser.privacy.services.passwordSavingEnabled.clear(),
    ]);
  }
}

/**
 * Data Cleanup Manager for handling browsing data
 */
class DataCleanupManager {
  /**
   * Clean browsing data for I2P domains
   * @param {Object} options Cleanup options
   */
  static async cleanBrowsingData(options = {}) {
    const since = this.calculateCleanupTime(
      options.since || PRIVACY_CONFIG.BROWSING_DATA.SINCE
    );

    try {
      const i2pHistory = await browser.history.search({
        text: "i2p",
        startTime: 0,
      });

      for (const item of i2pHistory) {
        if (this.isI2PUrl(item.url)) {
          await this.cleanupForDomain(item.url, since);
        }
      }

      await this.notifyCleanup();
    } catch (error) {
      console.error("Data cleanup failed:", error);
    }
  }

  /**
   * Calculate cleanup timestamp
   * @param {string} timeframe Cleanup timeframe
   * @returns {number} Timestamp
   */
  static calculateCleanupTime(timeframe) {
    const times = {
      hour: () => 1000 * 60 * 60,
      day: () => 1000 * 60 * 60 * 24,
      week: () => 1000 * 60 * 60 * 24 * 7,
      forever: () => 0,
    };

    return timeframe === "forever"
      ? 0
      : Date.now() - (times[timeframe] || times.forever)();
  }

  /**
   * Clean up data for specific domain
   * @param {string} url Domain URL
   * @param {number} since Timestamp
   */
  static async cleanupForDomain(url, since) {
    const hostname = this.extractI2PHostname(url);

    await Promise.all([
      browser.history.deleteUrl({ url }),
      browser.browsingData.removeCache({}),
      browser.browsingData.removePasswords({ hostnames: [hostname], since }),
      browser.browsingData.removeDownloads({ hostnames: [hostname], since }),
      browser.browsingData.removeFormData({ hostnames: [hostname], since }),
      browser.browsingData.removeLocalStorage({ hostnames: [hostname], since }),
    ]);

    await this.cleanupContainerCookies(url);
  }

  /**
   * Clean up container cookies
   * @param {string} url Domain URL
   */
  static async cleanupContainerCookies(url) {
    const containers = await browser.contextualIdentities.query({
      name: PRIVACY_CONFIG.TITLE_PREFACE,
    });

    for (const container of containers) {
      const cookies = await browser.cookies.getAll({
        firstPartyDomain: null,
        storeId: container.cookieStoreId,
      });

      for (const cookie of cookies) {
        await browser.cookies.remove({
          firstPartyDomain: cookie.firstPartyDomain,
          name: cookie.name,
          url: url,
        });
      }
    }
  }

  /**
   * Extract I2P hostname from URL
   * @param {string} url URL to parse
   * @returns {string} I2P hostname
   */
  static extractI2PHostname(url) {
    try {
      const urlObj = new URL(url);
      if (urlObj.host.endsWith(".i2p")) {
        return urlObj.host;
      }

      if (url.includes(".i2p")) {
        const parts = url.split("=");
        for (const part of parts) {
          const items = part.split("%");
          for (const item of items) {
            if (item.includes(".i2p")) {
              return item.replace("3D", "");
            }
          }
        }
      }

      return url.split("/")[2] || url.split("/")[0];
    } catch (error) {
      console.error("Hostname extraction failed:", error);
      return "";
    }
  }

  /**
   * Check if URL is I2P
   * @param {string} url URL to check
   * @returns {boolean}
   */
  static isI2PUrl(url) {
    const hostname = this.extractI2PHostname(url);
    return hostname.split(":")[0].endsWith(".i2p");
  }

  /**
   * Send cleanup notification
   */
  static async notifyCleanup() {
    await browser.notifications.create({
      type: "basic",
      title: "Removed browsing data",
      message: "Cleaned I2P browsing data and history",
    });
  }
}

// Initialize privacy settings
PrivacyManager.applyRecommendedSettings();

// Listen for uninstall
browser.management.onUninstalled.addListener(async (info) => {
  const selfInfo = await browser.management.getSelf();
  if (info.name === selfInfo.name) {
    await PrivacyManager.resetAllSettings();
  }
});

// Listen for messages
browser.runtime.onMessage.addListener(async (message) => {
  switch (message.type) {
    case "cleanupData":
      await DataCleanupManager.cleanBrowsingData(message.options);
      break;
    case "updatePrivacy":
      await PrivacyManager.applyRecommendedSettings();
      break;
  }
});

// Export for testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    PrivacyManager,
    DataCleanupManager,
    PRIVACY_CONFIG,
  };
}
