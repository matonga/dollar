(function ($) {
	$.widgets.image = function (input, size, type, quality) {
		input.attr ('type', 'hidden');
		var search = $('<input/>');
		search.attr ('type', 'file');
		search.attr ('accept', 'image/*');
		search.css ('float', 'left')
		      .css ('clear', 'both');
		input.next (search);
		var div = $('<div/>');
		div.css ('width', size+'px');
		div.css ('height', size+'px');
		div.css ('position', 'relative');
		div.css ('overflow', 'hidden');
		div.css ('margin-bottom', '8px');
		div.css ('background', '-webkit-linear-gradient(bottom,#ddd,#eee)');
		div.css ('background', 'linear-gradient(bottom,#ddd,#eee)');
		div.css ('float', 'left');
		div.css ('clear', 'left');
		div.css ('display', 'inline-block');
		search.next (div);
		div.next ($('<div>').css ('clear', 'both'));
		var img = false;
		var ratio, x, y;
		var getDataURL = false;
		var rotate = $('<input>').attr ('type', 'button').val ('rotar');
		rotate.css ('display', 'none')
		      .css ('float', 'left')
		      .css ('margin-left', '.5em')
		      .css ('width', 'auto')
		      .css ('padding', '.25em .5em')
		      .css ('line-height', '1em')
		      .css ('text-indent', '0');
		function load_image (data_url) {
			div.empty ();
			img = $('<img/>');
			img.event ('load', function () {
				rotate.css ('display', 'inline-block');
				img.css ('position', 'absolute');
				ratio = Math.max (size / img.native.naturalWidth, size / img.native.naturalHeight);
				img.css ('width', Math.ceil (img.native.naturalWidth * ratio) + 'px');
				img.css ('height', Math.ceil (img.native.naturalHeight * ratio) + 'px');
				x = Math.round ((size - img.native.naturalWidth * ratio) * .5);
				y = Math.round ((size - img.native.naturalHeight * ratio) * .5);
				getDataURL = function (fn, simg) {
					if (!simg) {
						simg = new Image ();
						simg.src = img.attr ('src');
					}
					if (Math.min (simg.naturalWidth, simg.naturalHeight) > size * 1.8) {
						var canvas = document.createElement ('canvas');
						canvas.width = Math.ceil (simg.naturalWidth / 1.8);
						canvas.height = Math.ceil (simg.naturalHeight / 1.8);
						var context = canvas.getContext ('2d');
						context.drawImage (simg, 0, 0, canvas.width, canvas.height);
						var cimg = new Image ();
						cimg.onload = function () {
							getDataURL (fn, cimg);
						};
						cimg.src = canvas.toDataURL ();
					} else {
						var sratio = Math.max (size / simg.naturalWidth, size / simg.naturalHeight);
						var canvas = document.createElement ('canvas');
						canvas.width = size;
						canvas.height = size;
						var context = canvas.getContext ('2d');
						context.drawImage (simg, x, y, Math.ceil (simg.naturalWidth * sratio), Math.ceil (simg.naturalHeight * sratio));
						fn (canvas.toDataURL (type, quality));
					}
				};
				img.css ('left', x + 'px');
				img.css ('top', y + 'px');
				div.append (img);
				var mx, my, mb = false;
				img.event ('mousedown', function (e) {
					e.preventDefault ();
					mb = true;
					mx = e.pageX;
					my = e.pageY;
				});
				img.event ('mousemove', function (e) {
					if (mb) {
						x += e.pageX - mx;
						y += e.pageY - my;
						if (x > 0) x = 0;
						if (y > 0) y = 0;
						var minX = -Math.floor (img.native.naturalWidth * ratio) + size;
						var minY = -Math.floor (img.native.naturalHeight * ratio) + size;
						if (x < minX) {
							x = minX;
						}
						if (y < minY) {
							y = minY;
						}
						mx = e.pageX;
						my = e.pageY;
						img.css ('left', x + 'px');
						img.css ('top', y + 'px');
					}
				});
				img.event ('mouseup', function (e) {
					mb = false;
					getDataURL (function (url) {
						input.val (url);
					});
				});
				getDataURL (function (url) {
					input.val (url);
				});
			});
			img.attr ('src', data_url);
		}
		search.event ('change', function () {
			var reader = new FileReader ();
			reader.onload = function (e) {
				load_image (reader.result);
			};
			reader.readAsDataURL (search.native.files[0]);
		});
		div.next (rotate);
		rotate.click (function () {
			var canvas = document.createElement ('canvas');
			canvas.width = img.native.naturalHeight;
			canvas.height = img.native.naturalWidth;
			var ctx = canvas.getContext ('2d');
			ctx.rotate (90*Math.PI/180);
			ctx.drawImage (img.native, 0, -canvas.width);
			load_image (canvas.toDataURL ());
		});
	};
}) (window.$);
