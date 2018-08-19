---
layout: doc
---
{%- for p in site.pages -%}

<div style="border: 1px solid black; padding: 1em; margin: 1em;">

{% highlight js %}
{{ p }}
{% endhighlight %}

</div>

{%- endfor -%}