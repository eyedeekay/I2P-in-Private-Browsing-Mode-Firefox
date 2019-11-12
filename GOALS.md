These are the goals of the I2P Browser, and not really this plugin in-and-of-itself
===================================================================================

A

User Interface:
---------------

 * Remove search engines
 * Replace bookmarks
 * Donate banner / UI
 * Patch Firefox to have relative (from the binary) profile directory
 * Start use the Firefox update process to update browser installations
 * Mark .i2p cookies as secure
 * Mark .i2p domains as secure connection
 * Add tests for .i2p secure marking
 * Improve the delay-the-user XUL dialogs to be more accurate in regards
  of where the router is in it’s bootup progress
 * Disable the WebIDE
 * Disable GamePad API by default
 * Disable Web Speech API by default
 * Disable the Web Audio API by default
 * UI redesign bootstrapping and configuration screens (delay-the-user dialogs)
 * Default browser choose wining should de disabled like
  browser.shell.checkDefaultBrowser, it can be default, but then
  choosen by the user without any begging ahead
 * Extend the firefox preferences UI for I2P router configuration thought
  of as "must have" or "very nice to have"
 * Shrink the BroadcastChannel API's boundaries of access or disable completely
 * Make a API white/grey/black -list, in super paranoia mode we should
  probably disable almost all, while in most cases the user probably want
  to be as close to a normal browser/web experinence that
  they are used to from before

Leak Avoidance:
---------------

 * Stop web socket DNS leak
 * If doable, slim down the CA store from unnecessary CAs
 * Disable the microphone by default
 * Ensure WebRTC is disabled in compile time
 * Disable mDNS features
 * Ensure links like sftp:// and smb:// ,
  as well as \\samba-share is blocked/denied
 * Don’t allow IndexedDB storage for third party domains (likability issue)
 * Patch the DNS service to prevent any browser or addon DNS resolution
 * Restrict what MIME types that are exposed to content scripts

General Security:
-----------------

 * Backport any security patches that might appear from Mozilla
 * Don’t allow XHR/Websockets requests towards 127.0.0.1/localhost
 * Always use the  most sane form of preferences defaults in context
  of privacy and security.

Unnecessary Connections:
------------------------

 * Disable getpocket.com features and alike
 * Remove sync option from preferences
 * Clear state when the app exits, by default
 * Disable updater telemetry
 * Make firefox stop call home to mozilla for different reasons
 * Prevent non-Necko network connections
 * Figure out how to approach prerender, preconnect, and prefetch link tags

Disk Avoidance:
---------------

 * Don’t allow SSL key logging
 * Only cache media in memory
 * Disable the password saving functionality to avoid such being written to disk
 * Disable the Auto form-fill to keep as much as possible not written to disk

Platforms:
----------

 * Support for Android?
 * Support for iOS?

Anti-Fingerprinting:
--------------------

 * Test for preferences which ensures a sane default and
  something to tell when/if we break it
 * Disable support for system adding
 * Disable Firefox enterprise policies
 * Disable NTLM authentication
 * Disable SPNEGO authentication
 * Handle privacy issues regarding window.name
 * Test runner for I2P Browser test cases
 * Block loading of plugins
 * Disable OS spesific firefox features that can help fingerprint
  the end user's operating system
 * Block html5 canvas by default
 * Block by default or disable WebGL completely?
 * Never start fullscreen, always start with fixed width/height to
  avoid expose screen resolution
 * Report fake system uptime to content scripts
 * Spoof Accept-Language and Accept-Charset headers no matter browser language
 * Spoof timezone to always be UTC
 * Develop methods to reduce the accuracy of JavaScript
  performance fingerprinting
 * Always report only one CPU core (dom.maxHardwareConcurrencys)
 * Avoid Keystroke fingerprinting by messing with the event resolution
 * Disable GeoIP-based search results

???
---

 * SVG drawing
 * MathML drawing
 * I2Pd flavor
