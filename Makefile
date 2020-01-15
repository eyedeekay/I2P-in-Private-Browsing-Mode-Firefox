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
	cp ./*.png $(PREFIX)/share/webext/i2ppb@eyedeekay.github.io/
	cp ./*.torrent $(PREFIX)/share/webext/i2ppb@eyedeekay.github.io/
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

MOZ_VERSION=0.56
VERSION=0.57

## INCREMENT THIS EVERY TIME YOU DO A RELEASE
LAST_VERSION=0.55

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
		grep -v '<img' > amo-index.html

MAGNET=`torrent2magnet i2ppb@eyedeekay.github.io.xpi.torrent`

index:
	@echo "<!DOCTYPE html>" > index.html
	@echo "<html>" >> index.html
	@echo "<head>" >> index.html
	@echo "  <title>I2P in Private Browsing Mode</title>" >> index.html
	@echo "  <link rel=\"stylesheet\" type=\"text/css\" href =\"home.css\" />" >> index.html
	@echo "  <link rel=\"stylesheet\" type=\"text/css\" href =\"sidebar.css\" />" >> index.html
	@echo "</head>" >> index.html
	@echo "<body>" >> index.html
	sed "s|magnetsub|[Magnet Link]($(MAGNET))|g" README.md | markdown >> index.html
	@echo "</body>" >> index.html
	@echo "</html>" >> index.html


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
	sed -i 's|$(shell grep "\"version\": " manifest.json)|  \"version\": \"$(VERSION)1\",|g' manifest.json
	sed -i 's|$(shell grep "\"version_name\": " manifest.json)|  \"version_name\": \"$(VERSION)1-rhizome\",|g' manifest.json
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
		--exclude="./.git" \
		--exclude="*/*.xpi" \
		--exclude="web-ext-artifacts" \
		--exclude="./*.pdf" -r -FS ../i2psetproxy.js.zip *

release:
	cat desc debian/changelog | grep -B 10 "$(LAST_VERSION)" | gothub release -p -u eyedeekay -r I2P-in-Private-Browsing-Mode-Firefox -t $(VERSION) -n $(VERSION) -d -; true

delete-release:
	gothub delete -u eyedeekay -r I2P-in-Private-Browsing-Mode-Firefox -t $(VERSION); true

recreate-release: delete-release release upload

upload: upload-xpi upload-deb

full-release: release submit deb upload torrent upload-torrent

WEB_EXT_API_KEY=AMO_KEY
WEB_EXT_API_SECRET=AMO_SECRET


-include ../api_keys_moz.mk

tk:
	echo $(WEB_EXT_API_KEY)

submit: moz-sign rhz-submit moz-submit

clean-artifacts:
	rm -fr web-ext-artifacts/*

##ODD NUMBERED, SELF-DISTRIBUTED VERSIONS HERE!
moz-sign: version clean-artifacts
	@echo "Using the 'sign' target to instantly sign an extension for self-distribution"
	@echo "requires a JWT API Key and Secret from addons.mozilla.org to be made available"
	@echo "to the Makefile under the variables WEB_EXT_API_KEY and WEB_EXT_API_SECRET."
	web-ext-submit --channel unlisted --config-discovery false --api-key $(WEB_EXT_API_KEY) --api-secret $(WEB_EXT_API_SECRET); true
	make copyss
	sleep 5

copyss:
	cp web-ext-artifacts/*.xpi ./i2ppb@eyedeekay.github.io.xpi; true

##EVEN NUMBERED, MOZILLA-DISTRIBUTED VERSIONS HERE!
moz-submit: moz-version
	@echo "Using the 'submit' target to instantly sign an extension for Mozilla distribution"
	@echo "requires a JWT API Key and Secret from addons.mozilla.org to be made available"
	@echo "to the Makefile under the variables WEB_EXT_API_KEY and WEB_EXT_API_SECRET."
	web-ext sign --channel listed --config-discovery false --api-key $(WEB_EXT_API_KEY) --api-secret $(WEB_EXT_API_SECRET); true
	sleep 5

rhz-submit: rhz-version
	@echo "Rhizome releases are disabled while browser is completed."
	#@echo "Using the 'sign' target to instantly sign an extension for self-distribution"
	#@echo "requires a JWT API Key and Secret from addons.mozilla.org to be made available"
	#@echo "to the Makefile under the variables WEB_EXT_API_KEY and WEB_EXT_API_SECRET."
	#web-ext-submit --channel unlisted --config-discovery false --api-key $(WEB_EXT_API_KEY) --api-secret $(WEB_EXT_API_SECRET); true
	#cp web-ext-artifacts/*.xpi ./i2ppb@eyedeekay.github.io.xpi

getxpi:
	gothub download -t $(VERSION) -u eyedeekay -r I2P-in-Private-Browsing-Mode-Firefox -n "i2ppb@eyedeekay.github.io.xpi"

torrent: getxpi
	rm -f "./i2ppb-$(VERSION)@eyedeekay.github.io.xpi.torrent"
	mktorrent -a http://zviyq72xcmjupynn5y2f5qa3u7bxyu34jnqmwt6czte2l7idxm7q.b32.i2p/announce \
		-a http://s5ikrdyjwbcgxmqetxb3nyheizftms7euacuub2hic7defkh3xhq.b32.i2p/a \
		-a http://uajd4nctepxpac4c4bdyrdw7qvja2a5u3x25otfhkptcjgd53ioq.b32.i2p/announce \
		-a http://w7tpbzncbcocrqtwwm3nezhnnsw4ozadvi2hmvzdhrqzfxfum7wa.b32.i2p/a \
		-a http://explodie.org:6969/announce \
		-a http://tracker.opentrackr.org:1337/announce \
		-a http://tracker.kamigami.org:2710/announce \
		-a http://tracker.internetwarriors.net:1337/announce \
		-a http://tracker.darli.net:6611/announce \
		-a http://tracker.corpscorp.online:80/announce \
		-a http://tracker.bz:80/announce \
		-a http://tracker.bt4g.com:2095/announce \
		-a http://retracker.sevstar.net:2710/announce \
		-a http://h4.trakx.nibba.trade:80/announce \
		-a http://www.proxmox.com:6969/announce \
		-a http://www.loushao.net:8080/announce \
		-a http://vps02.net.orel.ru:80/announce \
		-a http://tracker4.itzmx.com:2710/announce \
		-a http://tracker3.itzmx.com:6961/announce \
		-a http://tracker2.itzmx.com:6961/announce \
		-a http://tracker1.itzmx.com:8080/announce \
		-a http://tracker01.loveapp.com:6789/announce \
		-a http://tracker.zerobytes.xyz:1337/announce \
		-a http://tracker.yoshi210.com:6969/announce \
		-a http://tracker.torrentyorg.pl:80/announce \
		-a http://tracker.nyap2p.com:8080/announce \
		-a http://tracker.lelux.fi:80/announce \
		-a http://tracker.gbitt.info:80/announce \
		-a http://pow7.com:80/announce \
		-a http://opentracker.i2p.rocks:6969/announce \
		-a http://open.acgtracker.com:1096/announce \
		-a http://open.acgnxtracker.com:80/announce \
		-a http://mail2.zelenaya.net:80/announce \
		-a http://acg.rip:6699/announce \
		-n "./i2ppb-$(VERSION)@eyedeekay.github.io.xpi" \
		-o "./i2ppb-$(VERSION)@eyedeekay.github.io.xpi.torrent" \
		-w https://github.com/eyedeekay/I2P-in-Private-Browsing-Mode-Firefox/releases/download/$(VERSION)/i2ppb@eyedeekay.github.io.xpi \
		i2ppb@eyedeekay.github.io.xpi; true
	ln -sf "./i2ppb-$(VERSION)@eyedeekay.github.io.xpi.torrent" "./i2ppb@eyedeekay.github.io.xpi.torrent"
	make index

upload-torrent:
	gothub upload -R -u eyedeekay -r I2P-in-Private-Browsing-Mode-Firefox -t $(VERSION) -n "i2ppb@eyedeekay.github.io.xpi.torrent" -f "./i2ppb-$(VERSION)@eyedeekay.github.io.xpi.torrent"

upload-xpi:
	gothub upload -R -u eyedeekay -r I2P-in-Private-Browsing-Mode-Firefox -t $(VERSION) -n "i2ppb@eyedeekay.github.io.xpi" -f "./i2ppb@eyedeekay.github.io.xpi"

upload-deb:
	gothub upload -R -u eyedeekay -r I2P-in-Private-Browsing-Mode-Firefox -t $(VERSION) -n "i2psetproxy.js_$(VERSION)-1_amd64.deb" -f "../i2psetproxy.js_$(VERSION)-1_amd64.deb"
	gothub upload -R -u eyedeekay -r I2P-in-Private-Browsing-Mode-Firefox -t $(VERSION) -n "i2psetproxy.js_$(VERSION).orig.tar.gz" -f "../i2psetproxy.js_$(VERSION).orig.tar.gz"
	gothub upload -R -u eyedeekay -r I2P-in-Private-Browsing-Mode-Firefox -t $(VERSION) -n "i2psetproxy.js_$(VERSION)-1.debian.tar.xz" -f "../i2psetproxy.js_$(VERSION)-1.debian.tar.xz"
	gothub upload -R -u eyedeekay -r I2P-in-Private-Browsing-Mode-Firefox -t $(VERSION) -n "i2psetproxy.js_$(VERSION)-1.dsc" -f "../i2psetproxy.js_$(VERSION)-1.dsc"
	gothub upload -R -u eyedeekay -r I2P-in-Private-Browsing-Mode-Firefox -t $(VERSION) -n "i2psetproxy.js_$(VERSION)-1_amd64.changes" -f "../i2psetproxy.js_$(VERSION)-1_amd64.changes"
	gothub upload -R -u eyedeekay -r I2P-in-Private-Browsing-Mode-Firefox -t $(VERSION) -n "i2psetproxy.js_$(VERSION)-1_amd64.buildinfo" -f "../i2psetproxy.js_$(VERSION)-1_amd64.buildinfo"

upload-docs:
	gothub release -p -u eyedeekay -r I2P-in-Private-Browsing-Mode-Firefox -t docs -n "Documentation" -d "PDF's and text about the extension"; true
	gothub upload -R -u eyedeekay -r I2P-in-Private-Browsing-Mode-Firefox -t docs -n "Landing Page Documentation.pdf" -f ../smartlander.pdf
	gothub upload -R -u eyedeekay -r I2P-in-Private-Browsing-Mode-Firefox -t docs -n "Browser Design Documentation.pdf" -f ../browser.pdf

fmt:
	cleancss -O1 all -O2 all --format beautify home.css -o .home.css && mv .home.css home.css
	cleancss -O1 all -O2 all --format beautify info.css -o .info.css && mv .info.css info.css
	cleancss -O1 all -O2 all --format beautify search.css -o .search.css && mv .search.css search.css
	cleancss -O1 all -O2 all --format beautify sidebar.css -o .sidebar.css && mv .sidebar.css sidebar.css
	cleancss -O1 all -O2 all --format beautify options/options.css -o options/.options.css && mv options/.options.css options/options.css
	tidy --as-xhtml --drop-empty-elements no --input-xml --tidy-mark no -indent --indent-spaces 4 -wrap 0 --new-blocklevel-tags article,header,footer --new-inline-tags video,audio,canvas,ruby,rt,rp --break-before-br yes --sort-attributes alpha --vertical-space yes index.html > .index.html; mv .index.html index.html
	tidy --as-xhtml --drop-empty-elements no --input-xml --tidy-mark no -indent --indent-spaces 4 -wrap 0 --new-blocklevel-tags article,header,footer --new-inline-tags video,audio,canvas,ruby,rt,rp --break-before-br yes --sort-attributes alpha --vertical-space yes window.html > .window.html; mv .window.html window.html
	tidy --as-xhtml --drop-empty-elements no --input-xml --tidy-mark no -indent --indent-spaces 4 -wrap 0 --new-blocklevel-tags article,header,footer --new-inline-tags video,audio,canvas,ruby,rt,rp --break-before-br yes --sort-attributes alpha --vertical-space yes home.html > .home.html; mv .home.html home.html
	tidy --as-xhtml --drop-empty-elements no --input-xml --tidy-mark no -indent --indent-spaces 4 -wrap 0 --new-blocklevel-tags article,header,footer --new-inline-tags video,audio,canvas,ruby,rt,rp --break-before-br yes --sort-attributes alpha --vertical-space yes toopie.html > .toopie.html; mv .toopie.html toopie.html
	tidy --as-xhtml --drop-empty-elements no --input-xml --tidy-mark no -indent --indent-spaces 4 -wrap 0 --new-blocklevel-tags article,header,footer --new-inline-tags video,audio,canvas,ruby,rt,rp --break-before-br yes --sort-attributes alpha --vertical-space yes options/options.html > options/.options.html; mv options/.options.html options/options.html
	find . -path ./node_modules -prune -o -name '*.js' -exec prettier --write {} \;
	find . -path ./node_modules -prune -o -name '*.json' -exec prettier --write {} \;

lint:
	fixjsstyle *.js
	gjslint *.js; true
	#eslint --color *.js

deborig: fmt version
	rm -rf ../i2psetproxy.js-$(VERSION)
	cp -r . ../i2psetproxy.js-$(VERSION)
	cd ../i2psetproxy.js-$(VERSION) && \
	rm -rf web-ext-artifacts && \
	tar \
		-cvz \
		--exclude=.git \
		--exclude=i2psetproxy.js.gif \
		--exclude=node_modules \
		--exclude=web-ext-artifacts \
		--exclude=*.xpi \
		--exclude=*/*.xpi \
		--exclude=*.pdf \
		-f ../i2psetproxy.js_$(VERSION).orig.tar.gz \
		.

deb: deborig
	cd ../i2psetproxy.js-$(VERSION) && debuild -us -uc -rfakeroot

-include mirrors.mk

dat:
	wget -c -O dat.js https://bundle.run/dat-js

rss: torrent
	rm -f releases.diff
	grep "$(MAGNET)" .releases.atom && false || true
	mv releases.atom .releases.atom
	wget https://github.com/eyedeekay/I2P-in-Private-Browsing-Mode-Firefox/releases.atom
	diff releases.atom .releases.atom | tee releases.diff
	patch releases.atom <releases.diff
	sed -i "s|<title>$(VERSION)</title>|<title>$(VERSION)</title>\n    <enclosure url=\"$(MAGNET)\" type=\"application/x-bittorrent\" />|g" releases.atom

upload-rss:
	gothub upload -R -u eyedeekay -r I2P-in-Private-Browsing-Mode-Firefox -t docs -n "releases.atom" -f releases.atom

