/// VERSION MAIN

//// AstroAddress Class
function AstroAddress(val, flags = [0, 0, 0]) {
	//set basic variables
	this._flags = flags
	this.event_onChange = []

	//constructor
	if (typeof val === 'number') this.longitude = val
	if (typeof val === 'object') {
		if (!val.d) throw('expected value not present: d')
		if (!val.m) throw('expected value not present: m')
		if (!val.s) throw('expected value not present: s')
		this.longitude = val.d + (val.m / 60) + (val.s / 3600)
	}
	if (typeof val === 'string') {
		this.encodedString = val
	}
}
AstroAddress.prototype._schema = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
AstroAddress.prototype._schema_pad_to = 4
AstroAddress.prototype._flag_max = 3
AstroAddress.prototype.onChange = function(a) {
	for (var i in this.event_onChange) {
		if (typeof this.event_onChange[i] === 'function') {
			this.event_onChange[i](this, a)
		}
	}
}
AstroAddress.prototype.toString = function(format = '%d %z %M\'%S\"') {
	var r = {
		'%l': this.longitude,
		'%d': this.degreeInSign,
		'%z': this.signShort,
		'%Z': this.sign,
		'%M': (this.minute < 10 ? '0'+this.minute : this.minute),
		'%S': (this.second < 10 ? '0'+this.second : this.second),
		'%m': this. minute,
		'%s': this.second
	}
	for (var i in r) format = format.replace(i, r[i]);
	return format
}
Object.defineProperty(AstroAddress.prototype, 'longitude', {
	get: function() {return this._longitude},
	set: function(val) {
		while (val < 0) val += 360
		while (val >= 360) val -= 360
		this._longitude = val
		this.onChange()
	}
})
Object.defineProperty(AstroAddress.prototype, 'degree', {
	get: function() {return Math.floor(this._longitude)},
	set: function(val) {this.longitude = this.degree + (this.minute_long / 60)}
})
Object.defineProperty(AstroAddress.prototype, 'minute_long', {
	get: function() {return (this.longitude - this.degree) * 60},
	set: function(val) {this.longitude = this.degree + (val / 60)}
})
Object.defineProperty(AstroAddress.prototype, 'minute', {
	get: function() {return Math.floor(this.minute_long)},
	set: function(val) {this.longitude = this.degree + (val / 60) + (this.second / 3600)}
})
Object.defineProperty(AstroAddress.prototype, 'second', {
	get: function() {return Math.floor((this.minute_long - this.minute) * 60)},
	set: function(val) {this.longitude = this.degree + (this.minute / 60) + (val / 3600)}
})
Object.defineProperty(AstroAddress.prototype, 'signNumber', {
	get: function() {return Math.floor(this.longitude / 30)},
	set: function(val) {this.longitude = (val * 30) + this.degreeInSign + (this.minute_long / 60)}
})
Object.defineProperty(AstroAddress.prototype, 'degreeInSign', {
	get: function() {return Math.floor(this.longitude % 30)},
	set: function(val) {this.longitude = (this.signNumber * 30) + val + (this.minute_long / 60)}
})
Object.defineProperty(AstroAddress.prototype, 'sign', {
	get: function() {return ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Saggitarius', 'Capricorn', 'Aquarius', 'Pisces'][this.signNumber]}
})
Object.defineProperty(AstroAddress.prototype, 'signShort', {
	get: function() {return this.sign.substring(0,3)}
})
Object.defineProperty(AstroAddress.prototype, 'flags', {
	get: function() {return this._flags},
	set: function(val) {
		if (Array.isArray(val)) this._flags = val
		if (typeof val ==='number') {
			for (let i = 0; i < this._flag_max; i++) this._flags[i] = (val & Math.pow(2, i) ? 1 : 0)
		}
	}
})
Object.defineProperty(AstroAddress.prototype, 'encodedString', {
	get: function() {
		let n = Math.floor(this.longitude * Math.pow(this._schema.length, 2)) * Math.pow(2, this._flag_max)
		let r = ""
		for (let f = 0; f < this._flags.length; f++) n += (Math.pow(2, f) * this._flags[f])
		while ( n != 0) {
			r = (this._schema[n % this._schema.length]) + r
			n = Math.floor(n / this._schema.length)
		}
		while (r.length < this._schema_pad_to) r = "0"+r
		return r
	},
	set: function(val) {
		let n = 0
		for (var i = val.length - 1; i >= 0; i--) n+= (this._schema.indexOf(val[i]) * Math.pow(this._schema.length, val.length - i - 1))
		let f = (Math.floor(n) % Math.pow(2, this._flag_max));
		this.flags = f
		this.longitude = (n - f) / Math.pow(2, this._flag_max) / Math.pow(this._schema.length, 2)
	}
})

function AstroCollection(indexes) {
	this.db = {}
	this._indexes = indexes
}
AstroCollection.prototype.getByIndex = function(index) {return this.db[this._indexes.indexOf(index)]}
AstroCollection.prototype.add = function(id, address) {this.db[id] = address}
AstroCollection.prototype.get = function(id) {return this.db[id]}
AstroCollection.prototype.getByID = function(id) {return this.db[id]}
AstroCollection.prototype.set = function(id, longitude = null, flags = null) {
	if (!this.db[id]) throw('invalid id')
	if (flags != null) {this.db[id].flags = flags}
	if (longitude != null) {this.db[id].longitude = longitude}
}

////Splitting the Astro Engine and the Graphics Engine apart.
////Data Engine
function AstroEngine() {
	this.planet = new AstroCollection(['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto','northnode','blackmoonlilith','chiron','juno','vesta','ceres'])
	this.house = new AstroCollection([0,1,2,3,4,5,6,7,8,9,10,11])
	// Populate houses
	for (var i = 0; i < 12; i++) {
		this.house.add(i, new AstroAddress(0))
	}
	for (var i in this.planet._indexes) {
		this.planet.add(this.planet._indexes[i], new AstroAddress(0))
	}
}
// Makes the first character of string uppercase
AstroEngine.prototype._jsUcfirst = function(string) {return string.charAt(0).toUpperCase() + string.slice(1)}
Object.defineProperty(AstroEngine.prototype, 'houseEncoded', {
	get: function() {
		var r = []
		for (var i = 0; i < 6; i++) {r[i] = this.house.get(i).encodedString}
		return r.join('')
	},
	set: function(val) {
		var d = val.match(/.{1,4}/g)
		for (var i = 0; i < 6; i++) {
			this.house.get(i).encodedString = d[i]
			this.house.get(i + 6).longitude = this.house.get(i).longitude + 180
		}
	}
})
Object.defineProperty(AstroEngine.prototype, 'planetEncoded', {
	get: function() {
		var r = []
		for (var p in this.planet._indexes) {r[p] = this.planet.get(this.planet._indexes[p]).encodedString}
		return r.join('')
	},
	set: function(val) {
		var d = val.match(/.{1,4}/g)
		for (var p in d) {this.planet.get(this.planet._indexes[p]).encodedString = d[p]}
	}
})

//Data Loading Functions
AstroEngine.prototype.chartRandom = function() {
	var h = []
	for (var i = 0; i < 6; i++) {h[i] = Math.random() + 1}
	const tot = (acc, cur) => acc + cur
	var t = h.reduce(tot)
	var o = Math.random() * 360
	for (var i = 0; i < 6; i++) {
		o += (h[i] / t * 180)
		this.house.set(i, o)
		this.house.set(i + 6, o + 180)
	}

	for (var i in this.planet._indexes) {
		let r = (Math.random() > 0.9 ? 1 : 0)
		this.planet.set(this.planet._indexes[i], Math.random() * 360, [r, 0, 0])
	}
}
AstroEngine.prototype.chartLoad = function(data, o, callback = null) {
	for (d in data.planet) {o.planet.set(d, data.planet[d].longitude, (data.planet[d].speed > 0 ? 0 : 1))}
	if (data.house) {
		for (i = 0; i < 12; i++) {o.house.set(i, data.house[i].longitude)}
	}
	if (typeof callback === 'function') callback()
}
AstroEngine.prototype.chartFromString = function(string) {
	if (string.p) this.planetEncoded = string.p
	if (string.h) this.houseEncoded = string.h
}
AstroEngine.prototype.chartFromGet = function() {
	if (!window) throw('AstroEngine.chartFromGet must be called from a browser')
	var match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        query  = window.location.search.substring(1);

    urlParams = {};
    while (match = search.exec(query)) urlParams[decode(match[1])] = decode(match[2]);
    this.chartFromString(urlParams)
}
AstroEngine.prototype.chartQueryAPI = function(a, callback) {
	var reqA = []
	var cb = this.chartLoad
	var eng = this
	for (k in a) {reqA.push(k+'='+a[k])}
	var apiHTTP = new XMLHttpRequest()
    apiHTTP.open("GET", "https://api.earlgraytease.com/ephemeris/?"+reqA.join('&'), true)
    apiHTTP.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    apiHTTP.onreadystatechange = function () {
        if (apiHTTP.readyState == 4 && apiHTTP.status == 200) {
            //var results = JSON.parse(apiHTTP.responseText)
            cb(JSON.parse(apiHTTP.responseText), eng, callback)
        }
    }
    apiHTTP.send(null)
}

////Graphics Engine
function AstroGraphics(svg_element) {
	// Call Engine constructor
	AstroEngine.call(this)
	// construct graphics engine
	this.dom = {svg: svg_element}
	this.dom.defs = this.dom.svg.querySelector('defs')
	for (var i = 0; i < 12; i++) {
		this._extendHouse(this.house.get(i), i)
	}
	this._extendAscendant(this.house.get(0), '.zodiacRing')
	this._extendPlanet(this.house.get(0), 'ascendant')
	this._extendPlanet(this.house.get(9), 'midheaven')
	for (var i in this.planet._indexes) {
		var s = this.planet._indexes[i]
		var p = this.planet.get(s)
		this._extendPlanet(p, s)
	}
}
// Inherit everything from the Data Engine
AstroGraphics.prototype = Object.create(AstroEngine.prototype)
AstroGraphics.prototype.constructor = AstroGraphics

// Spin the chart so that the _address_ is at 9 o'clock
AstroGraphics.prototype.spinToPoint = function(address) {
	var dest = -30 + address.longitude
	this.dom.svg.querySelector('.zodiacRing').setAttribute('transform', 'rotate(' + dest + ' 5000 5000)')
}

AstroGraphics.prototype._extendDom = function(address) {
	if (!address.dom) {address.dom = {}}
}
// rotate the entire chart to -30 + longitude degrees when the address is changed
AstroGraphics.prototype._extendAscendant = function(address, id) {
	this._extendDom(address)
	address.dom.ascendant = {ring: this.dom.svg.querySelector(id)}
	address.event_onChange.push(function(o, a) {
		o.dom.ascendant.ring.setAttribute('transform', 'rotate(' + (-30 + o.longitude) + ' 5000 5000)')
	})
}
// redraw the house when address is changed
AstroGraphics.prototype._extendHouse = function(address, id) {
	this._extendDom(address)
	address.dom.house = {group: this.dom.svg.querySelector('.House#house' + id)}
	address.dom.house.block = address.dom.house.group.querySelector('.block')
	address.dom.house.coord = address.dom.house.group.querySelector('.coord textPath')
	address.dom.house.labelPath = this.dom.defs.querySelector('#pathHouse' + id + 'Label')
	address.dom.house.coordPath = this.dom.defs.querySelector('#pathHouse' + id + 'Coord')
	
	address.event_onChange.push(function(o, cascade = true) {
		//redraw house
		var g = AstroDraw.drawHouse(o)
		o.dom.house.coord.textContent = o.toString()
		o.dom.house.block.setAttributeNS(null, 'd', g.block)
		o.dom.house.labelPath.setAttributeNS(null, 'd', g.label)
		o.dom.house.coordPath.setAttributeNS(null, 'd', g.coord)
		o.dom.house.group.setAttribute('transform', 'rotate(' + g.rotate + ' 5000 5000)')
		o.dom.house.group.style.visibility = 'visible'
		if (cascade == true) o.addrPrev.onChange(false)
		return false;
	})

	address.addrPrev = this.house.get((id == 0 ? 11 : id - 1))
	address.addrNext = this.house.get((id == 11 ? 0 : id + 1))
	Object.defineProperty(address, 'width', {
		get: function() {
			var w = this.addrNext.longitude - this.longitude
			while (w < 0) w += 360
			while (w >= 360) w -= 360
			return w
		}
	})
}
// redraw the planet when address is changed
AstroGraphics.prototype._extendPlanet = function(address, id) {
	this._extendDom(address)
	address.dom.planet = {group: this.dom.svg.querySelector('.Planet#' + this._jsUcfirst(id))}
	address.dom.planet.coord = address.dom.planet.group.querySelector('.coord textPath')
	address.dom.planet.retrograde = address.dom.planet.group.querySelector('.retrograde')

	address.event_onChange.push(function(o, a) {
		o.dom.planet.coord.textContent = o.toString()
		o.dom.planet.group.setAttribute('transform', 'rotate(' + (0 - o.longitude + 120) + ' 5000 5000)')
		if (o.dom.planet.retrograde) {
			o.dom.planet.retrograde.style.visibility = (o.flags[0] == 1 ? 'visible' : 'hidden')
		}
		o.dom.planet.group.style.visibility = 'visible'
	})
}

// Drawing functions that don't really need to be in the class
const AstroDraw = {
	_polarToCartesian: function (centerX, centerY, radius, angleInDegrees) {
        var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    },
	drawHouse: function(address) {
		var halfWidth = address.width / 2;
        var radii = {
            inner: 4650,
            outer: 4800,
            label: 4675,
            coord: 4825
        }
        var points = {
            labelL: AstroDraw._polarToCartesian(5000, 5000, radii.label, 0 - halfWidth),
            labelR: AstroDraw._polarToCartesian(5000, 5000, radii.label, halfWidth),
            innerL: AstroDraw._polarToCartesian(5000, 5000, radii.inner, 0 - halfWidth + 0.5),
            innerR: AstroDraw._polarToCartesian(5000, 5000, radii.inner, halfWidth),
            outerL: AstroDraw._polarToCartesian(5000, 5000, radii.outer, 0 - halfWidth + 0.5),
            outerR: AstroDraw._polarToCartesian(5000, 5000, radii.outer, halfWidth),
            innerBar: AstroDraw._polarToCartesian(5000, 5000, radii.inner, halfWidth - 0.5),
            outerBar: AstroDraw._polarToCartesian(5000, 5000, radii.outer, halfWidth - 0.5),
            coordL: AstroDraw._polarToCartesian(5000, 5000, radii.coord, 0 - halfWidth),
            coordR: AstroDraw._polarToCartesian(5000, 5000, radii.coord, halfWidth)
        }

        return {
        	block: [
	            'M', points.innerL.x, points.innerL.y,
	            'A', radii.inner, radii.inner, 0, 0, 1, points.innerR.x, points.innerR.y,
	            'L', points.outerR.x, points.outerR.y,
	            'A', radii.outer, radii.outer, 0, 0, 0, points.outerL.x, points.outerL.y,
	            'Z',
	            'M', points.innerBar.x, points.innerBar.y,
	            'L', points.outerBar.x, points.outerBar.y
	            ].join(' '),
        	label: [
	            'M', points.labelL.x, points.labelL.y,
	            'A', radii.label, radii.label, 0, 0, 1, points.labelR.x, points.labelR.y
	            ].join(' '),
        	coord: [
	            'M', points.coordL.x, points.coordL.y,
	            'A', radii.coord, radii.coord, 0, 0, 1, points.coordR.x, points.coordR.y
	            ].join(' '),
        	rotate: 0 - (address.longitude + (address.width / 2)) - 60
        }
	}
}