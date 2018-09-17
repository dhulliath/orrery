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
AstroAddress.prototype.addOnChange = function(f) {
	this.event_onChange.push(f.bind(this))
}
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

function AstroAspect(address1, address2) {
	this._addresses = [address1, address2]
	address1.event_onChange.push(this._recheckFunc())
	address2.event_onChange.push(this._recheckFunc())
	//this.recheck()
}
AstroAspect.prototype.event = {onUpdate: []}
AstroAspect.prototype._aspects = [
	{n: 'conjunction', a: 0, o: 6},
	{n: 'opposition', a: 180, o: 6},
	{n: 'trine', a: 120, o: 4},
	{n: 'square', a: 90, o: 4},
	{n: 'sextile', a: 60, o: 4}]
AstroAspect.prototype.recheck = function() {
	var cur = this._aspect
	this._aspect = null
	for (a in this._aspects) {
		if (Math.abs(this.diff - this._aspects[a].a) < (this._aspects[a].o / 2)) {
			this._aspect = this._aspects[a]
		}
	}
	if (this._aspect != cur) {this.onUpdate()}
}
AstroAspect.prototype._recheckFunc = function() {
	var L = this
	return (() => {
		L.recheck()
	})
}
AstroAspect.prototype.onUpdate = function() {for (var f in this.event.onUpdate) {this.event.onUpdate[f](this)}}
Object.defineProperty(AstroAspect.prototype, 'diff', {
	get: function() {return Math.abs(this._addresses[0].longitude - this._addresses[1].longitude)}
})
Object.defineProperty(AstroAspect.prototype, 'offset', {
	get: function() {
		if (this._aspect != null) {
			return 1 - (Math.abs(this.diff - this._aspect.a) / (this._aspect.o / 2))
		} else {
			return null
		}
	}
})
Object.defineProperty(AstroAspect.prototype, 'type', {
	get: function() {
		if (this._aspect) return this._aspect.n
		else return null
	}
})

function AstroCollection(indexes) {
	this.db = {}
	this._indexes = indexes
}
AstroCollection.prototype.getByIndex = function(index) {return this.db[this._indexes.indexOf(index)]}
AstroCollection.prototype.add = function(id, address) {
	this.db[id] = address
	address.id = id
}
AstroCollection.prototype.get = function(id) {return this.db[id]}
AstroCollection.prototype.getByID = function(id) {return this.db[id]}
AstroCollection.prototype.set = function(id, longitude = null, flags = null) {
	if (!this.db[id]) throw('invalid id')
	if (flags != null) {this.db[id].flags = flags}
	if (longitude != null) {this.db[id].longitude = longitude}
}

// This is an extended form of AstroCollection designed to look at relationships between AstroAddress's
function AstroAspects(indexes) {
	AstroCollection.call(this, indexes)
	//this.aspects = {}
}
// Inherit everything from the Data Engine
AstroAspects.prototype = Object.create(AstroCollection.prototype)
AstroAspects.prototype.constructor = AstroAspects
AstroAspects.prototype.add = function(id, address) {
	if (!address.aspects) address.aspects = {}
	for (var p in this.db) {
		var pl = this.get(p)
		if (!address.aspects[pl.id]) {
			let a = new AstroAspect(address, pl)
			//console.log(address.id, address, pl.id, pl)
			address.aspects[pl.id] = a
			pl.aspects[id] = a
		}
	}
	AstroCollection.prototype.add.apply(this, [id, address])
}
AstroAspects.prototype.checkAspects = function(address) {

}

////Splitting the Astro Engine and the Graphics Engine apart.
////Data Engine
function AstroEngine() {
	this.planet = new AstroAspects(['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto','northnode','blackmoonlilith','chiron','juno','vesta','ceres'])
	this.house = new AstroCollection([0,1,2,3,4,5,6,7,8,9,10,11])
	// Populate houses
	for (var i = 0; i < 12; i++) {
		this.house.add(i, new AstroAddress(0))
	}
	for (var i in this.planet._indexes) {
		this.planet.add(this.planet._indexes[i], new AstroAddress(0))
	}
	this.planet.add('ascendant', this.house.get(0))
	this.planet.add('midheaven', this.house.get(9))
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