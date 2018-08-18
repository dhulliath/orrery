const NAMESPACES = {
    'svg': "http://www.w3.org/2000/svg",
    'xlink': 'http://www.w3.org/1999/xlink'
}

var MakeOrrery = function(querySelector, basicData, aspects, updatecb) {
    var SVG = {
        query: querySelector,
        dom: document.querySelector(querySelector)
    }
    var Planets = basicData
    var Aspects = aspects
    var update_callback = updatecb

    var _setPlanet = function(planetID, longitude, speed) {
        if (!Planets[planetID]) Planets[planetID] = {}

        Planets[planetID].longitude = longitude
        Planets[planetID].speed = speed
    }
    var _updatePlanet = function(planetID) {
        var planetDom = SVG.dom.querySelector('.Planet#'+planetID)
        if (!planetDom) console.log(planetID)
        planetDom.setAttribute('transform', 'rotate(' + Astro.adjustRenderLongitude(Planets[planetID].longitude) + ' 5000 5000)')
        planetDom.querySelector('textPath').textContent = Astro.zodiacCoord(Planets[planetID].longitude)
        try {
            if (Planets[planetID].speed < 0) {
                planetDom.querySelector('.retrograde').style.visibility = 'visible'
            } else {
                planetDom.querySelector('.retrograde').style.visibility = 'hidden'
            }
        } catch (e) {
            //so there's no retrograde, whatfuckingever
        }
    }
    var _refreshPlanets = function() {
        _clearAspects()
        for (planet in Planets) {
            //if (!Planets[planet].longitude) _setPlanet(planet, Math.random() * 360, (Math.random() * 10) - 2)
            _updatePlanet(planet)
            for (planet2 in Planets) {
                for (aspect in Aspects) {
                    var diff = Math.abs(Planets[planet].longitude - Planets[planet2].longitude)
                    var aMin = Aspects[aspect].angle - (Aspects[aspect].orb / 2)
                    var aMax = Aspects[aspect].angle + (Aspects[aspect].orb / 2)
                    if (diff > aMin && diff < aMax && planet != planet2) {
                        if (!SVG.dom.querySelector('.zodiacAspects #'+planet2+'-'+planet)) _drawAspect(planet, planet2, aspect)
                    }
                }
            }
        }
    }
    this.refreshPlanets = _refreshPlanets
    this.setPlanet = _setPlanet
    this.updatePlanet = _updatePlanet

    var _updateAscendant = function(longitude) {
        console.log('updating ascendant to: ', longitude)
        var ringDom = SVG.dom.querySelector('.zodiacRing')
        ringDom.setAttributeNS(null, 'transform', 'rotate(' + Astro.correctLongitude(longitude - 30) + ' 5000 5000)')
        /*_setPlanet('Ascendant', longitude)
        _updatePlanet('Ascendant')*/
    }
    this.updateAscendant = _updateAscendant

    var _updateHouse = function(houseID, longitude, size) {
        while (houseID >= 12) houseID -= 12
        while (houseID < 0) houseID += 12

        var houseDom = SVG.dom.querySelector('.House#house'+houseID)
        var houseLabelDom = SVG.dom.querySelector('#pathHouse'+houseID+'Label')
        var houseCoordDom = SVG.dom.querySelector('#pathHouse'+houseID+'Coord')
        var halfWidth = size / 2;

        var radii = {
            inner: 4650,
            outer: 4800,
            label: 4675,
            coord: 4825
        }
        var points = {
            labelL: Calcs.polarToCartesian(5000, 5000, radii.label, 0 - halfWidth),
            labelR: Calcs.polarToCartesian(5000, 5000, radii.label, halfWidth),
            innerL: Calcs.polarToCartesian(5000, 5000, radii.inner, 0 - halfWidth + 0.5),
            innerR: Calcs.polarToCartesian(5000, 5000, radii.inner, halfWidth),
            outerL: Calcs.polarToCartesian(5000, 5000, radii.outer, 0 - halfWidth + 0.5),
            outerR: Calcs.polarToCartesian(5000, 5000, radii.outer, halfWidth),
            innerBar: Calcs.polarToCartesian(5000, 5000, radii.inner, halfWidth - 0.5),
            outerBar: Calcs.polarToCartesian(5000, 5000, radii.outer, halfWidth - 0.5),
            coordL: Calcs.polarToCartesian(5000, 5000, radii.coord, 0 - halfWidth),
            coordR: Calcs.polarToCartesian(5000, 5000, radii.coord, halfWidth)
        }
        var blockPath = [
            'M', points.innerL.x, points.innerL.y,
            'A', radii.inner, radii.inner, 0, 0, 1, points.innerR.x, points.innerR.y,
            'L', points.outerR.x, points.outerR.y,
            'A', radii.outer, radii.outer, 0, 0, 0, points.outerL.x, points.outerL.y,
            'Z',
            'M', points.innerBar.x, points.innerBar.y,
            'L', points.outerBar.x, points.outerBar.y
            ].join(' ')
        var labelPath = [
            'M', points.labelL.x, points.labelL.y,
            'A', radii.label, radii.label, 0, 0, 1, points.labelR.x, points.labelR.y
            ].join(' ')
        var coordPath = [
            'M', points.coordL.x, points.coordL.y,
            'A', radii.coord, radii.coord, 0, 0, 1, points.coordR.x, points.coordR.y
            ].join(' ')
        
        houseDom.setAttribute('transform', 'rotate(' + Astro.adjustRenderLongitude((longitude + halfWidth) + 180) + ' 5000 5000)')
        houseDom.querySelector('.block').setAttributeNS(null, 'd', blockPath)
        houseDom.querySelector('.coord textPath').textContent = Astro.zodiacCoord(longitude)+' '
        houseDom.style.visibility = 'visible'

        houseLabelDom.setAttributeNS(null, 'd', labelPath)
        houseCoordDom.setAttributeNS(null, 'd', coordPath)
    }
    var _clearHouses = function() {
        for (var i = 0; i < 12; i++) {
            SVG.dom.querySelector(".House#house"+i).style.visibility = 'hidden'
        }
    }
    this.updateHouse = _updateHouse
    this.clearHouses = _clearHouses

    var _drawAspect = function(planet1, planet2, type) {
        if (!Planets[planet1]) return false;
        if (!Planets[planet2]) return false;
        var aspectDom = SVG.dom.querySelector('.aspect#' + [planet1, planet2].sort().join('-'))//SVG.dom.querySelector('.aspect#' + planet1 + '-' + planet2)
        var aspectGroupDom = SVG.dom.querySelector('.zodiacAspects')
        if (aspectDom) aspectDom.remove()

        var points = [
            Astro.polarToCartesian(5000, 5000, Planets[planet1].radius, Astro.adjustRenderLongitude(Planets[planet1].longitude + 180)),
            Astro.polarToCartesian(5000, 5000, Planets[planet2].radius, Astro.adjustRenderLongitude(Planets[planet2].longitude + 180))
        ]

        var angle = Planets[planet1].longitude - Planets[planet2].longitude

        var largeArcFlag = Math.abs(Planets[planet1]['longitude'] - Planets[planet2]['longitude']) < 180 ? "0" : "1";
        var radiiMult = 2;
        var invertFlag = angle >= 0 ? "1" : "0";
        var pathData = ['M', points[0].x, points[0].y, 'A', Planets[planet1]['radius'] * radiiMult, Planets[planet2]['radius'] * radiiMult, angle, 0, 1 - invertFlag, points[1].x, points[1].y].join(' ')

        var newPath = document.createElementNS(NAMESPACES.svg, 'path')
        newPath.id = [planet1, planet2].sort().join('-')//planet1+'-'+planet2
        newPath.setAttributeNS(null, 'd', pathData)
        newPath.setAttribute('class', 'aspect '+type)
        aspectGroupDom.appendChild(newPath)

        update_callback('ASPECT', planet1, planet2, type)

    }
    this.drawAspect = _drawAspect
    var _clearAspects = function() {
        var DomGroup = SVG.dom.querySelector('.zodiacAspects')
        while (DomGroup.firstChild) {
            DomGroup.removeChild(DomGroup.firstChild)
        }
    }
    

    return this
}

