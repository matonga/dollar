<?php
$css = stream_get_contents (STDIN);
$css = str_replace ("\n", " ", $css);
$css = str_replace ("\t", " ", $css);
$css = explode ("/*", $css);
for ($i=1; $i<count($css); $i++) {
	list (,$css[$i]) = explode ("*/", $css[$i], 2);
}
$css = implode (" ", $css);
$css = preg_replace ('/\s*({|}|:|;|,|>)\s*/', '$1', $css);
echo $css;
