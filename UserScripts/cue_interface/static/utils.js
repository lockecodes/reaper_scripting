function mkvolstr(vol) {
  var v = parseFloat(vol);
  if (v < 0.00000002980232) return "-inf dB";
  v = Math.log(v)*8.68588963806;
  return v.toFixed(2) + " dB";
}

function mkpanstr(pan) {
  if (Math.abs(pan) < 0.001) return "center";
  if (pan > 0) return (pan*100).toFixed(0) + "%R";
  return (pan*-100).toFixed(0) + "%L";
}

function simple_unescape(v) {
  return String(v).replace(/\\t/g,"\t").replace(/\\n/g,"\n").replace(/\\\\/g,"\\");
}

function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}
