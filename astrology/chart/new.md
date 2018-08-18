---
title: Natal Chart
layout: doc
js_additional:
 - /js/orreryEngine.js
 - /js/teleport/teleport-autocomplete.min.js
css_additional:
 - /css/teleport/teleport-autocomplete.min.css
navbar: true
---

### Basic Chart
Year: <input id="year" type="number" placeholder="year" value="2018" />
Month: <select id="month" />
Day: <select id="day" />

### Detailed Chart
Moon signs change every two and a half days, so an individual born near the cusp may need to know their birth time for an accurate result. Furthermore, the location one is born dictates the size of the houses which affects placement of the Ascending Sign (cusp of first house) and Midheaven (cusp of tenth house). Without knowing birthplace or birthtime these require a professional astrologer to discover through interview.


<select id="hour"><option value="no">Hour</option></select>
<select id="minute"><option value="no">Minute</option></select>

<input type="text" class="city-search" />

### Calculate
Everything looks good?
<input type="submit" value="Calculate!" onClick="reqChart()" />

<script>
const Orrery = new AstroEngine()

const m = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const inputs = {
	year: document.querySelector('#year'),
	month: document.querySelector('#month'),
	day: document.querySelector('#day'),
	hour: document.querySelector('#hour'),
	minute: document.querySelector('#minute')
}
const out = document.querySelector('#qString')

function newOption(label, value) {
	var o = document.createElement('option')
	o.textContent = label
	o.value = value
	return o
}

//populate month selector
for (i in m) {inputs.month.appendChild(newOption(m[i], parseInt(i)+1))}
//populate day selector
for (var i = 0; i < 31; i++) {inputs.day.appendChild(newOption(i+1,i+1))}
//populate hour selector
for (var i = 0; i < 24; i++) {
	var s = i
	if (i > 12) {s += " (" + (i-12) + "PM)"}
	if (i == 12) {s += " (Noon)"}
	if (i == 0) {s += " (Midnight)"}
	inputs.hour.appendChild(newOption(s, i))
}
for (var i = 0; i < 60; i++) {
	/*var s
	if (i < 10) {s = "0"+i}
	else {s = i}*/
	inputs.minute.appendChild(newOption((i < 10 ? "0"+i : i), i))
}

var tp = new TeleportAutocomplete({ el: '.city-search', maxItems: 5 });

function reqChart() {
	var reqA = {
		year: inputs.year.value,
		month: inputs.month.value,
		day: inputs.day.value
	}
	if (inputs.hour.value != "no" && inputs.minute.value != "no") {
		reqA.hour = inputs.hour.value
		reqA.minute = inputs.minute.value
	}
	if (tp.value) {
		reqA.latitude = tp.value.latitude
		reqA.longitude = tp.value.longitude
	}
	Orrery.chartQueryAPI(reqA, chartReturn)
	
	
}
function chartReturn() {
	var qString = 'p=' + Orrery.planetEncoded
	if (Orrery.houseEncoded != '000000000000000000000000') qString+='&h='+Orrery.houseEncoded
	window.location.href = '/astrology/chart/?' + qString
	//out.textContent = qString
}
</script>