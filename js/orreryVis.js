// orreryVis.js

function AstroVis(AstroEngine, Canvas) {
	this.DOM = {
		canvas: Canvas
	};
	this.AstroEngine = AstroEngine;
	this.DOM.Context = this.DOM.Context.getContext("2d");

}