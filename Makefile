
install:
	mkdir -p /usr/share/webext/i2psetproxy.js@eyedeekay.github.io \
		/usr/share/mozilla/extensions/i2psetproxy.js@eyedeekay.github.io
	cp -rv options /usr/share/webext/i2psetproxy.js@eyedeekay.github.io/options
	cp background.js /usr/share/webext/i2psetproxy.js@eyedeekay.github.io
	cp proxy.js /usr/share/webext/i2psetproxy.js@eyedeekay.github.io
	cp manifest.json /usr/share/webext/i2psetproxy.js@eyedeekay.github.io/
	cp README.md /usr/share/webext/i2psetproxy.js@eyedeekay.github.io
	cp LICENSE /usr/share/webext/i2psetproxy.js@eyedeekay.github.io
	ln -sf /usr/share/webext/i2psetproxy.js@eyedeekay.github.io \
		/usr/share/mozilla/extensions/{ec8030f7-c20a-464f-9b0e-13a3a9e97384}/i2psetproxy.js@eyedeekay.github.io

uninstall:
	rm -rf /usr/share/webext/i2psetproxy.js/i2psetproxy.js@eyedeekay.github.io \
		/usr/share/mozilla/extensions/{ec8030f7-c20a-464f-9b0e-13a3a9e97384}/i2psetproxy.js@eyedeekay.github.io

zip:
	zip -r -FS ../i2psetproxy.js.zip *

clobber:
	rm -f ../i2psetproxy.js.zip ../i2p_proxy*.xpi

xpi:
	mv ../i2p_proxy*.xpi ../i2psetproxy.js@eyedeekay.github.io.xpi

cp:
	cp ../i2psetproxy.js@eyedeekay.github.io.xpi ./i2psetproxy.js@eyedeekay.github.io.xpi
