(function (scope) {
	var functions = {};
	function array_instance (elements) {
		this.elements = [];
		for (var i=0; i<elements.length; i++) {
			var element = $(elements[i]);
			this.elements.push (element);
			this[i] = element;
		}
		this.length = elements.length;
		this.handle = function (/*functionName, args...*/) {
			var args = [].slice.apply (arguments);
			functionName = args.shift ();
			this.elements.forEach (function (element) {
				functions[functionName].apply (null, [ element ].concat (args));
			});
		};
		for (var functionName in functions) {
			(function (functionName, instance) {
				instance[functionName] = function (/*args...*/) {
					var args = [].slice.apply (arguments);
					instance.handle.apply (instance, [ functionName ].concat (args));
				}
			}) (functionName, this);
		}
		this.each = function (iteratee) {
			for (var i=0; i<this.length; i++) {
				iteratee (this.elements[i]);
			}
		};
	}
	function instance (element) {
		this.native = element;
		this.jsDollar = this;
	}
	function singleton (element) {
		if (!element.jsDollar) {
			element.jsDollar = new instance (element);
		}
		return element.jsDollar;
	}
	var simple_regexp = new RegExp ('^<([a-z]+)/?>$');
	var $ = function (text) {
		if (!text) {
			return null;
		}
		if (text.jsDollar) {
			return text.jsDollar;
		}
		if (text && text.appendChild) {	// soporte directo para DocumentFragment
			return singleton (text);
		}
		if (text && text.length && typeof (text[0]) != 'string' && !text.tagName) {
			return new array_instance (text);
		}
		if (typeof (text) == 'object') {
			return singleton (text);
		}
		if (text.substr (0, 1) == '#') {
			var element = document.getElementById (text.substr (1, text.length));
			if (element) {
				return $(element);
			} else {
				return null;
			}
		}
		if (text.substr (0, 1) == '.') {
			return $(document.getElementsByClassName (text.substr (1, text.length)));
		}
		if (text.substr (0, 1) == '<') {
			var simple = text.match (simple_regexp);
			if (simple) {
				return singleton (document.createElement (simple[1]));
			} else {
				var div = document.createElement ('div');
				div.innerHTML = text;
				if (div.children.length == 1) {
					return singleton (div.children[0]);
				} else {
					return $(div.children);
				}
			}
		}
		return $(document.getElementsByTagName (text));
	};
	$.undefined = function (value, undefined) {
		return value === undefined;
	};
	$.defined = function (value, undefined) {
		return value !== undefined;
	};
	$.extend = function (functionName, functionDefinition) {
		functions[functionName] = functionDefinition;
		instance.prototype[functionName] = functionDefinition;
	};
	$.extend ('event', function (event, handler, capture) {
		var me = this;
		if (!$.defined (capture)) {
			capture = false;
		}
		if (this.native.addEventListener) {
			this.native.addEventListener (event, function (e) {
				return handler.call (me, e);
			}, capture);
		} else if (this.native.attachEvent) {
			this.native.attachEvent ('on' + event, function (e) {
				return handler.call (me, e);
			});
		}
		return this;
	});
	['click','keydown','keypress','keyup','mousedown','mousemove','mouseup','input'].forEach (function (eventName) {
		$.extend (eventName, function (handler) {
			return this.event (eventName, handler);
		});
	});
	$.extend ('trigger', function (eventName, eventAttrs) {
		var event = document.createEvent ('HTMLEvents');
		event.initEvent (eventName, true, true);
		event.eventName = eventName;
		if ($.defined (eventAttrs)) {
			for (var i in eventAttrs) {
				event[i] = eventAttrs[i];
			}
		}
		this.native.dispatchEvent (event);
	});
	$.extend ('submit', function (handler) {
		if ($.defined (handler)) {
			this.event ('submit', handler);
		} else {
			this.native.submit ();
		}
	});
	$.extend ('ready', function (handler) {
		if (document.readyState != 'loading') {
			handler.call (this, null);
			return;
		}
		var done = false;
		function ready_handler (e) {
			if (done) {
				return;
			}
			done = true;
			handler.call (this, e);
		}
		$(document).event ('DOMContentLoaded', ready_handler);
		$(window).event ('load', ready_handler);
	});
	$.extend ('val', function (value) {
		if ($.defined (value)) {
			this.native.value = value;
			return this;
		} else {
			return this.native.value;
		}
	});
	$.extend ('checked', function (value) {
		if ($.defined (value)) {
			this.native.checked = value;
			return this;
		} else {
			return this.native.checked;
		}
	});
	function apply_object (instance, method, object) {
		for (var name in object) {
			var value = object[name];
			instance[method] (name, value);
		}
	}
	$.extend ('attr', function (name, value) {
		if (typeof (name) == 'object') {
			var object = name;
			apply_object (this, 'attr', object);
			return this;
		}
		if ($.defined (value)) {
			if (value !== null) {
				this.native.setAttribute (name, value);
			} else {
				this.native.removeAttribute (name);
			}
			return this;
		} else {
			if (!this.native.hasAttribute) {
				console.log ('Will fail: ' , this.native);
			}
			return this.native.hasAttribute (name) ? this.native.getAttribute (name) : null;
		}
	});
	$.extend ('css', function (name, value) {
		if (typeof (name) == 'object') {
			var object = name;
			apply_object (this, 'css', object);
			return this;
		}
		var cssName = name.replace (new RegExp ('-[a-z]','g'), function (text) { return text.substr (1, 1).toUpperCase (); });
		if ($.defined (value)) {
			if (!value) {
				if (this.native.style.removeProperty) {
					this.native.style.removeProperty (cssName);
				} else {
					this.native.style[cssName] = '';
				}
			} else {
				this.native.style[cssName] = value;
			}
			return this;
		} else {
			return this.native.style[cssName];
		}
	});
	$.extend ('show', function () {
		this.css ('display', 'block');
	});
	$.extend ('hide', function () {
		this.css ('display', 'none');
	});
	$.extend ('toggle', function () {
		if (this.css ('display') == 'none') {
			this.show ();
		} else {
			this.hide ();
		}
	});
	$.extend ('append', function (child) {
		if (typeof (child) == "string") {
			child = {
				native: document.createTextNode (child)
			};
		}
		if (!child.native) {
			child = $(child);
		}
		this.native.appendChild (child.native);
		return this;
	});
	$.extend ('parent', function () {
		return this.native.parentNode ? $(this.native.parentNode) : null;
	});
	$.extend ('remove', function () {
		if (this.native.parentNode) {
			this.native.parentNode.removeChild (this.native);
		}
		return this;
	});
	$.extend ('prepend', function (child) {
		if (typeof (child) == "string") {
			child = {
				native: document.createTextNode (child)
			};
		}
		if (!child.native) {
			child = $(child);
		}
		if (this.native.firstChild) {
			this.native.insertBefore (child.native, this.native.firstChild);
		} else {
			this.native.appendChild (child.native);
		}
		return this;
	});
	$.extend ('prev', function (sibling) {
		if ($.defined (sibling)) {
			if (typeof (sibling) == "string") {
				sibling = {
					native: document.createTextNode (sibling)
				};
			}
			if (!sibling.native) {
				sibling = $(sibling);
			}
			if (this.native.parentNode) {
				this.native.parentNode.insertBefore (sibling.native, this.native);
			}
			return this;
		} else {
			if (this.native.previousSibling) {
				return $(this.native.previousSibling);
			} else {
				return false;
			}
		}
	});
	$.extend ('next', function (sibling) {
		if ($.defined (sibling)) {
			if (typeof (sibling) == "string") {
				sibling = {
					native: document.createTextNode (sibling)
				};
			}
			if (!sibling.native) {
				sibling = $(sibling);
			}
			if (this.native.parentNode) {
				if (this.native.nextSibling) {
					this.native.parentNode.insertBefore (sibling.native, this.native.nextSibling);
				} else {
					this.native.parentNode.appendChild (sibling.native);
				}
			}
			return this;
		} else {
			if (this.native.nextSibling) {
				return $(this.native.nextSibling);
			} else {
				return false;
			}
		}
	});
	$.extend ('addClass', function (className) {
		var classes = this.attr ('class');
		classes = classes ? classes.split (' '): [];
		if (classes.indexOf (className) < 0) {
			classes.push (className);
			this.attr ('class', classes.join (' '));
		}
		return this;
	});
	$.extend ('removeClass', function (className) {
		var classes = [];
		var existingClasses = this.attr ('class');
		existingClasses = existingClasses ? existingClasses.split (' '): [];
		existingClasses.forEach (function (someClass) {
			if (someClass != className) {
				classes.push (someClass);
			}
		});
		this.attr ('class', classes.join (' '));
		return this;
	});
	$.extend ('hasClass', function (className) {
		var existingClasses = this.attr ('class');
		existingClasses = existingClasses ? existingClasses.split (' '): [];
		return existingClasses.indexOf (className) >= 0;
	});
	$.extend ('toggleClass', function (className) {
		if (this.hasClass (className)) {
			this.removeClass (className);
		} else {
			this.addClass (className);
		}
	});
	$.extend ('each', function (itemHandler) {
		itemHandler.call (this, this);
	});
	$.extend ('empty', function () {
		this.native.innerHTML = '';
	});
	$.extend ('text', function (text) {
		if ($.defined (text)) {
			this.empty ();
			this.native.appendChild (document.createTextNode (text));
			return this;
		} else {
			//return this.native.innerText;
			return this.native.textContent;
		}
	});
	$.extend ('tag', function () {
		return this.native.tagName.toLowerCase ();
	});
	$.extend ('children', function (index) {
		if ($.defined (index)) {
			if (typeof(index)=="string" && index.substr(0,1) == ".") {
				return $(this.native.getElementsByClassName(index.substr(1)));
			} else
			if (this.native.children[index]) {
				return $(this.native.children[index]);
			} else {
				return null;
			}
		} else {
			return new array_instance(this.native.children);
		}
	});
	$.extend ('focus', function () {
		this.native.focus ();
		return this;
	});
	$.extend ('cell', function (row, column) {
		var children = $(this.native.children);
		for (var i=0; i<children.length; i++) {
			if (children[i].tag() == 'tbody') {
				//console.log (children[i].children()[row].children());
				return children[i].children()[row].children()[column];
			}
		}
		return null;
	});
	$.extend ('clone', function () {
		var copy = $(this.native.cloneNode(true));
		if (copy.attr ('id')) {
			copy.native.removeAttribute ('id');
		}
		return copy;
	});
	$.array = function (elements) {
		if (!$.defined (elements)) {
			elements = [];
		}
		if (elements.jsDollarArray) {
			return elements;
		}
		elements.jsDollarArray = true;
		elements.add = function (item) {
			this.push (item);
		};
		elements.remove = function (index, count) {
			this.splice (index, $.defined (count) ? count : 1);
		};
		elements.append = function (item) {
			this.push (item);
		};
		elements.prepend = function (item) {
			this.splice (0, 0, item);
		};
		elements.each = function (itemHandler) {
			for (var i=0; i<elements.length; i++) {
				itemHandler (elements[i]);
			}
		};
		return elements;
	};
	$.debounce = function (functionDefinition, timeout) {
		var timer = false;
		if (!$.defined (timeout)) {
			timeout = 400;
		}
		var functionWithFilter = function (arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
			if (timer) {
				clearTimeout (timer);
			}
			timer = setTimeout (function () {
				timer = false;
				functionDefinition (arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9);
			}, timeout);
		};
		return functionWithFilter;
	};
	$.widgets = {};
	$.spread = function (original) {
		if (original instanceof Array) {
			return original.concat (Array.from (arguments).slice (1));
		} else {
			return Object.assign.apply (Object, [ { } ].concat (Array.from (arguments)));
		}
	};
	scope.$ = $;
}) (window);
