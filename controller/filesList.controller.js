sap.ui.define([
	"reqlist/controller/BaseController",
	//"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(BaseController, JSONModel, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("reqlist.controller.filesList", {

		onInit: function() {
			var oViewModel = new JSONModel({
				busy: false,
				delay: 0
			});
			this.getRouter().getRoute("files").attachPatternMatched(this._onObjectMatched, this);
			this.setModel(oViewModel, "filesView");
			this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
		},

		onViewShow: function(oEvent) {
			/*var oArgs = sap.ui.getCore().getModel("MyModel").getData();

			var Belnr = oArgs.Belnr;
			var Bukrs = oArgs.Bukrs;
			var Gjahr = oArgs.Gjahr;
			var Reqnum = oArgs.Reqnum;

			var aFilter = [];
			if (Belnr)
				aFilter.push(new Filter("Belnr", FilterOperator.EQ, Belnr));

			if (Bukrs)
				aFilter.push(new Filter("Bukrs", FilterOperator.EQ, Bukrs));

			if (Gjahr)
				aFilter.push(new Filter("Gjahr", FilterOperator.EQ, Gjahr));

			if (Reqnum)
				aFilter.push(new Filter("Reqnum", FilterOperator.EQ, Reqnum));

			var oTable = this.getView().byId("__table0");
			var oBinding = oTable.getBinding("items");
			oBinding.filter(aFilter);*/
		},

		_onObjectMatched: function(oEvent) {
			var Reqnum = oEvent.getParameter("arguments").Reqnum;
			var Bukrs = oEvent.getParameter("arguments").Bukrs;
			var Belnr = oEvent.getParameter("arguments").Belnr;
			var Gjahr = oEvent.getParameter("arguments").Gjahr;

			this.getModel().metadataLoaded().then(function() {
				var sObjectPath = this.getModel().createKey("itemsSet", {
					Reqnum: Reqnum,
					Bukrs: Bukrs,
					Belnr: Belnr,
					Gjahr: Gjahr
				});
				this._bindView("/" + sObjectPath);
			}.bind(this));
		},

		_bindView: function(sObjectPath) {
			// Set busy indicator during view binding
			var oViewModel = this.getModel("filesView");
			// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
			oViewModel.setProperty("/busy", false);
			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function() {
						oViewModel.setProperty("/busy", true);
					},
					dataReceived: function() {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},

		_onBindingChange: function() {
			var oView = this.getView(),
				oElementBinding = oView.getElementBinding();
			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("detailObjectNotFound");
				// if object could not be found, the selection in the master list
				// does not make sense anymore.
				this.getOwnerComponent().oListSelector.clearMasterListSelection();
				return;
			}
		},

		_onMetadataLoaded: function() {
			// Store original busy indicator delay for the detail view
			var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
				oViewModel = this.getModel("filesView"),
				oLineItemTable = this.byId("__table0"),
				iOriginalLineItemTableBusyDelay = oLineItemTable.getBusyIndicatorDelay();
			// Make sure busy indicator is displayed immediately when
			// detail view is displayed for the first time
			oViewModel.setProperty("/delay", 0);
			oViewModel.setProperty("/lineItemTableDelay", 0);
			oLineItemTable.attachEventOnce("updateFinished", function() {
				// Restore original busy indicator delay for line item table
				oViewModel.setProperty("/lineItemTableDelay", iOriginalLineItemTableBusyDelay);
			});
			// Binding the view will set it to not busy - so the view is always busy if it is not bound
			oViewModel.setProperty("/busy", true);
			// Restore original busy indicator delay for the detail view
			oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
		},

		onDownload: function() {
			var oTable = this.getView().byId("__table0");
			var oSelected = oTable.getSelectedItems();
			for (var i = 0; i < oSelected.length; ++i) {
				var oTmp = oSelected[i];
				if (oTmp.getCells()[1].getText()) {
					var sName = oTmp.getCells()[1].getText();
					var sUrl = "/sap/opu/odata/sap/ZUI5_DFS_SER_SRV/GetFilesSet('" + sName + "')/ReadFile/$value";

					this.downloadURI(sUrl, sName);
				}
			}
		},

		downloadURI: function(uri, name){
				var link = document.createElement("a");
				link.download = name;
				link.href = uri;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
		}

	});

});
