function error (message) {
	throw new Error (message);
}

function assert (condition, message) {
	if (!condition) error (message);
}

function test (name, test) {
	var error;
	try {
		test ();
	} catch (test_error) {
		error = test_error;
	}
	var div = document.createElement ('div');
	var span = document.createElement ('span');
	if (error) {
		span.textContent = 'error';
		span.style.color = '#c00';
	} else {
		span.textContent = 'ok';
		span.style.color = '#0a0';
	}
	div.appendChild (span);
	div.appendChild (document.createTextNode (' ' + name));
	if (error) {
		div.appendChild (document.createElement ('br'));
		var pre = document.createElement ('pre');
		pre.style.marginLeft = '2em';
		pre.textContent = error.stack;
		div.appendChild (pre);
	}
	document.body.appendChild (div);
}

var style = document.createElement ('style');
style.type = 'text/css';
style.textContent = '* { font-family: sans-serif; font-size: small } body { color: #222; background-color: #f4f4f4 }';
document.head.appendChild (style);
