(function () {
	"use strict";

	/*global jQuery, sap */
	jQuery.sap.declare("sap.ushell.demo.HelloWorldPluginSample.Component");
	jQuery.sap.require("sap.ui.core.Component");

	sap.ui.core.Component.extend("zshellplugin.Component", {

		metadata: {
			"manifest": "json"
		},

		init: function () {
			_forceLogInfo("zshellplugin initialized");

			if (sap.ui.getCore().isInitialized()) {
				this._initializeWSConnection();
				this._getTextFromService();
			} else {
				sap.ui.getCore().attachInit(this._initializeWSConnection.bind(this));
				sap.ui.getCore().attachInit(this._getTextFromService.bind(this));
			}
		},

		_sayHello: function () {
			var oConfig = this.getComponentData().config,
				sMessage = (oConfig && oConfig.message) || "Hello World from SAP Fiori launchpad plug-in",
				iDuration = oConfig && oConfig.duration;

			sap.m.MessageToast.show(sMessage, {
				duration: iDuration
			});
		},

		_getTextFromService: function () {
			this.getModel().read("/MessageSet", {
				success: function (oData) {
					var sMessage = "";
					var aResults = oData.results;
					if(aResults.length > 1){
						var apprObj = {};
						aResults.forEach(function(item, index){
							if(index === 0){
								apprObj.date = item.Datab;
								apprObj.index = index;
							} else if(item.Datab > apprObj.date) {
								apprObj.date = item.Datab;
								apprObj.index = index;
							}
						});
						sMessage = aResults[apprObj.index].Msgtxt;
					} else {
						sMessage = oData.results[0].Msgtxt;
					}

					this._openDialog.call(this, sMessage);
				}.bind(this),
				error: function (oError) {
					console.log(oError);
				}
			});
		},

		_openDialog: function (sMessage) {
			var dialog = new sap.m.Dialog({
				title: this.getModel("i18n").getResourceBundle().getText("dialogTitle"),
				type: 'Message',
				state: 'Warning',
				content: new sap.m.Text({
					text: sMessage
				}),
				beginButton: new sap.m.Button({
					text: 'OK',
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});

			dialog.open();
		},

		_initializeWSConnection: function () {
			var sUrl = "wss://mlk-tms-01.msk.aeroflot.ru:8030/sap/bc/apc/sap/ztc_apc_message";
			var ws = new sap.ui.core.ws.WebSocket(sUrl);

			ws.attachOpen(function(oEvent){
				console.log("Socket Open");
			});

			ws.attachMessage(function(oEvent){
				this._openDialog(oEvent.getParameter("data"));
			}.bind(this));

			ws.attachError(function(oError){
				console.log("Socket Error");
			});
		}
	});

	// private helper to ensure that a message is logged with INFO level
	function _forceLogInfo(sMessage) {
		var iCurrentLogLevel = jQuery.sap.log.getLevel();

		if (iCurrentLogLevel < jQuery.sap.log.Level.INFO) {
			jQuery.sap.log.setLevel(jQuery.sap.log.Level.INFO);
			jQuery.sap.log.info(sMessage, undefined, "zshellplugin.Component");
			jQuery.sap.log.setLevel(iCurrentLogLevel);
		} else {
			jQuery.sap.log.info(sMessage, undefined, "zshellplugin.Component");
		}
	}
})();
