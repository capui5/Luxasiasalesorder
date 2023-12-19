sap.ui.define([], function () {
	"use strict";
	return {
	
		precendingZerosRemvoal:function(articleno){
			if(articleno != null){
            articleno = articleno.replace(/^0+/, '');
            return articleno;
			}
        }

	};
});