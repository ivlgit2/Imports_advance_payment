sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox"
], function (Controller, MessageBox) {
	"use strict";

	return Controller.extend("bri.IMPORTS_ADV_PAYMENT.controller.ImpAPcreate", {
		onInit: function () {
			this.router = sap.ui.core.UIComponent.getRouterFor(this);
			this.router.attachRoutePatternMatched(this._handleRouteMatched, this);
			this.omodelParnt = this.getOwnerComponent().getModel("masterModel");
			this.omodelParntEdit = this.getOwnerComponent().getModel("cmnService");
			this.advpymntEdit = {
				"results": []
			};
			this.advpymntItemsEdit = {
				"results": []
			};

			this.advpymntEditMsHDR = {
				"results": []
			};
			this.pushItems = {
				"results": []
			};
			this.deleteItems = {
				"results": []
			};
			this.advpymntItemsCalEdit = {
				"results": []
			};
			this.temJson = {
				"results": []
			};

			this.checkBoxJson = {
				"results": []
			};

			this.checkEbeln = 0;
			this.itemSelect = 0;
			this.onNavTrigger = 0;

		},
		// filtercombo: function () {
		// 	var _self = this;
		// 	_self.T = sap.ui.table.Table.extend("customTable", {
		// 		metadata: {
		// 			properties: {
		// 				saveSelected: {
		// 					type: "boolean",
		// 					defaultValue: false
		// 				}
		// 			},
		// 		},
		// 		addFilterSelectedContext: function (string) {
		// 			if (this.FilterSelectedContext.indexOf(string) == -1) {
		// 				this.FilterSelectedContext.push(string);
		// 			}
		// 		},
		// 		removeFilterSelectedContext: function (string) {
		// 			var i = this.FilterSelectedContext.indexOf(string);
		// 			this.FilterSelectedContext.splice(i, 1);
		// 		},
		// 		removeSelectionInterval: function (i, f) {
		// 			this._oSelection.removeSelectionInterval(i, f);
		// 			if (this.getSaveSelected())
		// 				this.removeFilterSelectedContext(this.getContextByIndex(i).getPath());
		// 			return this;
		// 		},
		// 		addSelectionInterval: function (i, f) {
		// 			this._oSelection.addSelectionInterval(i, f);
		// 			if (this.getSaveSelected())
		// 				this.addFilterSelectedContext(this.getContextByIndex(i).getPath());
		// 			return this;
		// 		},
		// 		renderer: {}
		// 	});
		// 	_self.prototype.FilterSelectedContext = [];

		// 	_self.C = sap.ui.table.Column.extend("customColumn", {
		// 		metadata: {
		// 			aggregations: {
		// 				comparator: {
		// 					type: "object",
		// 					multiple: false,
		// 					defaultValue: null
		// 				}
		// 			},
		// 		},

		// 	});

		// },

		_handleRouteMatched: function (oEvent) {
			if (this.onNavTrigger == 0) {
				var param = oEvent.getParameter("arguments");
				var _self = this;
				_self.customEntity = 1;
				_self.getView().byId("refTo").setText(param.withRefTo);
				_self.getView().byId("seltyp").setText(param.withCalTo);

				_self.advrefno = param.withDocNo;
				_self.calType = param.withCalTo;
				_self.keyVal = param.withKeyNo;
				_self.keyPO = param.withKeyPoNo;
				//	var oTable = _self.byId("idItemTbl");
				//	var aIndices = oTable.setSelectedIndices(true);
				if (_self.calType == "Quantity Based") {
					_self.getView().byId("amenge").setEnabled(true);
				}
				if (_self.calType == "Value Based") {
					_self.getView().byId("anetwr1").setEnabled(true);
					_self.getView().byId("applquant").setVisible(false);
				}
				if (_self.customEntity === 1) {
					var param3 = _self.advrefno + "ZZZ" + _self.keyVal;
					var param4 = "AP";
					_self.omodelParnt.read("/xBRIxCE_POITEM_CALC(param1='" + param3 + "',param2='" + param4 + "')/Set", {
						urlParameters: {
							$top: 5000
						},
						// sorters: sorters,
						success: function (getData) {

							_self.calculateAnetwr = 0;
							for (var j = 0; j < getData.results.length; j++) {
								_self.itmLength = getData.results.length;
								var oModelDataItem = new sap.ui.model.json.JSONModel();
								oModelDataItem.setData(getData);
								_self.getView().setModel(oModelDataItem, "advCreateItemModel");
								_self.itemAmenge = parseFloat(getData.results[j].amenge);
								var itemNetpr = parseFloat(getData.results[j].netpr);
								getData.results[j].anetwr = (_self.itemAmenge * itemNetpr).toString();
								_self.advpymntItemsEdit.results[j] = getData.results[j];

								_self.pushItems.results.push(_self.advpymntItemsEdit.results[j]);
								_self.calculateAnetwr = parseFloat(_self.calculateAnetwr) + parseFloat(_self.advpymntItemsEdit.results[j].anetwr);

								// var objitm = _self.advpymntItemsEdit.results;
								// var allNamesitm = [];
								// for (var i = 0; i < objitm.length; i++) {
								// 	var invnameITM = objitm[i].ebeln;

								// 	if (!allNamesitm.includes(invnameITM)) {

								// 		allNamesitm.push(objitm[i].ebeln);
								// 		_self.pushItems.results.push(_self.advpymntItemsEdit.results[j]);
								// 	}
								// }

							}

							var oTable = _self.byId("idItemTbl");
							var cb = oTable.addSelectionInterval(0, _self.itmLength - 1);

							var oModelData = new sap.ui.model.json.JSONModel();
							oModelData.setData(_self.advpymntEdit);
							_self.getView().setModel(oModelData, "advCreateModel");
							if (_self.advpymntEdit.results.length != 0) {
								_self.exchRate = 1;
								_self.advamountlcExg = _self.calculateAnetwr * _self.exchRate;
								_self.advpymntEdit.results[0].anetwr = _self.calculateAnetwr.toString();
								_self.advpymntEdit.results[0].anetwrloc = _self.advamountlcExg.toString();
								_self.getView().getModel("advCreateModel").refresh();
							}
							// _self.readHeaderInitial();
							var oModelDataHDR = new sap.ui.model.json.JSONModel();
							oModelDataHDR.setData(_self.advpymntEditMsHDR.results[0]);
							_self.getView().setModel(oModelDataHDR, "advCreateHDRModel");
							if (_self.advpymntEditMsHDR.results.length != 0) {

								_self.advpymntEditMsHDR.results[0].advamountfc = _self.calculateAnetwr.toString();
								_self.advpymntEditMsHDR.results[0].advamountlc = _self.advamountlcExg.toString();
								_self.getView().getModel("advCreateHDRModel").refresh();
							}
						},
						// error: function (response) {
						// 	MessageBox.error("Something Went Wrong . Please Try again Later");

						// }
					});
				}
				var filterval;
				var filters = new Array();

				filterval = new sap.ui.model.Filter("ebeln", sap.ui.model.FilterOperator.EQ, _self.advrefno);

				filters.push(filterval);
				_self.omodelParntEdit.read("/xBRIxI_PO_SO_HEADER", {
					urlParameters: {
						$top: 5000
					},
					filters: filters,
					// sorters: sorters,
					success: function (getData) {
						var oModelDataHDR = new sap.ui.model.json.JSONModel();
						oModelDataHDR.setData(getData.results[0]);
						_self.getView().setModel(oModelDataHDR, "advCreateHDRModel");
						_self.advpymntEditMsHDR.results[0] = getData.results[0];
						_self.exchRate = getData.results[0].kursf;
						_self.exchRate = parseFloat(_self.exchRate);
						_self.advamountlcExg = _self.calculateAnetwr * _self.exchRate;
						_self.advpymntEditMsHDR.results[0].advamountfc = _self.calculateAnetwr.toString();
						_self.advpymntEditMsHDR.results[0].advamountlc = _self.advamountlcExg.toString();

						_self.getView().getModel("advCreateHDRModel").refresh();

						for (var i = 0; i < getData.results.length; i++) {
							var oModelData = new sap.ui.model.json.JSONModel();
							oModelData.setData(getData);
							_self.getView().setModel(oModelData, "advCreateModel");
							_self.getView().byId("selectionbased1").setSelectedKey(_self.advrefno);
							_self.advpymntEdit.results[i] = getData.results[i];
							_self.advpymntEdit.results[i].anetwr = _self.calculateAnetwr.toString();
							_self.advpymntEdit.results[i].anetwrloc = _self.advamountlcExg.toString();
							_self.advpymntEdit.results[i].aprefnr = "";
							_self.getView().getModel("advCreateModel").refresh();

						}
					}

				});

				// var oModelData = new sap.ui.model.json.JSONModel();
				// oModelData.setData(getData);
				// this.calculateAmount(oEvent);
			}
		},

		// OnSelectChange: function (oEvent) {
		// 	debugger;
		// 	var _self = this;
		// 	var oTable = oEvent.getSource().getParent();
		// 	var retainSelection = oTable.getSaveSelected();
		// 	if (_self.itemSelect == 0) {
		// 		var TotalAppliedAmount = 0;
		// 		//	var tableIndx = oEvent.getSource().getParent().getIndex();
		// 		for (var d = 0; d < _self.advpymntItemsEdit.results.length; d++) {
		// 			_self.checkBoxJson.results[d] = _self.advpymntItemsEdit.results[d];
		// 		}
		// 		var oTable = _self.byId("idItemTbl");
		// 		var selectedData = [];
		// 		var cbTableIndex = oTable.getSelectedIndex();
		// 		//get index of selected rows,
		// 		var aIndices = oTable.getSelectedIndices();

		// 		//loop on indices
		// 		for (var i = 0; i < aIndices.length; i++) {

		// 			//read data of selected rows by index
		// 			var tableContext = oTable.getContextByIndex(aIndices[i]);

		// 			//read data column by column
		// 			var data = oTable.getModel("advCreateItemModel").getProperty(tableContext.getPath());
		// 			_self.advpymntItemsEdit.results.splice(cbTableIndex - 1, 1);
		// 		}
		// 		for (var e = 0; e < _self.advpymntItemsEdit.results.length; e++) {
		// 			var TotalAppliedAmount = parseFloat(TotalAppliedAmount) + parseFloat(_self.advpymntItemsEdit.results[e].anetwr);
		// 			var liveChangeEbeln = _self.advpymntItemsEdit.results[e].ebeln;
		// 		}

		// 		_self.fnUpdateAppliedAmount(TotalAppliedAmount, liveChangeEbeln);
		// 	}
		// },
		addItemRow: function () {

			// this.commrate = 
			var _self = this;
			if (!_self.advpymntEdit) {
				/*************** DEPB details ***************************/
				_self.advpymntEdit = {
					results: [{
						// doctyp: this.docType,
						// docno: this.docNumber,
						aprefnr: "",
						ebeln: _self.advpymntEdit.results.ebeln,
						tnetwr: _self.advpymntEdit.results.total_amount,
						anetwr: "",
						anetwrloc: "",
						waers: _self.advpymntEdit.results.document_currency

					}]
				};
				var oModelIndDetails = new sap.ui.model.json.JSONModel([]);
				oModelIndDetails.setData(_self.advpymntEdit);
				_self.getView().setModel(oModelIndDetails, "advCreateModel");

				/*************** oModelDEPB details ***************************/
			} else {
				//	this.readHeaderEntity();
				_self.advpymntEdit.results.push({

					aprefnr: "",
					ebeln: "",
					tnetwr: "",
					anetwr: "",
					anetwrloc: "",
					waers: ""

				});
				var oModelIndDetails = new sap.ui.model.json.JSONModel([]);
				oModelIndDetails.setData(_self.advpymntEdit);
				_self.getView().setModel(oModelIndDetails, "advCreateModel");
				//	this.getView().getModel("Lists").refresh();
			}
		},
		fnUpdateHeaderAA: function () {
			var _self = this;
			var calculateHDRAA = 0;
			for (var c = 0; c < _self.advpymntEdit.results.length; c++) {
				calculateHDRAA = calculateHDRAA + parseFloat(_self.advpymntEdit.results[c].anetwr);

			}
			var calculateHDRAALOC = calculateHDRAA * parseFloat(_self.exchRate);
			calculateHDRAA = calculateHDRAA.toString();
			calculateHDRAALOC = calculateHDRAALOC.toString();
			_self.getView().byId("advamountfc").setValue(calculateHDRAA);
			_self.getView().byId("advamountlc").setValue(calculateHDRAALOC);
		},
		fnUpdateAppliedAmount: function (TotalAppliedAmount, liveChangeEbeln) {
			var _self = this;
			if (!_self.advpymntEdit) {} else {
				//	for (var c = 0 ; c <  _self.advpymntEdit.results.length ; c++ ){
				if (!liveChangeEbeln) {} else {
					var FilterInvoiceHeaderData = _self.advpymntEdit.results.filter(a => a.ebeln == liveChangeEbeln);
					TotalAppliedAmount = TotalAppliedAmount ? TotalAppliedAmount : "";
					//	curr = curr ? curr : null;
					FilterInvoiceHeaderData[0].anetwr = "";
					var TotalAppliedAmountLOC = TotalAppliedAmount * parseFloat(_self.exchRate);
					FilterInvoiceHeaderData[0].anetwr = ("" + TotalAppliedAmount + "") ? ("" + TotalAppliedAmount + "") : null;
					FilterInvoiceHeaderData[0].anetwrloc = ("" + TotalAppliedAmountLOC + "") ? ("" + TotalAppliedAmountLOC + "") : null;

					// 	_self.omodelParntEdit.update("/xBRIxi_ILCADVPO(aprefnr='" + _self.advrefno + "',ebeln='" + ebelnUpdt + "')", _self.advpayhdrValues
					// 	.results[d]

					// );
					//	FilterInvoiceHeaderData[0].invoicecur = curr;
					//if(this.InvoiceSelectedItemIndex.toString()!="") {
					//	this.InvoiceItemDetails.results[this.InvoiceSelectedItemIndex].Invoicedt=FilterInvoiceHeaderData[0].Invoicedt;
					//}
				}
				//	}
				_self.getView().getModel("advCreateModel").refresh();
				_self.fnUpdateHeaderAA();
			}
		},

		calculateAmount: function (oEvent) {
			var _self = this;

			var len = _self.advpymntItemsEdit.results.length;
			var TotalAppliedAmount = 0;
			var tableIndex = oEvent.getSource().getParent().getIndex();
			var tableEbeln = oEvent.getSource().getParent().getCells()[0].getValue();
			_self.temJson.results = _self.pushItems.results.filter(a => a.ebeln == tableEbeln);
			for (var b = 0; b < _self.temJson.results.length; b++) {
				const amengeValue = parseInt(_self.temJson.results[tableIndex].amenge);
				_self.applQuant = oEvent.getSource().getParent().getCells()[5].getValue();
				_self.applQuant = parseInt(_self.applQuant);

				if (_self.applQuant > amengeValue) {
					MessageBox.error("Applied quantity is higher than available quantity");
					oEvent.getSource().getParent().getCells()[5].setValue(amengeValue);
					_self.valueCheck = 1;
					break;
				} else {
					_self.applQuant = oEvent.getSource().getParent().getCells()[5].getValue();
					_self.applQuant = parseInt(_self.applQuant);
					_self.povalue = _self.temJson.results[tableIndex].netpr;
					_self.povalue = parseFloat(_self.povalue);
					_self.poQuantity = _self.temJson.results[tableIndex].menge;
					_self.poQuantity = parseFloat(_self.poQuantity);
					_self.applAmount = (_self.applQuant) * (_self.povalue);
					_self.applAmount = parseFloat(_self.applAmount.toFixed(5));
					oEvent.getSource().getParent().getCells()[9].setValue(_self.applAmount);
					_self.getView().getModel("advCreateItemModel").refresh();
					var TotalAppliedAmount = parseFloat(TotalAppliedAmount) + parseFloat(_self.temJson.results[b].anetwr);
					var liveChangeEbeln = _self.temJson.results[b].ebeln;
					_self.valueCheck = 0;
				}
			}
			//	_self.getView().getModel("advCreateItemModel").refresh();
			if (_self.valueCheck == 0) {
				//	_self.getView().getModel("advCreateItemModel").refresh();
				_self.fnUpdateAppliedAmount(TotalAppliedAmount, liveChangeEbeln);
			}
		},
		calculateValue: function (oEvent) {
			var _self = this;
			_self.getView().getModel("advCreateItemModel").refresh();
			var TotalAppliedAmount = 0;
			var tableIndex = oEvent.getSource().getParent().getIndex();
			var tableEbeln = oEvent.getSource().getParent().getCells()[0].getValue();

			_self.temJson.results = _self.pushItems.results.filter(a => a.ebeln == tableEbeln);
			_self.anetwr = oEvent.getSource().getParent().getCells()[8].getValue();
			_self.anetwr = parseFloat(_self.anetwr);
			const anetwrValue = parseInt(_self.temJson.results[tableIndex].anetwr);
			for (var b = 0; b < _self.temJson.results.length; b++) {
				if (_self.anetwr > anetwrValue ) {
					MessageBox.error("Applied value is higher than available value");
					oEvent.getSource().getParent().getCells()[8].setValue(anetwrValue);
					_self.valueCheck = 1;
					break;
				} else {
					_self.temJson.results[tableIndex].anetwr = parseFloat(_self.anetwr);
					var TotalAppliedAmount = parseFloat(TotalAppliedAmount) + parseFloat(_self.temJson.results[b].anetwr);
					var liveChangeEbeln = _self.temJson.results[b].ebeln;
					_self.valueCheck = 0;
				}
			}
			//	_self.getView().getModel("advCreateItemModel").refresh();
			if (_self.valueCheck == 0) {
				//	_self.getView().getModel("advCreateItemModel").refresh();
				_self.fnUpdateAppliedAmount(TotalAppliedAmount, liveChangeEbeln);
			}
		},
		FnUpdateClassify: function (oEvent) {
			debugger;
			var _self = this;
			var getEbeln = oEvent.getParameter("selectedItem").getText();
			_self.temJson.results = _self.pushItems.results.filter(a => a.ebeln == getEbeln);
			_self.newLen = _self.temJson.results.length;
			var oModelDataItem = new sap.ui.model.json.JSONModel();
			oModelDataItem.setData(_self.temJson);
			_self.getView().setModel(oModelDataItem, "advCreateItemModel");
			_self.getView().getModel("advCreateItemModel").refresh();
			var oTable = _self.byId("idItemTbl");
			var cb = oTable.addSelectionInterval(0, _self.newLen - 1);
			_self.itemSelect = 1;
		},
		// FnUpdateClassify: function (oEvent) {
		// 	var _self = this;
		// 	var flag = 0;
		// 	var paramSelect = oEvent.getParameter("selectedItem").getText();
		// 	var param1 = paramSelect + "ZZZ" + _self.keyVal
		// 	var param2 = "AP";
		// 	_self.omodelParnt.read("/xBRIxCE_POITEM_CALC(param1='" + param1 + "',param2='" + param2 + "')/Set", {
		// 		urlParameters: {
		// 			$top: 5000
		// 		},
		// 		// sorters: sorters,
		// 		success: function (getData) {

		// 			for (var j = 0; j < getData.results.length; j++) {
		// 				var oModelDataItem = new sap.ui.model.json.JSONModel();
		// 				oModelDataItem.setData(getData);
		// 				_self.getView().setModel(oModelDataItem, "advCreateItemModel");
		// 				_self.advpymntItemsEdit.results[j] = getData.results[j];

		// 			}
		// 		}

		// 	});

		// },

		deleteHDRPO: function (oArg) {
			debugger;

			var _self = this;
			if (_self.advpymntEdit.results.length == 1) {
				MessageBox.error("Atleast one PO Number should be attached");
			} else {
				//var filters = new Array();
				if (_self.advpymntEdit.results.length != 0) {
					_self.slno = oArg.getSource().getParent().getCells()[0].getValue();
					_self.rowIndex = oArg.getSource().getParent().getIndex();
					var delLen = _self.pushItems.results.length;
					// _self.row = oArg.getSource().getParent().getCells()[0].getSelectedRow();

				}
				MessageBox.confirm("Changes Cannot be Undone. Do you Really Want to Delete?", {
					actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
					onClose: function (oAction) {
						if (oAction === sap.m.MessageBox.Action.OK) {
							if (_self.advpymntEdit.results.length != 0) {
								for (var j = 0; j < _self.pushItems.results.length; j++) {
									if (_self.pushItems.results[j].ebeln == _self.slno) {
										_self.pushItems.results.splice(j, 1)
										j = j - 1;

									}
								}
								_self.advpymntEdit.results.splice(_self.rowIndex, 1);
								_self.getView().getModel("advCreateModel").refresh();
								//	_self.fnUpdateHeaderPO();
								_self.fnUpdateHeaderAA();

								MessageBox.success("Record Deleted Successfully");
							}

						}
					}
				});
			}
		},
		// readHeaderEntity: function () {
		// 	var _self = this;
		// 	var param3 = _self.oSelectedItem + "ZZZ" + _self.keyVal;
		// 	var param4 = "AP";
		// 	_self.omodelParnt.read("/xBRIxCE_POITEM_CALC(param1='" + param3 + "',param2='" + param4 + "')/Set", {
		// 		urlParameters: {
		// 			$top: 5000
		// 		},
		// 		// sorters: sorters,
		// 		success: function (getData) {

		// 			_self.calculateAnetwr = 0;
		// 			_self.calculateTnetwr = 0;
		// 			for (var j = 0; j < getData.results.length; j++) {

		// 				// var oModelDataItem = new sap.ui.model.json.JSONModel();
		// 				// oModelDataItem.setData(getData);
		// 				// _self.getView().setModel(oModelDataItem, "advCreateItemModel");
		// 				_self.advpymntItemsCalEdit.results[j] = getData.results[j];

		// 				_self.calculateAnetwr = parseFloat(_self.calculateAnetwr) + parseFloat(_self.advpymntItemsCalEdit.results[j].anetwr);
		// 				_self.calculateTnetwr = parseFloat(_self.calculateTnetwr) + parseFloat(_self.advpymntItemsCalEdit.results[j].netwr);
		// 			}
		// 			for (var t = 0; t < _self.advpymntEdit.results.length; t++) {
		// 				var oModelData = new sap.ui.model.json.JSONModel();
		// 				oModelData.setData(_self.advpymntEdit);
		// 				_self.getView().setModel(oModelData, "advCreateModel");
		// 				_self.advpymntEdit.results[_self.getIndex].tnetwr = _self.calculateTnetwr.toString();
		// 				_self.advpymntEdit.results[_self.getIndex].anetwr = _self.calculateAnetwr.toString();
		// 				_self.advpymntEdit.results[_self.getIndex].anetwrloc = _self.calculateAnetwr.toString();
		// 				_self.advpymntEdit.results[_self.getIndex].waers = _self.advpymntItemsEdit.results[0].waers;
		// 				_self.getView().getModel("advCreateModel").refresh();
		// 			}
		// 			_self.fnUpdateHeaderAA();
		// 			_self.calculateCurrency();
		// 		}
		// 	});
		// },
		readHeaderEntity: function () { //changed
			var _self = this;
			var param3 = _self.oSelectedItem + "ZZZ" + _self.keyVal;
			var param4 = "AP";
			_self.omodelParnt.read("/xBRIxCE_POITEM_CALC(param1='" + param3 + "',param2='" + param4 + "')/Set", {
				urlParameters: {
					$top: 5000
				},
				// sorters: sorters,
				success: function (getData) {
					if (getData.results.length == 0) {
						_self.advpymntEdit.results.splice(_self.getIndex, 1);
						_self.getView().getModel("advCreateModel").refresh();
						MessageBox.error("Items already utilized for the Doc Number" + " " + _self.oSelectedItem);
					} else {
						_self.calculateAnetwr = 0;
						_self.calculateTnetwr = 0;
						for (var j = 0; j < getData.results.length; j++) {

							// var oModelDataItem = new sap.ui.model.json.JSONModel();
							// oModelDataItem.setData(getData);
							// _self.getView().setModel(oModelDataItem, "advCreateItemModel");
							_self.advpymntItemsCalEdit.results[j] = getData.results[j];
							var rhAmenge = parseFloat(_self.advpymntItemsCalEdit.results[j].amenge);
							var rhNetpr = parseFloat(_self.advpymntItemsCalEdit.results[j].netpr);
							_self.advpymntItemsCalEdit.results[j].anetwr = (rhAmenge * rhNetpr).toString();
							_self.calculateAnetwr = parseFloat(_self.calculateAnetwr) + parseFloat(_self.advpymntItemsCalEdit.results[j].anetwr);
							_self.calculateTnetwr = parseFloat(_self.calculateTnetwr) + parseFloat(_self.advpymntItemsCalEdit.results[j].netwr);
						}
						for (var t = 0; t < _self.advpymntEdit.results.length; t++) {
							var oModelData = new sap.ui.model.json.JSONModel();
							oModelData.setData(_self.advpymntEdit);
							_self.getView().setModel(oModelData, "advCreateModel");
							_self.calculateAnetwrLOC = _self.exchRate * _self.calculateAnetwr;
							_self.advpymntEdit.results[_self.getIndex].tnetwr = _self.calculateTnetwr.toString();
							_self.advpymntEdit.results[_self.getIndex].anetwr = _self.calculateAnetwr.toString();
							_self.advpymntEdit.results[_self.getIndex].anetwrloc = _self.calculateAnetwrLOC.toString();
							_self.advpymntEdit.results[_self.getIndex].waers = _self.advpymntItemsCalEdit.results[0].waers;
							_self.getView().getModel("advCreateModel").refresh();
						}
						_self.fnUpdateHeaderAA();
						_self.calculateCurrency();
					}
				}
			});
		},
		calculateCurrency: function () {
			var _self = this;
			var filterval;
			var filters = new Array();

			filterval = new sap.ui.model.Filter("ebeln", sap.ui.model.FilterOperator.EQ, _self.oSelectedItem);

			filters.push(filterval);
			_self.omodelParntEdit.read("/xBRIxI_PO_SO_HEADER", {
				urlParameters: {
					$top: 5000
				},
				filters: filters,
				// sorters: sorters,
				success: function (getData) {

					for (var i = 0; i < _self.advpymntItemsCalEdit.results.length; i++) {
						if (getData.results[0].waers != _self.advpymntEdit.results[0].waers) {
							_self.advpymntEdit.results.splice(_self.getIndex, 1);
							_self.getView().getModel("advCreateModel").refresh();
							MessageBox.error("Currency is not same");
							this.checkEbeln = 1;

						} else {
							_self.pushItems.results.push(_self.advpymntItemsCalEdit.results[i]);

						}
					}
				}

			});
		},

		handleCmnValueHelpPOCrt: function (oEvent) {
			this.inputId = oEvent.getSource().getId();

			if (!this._valueHelpPO) {
				this._valueHelpPO = sap.ui.xmlfragment("bri.IMPORTS_ADV_PAYMENT.view.fragments.purchasingDoc", this);
				this.getView().addDependent(this._valueHelpPO);
			}

			this._valueHelpPO.open();
		},

		onNavBack: function () {
			this.onNavTrigger = 1;

			window.history.go(-1);
			//	document.location.reload();
		},
		// changeValue: function (oEvent) {
		// 	var valueUpdate = oEvent.getSource().getParent().getCells()[9].getValue();
		// 	valueUpdate = parseInt(valueUpdate);
		// 	this.getView().byId("advamountfc").setValue(valueUpdate);
		// 	this.getView().byId("advamountlc").setValue(valueUpdate);

		// },
		handleCmnValueHelpCurr: function (oEvent) {
			this.inputId = oEvent.getSource().getId();
			if (!this._valueHelpCurrency) {
				this._valueHelpCurrency = sap.ui.xmlfragment("bri.IMPORTS_ADV_PAYMENT.view.fragments.currency", this);
				this.getView().addDependent(this._valueHelpCurrency);
			}

			this._valueHelpCurrency.open();
			//	this.router.navTo("ImpAPcreate");
		},
		_handleValueHelpCloseCurr: function (oEvent) {

			if (oEvent.getParameter("selectedItem")) {
				var oSelectedItem = oEvent.getParameter("selectedItem").getTitle();
				if (oSelectedItem) {
					var reqNoInputFrom = this.getView().byId(this.inputId);
					reqNoInputFrom.setValue(oSelectedItem);
				}
				oEvent.getSource().getBinding("items").filter([]);
			}
		},
		handleValueHelpTypePO: function (oEvent) {
			var _self = this;
			_self.inputId = oEvent.getSource().getId();
			_self.getIndex = oEvent.getSource().getParent().getIndex();
			var filterval;
			var filters = new Array();

			filterval = new sap.ui.model.Filter("type", sap.ui.model.FilterOperator.EQ, _self.keyPO);

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
			if (!_self._valueHelpPO) {
				_self._valueHelpPO = sap.ui.xmlfragment("bri.IMPORTS_ADV_PAYMENT.view.fragments.purchasingDoc", this);
				_self.getView().addDependent(_self._valueHelpPO);
			}

			_self._valueHelpPO.open();
			//	this.router.navTo("ImpAPcreate");
		},
		_handleValueHelpPO: function (oEvent) {
			//	this.CheckInvoiceDuplicates();

			// this.Index =  oEvent.getSource().getParent.getIndex();
			if (oEvent.getParameter("selectedItem")) {
				this.oSelectedItem = oEvent.getParameter("selectedItem").getTitle();

				if (this.oSelectedItem) {
					var reqNoInputFrom = this.getView().byId(this.inputId);
					reqNoInputFrom.setValue(this.oSelectedItem);
					this.CheckInvoiceDuplicates();
					if (this.checkEbeln == 0) {
						this.readHeaderEntity();
					}
				}
				oEvent.getSource().getBinding("items").filter([]);

			}
		},
		handleCmnValueHelpBnk: function (oEvent) {
			this.inputId = oEvent.getSource().getId();
			if (!this._valueHelpBnk) {
				this._valueHelpBnk = sap.ui.xmlfragment("bri.IMPORTS_ADV_PAYMENT.view.fragments.beneficiaryBank", this);
				this.getView().addDependent(this._valueHelpBnk);
			}

			this._valueHelpBnk.open();
			//	this.router.navTo("ImpAPcreate");
		},
		_handleValueHelpBnk: function (oEvent) {

			if (oEvent.getParameter("selectedItem")) {
				var oSelectedItem = oEvent.getParameter("selectedItem").getTitle();
				if (oSelectedItem) {
					var reqNoInputFrom = this.getView().byId(this.inputId);
					reqNoInputFrom.setValue(oSelectedItem);
				}
				oEvent.getSource().getBinding("items").filter([]);
			}
		},
		handleCmnValueHelpInco: function (oEvent) {
			this.inputId = oEvent.getSource().getId();
			if (!this._valueHelpInco) {
				this._valueHelpInco = sap.ui.xmlfragment("bri.IMPORTS_ADV_PAYMENT.view.fragments.incoterms", this);
				this.getView().addDependent(this._valueHelpInco);
			}

			this._valueHelpInco.open();
			//	this.router.navTo("ImpAPcreate");
		},
		_handleValueHelpInco: function (oEvent) {

			if (oEvent.getParameter("selectedItem")) {
				var oSelectedItem = oEvent.getParameter("selectedItem").getTitle();
				if (oSelectedItem) {
					var reqNoInputFrom = this.getView().byId(this.inputId);
					reqNoInputFrom.setValue(oSelectedItem);
				}
				oEvent.getSource().getBinding("items").filter([]);
			}
		},
		handleCmnValueHelpCntry: function (oEvent) {
			this.inputId = oEvent.getSource().getId();
			if (!this._valueHelpCntry) {
				this._valueHelpCntry = sap.ui.xmlfragment("bri.IMPORTS_ADV_PAYMENT.view.fragments.country", this);
				this.getView().addDependent(this._valueHelpCntry);
			}

			this._valueHelpCntry.open();
			//	this.router.navTo("ImpAPcreate");
		},
		_handleValueHelpCntry: function (oEvent) {

			if (oEvent.getParameter("selectedItem")) {
				var oSelectedItem = oEvent.getParameter("selectedItem").getTitle();
				if (oSelectedItem) {
					var reqNoInputFrom = this.getView().byId(this.inputId);
					reqNoInputFrom.setValue(oSelectedItem);
				}
				oEvent.getSource().getBinding("items").filter([]);
			}
		},
		CheckInvoiceDuplicates: function () {

			var obj = this.advpymntEdit.results;
			var allNames = [];
			for (var i = 0; i < obj.length; i++) {
				var invname = obj[i].ebeln;
				var incurr = obj[0].waers;
				var incurrNew = obj[i].waers;
				if (!allNames.includes(invname)) {

					allNames.push(obj[i].ebeln);
					this.checkEbeln = 0;
				} else {
					MessageBox.error("Duplicates cannot be entered");
					obj.splice(i, 1);
					this.checkEbeln = 1;
					return false;
				}
			}

			return true;
		},
		// CheckInvoiceDuplicates: function () {

		// 	var obj = this.advpymntEdit.results;
		// 	var allNames = [];
		// 	// for (var i = 0; i < obj.length; i++) {
		// 		var invname = obj[i].ebeln;
		// 		var incurr = obj[i].waers;
		// 		if (!allNames.includes(invname)) {
		// 			allNames.push(obj[i].ebeln);
		// 			this.checkEbeln = 0;
		// 		} else {
		// 			MessageBox.error("Duplicate document number cannot be entered");
		// 			obj.splice(i,1);
		// 			this.checkEbeln = 1;
		// 			return false;
		// 		}
		// //	}

		// 	return true;
		// },

		refreshHeader: function () {
			this.getView().byId("bankrefno").setValue("");
			this.getView().byId("inco1").setValue("");
			this.getView().byId("cntryorg").setValue("");
			this.getView().byId("consignctry").setValue("");
			this.getView().byId("shipmode").setValue("");
			this.getView().byId("fcurr").setValue("");
			this.getView().byId("bnkadvdet").setValue("");
			this.getView().byId("bankrefdate").setValue("");
			this.getView().byId("remittancedate").setValue("");
			this.getView().byId("adcode").setValue("");
			this.getView().byId("purpofx").setValue("");
			this.getView().byId("advamountfc").setValue("");
			this.getView().byId("kursf").setValue("");
			this.getView().byId("advamountlc").setValue("");
			this.getView().byId("bankl").setValue("");
			this.getView().byId("hktid").setValue("");
			this.getView().byId("swift").setValue("");
			this.getView().byId("benbankl").setValue("");
			this.getView().byId("bankcurr").setValue("");
			this.getView().byId("telexcharge").setValue("");
			this.getView().byId("swiftcharges").setValue("");
			this.getView().byId("bankcomm").setValue("");
		},
		onPressSave: function () {
			var _self = this;
			var selindex = _self.getView().byId("idItemTble").getSelectedIndex();

			_self.bankrefdate = (_self.getView().byId("bankrefdate").getValue() ? _self.getView().byId("bankrefdate").getValue() : null);
			_self.remittancedate = (_self.getView().byId("remittancedate").getValue() ? _self.getView().byId("remittancedate").getValue() :
				null);
			_self.telexcharge = (_self.getView().byId("telexcharge").getValue() ? _self.getView().byId("telexcharge").getValue() : null);
			_self.swiftcharges = (_self.getView().byId("swiftcharges").getValue() ? _self.getView().byId("swiftcharges").getValue() : null);
			_self.bankcomm = (_self.getView().byId("bankcomm").getValue() ? _self.getView().byId("bankcomm").getValue() : null);
			_self.json = {
				bukrs: _self.getView().byId("bukrs").getValue(),
				vendor: _self.getView().byId("lifnr").getValue(),
				bankrefno: _self.getView().byId("bankrefno").getValue(),
				inco1: _self.getView().byId("inco1").getValue(),
				cntryorg: _self.getView().byId("cntryorg").getValue(),
				consignctry: _self.getView().byId("consignctry").getValue(),
				shipmode: _self.getView().byId("shipmode").getValue(),
				bnkadvdet: _self.getView().byId("bnkadvdet").getValue(),
				bankrefdate: _self.bankrefdate,
				remittancedate: _self.remittancedate,
				purpofx: _self.getView().byId("purpofx").getValue(),
				fcurr: _self.getView().byId("fcurr").getValue(),
				advamountfc: _self.getView().byId("advamountfc").getValue(),
				kursf: _self.getView().byId("kursf").getValue(),
				advamountlc: _self.getView().byId("advamountlc").getValue(),
				bankl: _self.getView().byId("bankl").getValue(),
				hktid: _self.getView().byId("hktid").getValue(),
				swift: _self.getView().byId("swift").getValue(),
				benbankl: _self.getView().byId("benbankl").getValue(),
				bankcurr: _self.getView().byId("bankcurr").getValue(),
				telexcharge: _self.telexcharge,
				swiftcharges: _self.swiftcharges,
				bankcomm: _self.bankcomm,
				splitcal: _self.keyVal

			};
			_self.json.to_advpayhdr = [];
			_self.json.to_advpayitm = [];

			// for (var j = 0; j < _self.advpymntEdit.results.length; j++) {
			// 	if (j == 0) {
			// 		_self.json.to_advpayhdr.push(_self.jsonHDR);
			// 	} else {
			// 		_self.json.to_advpayhdr.push(_self.advpymntEdit.results[j]);
			// 	}
			// }
			for (var j = 0; j < _self.advpymntEdit.results.length; j++) {
				delete _self.advpymntEdit.results[j].advamountfc;
				delete _self.advpymntEdit.results[j].advamountlc;
				delete _self.advpymntEdit.results[j].bukrs;
				delete _self.advpymntEdit.results[j].document_date;
				delete _self.advpymntEdit.results[j].kursf;
				delete _self.advpymntEdit.results[j].order_type;
				delete _self.advpymntEdit.results[j].to_Currency;
				delete _self.advpymntEdit.results[j].to_po_itm;
				delete _self.advpymntEdit.results[j].type;
				delete _self.advpymntEdit.results[j].__metadata;
				delete _self.advpymntEdit.results[j].vendor;
				delete _self.advpymntEdit.results[j].amount_currency;

				_self.json.to_advpayhdr.push(_self.advpymntEdit.results[j]);
			}
			// for (var i = 0; i < _self.advpymntItemsEdit.results.length; i++) {

			// 	delete _self.advpymntItemsEdit.results[i].doctype;
			// 	delete _self.advpymntItemsEdit.results[i].werks;
			// 	delete _self.advpymntItemsEdit.results[i].untto;
			// 	delete _self.advpymntItemsEdit.results[i].uebto;
			// 	delete _self.advpymntItemsEdit.results[i].pcinsur;
			// 	delete _self.advpymntItemsEdit.results[i].pcfrght;
			// 	delete _self.advpymntItemsEdit.results[i].pcfob;
			// 	delete _self.advpymntItemsEdit.results[i].param2;
			// 	delete _self.advpymntItemsEdit.results[i].param1;
			// 	delete _self.advpymntItemsEdit.results[i].__metadata;
			// 	delete _self.advpymntItemsEdit.results[i].Parameters;
			// 	delete _self.advpymntItemsEdit.results[i].waers;

			// 	_self.json.to_advpayitm.push(_self.advpymntItemsEdit.results[i]);
			// }
			for (var i = 0; i < _self.pushItems.results.length; i++) {

				delete _self.pushItems.results[i].doctype;
				delete _self.pushItems.results[i].werks;
				delete _self.pushItems.results[i].untto;
				delete _self.pushItems.results[i].uebto;
				delete _self.pushItems.results[i].pcinsur;
				delete _self.pushItems.results[i].pcfrght;
				delete _self.pushItems.results[i].pcfob;
				delete _self.pushItems.results[i].param2;
				delete _self.pushItems.results[i].param1;
				delete _self.pushItems.results[i].__metadata;
				delete _self.pushItems.results[i].Parameters;
				delete _self.pushItems.results[i].waers;
				delete _self.pushItems.results[i].splitcal;
				delete _self.pushItems.results[i].msg;

				_self.json.to_advpayitm.push(_self.pushItems.results[i]);
			}

			_self.omodelParnt.create("/xBRIxi_ILCADVMASTR", _self.json, {
				method: "POST",
				success: function (data, response) {
					var msg = JSON.parse(response.headers["sap-message"]).message;
					MessageBox.success(msg, {
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function (oAction) {
							if (oAction === sap.m.MessageBox.Action.OK) {
								//	window.FlagRefresh = true;
								window.history.go(-1);
								_self.refreshHeader();
								//	_self.router.navTo("impAPList", true);
							}
						}
					});
				},
				error: function (error) {
					MessageBox.error("error");
				}
			});
		},
		AuthConfiguration: function (Type) {

			if (Type == "Display") {
				var entity = "xBRIxI_UICONFIG03";
				if (this.ItemMand) {
					for (var i = 0; i < this.ItemMand.length; i++) {
						this.byId(this.ItemMand[i]).setRequired(false);
					}
				}
				if (this.RequiredFileds) {
					for (var i = 0; i < this.RequiredFileds.length; i++) {
						this.byId(this.RequiredFileds[i]).setRequired(false);
					}
				}
			} else if (Type == "Change") {
				var entity = "xBRIxI_UICONFIG02";

				// xBRIxI_UICONFIG02
			} else {
				var entity = "xBRIxI_UICONFIG";
				// this.Status = 1;
			}
			var _self = this;
			var filters = new Array();
			var filterval = new sap.ui.model.Filter("modid", sap.ui.model.FilterOperator.EQ, "CNTR");
			filters.push(filterval);
			var filterval = new sap.ui.model.Filter("status", sap.ui.model.FilterOperator.EQ, "01");
			filters.push(filterval);

			var filterval = new sap.ui.model.Filter("actvt", sap.ui.model.FilterOperator.EQ, "02");
			filters.push(filterval);

			this.RequiredFileds = new Array(); //header
			this.RequiredFiledsDesc = new Array();
			this.RequiredFiledsErrorSts = new Array();
			this.RequiredFiledsDropDwn = new Array();
			this.ItemMand = new Array(); //items fields
			this.ItemFiledsDesc = new Array();
			this.ItemFiledsErrorSts = new Array();
			this.ItemFiledsDropDwn = new Array();

			this.getOwnerComponent().getModel("Config_Model").read("/" + entity, {
				filters: filters,
				success: function (getData) {
					var arr = getData.results;

					console.log("Array");
					console.log(arr);

					for (var i = 0; i < arr.length; i++) {

						if (arr[i].entityset == "tab_") {
							_self.getView().byId('tab_' + arr[i].fldnam).setVisible((arr[i].visible == "true") ? true : false);
						} else
						if (arr[i].entityset == "btn_") {
							_self.getView().byId('btn_' + arr[i].fldnam).setVisible((arr[i].visible == "true") ? true : false);
						} else
						if (arr[i].tbl == true) {
							if (_self.getView().byId(arr[i].fldnam)) {
								_self.getView().byId(arr[i].fldnam).setVisible((arr[i].visible == "true") ? true : false);
							}
						} else {
							if (_self.getView().byId(arr[i].fldnam)) {
								_self.getView().byId(arr[i].fldnam).setVisible((arr[i].visible == "true") ? true : false);
								_self.getView().byId(arr[i].fldnam).setRequired((arr[i].required == "true") ? true : false);
								if (arr[i].required == "true") {
									if (arr[i].entityset.match("xBRIxi_ctcarritm")) {
										_self.ItemMand.push(arr[i].fldnam);
										_self.ItemFiledsDesc.push(arr[i].flddescr);
										_self.ItemFiledsErrorSts.push(arr[i].errstat);

									} else if (arr[i].entityset.match("xBRIxI_CTCNIND")) {
										_self.RequiredFileds.push(arr[i].fldnam);
										_self.RequiredFiledsDesc.push(arr[i].flddescr);
										_self.RequiredFiledsErrorSts.push(arr[i].errstat);

									} else if (arr[i].entityset.match("xBRIxI_CTCNITM")) {
										_self.ItemMand.push(arr[i].fldnam);
										_self.ItemFiledsDesc.push(arr[i].flddescr);
										_self.ItemFiledsErrorSts.push(arr[i].errstat);

									}

								}
							}
						}
					}
				},
				error: function (error) {
					MessageBox.error("Something Went Wrong . Please Try again Later");
				}
			});

			console.log(this.RequiredFileds);
			console.log(this.ItemMand);
			console.log(this.ItemFiledsDesc);

		},

	});

});