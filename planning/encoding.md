---
layout: bare
title: Number encoding
js_additional:
  - /js/sampledata.js
  - /js/orreryEngine.js
---

<script>

var db2 = new AstroDatabase()
db2.houses = sampleData.house
db2.planets = sampleData.planet

var db = new AstroDatabase()
db.houses = db2.houseQuery
db.planets = db2.planetQuery

//db2.debug()
//db.debug()

</script>

# Why

Anonymity is a key ideal in this service. To that end, data is not stored on any servers, only on the client or in a URL. To facilitate sharing of data anonymously, and create non cumbersome URL's which can be shared via SMS, encoding and compressing data is necessary. With this method, a maximum of three variables will be shared, with a minimum of one:
* Planetary positions (mandatory)
* House positions (not always known due to missing birthtime/location)
* Label (entirely unnecessary except for memory)

## TOC
* [Encoding](#encoding)
* [Houses](#houses)
* [Planets](#planets)

[](#encoding)
# Number Encoding

These samples are using Peter's chart as sample data. Numbers are converted into an arbitrary base<script>document.write(AstroAddress()._schema.length)</script> system. This may be changed a few times, perhaps with an included version variable in the query string as times change.

#### Method

Encoder takes the longitude of the address and multiples it by the schema length, multipled by (2 ^ flag_count)
Since longitudinal values won't exceed the value of 360, there is some extra working room. At present three flags are the maximum permissable without overflowing beyond 4 characters per address.

## Query String
_<script>document.write(db.toString())</script>_

This string will fully regenerate the house and planet positions of my chart, losing accuracy only below the second count (1 / 3600 of a degree).

[](#houses)
# Houses

Since the widths of houses are reflected (house 1 width equals house 7 width), we only need to store 6 values of house positions. Everything can then be calculated by adding 180 degrees for the complementary house, and widths can be calculated by subtracting longitudes.

## Test Data
<table width="100%">
<thead>
	<tr>
		<th colspan="4"><script type="text/javascript">document.write('Encoded String: ' + db.houseQuery + '<br/>')</script></th>
	</tr>
</thead>
<tr>
	<th>House</th>
	<th>Encoded</th>
	<th>Decoded</th>
	<th>Width</th>
	<th>Zodiac String</th>
</tr>
<tbody>
	<script type="text/javascript">
for (var i in db.houses) {
	document.write('<tr><td>' + i + '</td><td>' + db.houses[i].encodedString + '</td><td>' + db.houses[i].longitude + '</td><td>' + db.houses[i].width + '</td><td>' + db.houses[i].toString() + '</td></tr>')
}
	</script>

</tbody>
</table>

[](#planets)
# Planets

Planets are more complicated since they mostly don't relate to each other. Exceptions to this rule are the Ascendant (Cusp of the first house), the Midheaven (cusp of the tenth house), and the Lunar Nodes (always opposite to each other, so only one is needed). The backend provides longitude and apparent speed data for the planets. Speed is necessary only for calculating if a planet is retrograde or not. Some planets do not go retrograde.

At present there are 16 planets tracked by the Orrery. Assuming four digits like the planets, this results in a 64 byte string for longitudinal data. Including a single byte for retrogradiness results in 80 bytes. Sun and Moon are never retrograde, North Node is always retrograde, leading to 76 optimized bytes, but not ideal.

11-August-2018

In redesigned AstroAddress class, allowances for up to three binary flags are allowed, by multiplying the value by 8 and adding a value from 0 though 7. These are then parsed into binary flags. First flag indicates a retrograde

<table width="100%">
	<thead>
		<tr>
			<th colspan="5"><script>document.write(db.planetQuery)</script></th>
		</tr>
		<tr>
			<th>Planet</th>
			<th>Encoded</th>
			<th>Longitude</th>
			<th>Expected</th>
			<th>Speed</th>
			<th>Address</th>
		</tr>
	</thead>
	<tbody>
		<script>
for (var i in db.planets) {
	document.write('<tr><td>' + [db.__planet[i], db.planets[i].encodedString, db.planets[i].longitude, sampleData.planet[[db.__planet[i]]].longitude, db.planets[i].flags[0], db.planets[i].toString()].join('</td><td>') + '</td></tr>')
}
		</script>
	</tbody>
</table>

### Notes

Yes, the Sun, Moon, various asteroids, and calculated points are technically not planets. For sake of simplicity these wandering celestial elements are all lumped the same label.
