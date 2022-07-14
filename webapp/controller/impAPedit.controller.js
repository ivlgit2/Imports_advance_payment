sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox"
], function (Controller, MessageBox) {
	"use strict";

	return Controller.extend("bri.IMPORTS_ADV_PAYMENT.controller.impAPedit", {

		onInit: function () {
			this.router = sap.ui.core.UIComponent.getRouterFor(this);
			this.router.attachRoutePatternMatched(this._handleRouteMatched, this);
			this.omodelParntEdit = this.getOwnerComponent().getModel("masterModel");
			this.omodelParnt = this.getOwnerComponent().getModel("cmnService");
			this.advpymntEdit = {
				"results": []
			};
			this.advpayhdrValues = {
				"results": []
			};
			this.advpayitmValues = {
				"results": []
			};
			this.temJson = {
				"results": []
			};
			this.comboBox = {
				"results": []
			};
			this.filterComboBox = {
				"results": []
			};
			this.advpymntItemsCalEdit = {
				"results": []
			};

		},
		dateClick: function () {
			this.click = 0;

		},
		_handleRouteMatched: function (oEvent) {
			debugger;
			this.byId("idSwtichMode").setState(false);
			this.getView().byId("idSwtichMode").setVisible(true);
			var _self = this;
			this.click = 1;
			var param = oEvent.getParameter("arguments");
			_self.getView().byId("refTo").setText(param.advrefno);

			_self.advrefno = param.advrefno;

			var filterval;
			var filters = new Array();

			filterval = new sap.ui.model.Filter("aprefnr", sap.ui.model.FilterOperator.EQ, _self.advrefno);

			filters.push(filterval);

			_self.omodelParntEdit.read("/xBRIxi_ILCADVMASTR", {
				filters: filters,
				urlParameters: {
					"$expand": "to_advpayhdr,to_advpayitm"
				},

				// sorters: sorters,
				success: function (getData) {
					//	console.log('Response Data : ', getData.results.length);
					if (getData.results.length <= 0) {
						//	MessageBox.error("No Matching Result(s) Found for the Filter");

					} else {
						for (var i = 0; i < getData.results.length; i++) {
							_self.splitCal = getData.results[0].splitcal;
							if (_self.splitCal == "Q") {
								_self.getView().byId("seltyp").setText("Quantity Based");
									_self.getView().byId("anetwr1").setEditable(false);
							}
							if (_self.splitCal == "V") {
								_self.getView().byId("seltyp").setText("Value Based");
								_self.getView().byId("applquant").setVisible(false);
								_self.getView().byId("anetwr1").setEditable(true);

							}
							_self.bankrefdate = getData.results[i].bankrefdate;
							_self.remdate = getData.results[i].remittancedate;
							getData.results[i].bankrefdate = _self.convertToSAPdate(_self.bankrefdate);
							getData.results[i].remittancedate = _self.convertToSAPdate(_self.remdate);

						}
						var oModelData = new sap.ui.model.json.JSONModel();
						oModelData.setData(getData.results[0]);
						_self.getView().setModel(oModelData, "advModel");

						_self.advpymntEdit.results[0] = getData.results[0];
						_self.exchRate = parseFloat(_self.advpymntEdit.results[0].kursf);

						for (var j = 0; j < getData.results[0].to_advpayhdr.results.length; j++) {
							_self.advpayhdrValues.results = _self.advpayhdrValues.results.concat(getData.results[0].to_advpayhdr.results[j]);
							_self.advpayhdrValues.results[j].flag = "";
							var oModelDataPOHDR = new sap.ui.model.json.JSONModel();
							oModelDataPOHDR.setData(_self.advpayhdrValues);
							_self.getView().setModel(oModelDataPOHDR, "advCreateModel");
						}
						for (var k = 0; k < getData.results[0].to_advpayitm.results.length; k++) {
							_self.advpayitmValues.results = _self.advpayitmValues.results.concat(getData.results[0].to_advpayitm.results[k]);
							_self.advpayitmValues.results[k].flag = "";
							_self.filterComboBox.results = _self.advpayitmValues.results.filter(a => a.ebeln == _self.advpayitmValues.results[0].ebeln);
							_self.getView().byId("selectionbased1").setSelectedKey(_self.advpayitmValues.results[0].ebeln);
							var oModelDataPOITM = new sap.ui.model.json.JSONModel();
							oModelDataPOITM.setData(_self.filterComboBox);
							_self.getView().setModel(oModelDataPOITM, "advCreateItemModel");
						}
					}
				},
				error: function (error) {
					MessageBox.error("Something Went Wrong . Please Try again Later");

					// _self._CloseBusyDialog();
				}

			});
			_self.OnChangeSwitchDefault();
		},
		calculateCurrency: function () {
			var _self = this;
			var filterval;
			var filters = new Array();

			filterval = new sap.ui.model.Filter("ebeln", sap.ui.model.FilterOperator.EQ, _self.oSelectedItem);

			filters.push(filterval);
			_self.omodelParnt.read("/xBRIxI_PO_SO_HEADER", {
				urlParameters: {
					$top: 5000
				},
				filters: filters,
				// sorters: sorters,
				success: function (getData) {

					for (var i = 0; i < _self.advpymntItemsCalEdit.results.length; i++) {
						if (getData.results[0].waers != _self.advpayhdrValues.results[0].waers) {
							_self.advpayhdrValues.results.splice(_self.getIndex, 1);
							_self.getView().getModel("advCreateModel").refresh();
							MessageBox.error("Currency is not same");
							this.checkEbeln = 1;

						} else {
							_self.advpayitmValues.results.push(_self.advpymntItemsCalEdit.results[i]);

						}
					}
				}

			});
		},
		FnUpdateClassify: function (oEvent) {
			debugger;
			var _self = this;
			var getEbeln = oEvent.getParameter("selectedItem").getText();
			_self.temJson.results = _self.advpayitmValues.results.filter(a => a.ebeln == getEbeln);
			_self.newLen = _self.temJson.results.length;
			var oModelDataItem = new sap.ui.model.json.JSONModel();
			oModelDataItem.setData(_self.temJson);
			_self.getView().setModel(oModelDataItem, "advCreateItemModel");
			_self.getView().getModel("advCreateItemModel").refresh();
			// var oTable = _self.byId("idItemTbl");
			// var cb = oTable.addSelectionInterval(0, _self.newLen - 1);
			// _self.itemSelect = 1;
		},
		deleteHDRPO: function (oArg) {
			var _self = this;
			//var filters = new Array();
			if (_self.advpayhdrValues.results.length == 1) {
				MessageBox.error("Atleast one PO Number should be attached");
			} else {

				_self.slno = oArg.getSource().getParent().getCells()[0].getValue();
				_self.rowIndex = oArg.getSource().getParent().getIndex();

				MessageBox.confirm("Changes Cannot be Undone. Do you Really Want to Delete?", {
					actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
					onClose: function (oAction) {
						if (oAction === sap.m.MessageBox.Action.OK) {

							var mParameters = {};
							mParameters.groupId = "deleteGroup";
							mParameters.ETag = "*";

							if (_self.advpayhdrValues.results[_self.rowIndex].flag == "X") {
								for (var del = 0; del < _self.advpayitmValues.results.length; del++) {
									if (_self.advpayitmValues.results[del].ebeln == _self.slno) {
										_self.advpayitmValues.results.splice(del, 1)
										del = del - 1;
									}
								}
								_self.advpayhdrValues.results.splice(_self.rowIndex, 1);
								_self.getView().getModel("advCreateModel").refresh();
								_self.getView().getModel("advCreateItemModel").refresh();
								//	_self.fnUpdateHeaderPO();
								_self.fnUpdateHeaderAA();

								MessageBox.success("Record Deleted Successfully");
							} else {

								if (_self.advpayhdrValues.results.length != 0) {
									_self.omodelParntEdit.remove("/xBRIxi_ILCADVPO(ebeln='" + _self.advpayhdrValues
										.results[_self.rowIndex].ebeln + "',aprefnr='" + _self.advrefno +
										"')", mParameters);
									_self.advpayhdrValues.results.splice(_self.rowIndex, 1);
								}
								for (var del = 0; del < _self.advpayitmValues.results.length; del++) {
									if (_self.advpayitmValues.results[del].ebeln == _self.slno) {
										_self.advpayitmValues.results.splice(del, 1)
										del = del - 1;
									}

								}
								_self.getView().getModel("advCreateItemModel").refresh();
								_self.omodelParntEdit.setDeferredGroups(["deleteGroup"]);
								_self.omodelParntEdit.submitChanges({
									groupId: "deleteGroup",
									success: function (oData) {
										MessageBox.success("Record Deleted Successfully");
									},
									error: function (oError) {
										MessageBox.success("error while Deleting Successfully");
									}
								});
								_self.getView().getModel("advCreateModel").refresh();
							}

						}
					}
				});
			}
		},
		convertToSAPdate: function (value) {
			//alert(value);
			if (value) {
				if (value instanceof Date) {
					var NewDateform = value;
				} else if (value.indexOf("T00:00:00")) {
					return value;
				} else {
					////        var year = value.substring(0, 4);
					//            var month = value.substring(4, 6);
					//            var day = value.substring(0, 2);
				}
				var mnth = ("0" + (NewDateform.getMonth() + 1)).slice(-2);
				var day = ("0" + NewDateform.getDate()).slice(-2);
				var output = [NewDateform.getFullYear(), mnth, day].join("-") + "T00:00:00";
				return output;
			}
		},
		fnUpdateHeaderAA: function () {
			var _self = this;
			var calculateHDRAA = 0;
			for (var c = 0; c < _self.advpayhdrValues.results.length; c++) {
				calculateHDRAA = calculateHDRAA + parseFloat(_self.advpayhdrValues.results[c].anetwr);

			}
			var calculateHDRAALOC = calculateHDRAA * parseFloat(_self.exchRate);
			calculateHDRAA = calculateHDRAA.toString();
			calculateHDRAALOC = calculateHDRAALOC.toString();
			_self.getView().byId("advamountfc").setValue(calculateHDRAA);
			_self.getView().byId("advamountlc").setValue(calculateHDRAALOC);
		},
		readHeaderEntity: function () { //changed
			var _self = this;
			var param3 = _self.oSelectedItem + "ZZZ" + _self.splitCal;
			var param4 = "AP";
			_self.omodelParntEdit.read("/xBRIxCE_POITEM_CALC(param1='" + param3 + "',param2='" + param4 + "')/Set", {
				urlParameters: {
					$top: 5000
				},
				// sorters: sorters,
				success: function (getData) {
					if (getData.results.length == 0) {
						_self.advpayhdrValues.results.splice(_self.getIndex, 1);
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
						for (var t = 0; t < _self.advpayhdrValues.results.length; t++) {
							var oModelData = new sap.ui.model.json.JSONModel();
							oModelData.setData(_self.advpayhdrValues);
							_self.getView().setModel(oModelData, "advCreateModel");
							_self.calculateAnetwrLOC = _self.exchRate * _self.calculateAnetwr;
							_self.advpayhdrValues.results[_self.getIndex].tnetwr = _self.calculateTnetwr.toString();
							_self.advpayhdrValues.results[_self.getIndex].anetwr = _self.calculateAnetwr.toString();
							_self.advpayhdrValues.results[_self.getIndex].anetwrloc = _self.calculateAnetwrLOC.toString();
							_self.advpayhdrValues.results[_self.getIndex].waers = _self.advpymntItemsCalEdit.results[0].waers;
							_self.getView().getModel("advCreateModel").refresh();
						}
						_self.fnUpdateHeaderAA();
						_self.calculateCurrency();
					}
				}
			});
		},

		calculateAmount: function (oEvent) {
			var _self = this;
			_self.applEbeln = oEvent.getSource().getParent().getCells()[0].getValue();
			var len = _self.advpayitmValues.results.length;
			_self.comboBox.results = _self.advpayitmValues.results.filter(a => a.ebeln == _self.applEbeln);
			var TotalAppliedAmount = 0;
			var tableIndex = oEvent.getSource().getParent().getIndex();
			var tableEbeln = oEvent.getSource().getParent().getCells()[0].getValue();
			for (var b = 0; b < _self.comboBox.results.length; b++) {
				// _self.amenge = parseInt(_self.comboBox.results[tableIndex].amenge);
				// _self.applQuant = oEvent.getSource().getParent().getCells()[5].getValue();
				// _self.applQuant = parseInt(_self.applQuant);

				// if (_self.applQuant > _self.amenge) {
				// 	MessageBox.error("Applied quantity is higher");
				// 	_self.valueCheck = 1;
				// 	break;
				// } else {
				_self.applQuant = oEvent.getSource().getParent().getCells()[5].getValue();
				_self.applQuant = parseInt(_self.applQuant);
				_self.povalue = _self.comboBox.results[tableIndex].netpr;
				_self.povalue = parseFloat(_self.povalue);
				_self.poQuantity = _self.comboBox.results[tableIndex].menge;
				_self.poQuantity = parseFloat(_self.poQuantity);
				_self.applAmount = (_self.applQuant) * (_self.povalue);
				_self.applAmount = parseFloat(_self.applAmount.toFixed(5));
				oEvent.getSource().getParent().getCells()[9].setValue(_self.applAmount);
				_self.getView().getModel("advCreateItemModel").refresh();
				var TotalAppliedAmount = parseFloat(TotalAppliedAmount) + parseFloat(_self.comboBox.results[b].anetwr);
				var liveChangeEbeln = _self.comboBox.results[b].ebeln;
				_self.valueCheck = 0;
				// }
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
			 _self.anetwr = oEvent.getSource().getParent().getCells()[8].getValue();
			_self.temJson.results = _self.advpayitmValues.results.filter(a => a.ebeln == tableEbeln);
			for (var b = 0; b < _self.temJson.results.length; b++) {
				_self.temJson.results[tableIndex].anetwr = parseFloat(_self.anetwr);
				var TotalAppliedAmount = parseFloat(TotalAppliedAmount) + parseFloat(_self.temJson.results[b].anetwr);
				var liveChangeEbeln = _self.temJson.results[b].ebeln;
				_self.valueCheck = 0;

			}
			//	_self.getView().getModel("advCreateItemModel").refresh();
			if (_self.valueCheck == 0) {
				//	_self.getView().getModel("advCreateItemModel").refresh();
				_self.fnUpdateAppliedAmount(TotalAppliedAmount, liveChangeEbeln);
			}
		},
		fnUpdateAppliedAmount: function (TotalAppliedAmount, liveChangeEbeln) {
			var _self = this;
			if (!_self.advpayhdrValues) {} else {
				if (!liveChangeEbeln) {} else {
					var FilterInvoiceHeaderData = _self.advpayhdrValues.results.filter(a => a.ebeln == liveChangeEbeln);
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
				_self.getView().getModel("advCreateModel").refresh();
				_self.fnUpdateHeaderAA();
			}
		},
		handleCmnValueHelpPOCrt: function (oEvent) {
			this.inputId = oEvent.getSource().getId();
			if (!this._valueHelpPO) {
				this._valueHelpPO = sap.ui.xmlfragment("bri.IMPORTS_ADV_PAYMENT.view.fragments.purchasingDoc", this);
				this.getView().addDependent(this._valueHelpPO);
			}

			this._valueHelpPO.open();
		},
		handleValueHelpTypePO: function (oEvent) {
			var _self = this;
			_self.inputId = oEvent.getSource().getId();
			_self.getIndex = oEvent.getSource().getParent().getIndex();
			_self.keyPO = "PO";
			var filterval;
			var filters = new Array();

			filterval = new sap.ui.model.Filter("type", sap.ui.model.FilterOperator.EQ, _self.keyPO);

			filters.push(filterval);
			_self.omodelParnt.read("/xBRIxI_PO_SO_HEADER", {
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
		CheckInvoiceDuplicates: function () {

			var obj = this.advpayhdrValues.results;
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
		onNavBack: function () {
			window.history.go(-1);
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

		addItemRow: function () {

			// this.commrate = 
			var _self = this;
			if (!_self.advpayhdrValues) {
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
				oModelIndDetails.setData(_self.advpayhdrValues);
				_self.getView().setModel(oModelIndDetails, "advCreateModel");

				/*************** oModelDEPB details ***************************/
			} else {
				//	this.readHeaderEntity();
				_self.advpayhdrValues.results.push({

					aprefnr: "",
					ebeln: "",
					tnetwr: "",
					anetwr: "",
					anetwrloc: "",
					waers: "",
					flag: "X"

				});
				var oModelIndDetails = new sap.ui.model.json.JSONModel([]);
				oModelIndDetails.setData(_self.advpayhdrValues);
				_self.getView().setModel(oModelIndDetails, "advCreateModel");
				//	this.getView().getModel("Lists").refresh();
			}
		},
		OnChangeSwitchDefault: function () {
			var EnabledModel = new sap.ui.model.json.JSONModel({
				enable: true
			});
			this.getView().setModel(EnabledModel, "State");
			if (this.byId("idSwtichMode").getState() === false) {
				EnabledModel.setProperty('/enable', false);
				//this.getView().byId("iddelete").setVisible(true);
				this.getView().byId("addItemBtns").setVisible(false);
				this.getView().byId("hdrDel").setVisible(false);
				this.getView().byId("onpressid").setVisible(false);
			} else {
				EnabledModel.setProperty('/enable', true);
				this.getView().byId("addItemBtns").setVisible(true);
				this.getView().byId("hdrDel").setVisible(true);
				this.getView().byId("onpressid").setVisible(true);

			}
		},
		// OnChangeSwitchDefault: function () {
		// 	if (this.byId("idSwtichMode").getState() === true) {
		// 		this.getView().byId("bankrefno").setEnabled(true);
		// 		this.getView().byId("bnkadvdet").setEnabled(true);
		// 		this.getView().byId("bankrefdate").setEnabled(true);
		// 		this.getView().byId("remittancedate").setEnabled(true);
		// 		this.getView().byId("purpofx").setEnabled(true);
		// 		this.getView().byId("advamountfc").setEnabled(true);
		// 		this.getView().byId("fcurr").setEnabled(true);
		// 		this.getView().byId("kursf").setEnabled(true);
		// 		this.getView().byId("advamountlc").setEnabled(true);
		// 		this.getView().byId("bankl").setEnabled(true);
		// 		this.getView().byId("hktid").setEnabled(true);
		// 		this.getView().byId("adcode").setEnabled(true);
		// 		this.getView().byId("swift").setEnabled(true);
		// 		this.getView().byId("benbankl").setEnabled(true);
		// 		this.getView().byId("bankcurr").setEnabled(true);
		// 		this.getView().byId("telexcharge").setEnabled(true);
		// 		this.getView().byId("swiftcharges").setEnabled(true);
		// 		this.getView().byId("bankcomm").setEnabled(true);
		// 		this.getView().byId("inco1").setEnabled(true);
		// 		this.getView().byId("cntryorg").setEnabled(true);
		// 		this.getView().byId("consignctry").setEnabled(true);
		// 		this.getView().byId("shipmode").setEnabled(true);
		// 		this.getView().byId("amengel").setEnabled(true);
		// 		this.getView().byId("addItemBtns").setVisible(true);
		// 		this.getView().byId("hdrDel").setVisible(true);

		// 	} else {
		// 		this.getView().byId("bankrefno").setEnabled(false);
		// 		this.getView().byId("bnkadvdet").setEnabled(false);
		// 		this.getView().byId("bankrefdate").setEnabled(false);
		// 		this.getView().byId("remittancedate").setEnabled(false);
		// 		this.getView().byId("purpofx").setEnabled(false);
		// 		this.getView().byId("advamountfc").setEnabled(false);
		// 		this.getView().byId("fcurr").setEnabled(false);
		// 		this.getView().byId("kursf").setEnabled(false);
		// 		this.getView().byId("advamountlc").setEnabled(false);
		// 		this.getView().byId("bankl").setEnabled(false);
		// 		this.getView().byId("hktid").setEnabled(false);
		// 		this.getView().byId("adcode").setEnabled(false);
		// 		this.getView().byId("swift").setEnabled(false);
		// 		this.getView().byId("benbankl").setEnabled(false);
		// 		this.getView().byId("bankcurr").setEnabled(false);
		// 		this.getView().byId("telexcharge").setEnabled(false);
		// 		this.getView().byId("swiftcharges").setEnabled(false);
		// 		this.getView().byId("bankcomm").setEnabled(false);
		// 		this.getView().byId("inco1").setEnabled(false);
		// 		this.getView().byId("cntryorg").setEnabled(false);
		// 		this.getView().byId("consignctry").setEnabled(false);
		// 		this.getView().byId("shipmode").setEnabled(false);
		// 		this.getView().byId("amengel").setEnabled(false);
		// 		this.getView().byId("addItemBtns").setVisible(false);
		// 		this.getView().byId("hdrDel").setVisible(false);

		// 	}
		// },
		// onNavBack: function () {
		// 	window.history.go(-1);
		// },
		onPressSave: function () {
			var _self = this;
			var results = _self.advpymntEdit.results[0];
			delete _self.advpymntEdit.results[0].to_Country1;
			delete _self.advpymntEdit.results[0].to_Country2;
			delete _self.advpymntEdit.results[0].to_Currency;
			delete _self.advpymntEdit.results[0].to_advpayhdr;
			delete _self.advpymntEdit.results[0].to_advpayitm;
			delete _self.advpymntEdit.results[0].__metadata;

			_self.omodelParntEdit.update("/xBRIxi_ILCADVMASTR(aprefnr='" + _self.advrefno + "')", _self.advpymntEdit.results[0], {
				success: function (response) {
					MessageBox.success("Updated Successfully");
					// var m = JSON.parse(response.headers["sap-message"]);
					// MessageBox.success(m.message, {
					// 	actions: [sap.m.MessageBox.Action.OK],
					// 	onClose: function (oAction) {
					// 		if (oAction === sap.m.MessageBox.Action.OK) {

					// 		}
					// 	}
					// });
					// console.log(m.message);
				},
				error: function (err) {
					MessageBox.error("Something went wrong,Please try again later.");
				}
			});
			//******************************************************************************
			for (var d = 0; d < _self.advpayhdrValues.results.length; d++) {

				var ebelnUpdt = _self.advpayhdrValues.results[d].ebeln;
				if (_self.advpayhdrValues.results[d].flag == "") {
					delete _self.advpayhdrValues.results[d].flag;
					_self.omodelParntEdit.update("/xBRIxi_ILCADVPO(aprefnr='" + _self.advrefno + "',ebeln='" + ebelnUpdt + "')", _self.advpayhdrValues
						.results[d], {
							success: function (data) {

							},
							error: function (error) {

							}
						});
				} else {
					// _self.json.to_advpayhdr = [];
					// _self.json.to_advpayhdr.push(_self.advpayhdrValues.results[d]);
					delete _self.advpayhdrValues.results[d].flag;
					_self.advpayhdrValues.results[d];
					_self.omodelParntEdit.createEntry("/xBRIxi_ILCADVMASTR(aprefnr='" + _self.advrefno + "')/to_advpayhdr", {
						properties: _self.advpayhdrValues.results[d],
						groupId: "updatBatch", // (trkno='',version='')
						success: function (data) {

						},
						error: function (error) {

						}
					});
				}
			}
			//****************************************************************************************************
			for (var e = 0; e < _self.advpayitmValues.results.length; e++) {
				var ebelnUpdtItem = _self.advpayitmValues.results[e].ebeln;
				var ebelpUpdtItem = _self.advpayitmValues.results[e].ebelp;
				if (_self.advpayitmValues.results[e].flag == "") {
					delete _self.advpayitmValues.results[e].flag;
					_self.omodelParntEdit.update("/xBRIxi_ILCADVITM(aprefnr='" + _self.advrefno + "',ebeln='" + ebelnUpdtItem + "',ebelp='" +
						ebelpUpdtItem + "')", _self.advpayitmValues.results[e], {
							success: function (data) {

							},
							error: function (error) {

							}
						});
				} else {
					delete _self.advpayitmValues.results[e].flag;
					delete _self.advpayitmValues.results[e].doctype;
					delete _self.advpayitmValues.results[e].werks;
					delete _self.advpayitmValues.results[e].untto;
					delete _self.advpayitmValues.results[e].uebto;
					delete _self.advpayitmValues.results[e].pcinsur;
					delete _self.advpayitmValues.results[e].pcfrght;
					delete _self.advpayitmValues.results[e].pcfob;
					delete _self.advpayitmValues.results[e].param2;
					delete _self.advpayitmValues.results[e].param1;
					delete _self.advpayitmValues.results[e].__metadata;
					delete _self.advpayitmValues.results[e].Parameters;
					delete _self.advpayitmValues.results[e].waers;
					delete _self.advpayitmValues.results[e].splitcal;
					delete _self.advpayitmValues.results[e].msg;

					_self.advpayitmValues.results[e];
					_self.omodelParntEdit.createEntry("/xBRIxi_ILCADVMASTR(aprefnr='" + _self.advrefno + "')/to_advpayitm", {
						properties: _self.advpayitmValues.results[e],
						groupId: "updatBatch", // (trkno='',version='')
						success: function (data) {

						},
						error: function (error) {

						}
					});
				}
			}
			//******************************************************************************
			// _self.omodelParntEdit.submitChanges({
			// 	success: function (response) {
			// 		MessageBox.success("Updated Successfully");
			// 		// var m = JSON.parse(response.headers["sap-message"]);
			// 		// MessageBox.success(m.message, {
			// 		// 	actions: [sap.m.MessageBox.Action.OK],
			// 		// 	onClose: function (oAction) {
			// 		// 		if (oAction === sap.m.MessageBox.Action.OK) {

			// 		// 		}
			// 		// 	}
			// 		// });
			// 		// console.log(m.message);
			// 	},
			// 	error: function (err) {
			// 		MessageBox.error("Something went wrong,Please try again later.");
			// 	}
			// });
		}

	});

});