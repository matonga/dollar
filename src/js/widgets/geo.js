$.widgets.geo = function (input) {
	var coords = input.val().split (',').reverse().map (function (x) { return x*1; });
	if (!input.val()) {
		coords = [ -32.89, -68.85 ].reverse();
	}
	function ol_loaded () {
		//input.attr ('type', 'hidden');
		input.css ('margin-top', '5px');
		var div = $('<div>').css ('width', '500px').css ('height', '500px');
		input.prev (div);
		var view = new ol.View ({
			projection: ol.proj.get ('EPSG:3857'),
			center: ol.proj.transform (coords, 'EPSG:4326', 'EPSG:3857'),
			zoom: 12
		});
		var layerMapa = new ol.layer.Tile ({
			title: 'Mapa',
			source: new ol.source.OSM (),
			type: 'base'
		});
		var feature = new ol.Feature ({
			geometry: new ol.geom.Point (ol.proj.transform (coords, 'EPSG:4326', 'EPSG:3857'))
		});
		var style = new ol.style.Style ({
			image: new ol.style.Icon ({
				anchor: [ 0.5, 1 ],
				anchorXUnits: 'fraction',
				anchorYUnits: 'fraction',
				src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAUCAYAAACEYr13AAAABGdBTUEAALGPC/xhBQAAAPNJREFUOMul079KwlEYxvGPCE0NBbV4BUFDl9AFuDcK3UJX8EwtQUtrczdRmyA0WFuCCBJJQkMUIQgVtiiI/DT/PPBu5/t9OYfzMJNQDXehFV7G0wq3oWpB9kMjDEaMiiYMQgN7s3AltOeBBaI2KhO4FJrLwlOSJkpCLQzXEAxDTaivCk9J6la5e+FbhN4Ggp7wvIGgKzxuIHgQLtcU/IZz2A7dNbY/YWvy/4/D2wpwPxzMlugsfC0Bf4bTwjaFmxE/CwTf4XpuHZOUw/2C7Y0kZf9kN3QK4A52LJNwFPpT8Gs4tErGLf0I7+HEOglX4WLRmT/xu6SrfCqWOAAAAABJRU5ErkJggg=='
			})
		});
		feature.setStyle (style);
		var sourceVector = new ol.source.Vector ({
			features: [ feature ]
		});
		var layerVector = new ol.layer.Vector ({
			source: sourceVector
		});
		var modify = new ol.interaction.Modify ({
			features: new ol.Collection ([ feature ]),
			style: style,
			pixelTolerance: 20
		});
		modify.on ('modifyend', function (e) {
			input.val (ol.proj.transform (feature.getGeometry().getCoordinates(), 'EPSG:3857','EPSG:4326').reverse().map (function (x) {
				return x.toFixed(6);
			}).join(',')).trigger ('change');
		});
		var map = new ol.Map ({
			target: div.native,
			layers: [
				layerMapa,
				layerVector
			],
			interactions: ol.interaction.defaults().extend([modify]),
			view: view
		});
	}
	if (!window.ol) {
		var stylesheet = $('<link>').attr ('href', '//cdnjs.cloudflare.com/ajax/libs/ol3/3.17.1/ol.css').attr ('type', 'text/css').attr ('rel', 'stylesheet');
		$(document.head).append (stylesheet);
		//var script = $('<script>');	// por alguna razón que no comprendo, esto no funciona, la sgte línea sí
		var script = $(document.createElement ('script'));
		script.attr ('type', 'text/javascript');
		script.attr ('src', '//cdnjs.cloudflare.com/ajax/libs/ol3/3.17.1/ol.js');
		script.event ('load', ol_loaded);
		$(document.head).append (script);
	} else {
		ol_loaded ();
	}
};
