---
layout: doc
title: Feedback
navbar: true
menus: main
---

No one man is an island of development and ideas. I welcome input, be it suggestions, criticisms, encouragement, and what have you. Those in the Hokum camp are probably going to be ignored. This is not intended to single out and target individuals for their beliefs and practices, rather bring together a wide variety of said beliefs and practices, with the hope of producing contructive dialogue.

<form name="feedback" method="POST" netlify-honeypot="name" action="/contact/done/" netlify>
	<p style="visibility:hidden">
		<label>Humans don't touch this <input name="name" /></label>
	</p>
	<div class="input-group mb-3">
		<div class="input-group-prepend"><span class="input-group-text">Name</span></div>
		<input class="form-control" type="text" name="namez" />
	</div>
	<div class="input-group mb-3">
		<div class="input-group-prepend"><span class="input-group-text">Email Address</span></div>
		<input class="form-control" type="email" name="email" />
	</div>
	<h4>Fields of Interest</h4>
	{%- for interest in site.data.contact_interests -%}
	<div class="form-check">
		<input class="form-check-input" type="checkbox" id="interest_{{ interest.title | slug }}" name="interest_{{ interest.title }}">
		<label class="form-check-label" for="interest_{{ interest.title | slug }}">{{ interest.title }}</label>
	</div>
	{%- endfor -%}
	<div class="form-group mb-3">
		<label for="comments">Comments</label>
		<textarea class="form-control" id="comments" name="comments" rows="5"></textarea>
	</div>
	<p>
		<button class="btn btn-primary" type="submit">Send Feedback</button>
	</p>
</form>