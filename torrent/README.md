Acknowledgement
===============

**Many, many thanks to the [Transmitter](https://github.com/myfreeweb/transmitter)
webextension.**

This part of this plugin contains code which was adapted from the Transmitter
webextension, which is a minimal interface to the transmission-rpc interfaces of
many torrent clients, including for our purposes snark-rpc and BiglyBT.

Transmitter is released under the UNLICENSE. An original copy is available at
this URL: https://github.com/myfreeweb/transmitter/blob/master/UNLICENSE

A copy has also been included in this directory.

Configuring this extension for use with Snark-RPC!
--------------------------------------------------

One of the coolest things this extension is able to do is communicate with
a transmission-rpc enabled torrent client. Since it's an I2P focused plugin,
the default configuration is set up for use with the I2PSnark-RPC plugin created
by zzz. Since Snark-RPC isn't part of the main Java I2P distribution, in order
to do this you'll have to install the plugin. You can get a copy of it from
inside of I2P here:

 * [stats.i2p main package](http://stats.i2p/i2p/plugins/i2psnark-rpc.su3)
 * [stats.i2p update package](http://stats.i2p/i2p/plugins/i2psnark-rpc-update.su3)

I also have a mirror of the package with each release of the webextension,
reflecting the version in use in the webextension at the time of the release.

To install the plugin, go to [http://127.0.0.1:7657/configplugins](http://127.0.0.1:7657/configplugins)
and scroll down to the section of the page where it says "Installation from URL"
and paste the following URL:

```http://stats.i2p/i2p/plugins/i2psnark-rpc.su3```

Click the "Install Plugin" button and you'll be ready to go. Now, open the
extension options menu, and just click "Save." The defaults are correct for use
with I2PSnark-RPC, but they need to be initialized by saving the settings. If
I2PSnark-RPC becomes part of Java I2P, these defaults will be initialized when
the plugin is installed.
