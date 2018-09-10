---
layout: doc
---


site

{{ site }}
{% for p in site %}
* {{p }}{% endfor %}

---

site.kab_sefirot

{% for p in site.kab_sefirot %}
* {{ p }}{% endfor %}

---

site.collections

{{ site.collections }}

{% for p in site.collections %}
* {{ p }}{% endfor %}

---

site.collections.kab_sefirot

{{ site.collections.kab_sefirot }}
{% for p in site.collections.kab_sefirot %}
* {{ p }}{% endfor %}

