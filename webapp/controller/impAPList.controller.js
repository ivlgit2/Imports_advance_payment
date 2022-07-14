sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox"
], function (Controller, MessageBox) {
	"use strict";

	return Controller.extend("bri.IMPORTS_ADV_PAYMENT.controller.impAPList", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf bri.IMPORTS_ADV_PAYMENT.view.impAPList
		 */
		onInit: function () {
			this.router = sap.ui.core.UIComponent.getRouterFor(this);
			this.omodelParntList = this.getOwnerComponent().getModel("masterModel");
			this.omodelParntEdit = this.getOwnerComponent().getModel("cmnService");
			
		},

		_handleRouteMatched: function () {
			document.location.reload();
		},
		onPressApRef: function (oEvent) {
			this.router = sap.ui.core.UIComponent.getRouterFor(this);
			// var _self = this;
			// var sel = "1";

			this.SelectedText = oEvent.getSource().getText();
			this.router.navTo("impAPedit", {

				advrefno: this.SelectedText

			});
		},

		onSearch: function () {
			var advrefnofrom = this.getView().byId("type").getValue();
			var advrefnoto = this.getView().byId("type1").getValue();
			var filters = new Array();
			var filterval;
			if (advrefnofrom !== "") {
				if (advrefnoto !== "") {
					filters.pop();
					filterval = new sap.ui.model.Filter("aprefnr", sap.ui.model.FilterOperator.BT, advrefnofrom, advrefnoto);
					filters.push(filterval);
				} else {
					filterval = new sap.ui.model.Filter("aprefnr", sap.ui.model.FilterOperator.EQ, advrefnofrom);
					filters.push(filterval);
				}
			}
			var sorters = new Array();

			var sortval = new sap.ui.model.Sorter("aprefnr", true, false);

			sorters.push(sortval);
			this.read(filters, sorters);
		},
		read: function (filters, sorters) {

			var _self = this;
			_self.omodelParntList.read("/xBRIxi_ILCADVMASTR", {
				urlParameters: {
					$top: 5000
				},
				filters: filters,
				sorters: sorters,
				success: function (getData) {
					//	console.log('Response Data : ', getData.results.length);
					if (getData.results.length <= 0) {
						//	MessageBox.error("No Matching Result(s) Found for the Filter");
						//	_self.getView().byId("vendorTable").setVisible(false);
						// _self._CloseBusyDialog();

					} else {
						for (var i = 0; i < getData.results.length; i++) {
							_self.bankrefdate = getData.results[i].bankrefdate;
							_self.remdate = getData.results[i].remittancedate;
							getData.results[i].bankrefdate = _self.formatDate(_self.bankrefdate);
							getData.results[i].remittancedate = _self.formatDate(_self.remdate);
						}
						var oModelData = new sap.ui.model.json.JSONModel();
						oModelData.setData(getData);
						_self.getView().setModel(oModelData, "advModel");
						_self.getView().byId("advpymnttbl").setVisible(true);
						// _self.getView().byId("downloadBtn").setVisible(true);
						// _self.getView().byId("table_footer").setText("No. of Records : " + getData.results.length);
						// _self._CloseBusyDialog();

					}
				},
				error: function (error) {
					MessageBox.error("Something Went Wrong . Please Try again Later");

					// _self._CloseBusyDialog();
				}

			});

		},
		FnUpdateClassifyCT: function (oEvent) {
			var _self = this;
			var calTo = sap.ui.getCore().byId("selectionbasedon").getSelectedKey();
			var docNo = sap.ui.getCore().byId("pOtype").getValue();
			var param1 = docNo + "ZZZ" + calTo;
			var param2 = "AP";
			_self.omodelParntList.read("/xBRIxCE_POITEM_CALC(param1='" + param1 + "',param2='" + param2 + "')/Set", {
				urlParameters: {
					$top: 5000
				},
				// sorters: sorters,
				success: function (getData , response) {
					if(getData.results[0].msg !== ""){
					sap.ui.getCore().byId("save").setVisible(false);
						MessageBox.error(getData.results[0].msg + " " + "for the document number" + " " + docNo );
					}if(getData.results[0].msg == ""){
						sap.ui.getCore().byId("save").setVisible(true);
					}
				},
				error: function (response) {

				}

			});
		},
		formatDate: function (value) { // value is the date 
			if (typeof value === 'undefined' || value === null || value == "00000000" || value == "") {
				return "";
			} else if (value instanceof Date) {
				var NewDateform = value;
				var mnth = ("0" + (NewDateform.getMonth() + 1)).slice(-2);
				var day = ("0" + NewDateform.getDate()).slice(-2);
				var output = [day, mnth, NewDateform.getFullYear()].join("/");
				return output;
			} else {
				var year = value.substring(0, 4);
				var month = value.substring(4, 6);
				var day = value.substring(6, 8);
				return day + "/" + month + "/" + year; // return the formatted date
			}
		},

		onPressCreate: function (oEvent) {
			this.inputId = oEvent.getSource().getId();
			if (!this._valueHelpGstn) {
				this._valueHelpGstn = sap.ui.xmlfragment("bri.IMPORTS_ADV_PAYMENT.view.fragments.createSelection", this);
				this.getView().addDependent(this._valueHelpGstn);
			}

			this._valueHelpGstn.open();
			//	this.router.navTo("ImpAPcreate");
		},
		handleValueHelpTypePO: function (oEvent) {
			var _self = this;
			_self.inputId = oEvent.getSource().getId();
			_self.selectKey = sap.ui.getCore().byId("selectionbased").getSelectedKey();
			var filterval;
			var filters = new Array();

			filterval = new sap.ui.model.Filter("type", sap.ui.model.FilterOperator.EQ, _self.selectKey);

			filters.push(filterval);
			_self.omodelParntEdit.read("/xBRIxI_PO_SO_HEADER", {
				urlParameters: {
					$top: 5000
				},
				filters: filters,
				// sorters: sorters,
				success: function (getData) {
					var oModelData = new sap.ui.model.json.JSONModel();
					oModelData.setData(getData);
					_self.getView().setModel(oModelData, "searchHelpModel");
				}

			});
			if (!this._valueHelpPO) {
				this._valueHelpPO = sap.ui.xmlfragment("bri.IMPORTS_ADV_PAYMENT.view.fragments.purchasingDoc", this);
				this.getView().addDependent(this._valueHelpPO);
			}

			this._valueHelpPO.open();
			//	this.router.navTo("ImpAPcreate");
		},
		_handleValueHelpPO: function (oEvent) {

			if (oEvent.getParameter("selectedItem")) {
				var oSelectedItem = oEvent.getParameter("selectedItem").getTitle();
				if (oSelectedItem) {
					var reqNoInputFrom = sap.ui.getCore().byId(this.inputId);
					reqNoInputFrom.setValue(oSelectedItem);
				}
				oEvent.getSource().getBinding("items").filter([]);
			}
		},
		handleValueHelpTypeAdvRefNo: function (oEvent) {
			this.inputId = oEvent.getSource().getId();
			if (!this._valueHelpAdvPymnt) {
				this._valueHelpAdvPymnt = sap.ui.xmlfragment("bri.IMPORTS_ADV_PAYMENT.view.fragments.advancepymtrefno", this);
				this.getView().addDependent(this._valueHelpAdvPymnt);
			}

			this._valueHelpAdvPymnt.open();
			//	this.router.navTo("ImpAPcreate");
		},
		_handleValueHelpCloseCmpny: function (oEvent) {

			if (oEvent.getParameter("selectedItem")) {
				var oSelectedItem = oEvent.getParameter("selectedItem").getTitle();
				if (oSelectedItem) {
					var reqNoInputFrom = this.getView().byId(this.inputId);
					reqNoInputFrom.setValue(oSelectedItem);
				}
				oEvent.getSource().getBinding("items").filter([]);
			}
		},
		onDialogClose: function () {
		

			var refTo = sap.ui.getCore().byId("selectionbased").getValue();
			var calTo = sap.ui.getCore().byId("selectionbasedon").getValue();
			var docNo = sap.ui.getCore().byId("pOtype").getValue();
				if((refTo == "") || (calTo == "") || (docNo == "")){
					MessageBox.error("Fill all required values");
					
				}else{
			var key = sap.ui.getCore().byId("selectionbasedon").getSelectedKey();
			var keyPo = sap.ui.getCore().byId("selectionbased").getSelectedKey();

			this.router.navTo("ImpAPcreate", {
				withRefTo: refTo,
				withCalTo: calTo,
				withDocNo: docNo,
				withKeyNo: key,
				withKeyPoNo: keyPo

			});
			sap.ui.getCore().byId("selectionbased").setValue("");
			sap.ui.getCore().byId("selectionbasedon").setValue("");
			sap.ui.getCore().byId("pOtype").setValue("");
			this.router.navTo("ImpAPcreate");
}
		}

	});

});