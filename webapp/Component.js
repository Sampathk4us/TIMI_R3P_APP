/************************************************************************
 * Project            : TIMI                                 			*
 * Process            : FI                                              *
 * Task code          : FI062                                           *
 * Functional document:                                					*
 * Technical document :                                    				*
 *----------------------------------------------------------------------*
 * File       	 : Component.js   	        							*
 * Author        : David TEA                                            *
 * Company       : Resp                                               	*
 * Creation Date : 12/05/2016                                           *
 *----------------------------------------------------------------------*
 * Description   : App component file   								*		
 *                                                                      *
 ************************************************************************
 * Modification nï¿½ ...........	: M001									*
 * Project ...................	: TIMI									*
 * Author .................... 	: Marion Alberny                        *
 *----------------------------------------------------------------------*
 * Modification date ......... 	: 04/11/2016 							*
 * Transport order ........... 	:  										*
 * Change Request ............ 	: CR2016-273225  						*
 * Description ............... 	: Total Amount Rules Collection			*
 ************************************************************************/
sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/model/odata/v2/ODataModel",
	"cus/fi/timi/rel/model/messageHelper",
	"cus/fi/timi/rel/model/odataService",
	"cus/fi/timi/rel/model/parameters",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (UIComponent, JSONModel, ResourceModel, ODataModel, messageHelper, odataService, parameters, Filter, FilterOperator) {
	"use strict";
	return UIComponent.extend("cus.fi.timi.rel.Component", {

		metadata: {
			manifest: "json"
		},

		init: function () {

			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);

			var oManifestData = this.getMetadata().getManifest();
			var oDataSources = oManifestData["sap.app"]["dataSources"];

			var oStartupParameters = {};
			oStartupParameters = this.getComponentData().startupParameters;
			//oStartupParameters = { appAction: ["M"], appType: ["A"], intercoType: ["5"] }; //For Local Test Only - Accountant
			//oStartupParameters = { appAction: ["M"], appType: ["I"], intercoType: ["5"] }; //For Local Test Only - Issuer
			//oStartupParameters = { appAction: ["M"], appType: ["R"], intercoType: ["5"] }; //For Local Test Only - Receiver
			//oStartupParameters = { appAction: ["R"], appType: ["M"], intercoType: ["0"] }; //For Local Test Only - Reporting

			// set ODataModel 
			for (var sServiceName in oDataSources) {
				if (oDataSources.hasOwnProperty(sServiceName) && oDataSources[sServiceName].type === "OData") {
					var oModel = new ODataModel(odataService.getODataServiceUrl(oDataSources[sServiceName].uri), {
						"json": oDataSources[sServiceName].json,
						"useBatch": oDataSources[sServiceName].useBatch,
						"headers": oDataSources[sServiceName].settings.headers,
						"defaultUpdateMethod": "PUT"
					});
					this.setModel(oModel, sServiceName)
				}
			}

			// set device model
			var deviceModel = new JSONModel({
				isTouch: sap.ui.Device.support.touch,
				isNoTouch: !sap.ui.Device.support.touch,
				isPhone: sap.ui.Device.system.phone,
				isNoPhone: !sap.ui.Device.system.phone,
				listMode: sap.ui.Device.system.phone ? "None" : "SingleSelectMaster",
				listItemType: sap.ui.Device.system.phone ? "Active" : "Inactive"
			});
			deviceModel.setDefaultBindingMode("OneWay");
			this.setModel(deviceModel, "device");

			// set App Data model
			var oAppDataModel = new JSONModel({
				"appType": oStartupParameters.appType[0], //this.getComponentData().startupParameters.appType[0],
				"appAction": oStartupParameters.appAction[0], //this.getComponentData().startupParameters.appAction[0],
				"intercoType": oStartupParameters.intercoType[0], //this.getComponentData().startupParameters.intercoType[0],
				"userId": sap.ushell.Container.getUser().getId(),
				//"userId":'TST_USER4',
				"issuingItemVisibility": true,
				"receivingItemVisibility": true,
				"issuingItemFullscreen": false,
				"receivingItemFullscreen": false,
				"overviewActionsEnabled": {
					"Submit": false,
					"Validate": false,
					"Generate": false,
					"Delete": false,
					"Reject": false,
					"Approve" : false
				},
				"visibleActionsOnRequestOnly": false,
				"hasRequestChanged": false,
				"reportingType": parameters.getReportingTypeList().RequestHeader,
				"busyIndicatorDelay": 10,
				"requestInitiationData": {
					"InvoiceType": "1",
					"IssuingCountry": "",
					"SubInvoiceType": "1"
				}
			});
			oAppDataModel.setDefaultBindingMode("OneWay");
			this.setModel(oAppDataModel, "AppData");

			// set Constants model
			var oConstantModel = new JSONModel({
				"true": true,
				"false": false,
				"itemTypeIssuing": "1",
				"itemTypeReceiving": "2",
				"invoiceType": {
					"Invoice": parameters.getInvoiceTypeList().Invoice,
					"CreditMemo": parameters.getInvoiceTypeList().CreditMemo,
					"DCNote": parameters.getInvoiceTypeList().DCNote,
					"AdvanceInvoice": parameters.getInvoiceTypeList().AdvanceInvoice,
					"FinalInvoice": parameters.getInvoiceTypeList().FinalInvoice,
				}
			});
			oAppDataModel.setDefaultBindingMode("OneWay");
			this.setModel(oConstantModel, "Constants");

			this.getModel("YWS_FI062_TIMI").metadataLoaded()
				.then(this._asyncGetBusinessData.bind(this))
				.then(function(){
					this._asyncGetMasterData.call(this)
					.then(odataService.getOverviewActionsVisibility.bind(this, this.getModel("AppData").getProperty("/intercoType"), this.getModel(
						"AppData").getProperty("/appType")))
					.then(function (oData) {
						this.getModel("AppData").setProperty("/OverviewActionsVisibility", oData.OverviewActionsVisibility);
					}.bind(this))

					if(!!this.getRouter()){
						this.getRouter().initialize();
					}
				}.bind(this))
				.catch(messageHelper.showODataFailedMessages.bind(this));

			// this.getModel("YWS_FI062_TIMI").metadataLoaded()
			// 	.then(this._asyncGetBusinessData.bind(this))
			// 	.then(function(){
			// 		this.getRouter().initialize();
			// 	}.bind(this))
			// 	.then(this._asyncGetMasterData.bind(this))
			// 	.then(odataService.getOverviewActionsVisibility.bind(this, this.getModel("AppData").getProperty("/intercoType"), this.getModel(
			// 		"AppData").getProperty("/appType")))
			// 	.then(function (oData) {
			// 		this.getModel("AppData").setProperty("/OverviewActionsVisibility", oData.OverviewActionsVisibility);
			// 	}.bind(this))
			// 	.catch(messageHelper.showODataFailedMessages.bind(this));

			// this.getModel("YWS_FI062_TIMI").metadataLoaded()
			// 	.then(this._getBusinessData.bind(this))
			// 	.then(function (oData) {

			// 		var iCountAppData = 0,
			// 			oAppData = {},
			// 			aBatchResponses = oData.__batchResponses,
			// 			aDocumentTypeCreation = [];

			// 		this.setModel(new JSONModel(aBatchResponses[1].data), "DocumentTypeCollection");
			// 		aBatchResponses[1].data.results.forEach(function (oDocumentTypeData) {
			// 			if (oDocumentTypeData.UICreation) {
			// 				aDocumentTypeCreation.push(oDocumentTypeData);
			// 			}
			// 		})
			// 		this.setModel(new JSONModel({
			// 			results: aDocumentTypeCreation
			// 		}), "DocumentTypeCreationCollection");

			// 		this.setModel(new JSONModel(aBatchResponses[2].data), "LegalEntityCollection");
			// 		this.getModel("LegalEntityCollection").setSizeLimit(aBatchResponses[2].data ? aBatchResponses[2].data.results.length : 0);
			// 		this.setModel(new JSONModel(aBatchResponses[3].data), "TotalAmountCalculationRulesCollection");
			// 		this.setModel(new JSONModel(aBatchResponses[4].data), "StatusCollection");
			// 		this.setModel(new JSONModel(aBatchResponses[5].data), "DCIndicatorCollection");
			// 		this.setModel(new JSONModel(aBatchResponses[6].data), "CompanyCollection");
			// 		this.setModel(new JSONModel(aBatchResponses[7].data), "IntercoTypeCollection");
			// 		this.setModel(new JSONModel(aBatchResponses[8].data), "CreationModeCollection");
			// 		this.setModel(new JSONModel(aBatchResponses[9].data), "MajorTypeCollection");
			// 		this.setModel(new JSONModel(aBatchResponses[10].data), "CountryCollection");
			// 		this.setModel(new JSONModel(aBatchResponses[11].data), "LegalEntityCreationCollection");
			// 		this.getModel("LegalEntityCreationCollection").setSizeLimit(aBatchResponses[11].data ? aBatchResponses[11].data.results.length : 0);
			// 		this.setModel(new JSONModel(aBatchResponses[12].data), "LegalEntityRCCreationCollection");
			// 		this.getModel("LegalEntityRCCreationCollection").setSizeLimit(aBatchResponses[12].data ? aBatchResponses[12].data.results.length : 0);

			// 		//AppData into AppData Component Model
			// 		iCountAppData = aBatchResponses[0].data.results.length;
			// 		for (var i = 0; i < iCountAppData; i++) {
			// 			oAppData = aBatchResponses[0].data.results[i];
			// 			this.getModel("AppData").setProperty("/" + oAppData.PropertyName, oAppData.PropertyValue);
			// 		}

			// 		return "";

			// 	}.bind(this))
			// 	.then(odataService.getOverviewActionsVisibility.bind(this, this.getModel("AppData").getProperty("/intercoType"), this.getModel(
			// 		"AppData").getProperty("/appType")))
			// 	.then(function (oData) {
			// 		this.getModel("AppData").setProperty("/OverviewActionsVisibility", oData.OverviewActionsVisibility);
			// 	}.bind(this))
			// 	.then(function () {
			// 		// initialize routing
			// 		this.getRouter().initialize();
			// 	}.bind(this))
			// 	.catch(messageHelper.showODataFailedMessages.bind(this))

		},

		_asyncGetBusinessData : function(){
			var aOperations = [];
			aOperations.push({
				"path": "/AppDataCollection",
				"filters": []
			});
			aOperations.push({
				"path": "/TotalAmountCalculationRulesCollection",
				"filters": []
			});
			if(this.getModel("AppData").getProperty("/appAction") === "R"){
				aOperations.push({
					"path": "/StatusCollection",
					"filters": []
				});
				aOperations.push({
					"path": "/IntercoTypeCollection",
					"filters": []
				});
				aOperations.push({
					"path": "/CreationModeCollection",
					"filters": []
				});
				aOperations.push({
					"path": "/MajorTypeCollection",
					"filters": [new Filter("ApplicationType", FilterOperator.EQ, this.getModel("AppData").getProperty("/appType"))]
				});
			}
			return odataService.batchRead.call(this, "businessData", aOperations)
					.then(function(oData){
						var aBatchResponses = oData.__batchResponses,
							iCountAppData = aBatchResponses[0].data.results.length;

						for (var i = 0; i < iCountAppData; i++) {
							var oAppData = aBatchResponses[0].data.results[i];
							this.getModel("AppData").setProperty("/" + oAppData.PropertyName, oAppData.PropertyValue);
						}
						this.setModel(new JSONModel(aBatchResponses[1].data), "TotalAmountCalculationRulesCollection");
						
						if(this.getModel("AppData").getProperty("/appAction") === "R"){
							this.setModel(new JSONModel(aBatchResponses[2].data), "StatusCollection");
							this.setModel(new JSONModel(aBatchResponses[3].data), "IntercoTypeCollection");
							this.setModel(new JSONModel(aBatchResponses[4].data), "CreationModeCollection");
							this.setModel(new JSONModel(aBatchResponses[5].data), "MajorTypeCollection");
						}
					}.bind(this));
		},

		_asyncGetMasterData : function(){
			var aOperations = [];
			aOperations.push({
				"path": "/DocumentTypeCollection",
				"filters": [new Filter("IntercoType", FilterOperator.EQ, this.getModel("AppData").getProperty("/intercoType"))]
			});
			aOperations.push({
				"path": "/LegalEntityCollection",
				"filters": [new Filter("IntercoType", FilterOperator.EQ, this.getModel("AppData").getProperty("/intercoType"))]
			});
			aOperations.push({
				"path": "/StatusCollection",
				"filters": []
			});
			aOperations.push({
				"path": "/DCIndicatorCollection",
				"filters": []
			});
			aOperations.push({
				"path": "/CompanyCollection",
				"filters": []
			});
			aOperations.push({
				"path": "/IntercoTypeCollection",
				"filters": []
			});
			aOperations.push({
				"path": "/CreationModeCollection",
				"filters": []
			});
			aOperations.push({
				"path": "/MajorTypeCollection",
				"filters": [new Filter("ApplicationType", FilterOperator.EQ, this.getModel("AppData").getProperty("/appType"))]
			});
			aOperations.push({
				"path": "/CountryCollection",
				"filters": []
			});
			aOperations.push({
				"path": "/LegalEntityCreationCollection",
				"filters": [new Filter("IntercoType", FilterOperator.EQ, this.getModel("AppData").getProperty("/intercoType"))]
			});
			aOperations.push({
				"path": "/LegalEntityRCCreationCollection",
				"filters": [new Filter("IntercoType", FilterOperator.EQ, this.getModel("AppData").getProperty("/intercoType"))]
			});

			return odataService.batchRead.call(this, "masterData", aOperations)
					.then(function(oData){
						var iCountAppData = 0,
							oAppData = {},
							aBatchResponses = oData.__batchResponses,
							aDocumentTypeCreation = [];

						this.setModel(new JSONModel(aBatchResponses[0].data), "DocumentTypeCollection");
						aBatchResponses[0].data.results.forEach(function (oDocumentTypeData) {
							if (oDocumentTypeData.UICreation) {
								aDocumentTypeCreation.push(oDocumentTypeData);
							}
						})
						this.setModel(new JSONModel({
							results: aDocumentTypeCreation
						}), "DocumentTypeCreationCollection");

						this.setModel(new JSONModel(aBatchResponses[1].data), "LegalEntityCollection");
						this.getModel("LegalEntityCollection").setSizeLimit(aBatchResponses[1].data ? aBatchResponses[1].data.results.length : 0);
						this.setModel(new JSONModel(aBatchResponses[2].data), "StatusCollection");
						this.setModel(new JSONModel(aBatchResponses[3].data), "DCIndicatorCollection");
						this.setModel(new JSONModel(aBatchResponses[4].data), "CompanyCollection");
						this.setModel(new JSONModel(aBatchResponses[5].data), "IntercoTypeCollection");
						this.setModel(new JSONModel(aBatchResponses[6].data), "CreationModeCollection");
						this.setModel(new JSONModel(aBatchResponses[7].data), "MajorTypeCollection");
						this.setModel(new JSONModel(aBatchResponses[8].data), "CountryCollection");
						this.setModel(new JSONModel(aBatchResponses[9].data), "LegalEntityCreationCollection");
						this.getModel("LegalEntityCreationCollection").setSizeLimit(aBatchResponses[9].data ? aBatchResponses[9].data.results.length : 0);
			 			this.setModel(new JSONModel(aBatchResponses[10].data), "LegalEntityRCCreationCollection");
			 			this.getModel("LegalEntityRCCreationCollection").setSizeLimit(aBatchResponses[10].data ? aBatchResponses[10].data.results.length : 0);

						return "";

					}.bind(this));
		},

		/** 
		 * Get business data (Batch)
		 * 	- Document Type List
		 *  - Companies
		 * @private
		 * @returns {object} promise
		 */
		_getBusinessData: function () {

			var aOperations = [];

			aOperations.push({
				"path": "/AppDataCollection",
				"filters": []
			});
			aOperations.push({
				"path": "/DocumentTypeCollection",
				"filters": [new Filter("IntercoType", FilterOperator.EQ, this.getModel("AppData").getProperty("/intercoType"))]
			});
			//this.getComponentData().startupParameters.intercoType[0]
			aOperations.push({
				"path": "/LegalEntityCollection",
				"filters": [new Filter("IntercoType", FilterOperator.EQ, this.getModel("AppData").getProperty("/intercoType"))]
			});
			//this.getComponentData().startupParameters.intercoType[0]
			aOperations.push({
				"path": "/TotalAmountCalculationRulesCollection",
				"filters": []
			});
			aOperations.push({
				"path": "/StatusCollection",
				"filters": []
			});
			aOperations.push({
				"path": "/DCIndicatorCollection",
				"filters": []
			});
			aOperations.push({
				"path": "/CompanyCollection",
				"filters": []
			});
			aOperations.push({
				"path": "/IntercoTypeCollection",
				"filters": []
			});
			aOperations.push({
				"path": "/CreationModeCollection",
				"filters": []
			});
			aOperations.push({
				"path": "/MajorTypeCollection",
				"filters": [new Filter("ApplicationType", FilterOperator.EQ, this.getModel("AppData").getProperty("/appType"))]
			});
			//this.getComponentData().startupParameters.appType[0]
			aOperations.push({
				"path": "/CountryCollection",
				"filters": []
			});
			aOperations.push({
				"path": "/LegalEntityCreationCollection",
				"filters": [new Filter("IntercoType", FilterOperator.EQ, this.getModel("AppData").getProperty("/intercoType"))]
			});
			aOperations.push({
				"path": "/LegalEntityRCCreationCollection",
				"filters": [new Filter("IntercoType", FilterOperator.EQ, this.getModel("AppData").getProperty("/intercoType"))]
			});

			return odataService.batchRead.call(this, "businessData", aOperations);

		}

	});
});