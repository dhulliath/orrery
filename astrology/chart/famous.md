---
layout: doc
title: Famous Charts
---

<ul id="savedcharts">
{%- for p in site.data.orrery.famous_horoscopes -%}
<li>
<a href="/astrology/chart/?l={{ p.name}}&d={{ p.birthday }}&c={{ p.city }}&z={{ p.zodiac }}&h={{ p.houses }}&p={{ p.planets }}"><p class="title">{{ p.name }}: {{ p.zodiac }}</p></a>
<p class="subtitle">{{ p.birthday }}, {{ p.city }}</p>
</li>
{%- endfor -%}
</ul>