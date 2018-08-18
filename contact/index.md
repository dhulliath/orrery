---
layout: doc
title: Feedback
navbar: true
---

No one man is an island of development and ideas. I welcome input, be it suggestions, criticisms, encouragement, and what have you. Those in the Hokum camp are probably going to be ignored. 

<form name="feedback" method="POST" netlify-honeypot="hithere" action="/contact/done/" netlify>
	<p style="visibility:hidden">
		<label>Human's don't touch this <input name="hithere" /></label>
	</p>
	<p>
		<label>Name <input type="text" name="name" /></label>
	</p>
	<p>
		<label>Email <input type="email" name="email" /></label>
	</p>
	<p>
		<label>Interest in Astrology
			<select name="interest">
				<option>Casual</option>
				<option>Astrologer</option>
				<option>Enthusiast</option>
				<option>Hokum</option>
				<option>I'm a Developer and your scripts suck</option>
			</select>
		</label>
	</p>
	<p>
		<label>Comments <textarea style="width: 100%; height:8em;" name="notions"></textarea></label>
	</p>
	<p>
		<button type="submit">Send</button>
	</p>
</form>