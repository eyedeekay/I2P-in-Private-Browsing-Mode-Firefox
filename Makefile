PREFIX:=/usr

default: zip

install: uninstall
	mkdir -p $(PREFIX)/share/webext/i2ppb@eyedeekay.github.io \
		$(PREFIX)/share/webext/i2ppb@eyedeekay.github.io/i2pcontrol \
		$(PREFIX)/share/mozilla/extensions/{ec8030f7-c20a-464f-9b0e-13a3a9e97384}
	cp -r ./icons/ $(PREFIX)/share/webext/i2ppb@eyedeekay.github.io/
	cp -r ./_locales/ $(PREFIX)/share/webext/i2ppb@eyedeekay.github.io/
	cp -r ./options/ $(PREFIX)/share/webext/i2ppb@eyedeekay.github.io/
	cp ./*.js $(PREFIX)/share/webext/i2ppb@eyedeekay.github.io/
	cp ./i2pcontrol/i2pcontrol.js $(PREFIX)/share/webext/i2ppb@eyedeekay.github.io/i2pcontrol/i2pcontrol.js
	cp ./*.html $(PREFIX)/share/webext/i2ppb@eyedeekay.github.io/
	cp ./*.css $(PREFIX)/share/webext/i2ppb@eyedeekay.github.io/
	cp ./*.md $(PREFIX)/share/webext/i2ppb@eyedeekay.github.io/
	cp ./*.xpi $(PREFIX)/share/webext/i2ppb@eyedeekay.github.io/
	cp ./manifest.json $(PREFIX)/share/webext/i2ppb@eyedeekay.github.io/
	cp ./LICENSE $(PREFIX)/share/webext/i2ppb@eyedeekay.github.io/
	ln -s $(PREFIX)/share/webext/i2ppb@eyedeekay.github.io \
		$(PREFIX)/share/mozilla/extensions/{ec8030f7-c20a-464f-9b0e-13a3a9e97384}

uninstall:
	rm -rf $(PREFIX)/share/webext/i2ppb@eyedeekay.github.io \
		$(PREFIX)/share/webext/i2psetproxy.js@eyedeekay.github.io \
		$(PREFIX)/share/mozilla/extensions/{ec8030f7-c20a-464f-9b0e-13a3a9e97384}


ls:
	ls -lah $(PREFIX)/share/webext/i2ppb@eyedeekay.github.io; \
	ls -lah $(PREFIX)/share/mozilla/extensions/{ec8030f7-c20a-464f-9b0e-13a3a9e97384}

clean:
	rm -fr ../i2psetproxy.js.zip ../i2p_proxy*.xpi ../i2p*.xpi #../i2psetproxy.js_*.*

## EVEN RELEASES are AMO RELEASES
## ODD RELEASES are SELFHOSTED RELEASES

MOZ_VERSION=0.48
VERSION=0.49
#VERSION=$(MOZ_VERSION)
#VERSION=1.27

YELLOW=F7E59A
ORANGE=FFC56D
GREY=D9D9D6
BLUE=A4C8E1
PURPLE=A48fE1

colors:
	@echo " yellow $(YELLOW) \n orange $(ORANGE) \n grey $(GREY) \n blue $(BLUE) \n purple $(PURPLE)"

amo-readme:
	markdown README.md | \
		sed 's|<p>||g' | \
		sed 's|</p>||g' | \
		sed 's|<h1>|<strong>|g' | \
		sed 's|</h1>|</strong>|g' | \
		sed 's|<h2>|<strong>|g' | \
		sed 's|</h2>|</strong>|g' | \
		sed 's|<h3>|<strong>|g' | \
		sed 's|</h3>|</strong>|g' | \
		grep -v '<img' > index.html

xpi:
	#wget -O ../i2ppb@eyedeekay.github.io.xpi \
		#https://addons.mozilla.org/firefox/downloads/file/3419789/i2psetproxyjs-$(MOZ_VERSION)-an+fx.xpi
	#cp ../i2ppb@eyedeekay.github.io.xpi ./i2ppb@eyedeekay.github.io.xpi
	cp ~/Downloads/i2p_in_private_browsing-$(VERSION)-an+fx.xpi ./i2ppb@eyedeekay.github.io.xpi

version:
	sed -i 's|7647|7657|g' *.js* */*.js*
	sed -i 's|$(shell grep "\"version\": " manifest.json)|  \"version\": \"$(VERSION)\",|g' manifest.json
	sed -i 's|$(shell grep "\"version_name\": " manifest.json)|  \"version_name\": \"$(VERSION)\",|g' manifest.json

moz-version:
	sed -i 's|7647|7657|g' *.js* */*.js*
	sed -i 's|$(shell grep "\"version\": " manifest.json)|  \"version\": \"$(MOZ_VERSION)\",|g' manifest.json
	sed -i 's|$(shell grep "\"version_name\": " manifest.json)|  \"version_name\": \"$(MOZ_VERSION)\",|g' manifest.json

rhz-version:
	sed -i 's|$(shell grep "\"version\": " manifest.json)|  \"version\": \"$(VERSION)\",|g' manifest.json
	sed -i 's|$(shell grep "\"version_name\": " manifest.json)|  \"version_name\": \"$(VERSION)-rhizome\",|g' manifest.json
	sed -i 's|7657|7647|g' *.js* */*.js*

