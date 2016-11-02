(function ($) {
	var tooltipElement = $('<div/>');
	var css = {
		'position': 'absolute',
		'color': 'white',
		'background': 'black',
		'padding': '5px 10px',
		'margin': '0',
		'border-radius': '3px',
		'font-family': 'sans-serif',
		'font-size': '12px',
		'font-weight': 'none',
		'max-height': '50%',
		'overflow-y': 'auto'
	};
	tooltipElement.css ('display', 'none');
	for (var attr in css) {
		tooltipElement.css (attr, css[attr]);
	}
	$(document).ready (function () {
		$(document.body).append (tooltipElement);
	});
	var tooltipParent = false;
	var insideTooltip = false;
	tooltipElement.event ('mouseover', function () {
		if (tooltipParent) {
			insideTooltip = true;
		}
	});
	tooltipElement.event ('mouseout', function () {
		if (tooltipParent) {
			insideTooltip = false;
			hideTooltip (tooltipParent);
		}
	});
	function showTooltip (parent, e) {
		insideTooltip = false;
		tooltipParent = parent;
		if (typeof (parent.tooltipInstance.text) == "string") {
			tooltipElement.text (parent.tooltipInstance.text);
		} else {
			tooltipElement.empty ();
			tooltipElement.append (parent.tooltipInstance.text);
		}
		tooltipElement.css ('display', 'block');
		var left = 0;
		var top = 0;
		var el = parent.native;
		while (el) {
			left += el.offsetLeft;
			top += el.offsetTop;
			el = el.offsetParent;
		}
		if (top - tooltipElement.native.offsetHeight < 0) {
			top += parent.native.offsetHeight;
		} else {
			top -= tooltipElement.native.offsetHeight;
		}
		tooltipElement.css ('left', left + 'px');
		tooltipElement.css ('top', top + 'px');
	}
	function hideTooltip (parent) {
		setTimeout (function () {
			if (parent == tooltipParent && !insideTooltip) {
				tooltipParent = false;
				tooltipElement.css ('display', 'none');
			}
		}, 1);
	}
	$.extend ('tooltip', function (text) {
		if (!this.tooltipInstance) {
			this.tooltipInstance = {};
			this.event ('mouseover', function (e) {
				showTooltip (this, e);
			});
			this.event ('mouseout', function (e) {
				hideTooltip (this);
			});
		}
		this.tooltipInstance.text = text;
	});
}) (window.$);
