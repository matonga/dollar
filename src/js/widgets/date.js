(function ($) {
	var locales = {
		en: {
			days: [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ],
			months: [ null, 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ]
		},
		es: {
			days: [ 'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado' ],
			months: [ null, 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre' ]
		}
	};
	var locale = navigator.language;
	if (locale.indexOf ('-') > 0) {
		locale = locale.split('-')[0];
	}
	if (!locales[locale]) {
		locale = 'en';
	}
	locale = locales[locale];
	function render (calendar, input, display, month, year) {
		calendar.empty ();
		calendar.attr ('class', 'dollar-widget-date');
		var year_display = $('<div/>');
		year_display.attr ('class', 'dollar-widget-date-year');
		year_display.text (year);
		var prev = $('<button/>');
		prev.attr ('type', 'button');
		prev.text ('<');
		prev.addClass ('dollar-widget-date-prev');
		prev.click (function () {
			render (calendar, input, display, month, year-1);
		});
		year_display.append (prev);
		var next = $('<button/>');
		next.attr ('type', 'button');
		next.text ('>');
		next.addClass ('dollar-widget-date-next');
		next.click (function () {
			render (calendar, input, display, month, year+1);
		});
		year_display.append (next);
		calendar.append (year_display);
		var month_display = $('<div/>');
		month_display.attr ('class', 'dollar-widget-date-month');
		month_display.text (locale.months[month]);
		var prev = $('<button/>');
		prev.attr ('type', 'button');
		prev.text ('<');
		prev.addClass ('dollar-widget-date-prev');
		prev.click (function () {
			month--;
			if (!month) {
				month = 12;
				year--;
			}
			render (calendar, input, display, month, year);
		});
		month_display.append (prev);
		var next = $('<button/>');
		next.attr ('type', 'button');
		next.text ('>');
		next.addClass ('dollar-widget-date-next');
		next.click (function () {
			month++;
			if (month > 12) {
				month = 1;
				year++;
			}
			render (calendar, input, display, month, year);
		});
		month_display.append (next);
		calendar.append (month_display);
		var header_display = $('<div/>');
		header_display.attr ('class', 'dollar-widget-date-header');
		for (var i=0; i<7; i++) {
			var day = $('<div/>');
			day.text (locale.days[i].substr (0, 2));
			header_display.append (day);
		}
		calendar.append (header_display);
		var days = new Date (year, month, 0).getDate ();
		var week_day = new Date (year, month-1, 1).getDay ();
		var week_display = $('<div/>');
		week_display.attr ('class', 'dollar-widget-date-week');
		for (var i=0; i<week_day; i++) {
			var day = $('<div/>');
			day.text (' ');
			week_display.append (day);
		}
		var today = new Date();
		today = {
			year: today.getFullYear(),
			month: today.getMonth()+1,
			day: today.getDate()
		};
		for (var i=1; i<=days; i++) {
			if (i != 1 && week_day == 0) {
				calendar.append (week_display);
				week_display = $('<div/>');
				week_display.attr ('class', 'dollar-widget-date-week');
			}
			var day = $('<div/>');
			day.text (i);
			day.addClass ('dollar-widget-date-selectable');
			(function (i) {
				day.click (function () {
					calendar.hide ();
					input.val (year + '-' + ((month < 10) ? '0' : '') + month + '-' + ((i < 10) ? '0' : '') + i);
					display.val (new Date (year, month-1, i).toLocaleDateString ());
				});
			}) (i);
			if (year == today.year && month == today.month && i == today.day) {
				day.addClass ('dollar-widget-date-today');
			}
			week_display.append (day);
			week_day = (week_day + 1) % 7;
		}
		calendar.append (week_display);
	}
	$.widgets.date = function (input) {
		input.attr ('type', 'hidden');
		var display = $('<input/>');
		display.attr ('readonly', 'readonly');
		input.next (display);
		var button = $('<button/>');
		button.attr ('type', 'button');
		var image = $('<img/>');
		image.attr ('src', 'img/date.png');
		button.append (image);
		input.prev (display);
		input.prev (button);
		var calendar = $('<div/>');
		calendar.css ('position', 'absolute');
		calendar.css ('margin-top', '2.5em');
		calendar.css ('display', 'none');
		if (input.val()) {
			var date = input.val().split('-');
			display.val (new Date(date[0]*1, date[1]*1-1, date[2]*1).toLocaleDateString ());
			render (calendar, input, display, date[1]*1, date[0]*1);
		} else {	
			render (calendar, input, display, new Date().getMonth()+1, new Date().getFullYear ());
		}
		display.prev (calendar);
		button.click (function () {
			calendar.toggle ();
		});
	};
}) (window.$);
