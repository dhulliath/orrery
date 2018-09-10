////Graphics Engine
function AstroGraphics(svg_element) {
	// Call Engine constructor
	AstroEngine.call(this)
	// construct graphics engine
	this.dom = {svg: svg_element}
	this.dom.defs = this.dom.svg.querySelector('defs')
	this.dom.aspects = this.dom.svg.querySelector('.zodiacAspects')
	for (var i = 0; i < 12; i++) {
		this._extendHouse(this.house.get(i), i)
	}
	this._extendAscendant(this.house.get(0), '.zodiacRing')
	/*this._extendPlanet(this.house.get(0), 'ascendant')
	this._extendPlanet(this.house.get(9), 'midheaven')*/
	for (var p in this.planet.db) {
		this._extendPlanet(this.planet.get(p), p)
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
	//address.dom.planet.labels = address.dom.planet.group.querySelector('.labels')
	address.dom.planet.coord = address.dom.planet.group.querySelector('.coord textPath')
	address.dom.planet.retrograde = address.dom.planet.group.querySelector('.retrograde')
	address.dom.planet.circle = address.dom.planet.group.querySelector('circle')

	address.event_onChange.push(function(o, a) {
		let angle = 0 - o.longitude + 120
		o.dom.planet.coord.textContent = o.toString()
		o.dom.planet.group.setAttribute('transform', 'rotate(' + angle + ' 5000 5000)')
		//o.dom.planet.labels.setAttribute('transform', 'rotate(' + (0-angle) + ' 5000 ' + o.dom.planet.circle.cy.baseVal.value + ')')
		if (o.dom.planet.retrograde) {
			o.dom.planet.retrograde.style.visibility = (o.flags[0] == 1 ? 'visible' : 'hidden')
		}
		o.dom.planet.group.style.visibility = 'visible'
	})

	for (var ia in address.aspects) {
		let a = address.aspects[ia]
		if (!a.dom) {
			var p = document.createElementNS('http://www.w3.org/2000/svg', 'path')
			p.id = [address.id, ia].sort().join('-')
			this.dom.aspects.appendChild(p)
			a.dom = {path: p}
			a.event.onUpdate.push((o) => {
				/// Event Function for AstroAspect
				if (o.type != null) {
					let r = [o._addresses[0].dom.planet.circle.cy.baseVal.value - 5000, 
						o._addresses[1].dom.planet.circle.cy.baseVal.value - 5000]
					let points = [AstroDraw._polarToCartesian(5000, 5000, r[0], 0 - o._addresses[0].longitude + 300),
						AstroDraw._polarToCartesian(5000, 5000, r[1], 0 - o._addresses[1].longitude + 300)]
					let angle = o._addresses[0].longitude - o._addresses[1].longitude
					let invert = angle >= 0 ? "1" : "0"
					let largeArc = (Math.abs(angle) < 180 ? "0" : "1")

					let path = ['M', points[0].x, points[0].y, 'A', r[0] * 2, r[1] * 2, 0, 0, 1 - invert, points[1].x, points[1].y].join(' ')
					
					o.dom.path.setAttribute('class', 'aspect ' + o.type)
					o.dom.path.setAttributeNS(null, 'd', path)
					o.dom.path.style.visibility = 'visible'
				} else {
					o.dom.path.style.visibility = 'hidden'
					o.dom.path.setAttributeNS(null, 'd', '')
				} // Done function
			})
		}
	}
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