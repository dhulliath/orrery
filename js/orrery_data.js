---
language: en
---
/*
import testSigns from '../_data/orrery/signs.json';
var basicAstroSigns = JSON.parse('{{ site.data.orrery.signs }}')
console.log(testSigns)*/

{% assign oStrings = site.data.orrery.strings[page.language] %}

var OrreryData = {}

OrreryData.activePlanets = {}

OrreryData.gradients = [
    {% for sign in site.data.orrery.signs %}
    {
        "id": "{{ sign[0] | capitalize }}",
        "color_start": "{{ sign[1].color.main }}",
        "color_end": "{{ sign[1].color.accent }}"
    },
    {% endfor %}{% for planet in site.data.orrery.planets %}
    {
        "id": "{{planet[0] | capitalize }}",
        "color_start": "{{ planet[1].color.main }}",
        "color_end": "{{ planet[1].color.accent }}"
    },
    {% endfor %}
]

OrreryData.paths = [
    {
        id: "ConstellationLabel",
        d: "M 3975.227158472752 1107.6400958713784 A 4025 4025 0 0 1 6024.772841527249 1107.640095871379"
    },
    {% for planet in site.data.orrery.planets %}
    {
        id: "{{ planet[0] | capitalize }}Label",
        d: "M{{ planet[1].orbit.orb | divided_by: 2 | plus: 5100 }},{{ 5000 | plus: planet[1].orbit.order }} A {{ planet[1].orbit.order }} {{ planet[1].orbit.order }} 0 1 0 {{ 0 | minus: planet[1].orbit.orb | divided_by: 2 | plus: 4900 }} {{ 5000 | plus: planet[1].orbit.order }}"
    },
    {% endfor %}
]

OrreryData.signs = [
    {% for sign in site.data.orrery.signs %}
    {
        "id": "{{ sign[0] | capitalize }}",
        "glyph": "{{ sign[1].graphics.glyph }}",
        "label": "{{ sign[0] | capitalize }}",
        "order": "{{ sign[1].order }}"
    },
    {% endfor %}
]

OrreryData.planets = {
    {% for planet in site.data.orrery.planets %}
    {% assign planet_label = planet[1].name %}
    {{ planet[0] | capitalize }}: {
        "id": "{{ planet[0] | capitalize }}",
        "label": "{{ oStrings[planet_label] }}",
        "orb": "{{ planet[1].orbit.orb }}",
        "radius": {{ planet[1].orbit.order }},
        {% if planet[1].can_retrograde %}"can_retrograde": {{ planet[1].can_retrograde }}{% endif %}
    },{% endfor %}
}

OrreryData.aspects = {
    {% for aspect in site.data.orrery.aspects %}
    "{{aspect.name}}": {
        angle: {{aspect.angle}},
        orb: {{aspect.leeway}}
    },
    {% endfor %}
}