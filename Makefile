SCRIPTS=src/js/dollar.js src/js/dollar.get.js src/js/dollar.json.js src/js/dollar.form.js src/js/dollar.table.js src/js/dollar.tooltip.js $(wildcard src/js/widgets/*.js)
STYLESHEETS=$(wildcard src/css/*.css src/css/widgets/*.css)

all: release/dollar.min.js release/dollar.min.css
	@echo "\033[32;1mdone\033[0m"

release/dollar.min.js: $(SCRIPTS)
	@echo "\033[33;1m$@, $@.map\033[0m"
	@if [ ! -d release ]; then mkdir release; fi
	@if [ -z "`which uglifyjs`" ]; then echo "\033[31;1mInstall uglifyjs to build this project\033[0m"; exit 1; fi
	@uglifyjs $(SCRIPTS) --compress --mangle --source-map release/dollar.min.js.map > release/dollar.min.js

release/dollar.min.css: $(STYLESHEETS)
	@echo "\033[33;1m$@\033[0m"
	@if [ ! -d release ]; then mkdir release; fi
	@if [ -z "`which php`" ]; then echo "\033[31;1mInstall php to build this project\033[0m"; exit 1; fi
	@cat $(STYLESHEETS) | php opticss2.php > release/dollar.min.css

clean:
	@$(RM) -rf release
