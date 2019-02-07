
install:
	mkdir -p /usr/share/webext/i2psetproxy.js \
		/usr/share/mozilla/extensions/i2psetproxy.js/ \
		/usr/share/chromium/extensions/
	install background.js /usr/share/webext/i2psetproxy.js
	install proxy.js /usr/share/webext/i2psetproxy.js
	install manifest.json /usr/share/webext/i2psetproxy.js/
	install README.md /usr/share/webext/i2psetproxy.js
	install LICENSE /usr/share/webext/i2psetproxy.js
	ln -sf /usr/share/webext/i2psetproxy.js \
		/usr/share/chromium/extensions/i2psetproxy.js
	ln -sf /usr/share/webext/i2psetproxy.js \
		/usr/share/mozilla/extensions/i2psetproxy.js/i2psetproxy.js

uninstall:
	rm -rf /usr/share/webext/i2psetproxy.js \
		/usr/share/mozilla/extensions/i2psetproxy.js/i2psetproxy.js \
		/usr/share/chromium/extensions/i2psetproxy.js

zip:
	zip -r -FS ../i2psetproxy.js.zip *

clobber:
	rm -f ../i2psetproxy.js.zip ../i2p_proxy*.xpi
