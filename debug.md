---
layout: doc
---



# inspection

{% assign pages = site.pages | where: 'dataset','signs_sun' %}
{{ pages | inspect }}
{% for p in pages %}
## {{p.name}}

{{ p.content | truncatewords: 50 | markdownify }}
{{ p | inspect }}
{% endfor %}
