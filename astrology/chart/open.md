---
title: Natal Chart
layout: doc
js_additional:
 - /js/orreryEngine.js
 - /js/orreryData.js
 - /js/teleport/teleport-autocomplete.min.js
css_additional:
 - /css/teleport/teleport-autocomplete.min.css
navbar: true
---

## New Chart

### Basics
<label>Label: <input id="label" type="text" placeholder="label" /><br/></label>
<label>Year: <input id="year" type="number" placeholder="year" value="2018" /></label>
<label>Month: <select id="month" /></label>
<label>Day: <select id="day" /></label>

### Detailed Chart
<select id="hour"><option value="no">Hour</option></select>
<select id="minute"><option value="no">Minute</option></select>

<label>Place of Birth<input type="text" class="city-search" /></label>

### Calculate
Everything looks good?
<input type="submit" value="Request Chart" onClick="reqChart()" />

A birth location and birth time are required for a more detailed chart. The point on the horizon where the sun rises marks the location of the Ascendant, or the cusp of the First House. This in itself is an important sign in a person's chart. Without knowing the birth location and time, however, this cannot be discovered without an interview process.

Moon signs change every two and a half days, so an individual born near the cusp may need to know their birth time for an accurate result. 



## Saved Charts
<ul id="savedcharts"></ul>

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

function loadCharts() {
	var c = document.querySelector('#savedcharts')
	var k = Saved.keys()
	for (ik in k) {
		let s = Saved.get(k[ik])

		let d = {}
		d.l = document.createElement('li')
		d.a = document.createElement('a')
		
		d.t = document.createElement('p')
		d.t.setAttribute('class', 'title')
		d.a.appendChild(d.t)
		
		d.t.textContent = [s.l, s.z].join(': ')

		d.s = document.createElement('p')
		d.s.setAttribute('class', 'subtitle')
		//d.a.appendChild(d.s)

		d.l.setAttribute('id', k[ik])

		d.d = document.createElement('a')
		d.d.setAttribute('class', 'far fa-trash-alt')
		d.d.setAttribute('href', 'javascript:delChart("' + k[ik] + '")')

		let t = []
		if (s.d) t[0] = s.d
		if (s.c) t[1] = s.c
		d.s.textContent = t.join(', ')

		let ht = k[ik].split('-')
		let href = ['p=' + ht[0]]
		if (ht[1]) href.push('h=' + ht[1])
		href.push('l=' + s.l)
		d.a.setAttribute('href', '/astrology/chart/?' + href.join('&'))

		d.l.setAttribute('id', k[ik])
		d.l.appendChild(d.a)
		d.l.appendChild(d.s)
		d.l.appendChild(d.d)
		c.appendChild(d.l)
	}
}
function delChart(id) {
	Saved.delete(id)
	document.querySelector('#' + id).remove()
	//location.reload()
}

loadCharts()
</script>