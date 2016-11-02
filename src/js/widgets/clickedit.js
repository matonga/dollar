(function ($) {
	$.widgets.clickedit = function (input) {
		var orig_val = input.val;
		input.val = function (new_value) {
			if ($.defined (new_value)) {
				label.text (new_value);
			}
			return orig_val.call (input, new_value);
		};
		input.attr ('type', 'hidden');
		var label = $('<span/>');
		label.text (input.val ());
		label.css ('margin-right', '.5em');
		var button = $('<button/>');
		button.attr ('type', 'button');
		var image = $('<img/>');
		image.attr ('src', 'img/edit.png');
		button.append (image);
		input.prev (label);
		input.prev (button);
		button.click (function () {
			label.css ('display', 'none');
			button.css ('display', 'none');
			input.attr ('type', 'text');
		});
		return {
			set: function (args) {
				input.val (args);
				span.text (args);
			}
		};
	};
}) (window.$);
