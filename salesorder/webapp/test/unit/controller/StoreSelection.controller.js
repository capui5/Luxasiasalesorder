/*global QUnit*/

sap.ui.define([
	"comluxasia/salesorder/controller/StoreSelection.controller"
], function (Controller) {
	"use strict";

	QUnit.module("StoreSelection Controller");

	QUnit.test("I should test the StoreSelection controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
