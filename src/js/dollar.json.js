(function ($) {
	$.json = function (text) {
		function form_value (name, value) {
			if (!name) {
				return;
			}
			if ($.defined (text[name])) {
				if (typeof (text[name]) != 'object') {
					text[name] = [text[name]];
				}
				text[name].push (value);
			} else {
				text[name] = value;
			}
		}
		function form_values (native) {
			for (var i=0; i<native.length; i++) {
				var element = $(native[i]);
				var name = element.attr ('name');
				if (!name) {
					continue;
				}
				switch (element.tag ()) {
				case 'input':
					switch (element.attr ('type')) {
					case 'checkbox':
						if (element.attr ('value')) {
							if (!text[name]) {
								text[name] = [];
							}
							if (element.native.checked) {
								text[name].push (element.val());
							}
						} else {
							form_value (name, element.native.checked);
						}
						break;
					case 'radio':
						if (element.native.checked) {
							form_value (name, element.attr ('value'));
						}
						break;
					case 'file':
						// usar un widget, como $.widgets.image por ejemplo
						break;
					default:
						form_value (name, element.val ());
					}
					break;
				case 'select':
					if (element.attr ('multiple')) {
						// FIXME: handle multiselect forms
					} else {
						form_value (name, element.val ());
					}
					break;
				case 'textarea':
					form_value (name, element.val ());
					break;
				}
			}
		}
		if (text.tagName) {
			text = $(text);
		}
		if (text.tag && text.tag() == 'form') {
			var form = text;
			text = {};
			form_values (form.native);
		}
		if (typeof (text) == 'string') {
			var json_text = text;
			text = {};
			text.toString = function () {
				return json_text;
			};
			text.toObject = function () {
				return JSON.parse (json_text);
			};
		} else {
			text.toString = function () {
				return JSON.stringify (this);
			};
			text.toObject = function () {
				return (typeof (this) == 'object') ? JSON.parse (JSON.stringify (this)) : JSON.parse (this);
			};
		}
		text.post = function (url, options) {
			if (!options) {
				options = {};
			}
			if (options.postButton) {
				if (!options.postButton.idleCaption) {
					options.postButton.idleCaption = options.postButton.val();
				}
				options.postButton.attr ('disabled', 'disabled');
				if (options.postButtonCaption) {
					options.postButton.val (options.postButtonCaption);
				}
			}
			var xhr = new XMLHttpRequest ();
			var _success, _error;
			var post_data = text.toString ();
			xhr.open ('POST', url, true);
			xhr.setRequestHeader ('Content-Type', 'text/json');
			xhr.onreadystatechange = function () {
				if (xhr.readyState == 4) {
					if (options.postButton) {
						options.postButton.val (options.postButton.idleCaption);
						options.postButton.attr ('disabled', null);
					}
					if (xhr.status == 200) {
						if ($.defined (_success)) {
							var obj;
							try {
								obj = $.json(xhr.responseText).toObject ();
							} catch (e) {
								obj = xhr.responseText;
							}
							_success.call (text, obj);
						}
					} else {
						if ($.defined (_error)) {
							_error.call (text, {status: xhr.status, statusText: xhr.statusText});
						}
					}
				}
			};
			setTimeout (function () {
				xhr.send (post_data);
			}, 1);
			this.success = function (handler) {
				_success = handler;
				return this;
			};
			this.error = function (handler) {
				_error = handler;
				return this;
			};
			this.cancel = function () {
				_success = false;
				_error = false;
				xhr.abort ();
				if (options.postButton) {
					options.postButton.val (options.postButton.idleCaption);
					options.postButton.attr ('disabled', null);
				}
			};
			return this;
		};
		return text;
	};
}) (window.$);
