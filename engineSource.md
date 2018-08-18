---
layout: doc
title: Engine Source
css_additional: 
 - /css/syntaxHighlight.css
navbar: true
---

Yes I know my commenting and documentation leaves a lot to be desired. Here's some repos, and the source code. It's definitely overengineered since I don't use half the properties I've set in AstroAddress. Not even all of the constructor options either.

....Isn't it weird how much of the work goes into generating a pretty image, when the real meat of a natal chart is the text that it throws at you? Tells you a lot about my priorities.

The engine has been split into two files:
* [Engine Source Code](#enginesource)
* [Graphics Source Code](#graphicssource)
* [Site Repository](https://github.com/dhulliath/orrery)
* [Backend Repository](https://github.com/dhulliath/ojtekapi)

## Engine Source Code <a id="enginesource" />

{% highlight js linenos %}
{% include_relative js/orreryEngine.js %}
{% endhighlight %}

## Graphics Engine Source Code <a id="graphicssource" />

{% highlight js linenos %}
{% include_relative js/orreryGraphics.js %}
{% endhighlight %}