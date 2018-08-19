//Basic Data Engine, can be used for anything

function DataEngine(key) {this._key = key}

DataEngine.prototype.keys = function() {
	var k = this.get('_keys')
	if (!k.length) return []
	return k.split(',')
}
DataEngine.prototype.set = function(id, data) {
	window.localStorage.setItem(this._getKey(id), JSON.stringify(data))
	var k = this.keys()
	if (k.indexOf(id) < 0) k.push(id)
	this._setKeys(k)
}
DataEngine.prototype.get = function(id) {return JSON.parse(window.localStorage.getItem(this._getKey(id)))}
DataEngine.prototype.delete = function(id) {
	let k = this.keys()
	let i = k.indexOf(id)
	if (i > -1) k.splice(i, 1)
	this._setKeys(k)
	window.localStorage.removeItem(this._getKey(id))
}
DataEngine.prototype._setKeys = function(k) {
	window.localStorage.setItem(this._getKey('_keys'), JSON.stringify(k.join(',')))
}
DataEngine.prototype._getKey = function(id) {return [this._key, id].join(':')}


// Chart Specific Data Engine

function OrreryData() {DataEngine.call(this, 'charts')}
OrreryData.prototype = Object.create(DataEngine.prototype)
OrreryData.prototype.constructor = DataEngine

OrreryData.prototype.get = function(id) {
	let r = DataEngine.prototype.get.apply(this, [id])
	if (!r) return {id: id}
	r.id = id
	return r
}

OrreryData.prototype.setFromGet = function() {
	if (!window) throw('AstroEngine.chartFromGet must be called from a browser')
	var match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        query  = window.location.search.substring(1);

    urlParams = {};
    while (match = search.exec(query)) urlParams[decode(match[1])] = decode(match[2]);
    //this.chartFromString(urlParams)
    let i = [urlParams.p]
    if (urlParams.h) i.push(urlParams.h)

    let s = this.get(i.join('-'))
    if (urlParams.p) s.p = urlParams.p
    if (urlParams.h) s.h = urlParams.h
    if (urlParams.l) s.l = urlParams.l
    else s.l = 'The Amazing Unknown'
    if (urlParams.c) s.c = urlParams.c
    if (urlParams.z) s.z = urlParams.z

    this.set(i.join('-'), s)
}