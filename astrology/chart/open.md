---
title: Natal Chart
layout: doc
js_additional:
 - /js/orreryEngine.js
 - /js/orreryData.js
 - /js/teleport/teleport-autocomplete.min.js
css_additional:
 - /css/teleport/teleport.css
navbar: true
menus: astrology
---

## New Chart

<div class="input-group mb-3">
	<div class="input-group-prepend">
		<span class="input-group-text">Label</span>
	</div>
	<input id="label" type="text" class="form-control" placeholder="your name/title/honorific here" />
</div>
<div class="input-group mb-3">
	<div class="input-group-prepend">
		<span class="input-group-text">Birthday</span>
	</div>
	<input id="year" type="number" placeholder="year" />
	<select id="month" class="custom-select"></select>
	<select id="day" class="custom-select"></select>
</div>

### Detailed Chart

<div class="input-group mb-3">
	<div class="input-group-prepend">
		<span class="input-group-text">Time of Birth</span>
	</div>
	<select id="hour" class="custom-select"><option value="no">Hour</option></select>
	<select id="minute" class="custom-select"><option value="no">Minute</option></select>
	
</div>

<div class="input-group mb-3">
	<div class="input-group-prepend">
		<span class="input-group-text">Birthplace</span>
	</div>
	<input type="text" class="city-search form-control" />
</div>

<button type="button" class="btn btn-primary" onClick="reqChart()">Create Chart</button>


A birth location and birth time are required for a more detailed chart. The point on the horizon where the sun rises marks the location of the Ascendant, or the cusp of the First House. This in itself is an important sign in a person's chart. Without knowing the birth location and time, however, this cannot be discovered without an interview process.

Moon signs change every two and a half days, so an individual born near the cusp may need to know their birth time for an accurate result. 



## Saved Charts

<div id="charts" class="card-columns">
</div>


## Boring Details
* [Changelog](/astrology/chart/changelog/)
* [Todo](/astrology/chart/todo/)




<script>
const Orrery = new AstroEngine()
const Saved = new OrreryData('charts')

const m = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const inputs = {
	_label: document.querySelector('#label'),
	label: function() {return this._label.value},
	year: document.querySelector('#year'),
	month: document.querySelector('#month'),
	day: document.querySelector('#day'),
	hour: document.querySelector('#hour'),
	minute: document.querySelector('#minute'),
	toString: function() {
		return [m[parseInt(this.month.value) - 1].substring(0,3), this.day.value, this.year.value].join(' ')
	}
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
	let qString = []
	let q = [Orrery.planetEncoded]
	let s = {p: Orrery.planetEncoded}
	if (Orrery.houseEncoded != '000000000000000000000000') {
		s.h = Orrery.houseEncoded
		q.push(s.h)
	}

	s.d = inputs.toString()
	if (tp.value) s.c = tp.value.name
	if (inputs.label()) s.l = inputs.label()
	s.z = Orrery.planet.get('sun').toString('%Z')

	for (let i in s) qString.push(i + '=' + s[i])

	Saved.set(q.join('-'), s)

	window.location.href = '/astrology/chart/?' + qString.join('&')
	//out.textContent = qString
}

function chartCard(id) {
	let s = Saved.get(id)
	let o = {}

	let ht = id.split('-')
	let href = ['p=' + ht[0]]
	if (ht[1]) href.push('h=' + ht[1])
	href.push('l=' + s.l)

	o.c = document.createElement('div')
	o.c.setAttribute('class', 'card')
	o.c.setAttribute('id', id)

	o.c.appendChild(o.b = document.createElement('div'))
	o.b.setAttribute('class', 'card-body')

	o.b.appendChild(o.h = document.createElement('h5'))
	o.h.setAttribute('class', 'card-title')
	o.h.textContent = s.l

	o.b.appendChild(o.t = document.createElement('div'))
	o.t.setAttribute('class', 'card-text')
	o.t.textContent = [s.d, s.c].join(', ')

	o.b.appendChild(o.o = document.createElement('a'))
	o.o.setAttribute('class', 'card-link btn btn-primary')
	o.o.setAttribute('href', '/astrology/chart/?' + href.join('&'))
	o.o.textContent = 'Open'

	o.b.appendChild(o.d = document.createElement('a'))
	o.d.setAttribute('class', 'card-link')
	o.d.setAttribute('href', 'javascript:delChart("' + id + '")')
	o.d.textContent = 'Delete'

	return o.c
}

function loadCharts() {
	var c = document.querySelector('#charts')
	var k = Saved.keys()
	for (ik in k) {
		c.appendChild(chartCard(k[ik]))
	}
}
function delChart(id) {
	Saved.delete(id)
	document.querySelector('#' + id).remove()
}

loadCharts()
</script>