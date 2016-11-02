(function ($) {
	$.get = function (url) {
		var xhr = new XMLHttpRequest ();
		var _success, _error;
		xhr.open ('GET', url, true);
		xhr.onreadystatechange = function () {
			if (xhr.readyState == 4) {
				if (xhr.status == 200) {
					if ($.defined (_success)) {
						_success.call (null, xhr.responseText);
					}
				} else {
					if ($.defined (_error)) {
						_error.call (null, {status: xhr.status, statusText: xhr.statusText});
					}
				}
			}
		};
		setTimeout (function () {
			xhr.send ();
		}, 1);
		var instance;
		instance = {
			success: function (handler) {
				_success = handler;
				return instance;
			},
			error: function (handler) {
				_error = handler;
				return instance;
			}
		};
		return instance;
	};
}) ($);
