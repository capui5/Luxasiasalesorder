sap.ui.define([], function () {
	"use strict";
	return {
	
		precendingZerosRemvoal:function(articleno){
			if(articleno != null){
            articleno = articleno.replace(/^0+/, '');
            return articleno;
			}
        },
		decimal : function(d){
			return parseFloat(d).toFixed(2);// if value is string
			// if number use below statement
			// return d.toFixed(2)
		}
		
	};
});