i2psetproxy.js
==============

WebExtension that does extended configuration of a dedicated I2P browser. While
**experimental**, it's capable of enforcing the use of the I2P Proxy without
needing to touch about:config and disables several
fingerprinting/de-anonymization vectors on it's own. It is also the easiest way
to configure an I2P browser on Android without requiring the user to root their
device.

Android usage:
--------------

Open the following link [Github Releases Version](https://github.com/eyedeekay/i2psetproxy.js/releases/download/1.26/i2psetproxy.js@eyedeekay.github.io.xpi)
in the browser you want to use for I2P. Firefox will warn you that it is about
to install an extension and indicate the permissions required. Read them over
and when you're ready, accept them. That's all it should take, your browser is
now configured to use I2P.

### addons.mozilla.org

If you would prefer to recieve automatic updates from AMO, the correct product
page for this plugin is [I2P-proxy](https://addons.mozilla.org/en-US/firefox/addon/I2P-proxy/).
This absolutely requires a working outproxy. If you want to avoid the use of AMO
for updates, you can download the identical plugin from this repository's
releases page. The latest AMO Plugin will always be identical to the latest
github release, except for the version number, which must be incremented for
submission to AMO.

### Features

  * [done] **Indicate** the I2P browser is in use visually
  * [done] **Set** the http proxy to use the local I2P proxy
  * [done] **Disable** risky webRTC features
  * [done] **Change** the color of the browser window to indicate that I2P is in use
  * [done-ish] **Reset** the HTTP Proxy tunnel to generate a new destination on-demand
   * it does this by working in conjunction with this [standalone HTTP proxy](https://github.com/eyedeekay/httptunnel), currently disabled*
  * [ready] **Provide** help in a variety of languages.

### Screenshot

![Visiting i2p-projekt.i2p](i2psetproxy.js.png)
