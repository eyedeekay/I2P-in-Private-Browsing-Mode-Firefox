i2psetproxy.js
==============

WebExtension that does extended configuration of a dedicated i2p browser. It's
still not good enough to use on it's own, but except for internationalization
it does what it's supposed to do on it's own.

Features
--------

  * [done] **Indicate** the i2p browser is in use verbally and symbolically.
  * [done] **Set** the http proxy to use the local i2p proxy
  * [done] **Disable** risky webRTC features
  * [done] **Change** the color of the browser window to indicate that i2p is in use
  * [done] **Reset** the HTTP Proxy tunnel to generate a new destination on-demand
   * it does this by working in conjunction with this [standalone HTTP proxy](https://github.com/eyedeekay/httptunnel)*
  * [started] **Provide** help in a variety of languages.

Usage with standalone HTTP Proxy
--------------------------------

I developed a simple HTTP proxy that can be used with this extension to enable the
user to initiate a re-start of the HTTP proxy tunnel, with a new set of keys and a
new destination. This, combined with re-setting the browser settings back to the
original defaults(which is also done by the HTTP Proxy when re-initiated), amounts
to a "Fresh Identity" feature for the I2P browser.

Screenshot
----------

![Visiting i2p-projekt.i2p](i2psetproxy.js.png)
