---
layout: doc
title: Todo
navbar: false
---

# Todo List
I'll try to do these in top to bottom order.

### Planet house calculation
This'll probably be a helper function in the AstroEngine class. Probably along the lines of lookupHouse(AstroAddress), and return the appropriate index or AstroAddress to the caller. Is it worth extending AstroAddress so planets can look up looking at themselves? Probably not; they'd have to refer back to the other database in AstroEngine. Sounds like a lot of legwork.



### Dynamic interpretation loading
I see no reason to stop with hooking functions onto the AstroAddress objects. Probably more of the same going to happen here. Another piece of trickery may be ensuring this fires _after_ aspects are determined.



### Styling
As you can see from this bare-assed barely styled page, little to no effort has been put into the actual styling. Which is kinda offensive to me. But I've been busy on backend stuff. I'm thinking something with modern HTML5 grid layout. Pretty. Boxy. With plenty of graphical doodads to bring mobile internet to its knees, and enough background scripts to make an iPad chug along like an overburdened treadmill. Maybe some hookers too.



### Make Chart work in Microsft Edge
Honestly I don't think I'll ever get to this.

---

# Completed

### (August 19, 2018) ~~User Interface~~
Automatically bookmark chart URL's in client database, provide labelling system. For charts entered on the client, save with original chart data (year, month, day, hour, minute, location, etc). Modify generated URL to include a label parameter for friendly sharing.

### (August 18, 2018) ~~Aspect calculation and generation~~ 
This will likely be another onChange function added to each planetary AstroAddress. Anticipating trickiness fitting the Ascendant and Midheaven into this. I don't know if I'll bother with making a seperate Aspect class, since they're just a relationship between two points. Although maybe it would make sense...

Idea:
* Automatically create relating aspect as planets are set in the database, linked to their respective planets. Attach onChange function to poke the aspect class whenever planet longitudes are set, triggering a re-check of applicable aspects. onAspectPresent fires another function that'll update graphics, descriptive text, etc. Downside, it'll fire each class twice if every planet is changed. Upside, dynamically changing charts will automagically create and remove aspects. Houses already update twice in the current model because of their tight interdependence, and that doesn't seem to hurt things too much.