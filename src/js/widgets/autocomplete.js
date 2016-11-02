(function ($) {
	$.widgets.autocomplete = function (input, options, display_text, settings) {
		if (!$.defined (settings)) settings = {};
		input.attr ('type', 'hidden');
		var display = $('<input/>');
		input.next (display);
		var popup = $('<div/>');
		popup.addClass ('dollar-widget-autocomplete');
		if (settings.autocomplete_only) {
			popup.addClass ('dollar-widget-autocomplete-only');
		}
		popup.css ('position', 'absolute');
		popup.css ('margin-top', '2.5em');
		popup.css ('display', 'none');
		display.prev (popup);
		display.event ('blur', function () {
			setTimeout (function () {
				if (popup.css ('display') != 'none') {
					popup.css ('display', 'none');
					if (input.val () == '') {
						display.val ('');
					}
				}
			}, 1);
		});
		var queue = 0;
		var count = 0;
		var render_results = function (results) {
			popup.empty ();
			count = 0;
			popup.results = [];
			popup.selection = -1;
			for (var i in results) {
				var result = $('<div/>');
				result.addClass ('dollar-widget-autocomplete-result');
				result.text (results[i]);
				(function (i) {
					result.mousedown (function (e) {
						e.preventDefault ();
						popup.hide ();
						display.val (results[i]);
						last_search = simplify (display.val ());
						input.val (i);
						input.trigger ('change');
					});
				}) (i);
				popup.append (result);
				popup.results.push ({value: i, text: results[i]});
				count++;
				if (count == 20) {
					break;
				}
			}
			if (count) {
				popup.show ();
			} else {
				popup.hide ();
			}
			if (count == 1) {
				for (var i in results) {
					input.val (i);
					//input.trigger ('change');
				}
			}
			if (queue) {
				queue--;
				if (queue) {
					queue = 0;
					search ();
				}
			}
		};
		var last_search = false;
		function simplify (text) {
			return text.toLowerCase ().replace (new RegExp ('(^ *)|( *$)','g'), '')
		}
		var search = function () {
			var text = simplify (display.val ());
			if (text === last_search) {
				return;
			}
			if (settings.autocomplete_only) {
				input.val (display.val ());
			} else {
				input.val ('');
			}
			if (typeof (options) == 'function') {
				queue++;
				if (queue == 1) {
					options (text, function (results) {
						last_search = text;
						render_results (results);
					});
				}
			} else {
				var results = {};
				for (var i in options) {
					if (options[i].toLowerCase().indexOf (text) >= 0) {
						results[i] = options[i];
					}
				}
				last_search = text;
				render_results (results);
			}
		};
		display.keydown (function (e) {
			switch (e.keyCode) {
			case 38:
			case 40:
			case 13:
			case 27:
				e.preventDefault ();
			}
		});
		popup.mousemove (function () {
			popup.children().removeClass ('dollar-widget-autocomplete-result-focus');
		});
		display.keyup (function (e) {
			if (popup.results && popup.results.length) {
				switch (e.keyCode) {
				case 38:
					popup.selection--;
					if (popup.selection < 0) popup.selection = 0;
					popup.children().removeClass ('dollar-widget-autocomplete-result-focus');
					popup.children()[popup.selection].addClass ('dollar-widget-autocomplete-result-focus');
					e.preventDefault ();
					return;
				case 40:
					popup.selection++;
					if (popup.selection >= popup.results.length) {
						popup.selection = popup.results.length - 1;
					}
					popup.children().removeClass ('dollar-widget-autocomplete-result-focus');
					popup.children()[popup.selection].addClass ('dollar-widget-autocomplete-result-focus');
					e.preventDefault ();
					return;
				case 13:
					function do_selection () {
						if (queue) {
							setTimeout (do_selection, 1);
							return;
						}
						if (popup.selection < 0 && popup.results.length) {
							popup.selection = 0;
						}
						input.val (popup.results[popup.selection].value);
						display.val (popup.results[popup.selection].text);
						last_search = simplify (display.val ());
						popup.hide ();
						e.preventDefault ();
						input.trigger ('change');
					}
					do_selection ();
					return;
				case 27:
					popup.hide ();
					return;
				}
			}
			search ();
		});
		display.click (function () {
			if (count > 0) {
				popup.toggle ();
			}
		});
		display.event ('blur', function () {
			if (!input.val()) {
				display.val ('');
			}
		});
		if ($.defined (display_text)) {
			display.val (display_text);
			last_search = simplify (display.val ());
		}
		return {
			set: function (args) {
				input.val (args.value);
				display.val (args.display);
				last_search = simplify (display.val ());
			},
			caption: function (arg) {
				return display.val (arg);
			},
			focus: function () {
				display.focus ();
			},
			enable: function () {
				display.attr ('disabled', null);
			},
			disable: function () {
				display.attr ('disabled', 'disabled');
			},
			display: function () {
				return display;
			}
		};
	};
}) (window.$);