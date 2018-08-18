---
layout: doc
title: Changelog
navbar: true
---

# Changelog

#### August 18, 2018
Aspects are now calculated and generated by a new class, AstroAspect. This is constructed with two AstroAddresses, and adds an onChange event to both address which will trigger the AstroAspect to recheck its aspect. If the aspect changes, it will trigger its own onUpdate() event tree.

* AstroCollection has been extended with an AstroAspects class. This class automatically adds aspects connecting each member of its database.
* AstroEngine has been updated to use an AstroAspects class instead of AstroCollection to store planetary data.
* AstroGraphics adds a draw function to each AstroAspects class under every entry of the planet database. This function redraws the aspect line, or hides as necessary.

With all of these update hooks, it should be easy to create interpretation update functions. Engine has also been split into two files, the base data engine, and the Graphics engine extension.

#### August 15, 2018
Orrery Input is done. A lot was done on the code side of this bastard. We now have an engine with decoupled graphics and data management. Data management has been tuned to the point where a single variable is changed within the engine resulting in automagic changes across the whole thing. The next step is to extend the engine further to dynamically generate aspects. After that the engine will be tweaked to allow dynamic interpretation loading.

The chart will load itself with the querystring ?h=[houseEncoding]&p=[planetEncoding]. This seems to happen while the page is loading, which is great since you won't see it's default state, and the houses/ascendant/midheaven can be hidden by default and revealed if the data's there. No need for a clearing function.

#### August 11, 2018
Created AstroAddress type which automagically calculates seconds minutes degrees longitude, encoding, etc

Created AstroDatabase type, manages planets and houses, maintained in extended AstroAddress types. This will make generating synastry charts easier, since we only have to create two of these and start comparing.

Started creating AstroSVGController. Generates planets and houses depending on data within AstroDatabase. 
TODO:
* Aspect generation with AstroSVGController.
Probably create an AstroAspect class which can be fed planets and aspects?

#### August 9, 2018
* Removed Babel dependency since no longer required for ReactJS and other shit.
* Planning out data format for querystring

#### August 7, 2018

I've played with a few different ways of generating the orrery:
* ReactJS
* Vue
* A new homegrown class-type system (because classes are the future, right?)

I have concluded going back to the original is probably the best method. Despite larger file sizes because everything is mostly pre-drawn, size doesn't matter as much since the host has high bandwidth, and I bet gzipping is great at minimizing html docs. Another advantage is since JS is fucking finicky when it comes to generating SVGs, this bypasses all of that. Updating an existing DOM is so much easier than generating it on the fly.

#### July 26, 2018

The backend is providing incorrect calculations. Don't know why yet. Super annoying. 