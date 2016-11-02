(function ($) {
	var custom_cmp_regexp1 = new RegExp ('[0-9]+|[^0-9]+', 'g');
	var custom_cmp_regexp2 = new RegExp ('^[0-9]+$');
	var divLoadingScreen = $('<div/>').css('position','absolute').css('display','block').css('margin','0').css('padding','0').css('border-width','0').css('left','0').css('top','0').css('background','rgba(0,0,0,.3)').css('z-index','999999');
	var divLoadingScreenUsage = 0;
	var png_common1 = 'iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AkVDz';
	var png_common2 = 'AAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAB';
	var png_az = png_common1 + 'kjF/jPCw' + png_common2 + '6SURBVCjPldG7DcJQEETRY0REF26BDAmJjBYowXINLoOEpmiChIgESNEjseWP1r8Jd+fOarS0SvigsEJ7PAazFBkrvOrlbwnwxQGnwBACN7xxXQpMqQds1tLbkbPZHNAYShyDkBQFXXDHbmBMUfEznsjnSnf/MJrW1R8Mkh9suJE6PQAAAABJRU5ErkJggg==';
	var png_za = png_common1 + 'oOeQrAvQ' + png_common2 + '5SURBVCjPldCxDcJAEETRZ4uILtwCGRKSM1qgBIsaKIOEpmiChMgJOEXnwCQ+OPtu0p3/tbuVKcE8lUQ2UeGMQ9QJKcEJd2yjcvizgSOeaBLlH2hYsAWFmQF1KV1Hpje6EsEOj5wbLui/w08OMGCPNvdLN7xwXXvjCLD8ImgHw6pUAAAAAElFTkSuQmCC';
	$.table = function (options, columns, data) {
		if (!$.defined (data)) {
			data = columns;
			columns = options;
			options = { };
		}
		if (!data) {
			data = [];
		}
		if (options.sortable_use_text) {
			(console.warn || console.log || alert) ('WARNING: sortable_use_text deprecated');
			if (options.tree) {
				alert ('ERROR: deprecated sortable_use_text + tree will never be supported, bye bye');
				throw new Error ('deprecated sortable_use_text + tree will never be supported, bye bye');
			}
		}
		var tree_childs = { }, tree_parents = [ ];
		if (options.tree) {
			columns.unshift ({ caption: '', format: function (row) {
				if (row.parent_id) {
					return '\u00A0';
				}
				var toggle = $('<span>').text ('+').addClass ('dollar-table-toggle');
				var visible = false;
				toggle.click (function () {
					visible = !visible;
					toggle.text (visible ? '-' : '+');
					$(tree_childs[row.id]).toggleClass ('dollar-table-collapsed');
				});
				return toggle;
			} });
		}
		var table = $('<table/>');
		table.addClass ('dollar-table');
		var thead = $('<thead/>');
		var tbody = $('<tbody/>');
		table.append (thead);
		table.append (tbody);
		var tr = $('<tr/>');
		thead.append (tr);
		var table_rows = [];
		function custom_cmp (a, b) {
			if (typeof (a) != "string" || typeof (b) != "string") {
				if (!a) return -1;
				if (!b) return  1;
				if (a < b) return -1;
				if (a > b) return  1;
				return 0;
			}
			a = a.trim().match (custom_cmp_regexp1);
			b = b.trim().match (custom_cmp_regexp1);
			if (!a || !b) {
				if (!a && !b) {
					return 0;
				}
				if (!a) {
					return -1;
				}
				return 1;
			}
			var min_length = Math.min (a.length, b.length);
			for (var i=0; i<min_length; i++) {
				if (a[i] != b[i]) {
					if (a[i].match (custom_cmp_regexp2) && b[i].match (custom_cmp_regexp2)) {
						return a[i]*1 - b[i]*1;
					}
					if (a[i].toLocaleLowerCase() < b[i].toLocaleLowerCase()) {
						return -1;
					} else {
						return 1;
					}
				}
			}
			if (a.length < b.length) {
				return -1;
			} else if (a.length > b.length) {
				return 1;
			} else {
				return 0;
			}
		}
		function sort_table_by_text (index, reverse, fn) {
			if (fn === true) {
				fn = custom_cmp;
			}
			flush_rows (function () {
				var data = [];
				table_rows.forEach (function (tr) {
					data.push ({tr: tr, text: tr.children()[index].text()});
				});
				data.sort (function (a, b) {
					var result = fn (a.text, b.text);
					return reverse ? (-result) : result;
				});
				data.forEach (function (data) {
					tbody.append (data.tr);
				});
			});
		}
		function sort_table (index, reverse) {
			var fn = (columns[index].sortable === true) ? custom_cmp : columns[index].sortable;
			var column_name = columns[index].name;
			var sort_fn = function (a, b) {
				if (!column_name && fn == custom_cmp) {
					a = a.children(index).text();
					b = b.children(index).text();
				} else {
					a = data[a.data_row];
					b = data[b.data_row];
					if (column_name) {
						a = a[column_name];
						b = b[column_name];
					}
				}
				var result = fn (a, b, reverse);
				return reverse ? (-result) : result;
			};
			function sort_tree (rows) {
				return rows.sort (sort_fn).forEach (function (row) {
					tbody.append (row);
					var id = data[row.data_row].id;
					if (id && tree_childs[id]) {
						sort_tree (tree_childs[id]);
					}
				});
			}
			flush_rows (function () {
				if (!options.tree) {
					table_rows.sort (sort_fn).forEach (function (row) {
						tbody.append (row);
					});
				} else {
					sort_tree (tree_parents);
				}
				/*
				table_rows.sort (function (a, b) {
					if (!column_name && fn == custom_cmp) {
						a = a.children(index).text();
						b = b.children(index).text();
					} else {
						a = data[a.data_row];
						b = data[b.data_row];
						if (column_name) {
							a = a[column_name];
							b = b[column_name];
						}
					}
					var result = fn (a, b, reverse);
					return reverse ? (-result) : result;
				});
				
				table_rows.forEach (function (row) {
					tbody.append (row);
				});
				*/
			});
		}
		var column_visibility = [];
		function show_column (index, visible) {
			if (column_visibility[index] === visible) return;
			column_visibility[index] = visible;
			var display = visible ? 'table-cell' : 'none';
			console.log (index);
			window._t = { thead: thead, index: index };
			thead.children(0).children(index).css ('display', display);
			tbody.children().each (function (row) {
				row.children(index).css ('display', display);
			});
		}
		var column_index = 0;
		var thead_ctx = $('<div/>').attr ('class', 'dollar-table-menu');
		thead.event ('contextmenu', function (e) {
			e.preventDefault ();
			for (var i in e) {
				if (i.substr(-1) == 'X' || i.substr(-1) == 'Y' || i.substr(-4) == 'Left' || i.substr(-3) == 'Top') {
					console.log (i);
				}
			}
			var x = e.offsetX, y = e.offsetY, el = e.target;
			while (el) {
				x += el.offsetLeft;
				y += el.offsetTop;
				el = el.offsetParent;
			};
			console.log (x, y);
			thead_ctx.css ('position', 'absolute').css ('left', x + 'px').css ('top', y + 'px');
			$(document.body).append (thead_ctx);
		});
		var thead_ctx_close = $('<div/>').text ('✖').attr ('class', 'dollar-table-menu-close');
		thead_ctx.append (thead_ctx_close);
		thead_ctx_close.click (function () {
			thead_ctx.remove ();
		});
		columns.forEach (function (column) {
			column_visibility.push (true);
			if (column.caption) {
				var column_ctx = $('<input/>').attr ('type', 'checkbox').checked (true);
				thead_ctx.append ($('<div/>').append ($('<label/>').append (column_ctx).append (' ' + column.caption)));
				(function (column_index) {
					column_ctx.event ('change', function () {
						show_column (column_index, column_ctx.checked ());
					});
				}) (column_index);
			}
			var th = $('<th/>');
			th.text (column.caption);
			if (column.sortable) {
				var sort_asc = $('<span/>');
				sort_asc.addClass ('dollar-table-sortable');
				sort_asc.append ($('<img/>').attr ('alt', '▼').attr ('src', 'data:image/png;base64,' + png_az));
				var sort_desc = $('<span/>');
				sort_desc.addClass ('dollar-table-sortable');
				sort_desc.append ($('<img/>').attr ('alt', '▲').attr ('src', 'data:image/png;base64,' + png_za));
				(function (column_index) {
					if (options.sortable_use_text) {
						sort_asc.click (function () {
							sort_table_by_text (column_index, false, column.sortable);
						});
						sort_desc.click (function () {
							sort_table_by_text (column_index, true, column.sortable);
						});
					} else {
						sort_asc.click (function () {
							sort_table (column_index, false);
						});
						sort_desc.click (function () {
							sort_table (column_index, true);
						});
					}
				}) (column_index);
				th.append (sort_desc);
				th.append (sort_asc);
			}
			tr.append (th);
			column_index++;
		});
		var loader_bar = $('<div/>');
		loader_bar.css ('position', 'fixed');
		loader_bar.css ('left', '0');
		loader_bar.css ('top', '0');
		loader_bar.css ('height', '5px');
		loader_bar.css ('background', '#0c0');
		$(document.body).append (loader_bar);
		var column_iterator_tr, column_iterator_row;
		function column_iterator (column, index) {
			var td = $('<td/>');
			column_iterator_tr.append (td);
			var text;
			try {
				if (column.name && $.defined (column_iterator_row[column.name])) {
					text = column.format ? column.format (column_iterator_row[column.name]) : column_iterator_row[column.name];
				} else if (column.format) {
					text = column.format (column_iterator_row);
				}
				if (text && typeof (text) == "object") {
					td.append (text);
				} else {
					if (text === null) text = '';
					td.text (text);
				}
				if (column.align) {
					td.css ('text-align', column.align);
				}
				if (!column_visibility[index]) {
					td.css ('display', 'none');
				}
			} catch (ex) {
				console.log (ex);
			}
		}
		var current_row = 0;
		function render_row () {
			column_iterator_row = data[current_row];
			column_iterator_tr = $('<tr/>');
			column_iterator_tr.data_row = current_row;
			tbody.append (column_iterator_tr);
			table_rows.push (column_iterator_tr);
			columns.forEach (column_iterator);
			if (options.tree) {
				var parent_id = data[current_row].parent_id;
				if (parent_id) {
					column_iterator_tr.addClass ('dollar-table-collapsible').addClass ('dollar-table-collapsed');
					if (!tree_childs[parent_id]) {
						tree_childs[parent_id] = [ ];
					}
					tree_childs[parent_id].push (column_iterator_tr);
				} else {
					tree_parents.push (column_iterator_tr);
				}
			}
			if (options.format_row) {
				try {
					options.format_row (column_iterator_tr, column_iterator_row);
				} catch (ex) { }
			}
			current_row++;
		}
		var scrollHelper = $('<div/>').css('position','absolute').css('display','block').css('margin','0').css('padding','0').css('border-width','0').css('left','0').css('width','0').css('top','0').css('height','100%');
		$(document.body).append (scrollHelper);
		function flush_rows (callback) {
			if (current_row == data.length) {
				$.defined (callback) && callback ();
				return;
			}
			if (!divLoadingScreenUsage) {
				$(document.body).append (divLoadingScreen.css('width',document.body.scrollWidth+'px').css('height',document.body.scrollHeight+'px'));
			}
			divLoadingScreenUsage++;
			after = function (fn) { setTimeout (fn, 1); };	// lo intenté con requestAnimationFrame, pero no hay caso
			after (function () {
				while (current_row < data.length) {
					render_row ();
				}
				if ($.defined (callback)) {
					callback ();
				}
				divLoadingScreenUsage--;
				if (!divLoadingScreenUsage) {
					divLoadingScreen.remove ();
				}
			});
		}
		var listener = document.body.addEventListener ('keydown', function (e) {
			if (e.keyCode == 35) {
				flush_rows (function () {
					window.scrollTo (0, window.scrollY);
				});
			}
		});
		var fix_headers = false;
		var intID = setInterval (function () {
			if (!table.native.offsetParent) {
				return;
			}
			var limite = 10000;	// llevar a un número más bajo...
			var el = table.native, y = 0;
			while (el && limite--) {
				y += el.offsetTop;
				el = el.offsetParent;
			}
			var bodyScrollTop = window.scrollY;
			var helperHeight = scrollHelper.native.offsetHeight;
			var tableHeight = table.native.offsetHeight;
			while (y + table.native.offsetHeight < bodyScrollTop + helperHeight * 3 && current_row < data.length && limite--) {
				for (var i=0; i<50; i++) {	// la mayor parte del CPU se pierde en llamadas a table.native.offsetHeight, por eso este for() :-)
					if (current_row < data.length) {
						render_row ();
					}
				}
			}
			if (!limite) {
				console.log ('Alcancé el límite :\'(');
			}
			if (options.fix_headers) {
				var fix_headers_delta = false;
				if (y < bodyScrollTop) {
					var fix_headers_delta = bodyScrollTop - y;
				}
				if (fix_headers !== fix_headers_delta) {
					fix_headers = fix_headers_delta;
					if (fix_headers) {
						thead.css ('background-color', 'silver');
						thead.css ('transform', 'translate(0,'+fix_headers+'px)');
						thead.css ('transition', 'transform .4s');
						thead.css ('outline', '1px silver solid');
						thead.children(0).children().css ('background-color', 'white');
					} else {
						thead.css ('background-color', null);
						thead.css ('transform', null);
						thead.css ('transition', null);
						thead.css ('outline', null);
						thead.children(0).children().css ('background-color', 'null');
					}
				}
			}
		}, 40);
		table.flush = function (callback) {
			flush_rows (callback);
			return table;
		};
		table.sort = function (table_column, reverse) {
			if (options.sortable_use_text) {
				alert ('ERROR: option:sortable_use_text + table.sort() will not be implemented, bye bye');
				throw new Error ('ERROR: option:sortable_use_text + table.sort() will not be implemented, bye bye');
			}
			flush_rows (function () {
				sort_table (options.tree ? (table_column + 1) : table_column, reverse);
			});
			return table;
		};
		var dollarRemove = table.remove;
		table.remove = function () {
			clearInterval (intID);
			scrollHelper.remove ();
			document.body.removeEventListener ('keydown', listener);
			dollarRemove.call (this);
		};
		window.addEventListener ('keydown', function (e) {
			if (e.ctrlKey && e.keyCode == 70) {	// Control+F
				flush_rows ();
			}
		});
		return table;
	};
}) (window.$);
