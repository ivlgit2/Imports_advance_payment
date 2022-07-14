/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"bri/IMPORTS_ADV_PAYMENT/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});