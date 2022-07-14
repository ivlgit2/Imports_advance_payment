function initModel() {
	var sUrl = "/abap/sap/opu/odata/BRI/CMN_SERVICES/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}