zip: version
	zip --exclude="./i2ppb@eyedeekay.github.io.xpi" \
		--exclude="./i2psetproxy.js@eyedeekay.github.io.xpi" \
		--exclude="./i2psetproxy.js.png" \
		--exclude="./i2psetproxy.js.gif" \
		--exclude="./package.json" \
		--exclude="./package-lock.json" \
		--exclude="./.node_modules" \
		--exclude="./node_modules" \
		--exclude="./.git" -r -FS ../i2psetproxy.js.zip *

release:
	cat desc debian/changelog | gothub release -p -u eyedeekay -r i2psetproxy.js -t $(VERSION) -n $(VERSION) -d -

delete-release:
	gothub delete -u eyedeekay -r i2psetproxy.js -t $(VERSION); true

recreate-release: delete-release release upload

upload: upload-xpi upload-deb


WEB_EXT_API_KEY=AMO_KEY
WEB_EXT_API_SECRET=AMO_SECRET


-include ../api_keys_moz.mk

tk:
	echo $(WEB_EXT_API_KEY)

submit: moz-sign rhz-submit moz-submit

##ODD NUMBERED, SELF-DISTRIBUTED VERSIONS HERE!
moz-sign: version
	@echo "Using the 'sign' target to instantly sign an extension for self-distribution"
	@echo "requires a JWT API Key and Secret from addons.mozilla.org to be made available"
	@echo "to the Makefile under the variables WEB_EXT_API_KEY and WEB_EXT_API_SECRET."
	web-ext-submit --channel unlisted --config-discovery false --api-key $(WEB_EXT_API_KEY) --api-secret $(WEB_EXT_API_SECRET); true
	cp web-ext-artifacts/*.xpi ./i2ppb@eyedeekay.github.io.xpi

##EVEN NUMBERED, MOZILLA-DISTRIBUTED VERSIONS HERE!
moz-submit: moz-version
	@echo "Using the 'submit' target to instantly sign an extension for Mozilla distribution"
	@echo "requires a JWT API Key and Secret from addons.mozilla.org to be made available"
	@echo "to the Makefile under the variables WEB_EXT_API_KEY and WEB_EXT_API_SECRET."
	web-ext sign --channel listed --config-discovery false --api-key $(WEB_EXT_API_KEY) --api-secret $(WEB_EXT_API_SECRET); true

rhz-submit: rhz-version
	@echo "Using the 'sign' target to instantly sign an extension for self-distribution"
	@echo "requires a JWT API Key and Secret from addons.mozilla.org to be made available"
	@echo "to the Makefile under the variables WEB_EXT_API_KEY and WEB_EXT_API_SECRET."
	web-ext-submit --channel unlisted --config-discovery false --api-key $(WEB_EXT_API_KEY) --api-secret $(WEB_EXT_API_SECRET); true
	#cp web-ext-artifacts/*.xpi ./i2ppb@eyedeekay.github.io.xpi

upload-xpi:
	gothub upload -R -u eyedeekay -r i2psetproxy.js -t $(VERSION) -n "i2ppb@eyedeekay.github.io.xpi" -f "./i2ppb@eyedeekay.github.io.xpi"

upload-deb:
	gothub upload -R -u eyedeekay -r i2psetproxy.js -t $(VERSION) -n "i2psetproxy.js_$(VERSION)-1_amd64.deb" -f "../i2psetproxy.js_$(VERSION)-1_amd64.deb"
	gothub upload -R -u eyedeekay -r i2psetproxy.js -t $(VERSION) -n "i2psetproxy.js_$(VERSION).orig.tar.gz" -f "../i2psetproxy.js_$(VERSION).orig.tar.gz"
	gothub upload -R -u eyedeekay -r i2psetproxy.js -t $(VERSION) -n "i2psetproxy.js_$(VERSION)-1.debian.tar.xz" -f "../i2psetproxy.js_$(VERSION)-1.debian.tar.xz"
	gothub upload -R -u eyedeekay -r i2psetproxy.js -t $(VERSION) -n "i2psetproxy.js_$(VERSION)-1.dsc" -f "../i2psetproxy.js_$(VERSION)-1.dsc"
	gothub upload -R -u eyedeekay -r i2psetproxy.js -t $(VERSION) -n "i2psetproxy.js_$(VERSION)-1_amd64.changes" -f "../i2psetproxy.js_$(VERSION)-1_amd64.changes"
	gothub upload -R -u eyedeekay -r i2psetproxy.js -t $(VERSION) -n "i2psetproxy.js_$(VERSION)-1_amd64.buildinfo" -f "../i2psetproxy.js_$(VERSION)-1_amd64.buildinfo"

fmt:
	cleancss -O1 all -O2 all --format beautify home.css -o .home.css && mv .home.css home.css
	cleancss -O1 all -O2 all --format beautify info.css -o .info.css && mv .info.css info.css
	#find . -path ./node_modules -prune -o -name '*.css' -exec cleancss -O1 --format beautify {} \;
	find . -path ./node_modules -prune -o -name '*.js*' -exec prettier --write {} \;

lint:
	eslint --fix *.js

deborig:
	rm -rf ../i2psetproxy.js-$(VERSION)
	cp -r . ../i2psetproxy.js-$(VERSION)
	tar \
		-cvz \
		--exclude=.git \
		--exclude=i2psetproxy.js.gif \
		--exclude=node_modules \
		-f ../i2psetproxy.js_$(VERSION).orig.tar.gz \
		.

deb: deborig
	cd ../i2psetproxy.js-$(VERSION) && debuild -us -uc -rfakeroot

-include mirrors.mk

dat:
	wget -c -O dat.js https://bundle.run/dat-js