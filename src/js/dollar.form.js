(function ($) {
	$.form = function (fields, defaults) {
		var form = $('<form/>');
		if (!$.defined (defaults)) {
			defaults = [];
		}
		var dl = $('<dl/>');
		form.append (dl);
		var errors = {};
		var inputs = {};
		var widgets = {};
		fields.forEach (function (field) {
			var dt = $('<dt/>');
			if (field.caption) {
				dt.text (field.caption);
			}
			if (field.inline) {
				dt.attr ('class', 'dollar-form-inline');
			}
			dl.append (dt);
			var dd = $('<dd/>');
			var input;
			switch (field.type) {
			case 'select':
				input = $('<select/>');
				for (var i in field.options) {
					var key = i;
					if (key.substr (0, 1) == "\u0000") {
						// pequeño hack para forzar a Chrome y Iceweasel a respetar el orden de las opciones
						// aquí quitamos ese hack
						key = key.substr (1);
					}
					var option = $('<option/>');
					option.val (key);
					option.text (field.options[i]);
					if (key == defaults[field.name]) {
						option.attr ('selected', 'selected');
					}
					input.append (option);
				}
				break;
			case 'checkbox':
				input = $('<input/>');
				input.attr ('type', 'checkbox');
				if (field.value) {
					input.attr ('value', field.value);
					if (defaults[field.name] && defaults[field.name].indexOf (field.value) >= 0) {
						input.attr ('checked', 'checked');
					}
				} else {
					if (defaults[field.name]) {
						input.attr ('checked', 'checked');
					}
				}
				break;
			case 'radio':
				input = $('<input/>');
				input.attr ('type', 'radio');
				input.attr ('value', field.value);
				if (field.value == defaults[field.name]) {
					input.attr ('checked', 'checked');
				}
				break;
			case 'textarea':
				input = $('<textarea/>');
				input.text (defaults[field.name]);
				break;
			case 'submit':
				input = $('<input/>');
				input.val (field.value);
				input.attr ('type', 'submit');
				break;
			default:
				input = $('<input/>');
				input.attr ('type', field.type);
				input.val (defaults[field.name]);
				if (field.size) {
					input.attr ('size', field.size);
				}
			}
			input.attr ('name', field.name);
			if ($.defined (field.placeholder)) {
				input.attr ('placeholder', field.placeholder);
			}
			field.input = input;
			inputs[field.name] = input;
			if (field.label) {
				var label = $('<label/>');
				if (field.label_class) {
					label.attr ('class', field.label_class);
				}
				if (field.label.native) {
					label.append (field.label);
				} else {
					label.text (' ' + field.label);
				}
				label.prepend (input);
				dd.append (label);
			} else {
				dd.append (input);
			}
			if (field.widget) {
				var widget = field.widget (input);
				if (typeof (defaults[field.name]) == 'object') {
					if (!widget) {
						console.log ('Could not set initial state of ',field,': no widget instance');
					} else if (!widget.set) {
						console.log ('Could not set initial state of ',field,': no widget.set() method');
					} else {
						widget.set (defaults[field.name]);
					}
				}
				widgets[field.name] = widget;
			}
			var error = $('<div/>');
			errors[field.name] = error;
			error.addClass ('dollar-form-error');
			dd.append (error);
			dl.append (dd);
		});
		var has_error;
		
		form.validate = function (handler) {
			var submit_handlers = [];
			form.event ('submit', function (e) {
				try {
					for (var i in errors) {
						errors[i].removeClass ('dollar-form-error-visible');
					}
					has_error = false;
					handler.call (this);
					if (has_error) {
						e.preventDefault ();
					} else {
						submit_handlers.forEach (function (handler) {
							handler.call (this, e);
						});
					}
				} catch (ex) {
					e.preventDefault ();
					console.log (ex);	// en realidad esta excepción debería reportarse por algún medio...
					throw ex;
				}
			});
			// sobreescribir el manejador de submit para permitir que validemos los datos antes
			form.submit = function (handler) {
				if ($.defined (handler)) {
					submit_handlers.push (handler);
				} else {
					this.native.submit ();
				}
			};
		};
		form.error = function (name, message) {
			has_error = true;
			errors[name].text (message);
			errors[name].addClass ('dollar-form-error-visible');
		};
		form.input = function (name) {
			return inputs[name];
		};
		form.widget = function (name) {
			return widgets[name];
		};
		return form;
	};
	// ------------------------------------------
	// que cuando aprieten ENTER en los formularios te mande al campo siguiente
	$(document).ready (function () {
		setTimeout (function () {
			var l = [];
			var l1 = document.all;
			for (var i=0; i<l1.length; i++) {
				if (l1[i].nodeName && ['input','select','textarea'].indexOf (l1[i].nodeName.toLowerCase()) >= 0) {
					l.push (l1[i]);
				}
			}
			l.forEach (function (el) {
				el.addEventListener ('keydown', function (e) {
					if (e.keyCode == 13 && (!el.hasAttribute ('type') || ['submit','button','reset'].indexOf (el.getAttribute ('type').toLowerCase()) < 0) && el.nodeName.toLowerCase() != 'textarea' && (!el.previousSibling || !el.previousSibling.hasAttribute('class') || el.previousSibling.getAttribute('class') != 'widget-autocomplete')) {
						if (el.previousSibling && el.previousSibling.hasAttribute('class') && el.previousSibling.getAttribute('class').indexOf ('widget-autocomplete') >= 0) {
							// nada, no prevenir el default
						} else {
							e.preventDefault ();
						}
						var i = l.indexOf (el);
						do {
							i++;
						} while (i < l.length && l[i].offsetParent === null);	// con offsetParent chequeamos que esté visible el elemento al cual daremos foco
						if (i < l.length && el.form == l[i].form) {	// chequear que estée en el mismo formulario
							l[i].focus ();
						}
					}
				});
			});
		}, 1);
	});
}) (window.$);