var egtGeneric = {
    'queryString': function(obj) {
        let ret = [];
        for (let d in obj) {
            ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(obj[d]))
        }
        return ret.join('&')
    }
}

function jsUcfirst(string) 
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

var Astro = {
    'decodeQuery': function(q) {
        var details = q.match(/.{1,5}/g)
    },
    'requestChart': function(args, callback) {
        var apiHTTP = new XMLHttpRequest()
        apiHTTP.open("GET", "https://api.earlgraytease.com/ephemeris/?"+egtGeneric.queryString(args), true)
        apiHTTP.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
        apiHTTP.onreadystatechange = function () {
            if (apiHTTP.readyState == 4 && apiHTTP.status == 200) {
                var results = JSON.parse(apiHTTP.responseText)
                callback(results)
            }
        }
        apiHTTP.send(null)
    },
    'zodiacCoord': function(longitude, format = '%d %z %M\'%S\"') {
        /* %D - decimal degrees within sign
         * %d - degrees minus minutes and seconds (rounded down)
         * %z - short zodiac ex 'Sco'
         * %Z - long zodiac ex 'Scorpio'
         * %m - minutes, minus seconds (rounded down)
         * %M - same as above with leading zero
         * %s - full seconds
         * %S - full seconds with leading zero
         */
        longitude = Astro.correctLongitude(longitude)

        const zodiacShort = ['Ari', 'Tau', 'Gem', 'Can', 'Leo', 'Vir', 'Lib', 'Sco', 'Sag', 'Cap', 'Aqu', 'Pis'];
        const zodiacLong = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Saggitarius', 'Capricorn', 'Aquarius', 'Pisces'];
        
        var signNum = Math.floor(longitude / 30);
        var signPos = parseFloat(longitude) - (signNum * 30);
        var degree = Math.floor(signPos);
        var fullMin = (signPos - degree) * 60;
        var min = Math.floor(fullMin);
        var fullSec = Math.round((fullMin - min) * 60);

        var leadMin = (min < 10 ? "0"+min : min);
        var leadSec = (fullSec < 10 ? "0"+fullSec : fullSec);

        format = format.replace('%D', signPos);
        format = format.replace('%d', degree);
        format = format.replace('%z', zodiacShort[signNum]);
        format = format.replace('%Z', zodiacLong[signNum]);
        format = format.replace('%m', min);
        format = format.replace('%M', leadMin);
        format = format.replace('%s', fullSec);
        format = format.replace('%S', leadSec);

        return format;
    },
    'adjustRenderLongitude': function (longitude) {
        return 0 - Astro.correctLongitude(longitude) + 120;
    },
    'correctLongitude': function(longitude) {
        while (longitude < 0) longitude += 360
        while (longitude > 360) longitude -= 360
        return longitude
    },
    'getSign': function (longitude) {
        var signs = ['Ari', 'Tau', 'Gem', 'Can', 'Leo', 'Vir', 'Lib', 'Sco', 'Sag', 'Cap', 'Aqu', 'Pis'];
        var signNum = Math.floor(longitude / 30);
        return signs[signNum]
    },
    'polarToCartesian': function (centerX, centerY, radius, angleInDegrees) {
        var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    }
}