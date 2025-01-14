/**
 * @fileoverview I2P Host Management Module
 * Handles host verification, routing, and application paths for I2P browser extension
 */

// Constants for URL patterns and ports
const URL_PATTERNS = {
  I2P_SUFFIX: ".i2p",
  PROXY_HOST: "proxy.i2p",
  LOCALHOST: ["localhost", "127.0.0.1"],
  PROTOCOL_PREFIX: "ext+rc:",
};

const PORT_APPLICATIONS = {
  TOR: "7695",
  BLOG: "8084",
  IRC: "7669",
};

const ROUTER_PATHS = {
  TUNNEL_MGR: ["i2ptunnelmgr", "i2ptunnel"],
  TORRENT: ["i2psnark", "torrents", "transmission", "tracker"],
  MAIL: ["webmail", "susimail"],
  MUWIRE: ["MuWire"],
  BOTE: ["i2pbote"],
  CONSOLE: ["home", "console", "dns", "susidns", "config", "sitemap", ""],
};

/**
 * Validates and processes URLs for host checking
 * @param {string|URL|Object} urlInput - URL to process
 * @return {URL} Processed URL object
 * @throws {Error} If URL is invalid
 */
function processURL(urlInput) {
  try {
    if (typeof urlInput === "string") {
      if (!urlInput.startsWith("http")) {
        urlInput = "http://" + urlInput;
      }
      return new URL(urlInput);
    }
    if (urlInput instanceof URL) {
      return urlInput;
    }
    return new URL(urlInput.url);
  } catch (error) {
    console.error("Invalid URL processing:", error);
    throw new Error("Invalid URL format");
  }
}

/**
 * Checks if request is for proxy host
 * @param {Object} requestDetails - Request details object
 * @return {boolean}
 */
function isProxyHost(requestDetails) {
  try {
    const requestUrl = processURL(requestDetails);
    const isProxy = requestUrl.hostname === URL_PATTERNS.PROXY_HOST;
    console.debug("(proxy) proxyinfo check:", requestUrl.hostname, isProxy);
    return isProxy;
  } catch (error) {
    console.error("Proxy host check failed:", error);
    return false;
  }
}

/**
 * Validates if URL points to localhost
 * @param {string|URL} url
 * @return {string|false} Host:port if local, false otherwise
 */
function isLocalHost(url) {
  try {
    const requestUrl = processURL(url);
    if (URL_PATTERNS.LOCALHOST.includes(requestUrl.hostname)) {
      return `${requestUrl.hostname}:${requestUrl.port}`;
    }
    return false;
  } catch (error) {
    console.error("Local host check failed:", error);
    return false;
  }
}

/**
 * Standardizes localhost representation
 * @param {string|URL} url
 * @return {string}
 */
function tidyLocalHost(url) {
  const hostPort = isLocalHost(url);
  if (hostPort) {
    return hostPort.replace("127.0.0.1", "localhost");
  }
  const processedUrl = processURL(url);
  return `${processedUrl.hostname}:${processedUrl.port}`;
}

/**
 * Service-specific host checks
 * @param {string|URL} url
 * @param {string} port
 * @param {string} service
 * @return {string|false}
 */
function checkServiceHost(url, port, service) {
  const host = isLocalHost(url);
  if (!host) {
    return false;
  }
  return host.includes(` : ${port}`) ? service : false;
}

const isTorHost = (url) => checkServiceHost(url, PORT_APPLICATIONS.TOR, "tor");
const isBlogHost = (url) =>
  checkServiceHost(url, PORT_APPLICATIONS.BLOG, "blog");
const isIRCHost = (url) => checkServiceHost(url, PORT_APPLICATIONS.IRC, "irc");

/**
 * Verifies if request comes from extension
 * @param {Object} url - Request URL object
 * @return {boolean}
 */
function isExtensionHost(url) {
  const extensionPrefix = browser.runtime
    .getURL("")
    .replace("moz-extension://", "")
    .replace("/", "");

  const checkUrl = (sourceUrl) => {
    if (!sourceUrl) return false;
    return sourceUrl
      .replace("moz-extension://", "")
      .replace("/", "")
      .startsWith(extensionPrefix);
  };

  return checkUrl(url.originUrl) || checkUrl(url.documentUrl);
}

/**
 * Extracts I2P hostname from URL
 * @param {string|URL} url
 * @returns {string|false}
 */
function i2pHostName(url) {
  try {
    const requestUrl = processURL(url);
    return requestUrl.host.endsWith(URL_PATTERNS.I2P_SUFFIX)
      ? requestUrl.host
      : false;
  } catch (error) {
    console.error("I2P hostname extraction failed:", error);
    return false;
  }
}

/**
 * Validates I2P host
 * @param {Object} url
 * @returns {boolean}
 */
function i2pHost(url) {
  if (isProxyHost(url)) {
    console.warn("(host) proxy.i2p detected");
    return false;
  }
  const requestUrl = processURL(url.url);
  return requestUrl.hostname.endsWith(URL_PATTERNS.I2P_SUFFIX);
}

/**
 * Gets first path element from URL
 * @param {string|URL} url
 * @returns {string}
 */
function getFirstPathElement(url) {
  const requestUrl = processURL(url);
  const path = requestUrl.pathname.replace(/^\/+/, "");
  return path.split("/")[0];
}

/**
 * Identifies application from path
 * @param {string|URL} url
 * @returns {string|boolean}
 */
function getPathApplication(url) {
  const path = getFirstPathElement(url);

  if (ROUTER_PATHS.TUNNEL_MGR.includes(path)) return "i2ptunnelmgr";
  if (ROUTER_PATHS.TORRENT.includes(path)) return "i2psnark";
  if (ROUTER_PATHS.MAIL.includes(path)) return "webmail";
  if (path.startsWith("MuWire")) return "muwire";
  if (path.startsWith("i2pbote")) return "i2pbote";
  if (ROUTER_PATHS.CONSOLE.includes(path)) return "routerconsole";

  console.warn("(host) unknown path:", path);
  return true;
}

/**
 * Verifies router host status
 * @param {string|URL} url
 * @returns {string|boolean}
 */
function isRouterHost(url) {
  try {
    const protocolUrl = identifyProtocolHandler(url);
    if (protocolUrl) {
      return isRouterHost(protocolUrl);
    }

    const requestUrl = processURL(url);
    const { hostname, port } = requestUrl;
    const controlHost = control_host();
    const controlPort = control_port();

    if (
      tidyLocalHost(`${hostname}:${port}`) ===
      tidyLocalHost(`${controlHost}:${controlPort}`)
    ) {
      return getPathApplication(url);
    }
    return false;
  } catch (error) {
    console.error("Router host check failed:", error);
    return false;
  }
}

/**
 * Identifies protocol handler in URL
 * @param {string} url
 * @returns {string|false}
 */
function identifyProtocolHandler(url) {
  const encoded = encodeURIComponent(URL_PATTERNS.PROTOCOL_PREFIX);
  if (url.includes(encoded)) {
    return url.replace(encoded, "");
  }
  if (url.includes(URL_PATTERNS.PROTOCOL_PREFIX)) {
    return url.replace(URL_PATTERNS.PROTOCOL_PREFIX, "");
  }
  return false;
}
