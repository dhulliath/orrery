---
layout: doc
title: Feedback
navbar: true
---

No one man is an island of development and ideas. I welcome input, be it suggestions, criticisms, encouragement, and what have you. Those in the Hokum camp are probably going to be ignored. This is not intended to single out and target individuals for their beliefs and practices, rather bring together a wide variety of said beliefs and practices, with the hope of producing contructive dialogue.

<form name="feedback" method="POST" netlify-honeypot="hithere" action="/contact/done/" netlify>
	<p style="visibility:hidden">
		<label>Humans don't touch this <input name="hithere" /></label>
	</p>
	<p>
		<label>Name <input type="text" name="name" /></label>
	</p>
	<p>
		<label>Email <input type="email" name="email" /></label>
	</p>
	<p>
		<h4>Fields of Interest</h4>
		{%- for interest in site.data.contact_interests -%}
		<label><input type="checkbox" name="interest_{{ interest.title }}">{{ interest.title }}</label><br/>
		{%- endfor -%}
	</p>
	<p>
		<label>Comments <textarea style="width: 100%; height:8em;" name="comments"></textarea></label>
	</p>
	<p>
		<button type="submit">Send Feedback</button>
	</p>
</form>