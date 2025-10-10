/************************************************************************
 * Project            : TIMI                                 			*
 * Process            : FI                                              *
 * Task code          : FI062                                           *
 * Functional document:                                					*
 * Technical document :                                    				*
 *----------------------------------------------------------------------*
 * File       	 : view/Overview.controller.js   	        			*
 * Author        : David TEA                                            *
 * Company       : Resp                                               	*
 * Creation Date : 01/07/2025                                           *
 *----------------------------------------------------------------------*
 * Description   :Overview view controller   							*		
 *                                                                      *
 ************************************************************************
/**
 * @fileOverview Overview view controller
 * @author David Tea
 * @version 1.0
 */
sap.ui.define([
	"cus/fi/timi/rel/controller/BaseController",
	"sap/m/CustomListItem",
	"sap/m/GroupHeaderListItem",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter",
	"cus/fi/timi/rel/model/attachments",
	"cus/fi/timi/rel/model/businessRules",
	"cus/fi/timi/rel/model/exports",
	"cus/fi/timi/rel/model/formatterFormat",
	"cus/fi/timi/rel/model/formatterState",
	"cus/fi/timi/rel/model/formatterText",
	"cus/fi/timi/rel/model/formatterVisibility",
	"cus/fi/timi/rel/model/messageHelper",
	"cus/fi/timi/rel/model/odataService",
	"cus/fi/timi/rel/model/parameters",
	"cus/fi/timi/rel/assets/js/helpers/utilities",
	"cus/fi/timi/rel/assets/js/helpers/busy"
], function (BaseController, CustomListItem, GroupHeaderListItem, JSONModel, Filter, FilterOperator, Sorter, attachments, businessRules,
	exports, formatterFormat, formatterState, formatterText, formatterVisibility, messageHelper, odataService, parameters, utilities, busy) {
	"use strict";

	return BaseController.extend("cus.fi.timi.rel.controller.Overview", {

		formatterFormat: formatterFormat,
		formatterState: formatterState,
		formatterText: formatterText,
		formatterVisibility: formatterVisibility,
		businessRules: businessRules,
		utilities: utilities,

		/**
		 * Called when a controller is instantiated and its View controls (if
		 * available) are already created. Can be used to modify the View before
		 * it is displayed, to bind event handlers and do other one-time
		 * initialization.
		 * 
		 * @memberOf view.Overview
		 */
		onInit: function () {

			/**
			 * Component defined routes
			 * 
			 * @type {sap.ui.core.routing.Router}
			 */
			this.oRouter = this.getRouter();

			/**
			 * Component defined ODataModel
			 * 
			 * @type {sap.ui.model.odata.ODataModel}
			 */
			this.oDataModel = odataService.getODataModel.apply(this);

			/**
			 * Component defined localization resource model
			 * 
			 * @type {sap.ui.model.resource.ResourceModel}
			 */
			this.oBundle = this.getResourceBundle();

			/**
			 * Attach on route navigation event match
			 */
			this.oRouter.getRoute("overview").attachMatched(this._onRouteMatched, this);

			/**
			 * Event Subscription
			 */
			this.getOwnerComponent().getEventBus().subscribe("cus.fi.timi.rel", "refreshOverviewRequestList", this._refreshOverviewRequestList,
				this);

			/**
			 * Call _setStyle method
			 */
			this._setStyle();

			this._creationIssuingLE = "";
			this._creationReceivingLE = "";
		},

		/**
		 * Handles route matched function
		 * 
		 * @event
		 * @param {eventObject} oEvent the event data
		 * @public
		 */
		_onRouteMatched: function (oEvent) {

			// Get Requests List
			this._getRequests();

			// Initiate CheckBox All Requests 
			this._initiateCheckBoxAllRequests();
		},

		_refreshOverviewRequestList: function (sChannel, sEventName, oCustomData) {

			var oModel = {};

			if (oCustomData && oCustomData.UploadId && oCustomData.UploadId !== "") {
				this._setUploadId(oCustomData.UploadId);
			}

			// Get Requests List
			this._getRequests();

		},

		/**
		 * Build request filters for search
		 * @private
		 * @returns {array} the array of filters
		 */
		_buildRequestFilters: function () {

			var aFilters = [],
				i = 0,
				sStatusId = this.getView().byId("itbRequests").getSelectedKey(),
				sRequestId = this.getView().byId("iCriteriaRequest").getValue(),
				sDateFrom = this.getView().byId("dpCriteriaDateFrom").getValue(),
				oDateFrom = {},
				sDateTo = this.getView().byId("dpCriteriaDateTo").getValue(),
				oDateTo = {},
				aIssuingCompany = this.getView().byId("mcbCriteriaIssuingCompany").getSelectedItems(),
				aReceivingCompany = this.getView().byId("mcbCriteriaReceivingCompany").getSelectedItems(),
				aMajorType = this.getView().byId("mcbReportingCriteriaMajorType").getSelectedItems(),
				aCreationMode = this.getView().byId("mcbReportingCriteriaCreationMode").getSelectedItems(),
				aIssuingCompanyLength = aIssuingCompany.length,
				aReceivingCompanyLength = aReceivingCompany.length,
				aMajorTypeLength = aMajorType.length,
				aCreationModeLength = aCreationMode.length,
				bHasActionsOnly = this.getComponentModel("AppData").getProperty("/visibleActionsOnRequestOnly");

			aFilters.push(new Filter("ApplicationType", FilterOperator.EQ, this.getAppType()));
			aFilters.push(new Filter("Filters/IntercoType", FilterOperator.EQ, this.getIntercoType()));
			if (sStatusId) {
				aFilters.push(new Filter("StatusId", FilterOperator.EQ, sStatusId));
			}

			if (sRequestId !== "") {
				aFilters.push(new Filter("RequestId", FilterOperator.EQ, sRequestId));
			}

			aFilters.push(new Filter("Filters/HasActions", FilterOperator.EQ, bHasActionsOnly));

			if (sDateFrom !== "" && sDateTo !== "") {
				oDateFrom = formatterFormat.formatSAPDate(sDateFrom);
				//oDateFrom = new Date(oDateFrom.setHours(oDateFrom.getHours() + 4));
				oDateTo = formatterFormat.formatSAPDate(sDateTo);
				//oDateTo = new Date(oDateTo.setHours(oDateTo.getHours() + 4));
				aFilters.push(new Filter("DateCreation", FilterOperator.BT, oDateFrom, oDateTo));
			} else if (sDateFrom !== "" && sDateTo === "") {
				oDateFrom = formatterFormat.formatSAPDate(sDateFrom);
				//oDateFrom = new Date(oDateFrom.setHours(oDateFrom.getHours() + 4));
				aFilters.push(new Filter("DateCreation", FilterOperator.GE, oDateFrom, ''));
			} else if (sDateFrom === "" && sDateTo !== "") {
				oDateTo = formatterFormat.formatSAPDate(sDateTo);
				//oDateTo = new Date(oDateTo.setHours(oDateTo.getHours() + 4));
				aFilters.push(new Filter("DateCreation", FilterOperator.LE, oDateTo, ''));
			}

			if (aIssuingCompanyLength > 0) {
				for (i = 0; i < aIssuingCompanyLength; i++) {
					aFilters.push(new Filter("HeaderData/IsCompanyCode", FilterOperator.EQ, aIssuingCompany[i].getBindingContext("CompanyCollection")
						.getProperty("CompanyCode")));
				}
			}

			if (aReceivingCompanyLength > 0) {
				for (i = 0; i < aReceivingCompanyLength; i++) {
					aFilters.push(new Filter("HeaderData/RcCompanyCode", FilterOperator.EQ, aReceivingCompany[i].getBindingContext(
						"CompanyCollection").getProperty("CompanyCode")));
				}
			}

			if (aMajorTypeLength > 0) {
				for (i = 0; i < aMajorTypeLength; i++) {
					aFilters.push(new Filter("HeaderData/MajorTypeCode", FilterOperator.EQ, aMajorType[i].getBindingContext("MajorTypeCollection").getProperty(
						"MajorTypeCode")));
				}
			}

			if (aCreationModeLength > 0) {
				for (i = 0; i < aCreationModeLength; i++) {
					aFilters.push(new Filter("HeaderData/CreationMode", FilterOperator.EQ, aCreationMode[i].getBindingContext(
						"CreationModeCollection").getProperty("CreationModeCode")));
				}
			}

			return aFilters;

		},

		/**
		 * Get request list
		 * 
		 * @param {string} sStatusId the status id
		 * @private
		 */
		_getRequests: function () {

			// Set busy indicator on before OData read
			this._setBusyRequestTable(true);

			this._asyncGetRequests()
				.catch(messageHelper.showODataFailedMessages.bind(this))
				.then(function () {
					this._applyRequestsDisplayMode(this.getView().byId("sbRequestDisplayMode").getSelectedKey());
					this._selectRequestByUploadId(this._getUploadId());
					this._clearUploadId();
					this._refreshMassActionsEnabledStatus();
					this.getView().getModel("RequestList").updateBindings();
					this._setBusyRequestTable(false);
				}.bind(this));

		},

		_selectRequestByUploadId: function (sUploadId) {

			var oModel = this.getView().getModel("RequestList");

			if (sUploadId !== "") {
				oModel.getProperty("/results").forEach(function (oItem) {
					if (oItem.HeaderData.UploadId === sUploadId) {
						oItem.Filters.IsSelected = true;
					}
				})
			}

		},

		_asyncGetRequests: function () {

			var aFilters = this._buildRequestFilters();

			return odataService.queryRequest.call(this, aFilters)
				.then(function (oData) {
					// Set JSON Model
					this.getView().setModel(new JSONModel(oData), "RequestList");
					return "";
				}.bind(this))
				.then(this._asyncCountRequests.bind(this));

		},

		_asyncCountRequests: function () {

			var aIssuingCompanyItems = this.getView().byId("mcbCriteriaIssuingCompany").getSelectedItems(),
				iIssuingCompanyItemsLength = aIssuingCompanyItems.length,
				aIssuingCompany = [],
				aReceivingCompanyItems = this.getView().byId("mcbCriteriaReceivingCompany").getSelectedItems(),
				iReceivingCompanyItemsLength = aReceivingCompanyItems.length,
				aReceivingCompany = [],
				bHasActionsOnly = this.getComponentModel("AppData").getProperty("/visibleActionsOnRequestOnly"),
				i = 0,
				oUrlParameters = {};

			if (iIssuingCompanyItemsLength > 0) {
				for (i = 0; i < iIssuingCompanyItemsLength; i++) {
					aIssuingCompany.push(aIssuingCompanyItems[i].getBindingContext("CompanyCollection").getProperty("CompanyCode"));
				}
			}

			if (iReceivingCompanyItemsLength > 0) {
				for (i = 0; i < iReceivingCompanyItemsLength; i++) {
					aReceivingCompany.push(aReceivingCompanyItems[i].getBindingContext("CompanyCollection").getProperty("CompanyCode"));
				}
			}

			oUrlParameters = {
				"ApplicationType": this.getAppType(),
				"IntercoType": this.getIntercoType(),
				"RequestId": this.getView().byId("iCriteriaRequest").getValue(),
				"DateFrom": this.getView().byId("dpCriteriaDateFrom").getValue(),
				"DateTo": this.getView().byId("dpCriteriaDateTo").getValue(),
				"IssuingCompaniesInline": aIssuingCompany.join(";"),
				"ReceivingCompaniesInline": aReceivingCompany.join(";"),
				"HasActionsOnly": bHasActionsOnly
			}

			return odataService.countRequests.call(this, oUrlParameters)
				.then(function (oData) {
					this.getView().setModel(new JSONModel(oData), "RequestsCount");
				}.bind(this));

		},

		/**
		 * Handles icon tab bar status selection
		 * 
		 * @event
		 * @param {eventObject} oEvent the event data
		 * @public
		 */
		onSelectStatus: function (oEvent) {

			// Get Request List
			this._getRequests();

			// Initiate CheckBox All Requests 
			this._initiateCheckBoxAllRequests();

		},

		onPressActionsOnRequest: function () {

			var bHasActionsOnly = this.getComponentModel("AppData").getProperty("/visibleActionsOnRequestOnly");

			this.getComponentModel("AppData").setProperty("/visibleActionsOnRequestOnly", !bHasActionsOnly);

			// Get Request List
			this._getRequests();
			// Initiate CheckBox All Requests 
			this._initiateCheckBoxAllRequests();

		},

		/**
		 * Initiate Check Box All requests selected property
		 * @public
		 */
		_initiateCheckBoxAllRequests: function () {
			this.getView().byId("cbSelectAllRequests").setSelected(false);

		},

		onSelectionChangeIssuingLegalEntity: function (oEvent) {

			var oSelectedItem = oEvent.getParameters().selectedItem,
				oSelectedLegalEntity = {},
				oCBIssuingCompany = this.byId(sap.ui.core.Fragment.createId("frgtCreateRequest", "cbIssuingCompany")),
				aFilters = [];

			if (oSelectedItem !== null) {
				oSelectedLegalEntity = oSelectedItem.getBindingContext("LegalEntityCreationCollection");
				this._creationIssuingLE = oSelectedLegalEntity.getProperty("LegalEntityCode");
				aFilters.push(new Filter("LegalEntityCode", FilterOperator.EQ, oSelectedLegalEntity.getProperty("LegalEntityCode")));

				this.getAppDataModel().setProperty("/requestInitiationData/IssuingCountry", oSelectedLegalEntity.getProperty("Country"));

				oCBIssuingCompany.setBusy(true);

				odataService.queryCompany.call(this, aFilters)
					.then(function (oData) {
						if (oData.results.length > 0) {
							if (oData.results[0].LegalEntityCode === this._creationIssuingLE) {
								this.getView().setModel(new JSONModel(oData), "IssuingCompanyCollection");
							}
						}
					}.bind(this))
					.catch(messageHelper.showODataFailedMessages.bind(this))
					.then(function () {
						oCBIssuingCompany.setBusy(false);
					}.bind(this))

			} else {
				this.getView().setModel(new JSONModel(), "IssuingCompanyCollection");
			}

		},

		onSelectionChangeReceivingLegalEntity: function (oEvent) {

			var oSelectedItem = oEvent.getParameters().selectedItem,
				oSelectedLegalEntity = {},
				oCBReceivingCompany = this.byId(sap.ui.core.Fragment.createId("frgtCreateRequest", "cbReceivingCompany")),
				aFilters = [];

			if (oSelectedItem !== null) {
				oSelectedLegalEntity = oSelectedItem.getBindingContext("LegalEntityRCCreationCollection");
				this._creationReceivingLE = oSelectedLegalEntity.getProperty("LegalEntityCode");
				aFilters.push(new Filter("LegalEntityCode", FilterOperator.EQ, oSelectedLegalEntity.getProperty("LegalEntityCode")));

				oCBReceivingCompany.setBusy(true);

				odataService.queryCompanyRC.call(this, aFilters)
					.then(function (oData) {
						if (oData.results.length > 0) {
							if (oData.results[0].LegalEntityCode === this._creationReceivingLE) {
								this.getView().setModel(new JSONModel(oData), "ReceivingCompanyCollection");
							}
						}
					}.bind(this))
					.catch(messageHelper.showODataFailedMessages.bind(this))
					.then(function () {
						oCBReceivingCompany.setBusy(false);
					}.bind(this))
			} else {
				this.getView().setModel(new JSONModel(), "ReceivingCompanyCollection");
			}

		},

		onChangeInvoiceType: function (oEvent) {
			var sSelectedKey = oEvent.getParameter("selectedItem").getKey();
			this.getAppDataModel().setProperty("/requestInitiationData/InvoiceType", sSelectedKey);
		},

		onSelectSubInvoiceType: function (oEvent) {
			var sValue = oEvent.getSource().getSelectedButton().data("value");
			this.getAppDataModel().setProperty("/requestInitiationData/SubInvoiceType", sValue);
		},

		/**
		 * Handles press on duplicate request button
		 * 
		 * @event
		 * @param {eventObject} oEvent the event data
		 * @public
		 */
		onPressDuplicateRequest: function (oEvent) {

			var oText = {},
				oSource = oEvent.getSource(),
				sPath = oSource.getBindingContext("RequestList").getPath(),
				oReqData = this.getView().getModel("RequestList").getProperty(sPath);

			// create duplicate request responsive popover
			if (!this._oDuplicateRequestPopover) {
				this._oDuplicateRequestPopover = sap.ui.xmlfragment(this.createId("frgtDuplicateRequest"),
					"cus.fi.timi.rel.view.fragment.RequestDuplicateResponsivePopup", this);
				this.getView().addDependent(this._oDuplicateRequestPopover);
			}

			// Set text 
			oText = this.byId(sap.ui.core.Fragment.createId("frgtDuplicateRequest", "tRequestActionQuestion"));
			oText.setText(this.oBundle.getText("request.popup.text.duplicate", oReqData.HeaderData.RequestId));
			// Add request id to the dialog
			this._oDuplicateRequestPopover.data("RequestId", oReqData.HeaderData.RequestId);

			this._oDuplicateRequestPopover.openBy(oSource);

		},

		/**
		 * Handles press confirmation on request duplication popup
		 * 
		 * @event
		 * @param {eventObject} oEvent the event data
		 * @public
		 */
		onPressDuplicateRequestPopupConfirm: function (oEvent) {
			// Show busy indicator
			busy.setBusyOn();

			this._oDuplicateRequestPopover.close();

			var sRequestId = this._oDuplicateRequestPopover.data("RequestId"),
				oRequest = odataService.createODataEntityObject(this.oDataModel, "Request", []);

			oRequest.HeaderData.RequestId = sRequestId;
			oRequest.HeaderData.CreationMode = parameters.getCreationModeList().Manual;
			oRequest.HeaderData.IntercoTypeCode = this.getIntercoType();
			oRequest.ApplicationType = this.getAppType();

			odataService.createRequest.call(this, oRequest)
				.then(function (oData) {

					// Navigate to the new request
					this.oRouter.navTo("request", {
						"requestId": oData.RequestId
					});

					return "";
				}.bind(this))
				.catch(messageHelper.showODataFailedMessages.bind(this))
				.then(function () {
					// Close busy indicator
					busy.setBusyOff();
				});

		},

		/**
		 * Handles press cancel on request duplication popup
		 * 
		 * @event
		 * @param {eventObject} oEvent the event data
		 * @public
		 */
		onPressDuplicateRequestPopupCancel: function (oEvent) {
			// close dialog
			this._oDuplicateRequestPopover.close();
		},

		/**
		 * Handles press on create a new request button
		 * 
		 * @event
		 * @param {eventObject} oEvent the event data
		 * @public
		 */
		onPressCreateRequest: function (oEvent) {

			if (!this._oCreateRequestDialog) {
				this._oCreateRequestDialog = sap.ui.xmlfragment(this.createId("frgtCreateRequest"),
					"cus.fi.timi.rel.view.fragment.RequestCreationPopup", this.getView().getController());
				this.getView().addDependent(this._oCreateRequestDialog);
				this._oCreateRequestDialog.getBeginButton().attachPress(this._onPressRequestCreationDialogConfirm.bind(this));
				this._oCreateRequestDialog.getEndButton().attachPress(this._onPressRequestCreationDialogCancel.bind(this));
			}

			this._oCreateRequestDialog.open();
		},

		/**
		 * Handles press confirmation on request creation popup
		 * 
		 * @event
		 * @param {eventObject} oEvent the event data
		 * @public
		 */
		_onPressRequestCreationDialogConfirm: function (oEvent) {

			// Show busy indicator
			busy.setBusyOn();

			var oSelectMajorType = {},
				oSelectNature = {},
				oSelectInvoiceType = {},
				oCBIssuingCompany = {},
				oCBIssuingLegalEntity,
				oCBReceivingCompany = {},
				oCBReceivingLegalEntity,
				oRequest = {},
				oAppDataModel = this.getAppDataModel();

			oSelectMajorType = this.byId(sap.ui.core.Fragment.createId("frgtCreateRequest", "sMajorType"));
			oSelectNature = this.byId(sap.ui.core.Fragment.createId("frgtCreateRequest", "sNature"));
			oSelectInvoiceType = this.byId(sap.ui.core.Fragment.createId("frgtCreateRequest", "sInvoiceType"));
			oCBIssuingLegalEntity = this.byId(sap.ui.core.Fragment.createId("frgtCreateRequest", "cbIssuingLegalEntity"));
			oCBReceivingLegalEntity = this.byId(sap.ui.core.Fragment.createId("frgtCreateRequest", "cbReceivingLegalEntity"));
			oCBIssuingCompany = this.byId(sap.ui.core.Fragment.createId("frgtCreateRequest", "cbIssuingCompany"));
			oCBReceivingCompany = this.byId(sap.ui.core.Fragment.createId("frgtCreateRequest", "cbReceivingCompany"));

			oRequest = odataService.createODataEntityObject(this.oDataModel, "Request", []);

			if (businessRules.isInvoicePL(oAppDataModel.getProperty("/intercoType"),
					oAppDataModel.getProperty("/requestInitiationData/IssuingCountry"),
					oAppDataModel.getProperty("/requestInitiationData/InvoiceType"))) {
				oRequest.HeaderData.DocumentTypeCode = oAppDataModel.getProperty("/requestInitiationData/SubInvoiceType");
			} else {
				oRequest.HeaderData.DocumentTypeCode = oSelectInvoiceType.getSelectedKey();
			}
			//oRequest.HeaderData.DocumentTypeCode = oSelectInvoiceType.getSelectedKey();
			oRequest.HeaderData.IsLegalEntityCode = oCBIssuingLegalEntity.getSelectedKey();
			oRequest.HeaderData.RcLegalEntityCode = oCBReceivingLegalEntity.getSelectedKey();
			oRequest.HeaderData.CreationMode = parameters.getCreationModeList().Manual;
			oRequest.HeaderData.IntercoTypeCode = this.getIntercoType();
			oRequest.ApplicationType = this.getAppType();

			if (oCBIssuingCompany.getSelectedItem()) {
				oRequest.HeaderData.IsCompanyCode = oCBIssuingCompany.getSelectedItem().getBindingContext("IssuingCompanyCollection").getProperty(
					"CompanyCode");
				oRequest.HeaderData.IsCountryCode = oCBIssuingCompany.getSelectedItem().getBindingContext("IssuingCompanyCollection").getProperty(
					"CountryCode");
			}
			if (oCBReceivingCompany.getSelectedItem()) {
				oRequest.HeaderData.RcCompanyCode = oCBReceivingCompany.getSelectedItem().getBindingContext("ReceivingCompanyCollection").getProperty(
					"CompanyCode");
				oRequest.HeaderData.RcCountryCode = oCBReceivingCompany.getSelectedItem().getBindingContext("ReceivingCompanyCollection").getProperty(
					"CountryCode");
			}

			odataService.createRequest.call(this, oRequest)
				.then(function (oData) {

					// Navigate to the new request
					this.oRouter.navTo("request", {
						"requestId": oData.RequestId
					});

					return "";
				}.bind(this))
				.catch(messageHelper.showODataFailedMessages.bind(this))
				.then(function () {
					// Close busy indicator
					busy.setBusyOff();
				});

		},

		/**
		 * Handles press cancel on request creation popup
		 * 
		 * @event
		 * @param {eventObject} oEvent the event data
		 * @public
		 */
		_onPressRequestCreationDialogCancel: function (oEvent) {
			// close dialog
			this._oCreateRequestDialog.close();
		},

		/**
		 * Handles press on delete request button
		 * 
		 * @event
		 * @param {eventObject} oEvent the event data
		 * @public
		 */
		onPressDeleteRequest: function (oEvent) {

			var oText = {},
				oSource = oEvent.getSource();
			var sPath = oSource.getBindingContext("RequestList").getPath();
			var oReqData = this.getView().getModel("RequestList").getProperty(sPath);

			// create delete request responsive popover
			if (!this._oDeleteRequestPopover) {
				this._oDeleteRequestPopover = sap.ui.xmlfragment(this.createId("frgtDeleteRequest"),
					"cus.fi.timi.rel.view.fragment.RequestDeleteResponsivePopup", this);
				this.getView().addDependent(this._oDeleteRequestPopover);
			}

			// Set text 
			oText = this.byId(sap.ui.core.Fragment.createId("frgtDeleteRequest", "tRequestActionQuestion"));
			oText.setText(this.oBundle.getText("request.popup.text.delete", oReqData.HeaderData.RequestId));
			// Add request id to the dialog
			this._oDeleteRequestPopover.data("RequestId", oReqData.HeaderData.RequestId);

			this._oDeleteRequestPopover.openBy(oSource);

		},

		/**
		 * Handles press confirmation on request deletion popup
		 * 
		 * @event
		 * @param {eventObject} oEvent the event data
		 * @public
		 */
		onPressDeleteRequestPopupConfirm: function (oEvent) {

			var sRequestId = this._oDeleteRequestPopover.data("RequestId"),
				oUrlParameters = {};

			// Set busy indicator on before OData read
			this._setBusyRequestTable(true);
			this._oDeleteRequestPopover.close();

			oUrlParameters = {
				"IntercoType": this.getIntercoType(),
				"ApplicationType": this.getAppType(),
				"RequestId": sRequestId,
				"ActionId": parameters.getActionList().Delete,
				"Comments": ""
			};

			odataService.applyRequestDecision.call(this, oUrlParameters)
				.then(this._asyncGetRequests.bind(this))
				.catch(messageHelper.showODataFailedMessages.bind(this))
				.then(function () {
					this._applyRequestsDisplayMode(this.getView().byId("sbRequestDisplayMode").getSelectedKey());
					this._refreshMassActionsEnabledStatus();
					this._setBusyRequestTable(false);
				}.bind(this));

		},

		/**
		 * Handles press cancel on request deletion popup
		 * 
		 * @event
		 * @param {eventObject}
		 *                oEvent the event data
		 * @public
		 */
		onPressDeleteRequestPopupCancel: function (oEvent) {
			// close dialog
			this._oDeleteRequestPopover.close();
		},

		onPressShowRequestBatchLogs: function (oEvent) {

			var oSource = oEvent.getSource();
			var sPath = oSource.getBindingContext("RequestList").getPath();
			var oReqData = this.getView().getModel("RequestList").getProperty(sPath);

			if (oReqData.BatchLogs.results.length > 0) {
				// Create popover
				if (!this._oPopoverRequestBatchLogs) {
					this._oPopoverRequestBatchLogs = sap.ui.xmlfragment("cus.fi.timi.rel.view.fragment.RequestBatchLogsPopup", this);
					this.getView().addDependent(this._oPopoverRequestBatchLogs);
				}

				// Set JSON Model
				this._oPopoverRequestBatchLogs.setModel(new JSONModel(oReqData), "Request");

				this._oPopoverRequestBatchLogs.openBy(oSource);
			}

		},

		onPressRequestsAction: function (oEvent) {

			var oButton = oEvent.getSource();

			this._initiateRequestsActionDialog(oButton.data("actionId"));

		},

		_initiateRequestsActionDialog: function (sActionId) {

			var oText = {},
				oTextArea = {},
				oButtonConfirm = {},
				oRadionButtonRejectIssuer = {},
				oRadionButtonRejectReceiver = {},
				fnOnChangeTextArea,
				sText, sPlaceholder, sTitle,
				bTextAreaVisible = false,
				bRGBVisible = false,
				bBtnConfirmEnabled = false,
				bInvalid = false,
				sAppType = this.getAppType();

			// create delete request responsive popover
			if (!this._oRequestActionPopover) {
				this._oRequestActionPopover = sap.ui.xmlfragment(this.createId("frgtRequestActionDialog"),
					"cus.fi.timi.rel.view.fragment.RequestActionPopup", this);
				this.getView().addDependent(this._oRequestActionPopover);
			}

			// Attach action id to the dialog
			this._oRequestActionPopover.data("ActionId", sActionId);

			// Get Dialog controls 
			oText = this.byId(sap.ui.core.Fragment.createId("frgtRequestActionDialog", "tActionText"));
			oTextArea = this.byId(sap.ui.core.Fragment.createId("frgtRequestActionDialog", "taActionComment"));
			oRadionButtonRejectIssuer = this.byId(sap.ui.core.Fragment.createId("frgtRequestActionDialog", "rbRejectIssuer"));
			oRadionButtonRejectReceiver = this.byId(sap.ui.core.Fragment.createId("frgtRequestActionDialog", "rbRejectReceiver"));
			oButtonConfirm = this.byId(sap.ui.core.Fragment.createId("frgtRequestActionDialog", "btnRequestActionConfirm"));

			// Clear Comments value
			oTextArea.setValue("");

			// TextArea change event function handler
			fnOnChangeTextArea = function (oEvent, oButtonConfirm) {
				// Set value is not null, 
				var bEnabled = false,
					sComments = oEvent.getSource().getValue().trim();

				// If comments, enable confirm button
				if (sComments === "") {
					bEnabled = false;
				} else {
					bEnabled = true;
				}
				oButtonConfirm.setEnabled(bEnabled);
			};

			switch (sActionId) {
			case parameters.getActionList().Submit:
				if (businessRules.isAppIssuer(this.getAppType())) {
					if (!businessRules.checkRequesterDeadlineIsPassed.call(this)) {
						sTitle = this.oBundle.getText("request.popup.title.submit.multiple");
						sText = this.oBundle.getText("request.popup.text.submit.selected");
						sPlaceholder = this.oBundle.getText("request.popup.placeholder.optional");
						bTextAreaVisible = true;
						bRGBVisible = false;
						bBtnConfirmEnabled = true;
					} else {
						// Deadline has passed
						sText = this.oBundle.getText("overview.deadlinemesssage.issuerapp.passed");
						sPlaceholder = "";
						bTextAreaVisible = false;
						bRGBVisible = false;
						bBtnConfirmEnabled = false;
					}
				} else {
					bInvalid = true;
				}
				break;
			case parameters.getActionList().Validate:
				sTitle = this.oBundle.getText("request.popup.title.validate.multiple");
				sText = this.oBundle.getText("request.popup.text.validate.selected");
				sPlaceholder = "";
				bTextAreaVisible = false;
				bRGBVisible = false;
				bBtnConfirmEnabled = true;
				break;
			case parameters.getActionList().Generate:
				sTitle = this.oBundle.getText("request.popup.title.generate.multiple");
				sText = this.oBundle.getText("request.popup.text.generate.selected");
				sPlaceholder = "";
				bTextAreaVisible = false;
				bRGBVisible = false;
				bBtnConfirmEnabled = true;
				break;
			case parameters.getActionList().Reject:
				sTitle = this.oBundle.getText("request.popup.title.reject.multiple");
				sText = this.oBundle.getText("request.popup.text.reject.selected");
				sPlaceholder = this.oBundle.getText("request.popup.placeholder.mandatory");
				bTextAreaVisible = true;
				bRGBVisible = false;
				bBtnConfirmEnabled = false;
				oTextArea.attachChange(oButtonConfirm, fnOnChangeTextArea, this);
				break;
			case parameters.getActionList().Delete:
				sTitle = this.oBundle.getText("request.popup.title.delete.multiple");
				sText = this.oBundle.getText("request.popup.text.delete.selected");
				sPlaceholder = "";
				bTextAreaVisible = false;
				bRGBVisible = false;
				bBtnConfirmEnabled = true;
				break;
				// M003 - SRS - Begin of change - 04/07/2022
			case parameters.getActionList().Approve:
				//Check deadline date is not passed
				var bIsDeadlinePassed = false;
				bIsDeadlinePassed = businessRules.checkDeadlineIsPassed.call(this);
				if (bIsDeadlinePassed === true) { //Deadline has passed
					sText = this.oBundle.getText("overview.deadlinemesssage.receiverapp.passed");
					sPlaceholder = ""
					bTextAreaVisible = false;
					bRGBVisible = false;
					bBtnConfirmEnabled = false;
				} else {
					sText = this.oBundle.getText("request.popup.text.approve.multiple");
					sPlaceholder = "";
					bTextAreaVisible = false;
					bRGBVisible = false;
					bBtnConfirmEnabled = true;
				}
				sTitle = this.oBundle.getText("request.popup.title.approve");
				break;
				// M003 - SRS - End of change - 04/07/2022
				// M005 - ABC - Begin of change - 24/01/2023
			case parameters.getActionList().RejectIssuer:
				sTitle = this.oBundle.getText("request.popup.title.reject.multiple");
				sText = this.oBundle.getText("request.popup.text.reject.selected");
				sPlaceholder = this.oBundle.getText("request.popup.placeholder.mandatory");
				bTextAreaVisible = true;
				bRGBVisible = false;
				bBtnConfirmEnabled = false;
				oTextArea.attachChange(oButtonConfirm, fnOnChangeTextArea, this);
				break;
				// M005 - ABC - End of change - 24/01/2023
			default:
				bInvalid = true;
				break;
			}

			// Invalid Action
			if (bInvalid) {
				sTitle = this.oBundle.getText("messagebox.error.title");
				sText = this.oBundle.getText("request.popup.text.action.unknown");
				bTextAreaVisible = false;
				bRGBVisible = false;
				bBtnConfirmEnabled = false;
			}

			this._oRequestActionPopover.setTitle(sTitle);
			this._oRequestActionPopover.setState(sap.ui.core.ValueState.None);
			oText.setText(sText);
			oTextArea.setVisible(bTextAreaVisible).setPlaceholder(sPlaceholder);
			oRadionButtonRejectIssuer.setVisible(bRGBVisible);
			oRadionButtonRejectReceiver.setVisible(bRGBVisible);
			oButtonConfirm.setEnabled(bBtnConfirmEnabled);
			this._oRequestActionPopover.open();

		},

		onPressConfirmRequestAction: function (oEvent) {

			var sActionId = this._oRequestActionPopover.data("ActionId"),
				sValidateActionId = "",
				oRequestModel = this.getView().getModel("RequestList"),
				aRequests = oRequestModel.getProperty("/results"),
				oTextArea = this.byId(sap.ui.core.Fragment.createId("frgtRequestActionDialog", "taActionComment")),
				sComments = oTextArea.getValue(),
				aPromises = [],
				i = 0,
				aErrorMessages = [],
				bTriggerCall = false,
				sLoadingDialogMode;

			// create delete request responsive popover
			if (!this._oLoadingDialog) {
				this._oLoadingDialog = sap.ui.xmlfragment(this.createId("frgtLoadingDialog"), "cus.fi.timi.rel.view.fragment.LoadingDialog", this);
				this.getView().addDependent(this._oLoadingDialog);
			}

			function handleError(sRequestId, oError) {
				aErrorMessages.push({
					"RequestId": sRequestId,
					"Messages": messageHelper.getODataMessages.call(this, oError)["messages"].map(function (oItem) {
						return {
							"Description": oItem
						};
					})
				})
			}

			this._initiateLoadingDialogModel();

			switch (sActionId) {
			case parameters.getActionList().Submit:

				bTriggerCall = true;
				sLoadingDialogMode = parameters.getLoadingDialogModeList().SubmitRequests;

				for (i = 0; i < aRequests.length; i++) {
					if (aRequests[i].Filters.IsSelected && aRequests[i].Actions.VisibleSubmit) {
						var oRequest = aRequests[i];
						aPromises.push(this._asyncCheckRequest.call(this, oRequest.HeaderData.RequestId, sActionId)
							.then(this._asyncApplyRequestDecision.bind(this, this.getIntercoType(), this.getAppType(), oRequest.HeaderData.RequestId,
								sActionId, sComments))
							.catch(handleError.bind(this, oRequest.HeaderData.RequestId))
							.then(function () {
								this._incrementLoadingDialogProgressionText(sLoadingDialogMode);
							}.bind(this))
						)

					}
				}

				break;

			case parameters.getActionList().Validate:

				bTriggerCall = true;
				sLoadingDialogMode = parameters.getLoadingDialogModeList().ValidateRequests;

				for (i = 0; i < aRequests.length; i++) {
					if (aRequests[i].Filters.IsSelected && (aRequests[i].Actions.VisibleValidate || aRequests[i].Actions.VisibleValidateReceiver)) {
						var oRequest = aRequests[i];
						if (aRequests[i].Actions.VisibleValidate) {
							sValidateActionId = sActionId;
						} else {
							sValidateActionId = parameters.getActionList().ValidateRA;
						}
						aPromises.push(this._asyncCheckRequest.call(this, oRequest.HeaderData.RequestId, sValidateActionId)
							.then(this._asyncApplyRequestDecision.bind(this, this.getIntercoType(), this.getAppType(), oRequest.HeaderData.RequestId,
								sValidateActionId, sComments))
							.catch(handleError.bind(this, oRequest.HeaderData.RequestId))
							.then(function () {
								this._incrementLoadingDialogProgressionText(sLoadingDialogMode);
							}.bind(this))
						)

					}
				}

				break;

			case parameters.getActionList().Generate:

				this._generateRequests();
				break;

			case parameters.getActionList().Reject:

				bTriggerCall = true;
				sLoadingDialogMode = parameters.getLoadingDialogModeList().RejectRequests;

				for (i = 0; i < aRequests.length; i++) {
					if (aRequests[i].Filters.IsSelected && (aRequests[i].Actions.VisibleRejectIssuer || aRequests[i].Actions.VisibleRejectReceiver)) {
						var oRequest = aRequests[i];
						aPromises.push(this._asyncApplyRequestDecision.call(this, this.getIntercoType(), this.getAppType(), oRequest.HeaderData.RequestId,
								sActionId, sComments)
							.catch(handleError.bind(this, oRequest.HeaderData.RequestId))
							.then(function () {
								this._incrementLoadingDialogProgressionText(sLoadingDialogMode);
							}.bind(this))
						)

					}
				}

				break;

			case parameters.getActionList().Delete:

				bTriggerCall = true;
				sLoadingDialogMode = parameters.getLoadingDialogModeList().DeleteRequests;

				for (i = 0; i < aRequests.length; i++) {
					if (aRequests[i].Filters.IsSelected && aRequests[i].Actions.VisibleDelete) {
						var oRequest = aRequests[i];
						aPromises.push(this._asyncApplyRequestDecision.call(this, this.getIntercoType(), this.getAppType(), oRequest.HeaderData.RequestId,
								sActionId, sComments)
							.catch(handleError.bind(this, oRequest.HeaderData.RequestId))
							.then(function () {
								this._incrementLoadingDialogProgressionText(sLoadingDialogMode);
							}.bind(this))
						)

					}
				}

				break;
				// M003 - SRS - Begin of change - 04/07/2022
				// M004 - SRS - Begin of change - 28/09/2022 - Added condition in if
			case parameters.getActionList().Approve:
				busy.setBusyOn();
				bTriggerCall = true;
				sLoadingDialogMode = parameters.getLoadingDialogModeList().ApproveRequests;
				for (i = 0; i < aRequests.length; i++) {
					if (aRequests[i].Actions.VisibleApprove && aRequests[i].Filters.IsSelected) {
						var oRequest = aRequests[i];
						aPromises.push(this._asyncApplyRequestDecision.call(this, this.getIntercoType(), this.getAppType(), oRequest.HeaderData.RequestId,
								sActionId, sComments)
							.catch(handleError.bind(this, oRequest.HeaderData.RequestId))
							.then(function () {
								this._incrementLoadingDialogProgressionText(sLoadingDialogMode);
								busy.setBusyOff();
							}.bind(this))
						)
					}
				}
				break;
				// M003 - SRS - End of change - 04/07/2022
				// M004 - SRS - End of change - 28/09/2022
				// M005 - ABC - Begin of change - 24/01/2023
			case parameters.getActionList().RejectIssuer:
				bTriggerCall = true;
				sLoadingDialogMode = parameters.getLoadingDialogModeList().RejectRequests;

				for (i = 0; i < aRequests.length; i++) {
					if (aRequests[i].Filters.IsSelected && (aRequests[i].Actions.VisibleRejectIssuer || aRequests[i].Actions.VisibleRejectReceiver)) {
						var oRequest = aRequests[i];
						var sActionIdCalc = "";
						if(aRequests[i].Actions.VisibleRejectIssuer && !aRequests[i].Actions.VisibleRejectReceiver) {
							sActionIdCalc = parameters.getActionList().RejectIssuer;
						}
						if(!aRequests[i].Actions.VisibleRejectIssuer && aRequests[i].Actions.VisibleRejectReceiver) {
							sActionIdCalc = parameters.getActionList().RejectReceiver;
						}
						aPromises.push(this._asyncApplyRequestDecision.call(this, this.getIntercoType(), this.getAppType(), oRequest.HeaderData.RequestId,
								sActionIdCalc, sComments)
							.catch(handleError.bind(this, oRequest.HeaderData.RequestId))
							.then(function () {
								this._incrementLoadingDialogProgressionText(sLoadingDialogMode);
							}.bind(this))
						)

					}
				}
				break;
				// M005 - ABC - End of change - 24/01/2023
			default:
				break;
			}

			if (bTriggerCall) {

				this._setLoadingDialogModelTotalValue(aPromises.length);
				this._setLoadingDialogProgressionText(sLoadingDialogMode);
				this._oLoadingDialog.open();

				Promise.all(aPromises)
					.then(function (oData) {
						if (aErrorMessages.length > 0) {
							messageHelper.showRequestsActionsErrors.call(this, aErrorMessages);
						}
					}.bind(this))
					.then(this._asyncGetRequests.bind(this))
					.catch(messageHelper.showODataFailedMessages.bind(this))
					.then(function () {
						this._applyRequestsDisplayMode(this.getView().byId("sbRequestDisplayMode").getSelectedKey());
						this._refreshMassActionsEnabledStatus();
						//		            	this.getView().getModel("RequestList").updateBindings();
						this._oLoadingDialog.close();
						this._oRequestActionPopover.close();
					}.bind(this));

			}

		},

		onPressCancelRequestAction: function (oEvent) {
			this._oRequestActionPopover.close();
		},

		_asyncApplyRequestDecision: function (sIntercoType, sApplicationType, sRequestId, sActionId, sComments) {

			var oUrlParameters = {
				"IntercoType": sIntercoType,
				"ApplicationType": sApplicationType,
				"RequestId": sRequestId,
				"ActionId": sActionId,
				"Comments": sComments
			};

			return odataService.applyRequestDecision.call(this, oUrlParameters);

		},

		_asyncCheckRequest: function (sRequestId, sActionId) {

			var aFilters = [];

			aFilters.push(new Filter("RequestId", FilterOperator.EQ, sRequestId));
			aFilters.push(new Filter("ApplicationType", FilterOperator.EQ, this.getAppType()));
			aFilters.push(new Filter("Filters/IntercoType", FilterOperator.EQ, this.getIntercoType()));

			return odataService.checkRequest.call(this, sActionId, aFilters);
			//                .then(function(oData) {
			//
			//                    var oRequestData = oData.results[0],
			//                        aContent = oRequestData.Messages.results,
			//                        aMessages = [];
			//
			//                    if (aContent.length > 0) {
			//
			//                        // Set JSON Model
			//                        this.setComponentModel(new JSONModel(oRequestData), "Request");
			//
			//                        // Set Messages
			//                        messageHelper.setRequestMessagesModel.call(this, aContent);
			//
			//                        aMessages = aContent.map(function(oMessage) {
			//                            return oMessage.Message;
			//                        })
			//
			//                        throw {
			//                            "title": this.oBundle.getText("messagebox.error.title"),
			//                            "messages": aMessages
			//                        };
			//                    }
			//
			//                    return null;
			//
			//                }.bind(this))

		},

		/**
		 * Trigger request workflow
		 * @param {integer}
		 *                sOption Option chosen for File Generation
		 * @private
		 */
		_generateRequests: function () {

			var oTable = this.getView().byId("tRequests"),
				aItems = oTable.getItems(),
				iCountItems = aItems.length,
				aRequestsId = [],
				oUrlParameters = {},
				sAppType = this.getAppType(),
				sIntercoType = this.getIntercoType(),
				oSelectedRequest = {};

			for (var i = 0; i < iCountItems; i++) {
				if (aItems[i].getCells()[0].getSelected() === true) {
					oSelectedRequest = aItems[i].getBindingContext("RequestList");
					if (oSelectedRequest.getProperty("Actions/VisibleGenerate") === true) {
						aRequestsId.push(oSelectedRequest.getProperty("RequestId"));
					}
				}
			}

			if (aRequestsId.length === 0) {
				messageHelper.showMessageToast(this.oBundle.getText("request.popup.text.generate.none"), null);
			} else {

				// Set busy indicator on table
				this._setBusyRequestTable(true);
				this._oRequestActionPopover.close();

				oUrlParameters = {
					"RequestsIdInline": aRequestsId.join(';'),
					"IntercoType": sIntercoType,
					"ApplicationType": sAppType
				};

				odataService.generateRequests.call(this, oUrlParameters)
					.then(function (oData) {

						if (oData.results.length > 0) {
							// Exports data
							exports.exportPostingFileCSV.call(this, oData.results);
						}

						messageHelper.showMessageToast(this.oBundle.getText("request.generate.multiple.inprogress"), null);

						return "";
					}.bind(this))
					.catch(messageHelper.showODataFailedMessages.bind(this))
					.then(this._asyncGetRequests.bind(this))
					.catch(messageHelper.showODataFailedMessages.bind(this))
					.then(function () {
						this._setBusyRequestTable(false);
					}.bind(this));

			}

		},

		/**
		 * Handles select all requests for Generate 
		 * 
		 * @event
		 * @param {eventObject}
		 *                oEvent the event data
		 * @public
		 */
		onSelectAllRequests: function (oEvent) {

			var oCheckBox = oEvent.getSource(),
				bSelected = oCheckBox.getSelected(),
				oRequestListModel = this.getView().getModel("RequestList"),
				aRequestList = oRequestListModel.getProperty("/results"),
				iCount = aRequestList.length,
				i = 0;

			for (i = 0; i < iCount; i++) {
				aRequestList[i].Filters.IsSelected = bSelected;
			}
			oRequestListModel.updateBindings();

			this._refreshMassActionsEnabledStatus();

		},

		onSelectRequest: function (oEvent) {
			this._refreshMassActionsEnabledStatus();
		},

		_refreshMassActionsEnabledStatus: function () {

			var oRequestListModel = this.getView().getModel("RequestList"),
				aRequestList = oRequestListModel.getProperty("/results"),
				oAppDataModel = this.getComponentModel("AppData"),
				iCount = aRequestList.length,
				i = 0;

			this._disableMassActionsEnabledStatus();

			for (i = 0; i < iCount; i++) {
				if (aRequestList[i].Filters.IsSelected) {
					if (aRequestList[i].Actions.VisibleSubmit) {
						oAppDataModel.setProperty("/overviewActionsEnabled/Submit", true);
					}
					if (aRequestList[i].Actions.VisibleValidate || aRequestList[i].Actions.VisibleValidateReceiver) {
						oAppDataModel.setProperty("/overviewActionsEnabled/Validate", true);
					}
					if (aRequestList[i].Actions.VisibleGenerate) {
						oAppDataModel.setProperty("/overviewActionsEnabled/Generate", true);
					}
					// M004 - SRS - Begin of INS - 29/09/2022
					if (aRequestList[i].Actions.VisibleApprove) {
						oAppDataModel.setProperty("/overviewActionsEnabled/Approve", true);
					}
				    // M004 - SRS - End of INS - 29/09/2022
					if (aRequestList[i].Actions.VisibleRejectIssuer || aRequestList[i].Actions.VisibleRejectReceiver) {
						oAppDataModel.setProperty("/overviewActionsEnabled/Reject", true);
					}
					if (aRequestList[i].Actions.VisibleDelete) {
						oAppDataModel.setProperty("/overviewActionsEnabled/Delete", true);
					}
				}
			}

		},

		_disableMassActionsEnabledStatus: function () {

			var oAppDataModel = this.getComponentModel("AppData");

			oAppDataModel.setProperty("/overviewActionsEnabled/Submit", false);
			oAppDataModel.setProperty("/overviewActionsEnabled/Validate", false);
			oAppDataModel.setProperty("/overviewActionsEnabled/Generate", false);
			oAppDataModel.setProperty("/overviewActionsEnabled/Reject", false);
			oAppDataModel.setProperty("/overviewActionsEnabled/Delete", false);
			// M004 - SRS - Begin of INS - 29/09/2022
			oAppDataModel.setProperty("/overviewActionsEnabled/Approve", false); 
            // M004 - SRS - End of INS - 29/09/2022
		},

		/**
		 * Handles press to show request header data
		 * 
		 * @event
		 * @param {eventObject}
		 *                oEvent the event data
		 * @public
		 */
		onPressShowRequestHeaderData: function (oEvent) {

			var oSource = oEvent.getSource();
			var sPath = oSource.getBindingContext("RequestList").getPath();
			var oReqData = this.getView().getModel("RequestList").getProperty(sPath);

			// create customer popover
			if (!this._oPopover) {
				this._oPopover = sap.ui.xmlfragment("cus.fi.timi.rel.view.fragment.RequestHeaderPopup", this);
				this.getView().addDependent(this._oPopover);
			}

			// Set JSON Model
			this._oPopover.setModel(new JSONModel(oReqData), "RequestHeader");

			this._oPopover.openBy(oSource);

		},

		/**
		 * Handles press event to show request workflow history
		 * 
		 * @event
		 * @param {eventObject}
		 *                oEvent the event data
		 * @public
		 */
		onPressShowRequestHistory: function (oEvent) {

			var oSource = oEvent.getSource();
			var sPath = oSource.getBindingContext("RequestList").getPath();
			var oReqData = this.getView().getModel("RequestList").getProperty(sPath);

			// Create popover
			if (!this._oWorkflowHistoryPopover) {
				this._oWorkflowHistory = sap.ui.xmlfragment("cus.fi.timi.rel.view.fragment.RequestWorkflowHistoryResponsivePopup", this);
				this.getView().addDependent(this._oWorkflowHistory);
				// Add Style
				this._oWorkflowHistory.addStyleClass("timi");
			}

			// Set JSON Model
			this._oWorkflowHistory.setModel(new JSONModel(oReqData), "Request");

			this._oWorkflowHistory.openBy(oSource);
		},

		/**
		 * Handles press to navigate to request details
		 * 
		 * @event
		 * @param {eventObject}
		 *                oEvent the event data
		 * @public
		 */
		onPressNavigateToRequestDetails: function (oEvent) {

			var oSource = oEvent.getSource(),
				sPath, oRequestData = {};

			sPath = oSource.getBindingContext("RequestList").getPath();
			oRequestData = this.getView().getModel("RequestList").getProperty(sPath);

			this.oRouter.navTo("request", {
				"requestId": oRequestData.RequestId
			});

		},

		/**
		 * Handles press on search button
		 * 
		 * @event
		 * @param {eventObject}
		 *                oEvent the event data
		 * @public
		 */
		onPressSearchRequest: function (oEvent) {
			// Get Requests List
			this._getRequests();
		},

		/**
		 * Handles press to refresh Requests List
		 * 
		 * @event
		 * @param {eventObject}
		 *                oEvent the event data
		 * @public
		 */
		onPressRefreshResquestsList: function (oEvent) {
			// Get Requests List
			this._getRequests();
		},

		/**
		 * Handles press to show/hide search criteria
		 * 
		 * @event
		 * @param {eventObject}
		 *                oEvent the event data
		 * @public
		 */
		onPressToogleSearchCriteriaVisibility: function (oEvent) {

			var oBtn = oEvent.getSource();
			var sDisplayStateValue = oBtn.data("displayStateValue");
			var oFormSearchCriteria = this.getView().byId("formSearchCriteria");
			var oFormSearchButton = this.getView().byId("formSearchButton");
			var oBtnSearchCriteriaVisibility = this.getView().byId("btnSearchCriteriaVisibility");

			switch (sDisplayStateValue) {
			case "show":
				// hide the table
				oBtn.setIcon("sap-icon://navigation-down-arrow");
				oBtn.data("displayStateValue", "hide");
				oBtnSearchCriteriaVisibility.setTooltip(this.oBundle.getText("searchcriteria.button.tooltip.show"));
				oFormSearchCriteria.setVisible(false);
				oFormSearchButton.setVisible(false);
				break;
			case "hide":
			default:
				// show the table
				oBtn.setIcon("sap-icon://navigation-up-arrow");
				oBtn.data("displayStateValue", "show");
				oBtnSearchCriteriaVisibility.setTooltip(this.oBundle.getText("searchcriteria.button.tooltip.hide"));
				oFormSearchCriteria.setVisible(true);
				oFormSearchButton.setVisible(true);
				break;
			}

		},

		/**
		 * Handles press navigate to substitution app
		 * 
		 * @event
		 * @param {eventObject}
		 *                oEvent the event data
		 * @public
		 */
		onPressNavigateToSubstitutionApp: function (oEvent) {

			var sSubstitutionUrl = businessRules.getSubstitutionAppUrl.call(this);

			if (sSubstitutionUrl) {
				window.open(sSubstitutionUrl, "_blank");
			}

		},

		onSelectDisplayMode: function (oEvent) {

			var sSelectedKey = oEvent.getParameter("key");

			this._applyRequestsDisplayMode(sSelectedKey);

		},

		_applyRequestsDisplayMode: function (sSelectedKey) {

			var aSorters = [],
				oTable = this.getView().byId("tRequests"),
				oBindingItems = oTable.getBinding("items");

			switch (sSelectedKey) {
			case parameters.getRequestDisplayModeList().Group:
				aSorters.push(new Sorter("HeaderData/UploadId", true, function (oContext) {
					var id = oContext.getProperty("HeaderData/UploadId"),
						name = oContext.getProperty("HeaderData/UploadData/UploadFilename") + " - " + formatterFormat.formatTimestamp(oContext.getProperty(
							"HeaderData/UploadData/TimestampCreation"));
					if (id == "") {
						name = this.oBundle.getText("text.creationmode.manual");
					}
					return {
						key: id,
						text: name
					};
				}.bind(this)));
			case parameters.getRequestDisplayModeList().List:
			default:
				aSorters.push(new Sorter("HeaderData/TimestampCreation", true));
			}

			oBindingItems.sort(aSorters);

		},

		factoryRequestGroupHeader: function (oEvent) {
			return new GroupHeaderListItem({
					title: oEvent.text,
					type: "Active",
					
					press: function (oEvent) {
						var oSource = oEvent.getSource(),
							oModel = this.getView().getModel("RequestList"),
							oUploadId = oSource.data("UploadId"),
							bIsGroupHeaderSelected = oSource.data("IsSelected"),
							bToSelect = false,
							sToSelectHeader = "",
							oCustomDataIsSelected = {};

						if (bIsGroupHeaderSelected) {
							bToSelect = false;
							sToSelectHeader = "";
						} else {
							bToSelect = true;
							sToSelectHeader = "X";
						}

						oSource.data("IsSelected", bToSelect);
						oSource.data("IsSelectedHeader", sToSelectHeader, true /* WriteToDom */ );

						oModel.getData().results.forEach(function (oItem) {
							if (oItem.HeaderData.UploadId === oUploadId) {
								oItem.Filters.IsSelected = bToSelect;
							}
						})

						oModel.updateBindings();
						this._refreshMassActionsEnabledStatus();
					}.bind(this)
				})
				.data("UploadId", oEvent.key)
				.data("IsSelected", false)
				.data("IsSelectedHeader", "", true /* WriteToDom */ )
				.addStyleClass("groupHeaderListItem");

		},

		_setBusyRequestTable: function (bOn) {
			this._setBusy("tRequests", bOn);
		},

		_setBusy: function (sControlId, bOn) {
			if (this.getView().byId(sControlId)) {
				this.getView().byId(sControlId).setBusy(bOn);
			}
		},

		/**
		 * Set view styles & css classes
		 * 
		 * @private
		 */
		_setStyle: function () {

			// Set view compact/cosy class
			this.getView().byId("tRequests").addStyleClass(this.getContentDensityClass());

		},

		onPressUploadFileCreationDialog: function () {

			// create delete request responsive popover
			if (!this._oDialogUploadFileCreation) {
				this._oDialogUploadFileCreation = sap.ui.xmlfragment(this.createId("frgtUploadFileCreationDialog"),
					"cus.fi.timi.rel.view.fragment.RequestUploadFileCreationDialog", this);
				this.getView().addDependent(this._oDialogUploadFileCreation);

				attachments.getUploadUrl.apply(this)
					.then(function (sUploadUrl) {
						this.byId(sap.ui.core.Fragment.createId("frgtUploadFileCreationDialog", "ucFileUploadAttachments")).setUploadUrl(sUploadUrl);
						this.byId(sap.ui.core.Fragment.createId("frgtUploadFileCreationDialog", "fuFileUploadRequests")).setUploadUrl(sUploadUrl);
					}.bind(this));

			}

			this._oDialogUploadFileCreation.setModel(this.getView().getModel("MajorTypeCollection"), "MajorTypeCollection");
			this._oDialogUploadFileCreation.setModel(new JSONModel({
				"results": []
			}), "UploadFileCreationAttachments");
			this._oDialogUploadFileCreation.setModel(new JSONModel({
				"NbTotalRequests": 0,
				"RequestsAreValid": true
			}), "UploadFileCreationData");

			this._oDialogUploadFileCreation.open();

		},

		onPressToogleUploadFileCreationAttachmentsVisibility: function (oEvent) {

			var oButton = oEvent.getSource(),
				oUC = this.byId(sap.ui.core.Fragment.createId("frgtUploadFileCreationDialog", "ucFileUploadAttachments")),
				sDisplayStateValue = oButton.data("displayStateValue");

			switch (sDisplayStateValue) {
			case "show":
				// hide the table
				oButton.setIcon("sap-icon://navigation-down-arrow");
				oButton.data("displayStateValue", "hide");
				oButton.setTooltip(this.oBundle.getText("text.attachment.show"));
				oUC.addStyleClass("hideUploadFileAttachments");
				break;
			case "hide":
			default:
				// show the table
				oButton.setIcon("sap-icon://navigation-up-arrow");
				oButton.data("displayStateValue", "show");
				oButton.setTooltip(this.oBundle.getText("text.attachment.hide"));
				oUC.removeStyleClass("hideUploadFileAttachments");
				break;
			}

		},

		onSelectUploadingRequest: function (oEvent) {

			var oSelectedItem = oEvent.getParameter("listItem").getBindingContext("UploadFileReportRequests").getObject(),
				oListUploadMessages = this.byId(sap.ui.core.Fragment.createId("frgtUploadFileCreationDialog", "listUploadFileCreationMessages")),
				aMessages = oSelectedItem && oSelectedItem.Messages ? oSelectedItem.Messages : [];

			if (aMessages.results.length > 0) {
				oListUploadMessages.setVisible(true);
				this._oDialogUploadFileCreation.setModel(new JSONModel(aMessages), "UploadFileCreationMessages");
			} else {
				oListUploadMessages.setVisible(false);
			}

		},

		onPressCreateRequestConfirmation: function (oEvent) {

			var aRequests = this._oDialogUploadFileCreation.getModel("UploadFileReportRequests").getProperty("/results"),
				aAttachments = this._oDialogUploadFileCreation.getModel("UploadFileCreationAttachments").getProperty("/results"),
				oReportModel = this._oDialogUploadFileCreation.getModel("UploadFileReport"),
				aPromises = [];

			// create delete request responsive popover
			if (!this._oLoadingDialog) {
				this._oLoadingDialog = sap.ui.xmlfragment(this.createId("frgtLoadingDialog"), "cus.fi.timi.rel.view.fragment.LoadingDialog", this);
				this.getView().addDependent(this._oLoadingDialog);
			}

			for (var i = 0; i < aRequests.length; i++) {
				var oRequest = aRequests[i];
				aPromises.push(this._asyncCreateUploadRequest.call(this, aRequests[i], aAttachments)
					.then(function (oData) {
						this._incrementLoadingDialogProgressionText(parameters.getLoadingDialogModeList().CreateRequests);
						return oData;
					}.bind(this)))
			}

			this._initiateLoadingDialogModel();
			this._setLoadingDialogModelTotalValue(aRequests.length);
			this._setLoadingDialogProgressionText(parameters.getLoadingDialogModeList().CreateRequests);
			this._oLoadingDialog.open();

			Promise.all(aPromises)
				.then(function (oData) {

					if (this.getAppDataModel().getProperty("/appType") === parameters.getAppTypeList().Issuer 
						&& this.getAppDataModel().getProperty("/intercoType") === parameters.getIntercoTypeList().R3P) {
						return "";
					}

					return odataService.applyUploadedFileDecision.call(this, oReportModel.getProperty("/UploadId"), parameters.getActionList().Submit);
				}.bind(this))
				.then(function (oData) {
					this.getOwnerComponent().getEventBus().publish("cus.fi.timi.rel", "refreshOverviewRequestList", {
						"UploadId": oReportModel.getProperty("/UploadId")
					});
					this._clearUploadFileCreationDialogData();
					this._oDialogUploadFileCreation.close();
				}.bind(this))
				.catch(messageHelper.showODataFailedMessages.bind(this))
				.then(function () {
					this._oLoadingDialog.close();
				}.bind(this));

		},

		onPressCreateRequestCancellation: function () {

			var oReportModel = this._oDialogUploadFileCreation.getModel("UploadFileReport");

			if (oReportModel && oReportModel.getProperty("/UploadId") !== "") {
				odataService.applyUploadedFileDecision.call(this, oReportModel.getProperty("/UploadId"), parameters.getActionList().Delete)
					.catch(messageHelper.showODataFailedMessages.bind(this))
					.then(function () {
						this._clearUploadFileCreationDialogData();
						this._oDialogUploadFileCreation.close();
					}.bind(this))
			} else {
				this._clearUploadFileCreationDialogData();
				this._oDialogUploadFileCreation.close();
			}

		},

		onChangeUploadFile: function (oEvent) {

			var oUploadCollection = oEvent.getSource(),
				sFileName;

			this.oDataModel.refreshSecurityToken();
			oUploadCollection.destroyHeaderParameters();

			// CSRF-Token
			attachments.getCustomerHeaderTokenParameter.call(this, parameters.getUploadControlTypeList().UploadCollection, function (
				oCustomerHeaderParameter) {
				oUploadCollection.addHeaderParameter(oCustomerHeaderParameter);
			});

			// Filename
			sFileName = oEvent.getParameter("files")[0].name;
			attachments.getSlugParameter.call(this, parameters.getUploadControlTypeList().UploadCollection, sFileName, function (oSlugParameter) {
				oUploadCollection.addHeaderParameter(oSlugParameter);
			});

		},

		onUploadComplete: function (oEvent) {

			var oUCAttachments = oEvent.getSource(),
				oUploadFileCreationAttachmentsModel = this._oDialogUploadFileCreation.getModel("UploadFileCreationAttachments");

			attachments.onUploadComplete.call(this, parameters.getUploadControlTypeList().UploadCollection, oEvent)
				.then(function (oAttachment) {

					oAttachment.Mode = parameters.getAttachmentModeList().Add;
					oUploadFileCreationAttachmentsModel.getProperty("/results").unshift(oAttachment);
					oUCAttachments.destroyItems();
					oUploadFileCreationAttachmentsModel.updateBindings(true);

				}.bind(this))
				.catch(messageHelper.showMessageToast);

		},

		onFileDeleted: function (oEvent) {

			var oUploadFileCreationAttachmentsModel = this._oDialogUploadFileCreation.getModel("UploadFileCreationAttachments"),
				aAttachments = [],
				iCount = 0,
				i = 0,
				oAttachmentItem = {};

			attachments.onFileDeleted.call(this, parameters.getUploadControlTypeList().UploadCollection, oEvent)
				.then(function (sDocumentId) {

					aAttachments = oUploadFileCreationAttachmentsModel.getProperty("/results");
					iCount = aAttachments.length;

					for (i = 0; i < iCount; i++) {
						if (aAttachments[i].FolderId === sDocumentId) {
							oAttachmentItem = aAttachments[i];
							aAttachments.splice(i, 1);
							break;
						}
					}

					oUploadFileCreationAttachmentsModel.updateBindings(true);

				}.bind(this))
				.catch(messageHelper.showMessageToast);

		},

		onTypeMissmatchUploadTXTFile: function (oEvent) {
			messageHelper.showMessageToast(this.oBundle.getText("text.upload.typemissmatch.txtfile", oEvent.getParameter("fileName")));
		},

		onChangeUploadTXTFile: function (oEvent) {

			var oFileUploader = oEvent.getSource(),
				sFileName;

			this._setUploadFileCreationDialogRequestsValidStatus(true);
			this._setUploadFileCreationDialogRequestsTotalNumber(0);

			// create delete request responsive popover
			if (!this._oLoadingDialog) {
				this._oLoadingDialog = sap.ui.xmlfragment(this.createId("frgtLoadingDialog"), "cus.fi.timi.rel.view.fragment.LoadingDialog", this);
				this.getView().addDependent(this._oLoadingDialog);
			}

			this._setLoadingDialogText(this.oBundle.getText("text.loading.fileuploading"));
			this._oLoadingDialog.open();

			this.oDataModel.refreshSecurityToken();
			oFileUploader.destroyHeaderParameters();

			// CSRF-Token
			attachments.getCustomerHeaderTokenParameter.call(this, parameters.getUploadControlTypeList().FileUploader, function (
				oCustomerHeaderParameter) {
				oFileUploader.addHeaderParameter(oCustomerHeaderParameter);
			});

			// Filename
			sFileName = oEvent.getParameter("files")[0].name;
			attachments.getSlugParameter.call(this, parameters.getUploadControlTypeList().FileUploader, sFileName, function (oSlugParameter) {
				oFileUploader.addHeaderParameter(oSlugParameter);
			});

		},

		onUploadCompleteUploadTXTFile: function (oEvent) {

			var oCBUploadFileCreationMajorType = this.byId(sap.ui.core.Fragment.createId("frgtUploadFileCreationDialog",
					"cbUploadFileCreationMajorType")),
				oTableUploadFileCreationResults = this.byId(sap.ui.core.Fragment.createId("frgtUploadFileCreationDialog",
					"tUploadFileCreationResults")),
				oLabelUploadFileCreationResults = this.byId(sap.ui.core.Fragment.createId("frgtUploadFileCreationDialog",
					"lblUploadFileCreationResults")),
				oListUploadFileCreationMessages = this.byId(sap.ui.core.Fragment.createId("frgtUploadFileCreationDialog",
					"listUploadFileCreationMessages"));

			attachments.onUploadComplete.call(this, parameters.getUploadControlTypeList().FileUploader, oEvent)
				.then(function (oAttachment) {
					this._setLoadingDialogText(this.oBundle.getText("text.loading.fileprocessing"));
					return odataService.checkUploadedFileData.call(this, oCBUploadFileCreationMajorType.getSelectedKey(), oAttachment.FolderId);
				}.bind(this))
				.then(function (oData) {
					var oReport = oData.results[0],
						aRequests = oReport.Requests.results,
						aReportMessages = oReport.Messages.results,
						aPromises = [];

					this._initiateLoadingDialogModel();
					this._setLoadingDialogModelTotalValue(aRequests.length);
					this._setLoadingDialogProgressionText(parameters.getLoadingDialogModeList().UploadRequests);

					this._oDialogUploadFileCreation.setModel(new JSONModel(oReport), "UploadFileReport");
					oLabelUploadFileCreationResults.setVisible(true);
					if (aReportMessages.length > 0) {
						this._oDialogUploadFileCreation.setModel(new JSONModel(oReport.Messages), "UploadFileCreationMessages");
						oListUploadFileCreationMessages.setVisible(true);
					} else {
						this._oDialogUploadFileCreation.setModel(new JSONModel({}), "UploadFileCreationMessages");
						oListUploadFileCreationMessages.setVisible(false);
					}
					if (aRequests.length > 0) {
						this._setUploadFileCreationDialogRequestsTotalNumber(aRequests.length);
						for (var i = 0; i < aRequests.length; i++) {
							aPromises.push(this._asyncCheckUploadRequest.call(this, aRequests[i])
								.then(function (oData) {
									this._incrementLoadingDialogProgressionText(parameters.getLoadingDialogModeList().UploadRequests);
									if (oData.CheckStatus === parameters.getMessageStateList().Error) {
										this._setUploadFileCreationDialogRequestsValidStatus(false);
									}
									return oData;
								}.bind(this)));
						}
						return Promise.all(aPromises);
					} else {
						oTableUploadFileCreationResults.setVisible(false);
						this._setUploadFileCreationDialogRequestsValidStatus(false);
					}

					return null;

				}.bind(this))
				.then(function (oData) {
					if (oData !== null) {
						this._oDialogUploadFileCreation.setModel(new JSONModel({
							"results": oData
						}), "UploadFileReportRequests");
						oTableUploadFileCreationResults.setVisible(true);
					}
				}.bind(this))
				.catch(function (oData) {
					this._setUploadFileCreationDialogRequestsValidStatus(false);
					messageHelper.showODataFailedMessages.call(this, oData);
				}.bind(this))
				.then(function () {
					this._oLoadingDialog.close();
				}.bind(this));

		},

		_asyncCheckUploadRequest: function (oRequestData) {

			var oRequestToCheck = jQuery.extend(true, {}, oRequestData),
				aIssuingItems = oRequestData.IssuingItems.results,
				aReceivingItems = oRequestData.ReceivingItems.results,
				aMessages = oRequestData.Messages.results;

			oRequestToCheck.ApplicationType = this.getAppType();
			oRequestToCheck.HeaderData.IntercoTypeCode = this.getIntercoType();
			oRequestToCheck.IssuingItems = aIssuingItems;
			oRequestToCheck.ReceivingItems = aReceivingItems;
			oRequestToCheck.Messages = aMessages;

			return odataService.checkUploadRequest.call(this, oRequestToCheck);

		},

		_asyncCreateUploadRequest: function (oRequestData, aAttachments) {

			var oRequestToCreate = jQuery.extend(true, {}, oRequestData),
				aIssuingItems = oRequestData.IssuingItems.results,
				aReceivingItems = oRequestData.ReceivingItems.results;

			oRequestToCreate.ApplicationType = this.getAppType();
			oRequestToCreate.HeaderData.IntercoTypeCode = this.getIntercoType();
			oRequestToCreate.IssuingItems = aIssuingItems;
			oRequestToCreate.ReceivingItems = aReceivingItems;
			oRequestToCreate.Attachments = aAttachments.map(function (oAttachment) {
				oAttachment.FileSize = oAttachment.FileSize.toString();
				return oAttachment;
			});
			oRequestToCreate.Messages = [];

			return odataService.createDeepRequest.call(this, oRequestToCreate);
		},

		_clearUploadFileCreationDialogData: function () {
			var oCBUploadFileCreationMajorType = this.byId(sap.ui.core.Fragment.createId("frgtUploadFileCreationDialog",
					"cbUploadFileCreationMajorType")),
				oTableUploadFileCreationResults = this.byId(sap.ui.core.Fragment.createId("frgtUploadFileCreationDialog",
					"tUploadFileCreationResults")),
				oLabelUploadFileCreationResults = this.byId(sap.ui.core.Fragment.createId("frgtUploadFileCreationDialog",
					"lblUploadFileCreationResults")),
				oListUploadFileCreationMessages = this.byId(sap.ui.core.Fragment.createId("frgtUploadFileCreationDialog",
					"listUploadFileCreationMessages"));

			oTableUploadFileCreationResults.setVisible(false);
			oListUploadFileCreationMessages.setVisible(false);
			oLabelUploadFileCreationResults.setVisible(false);
			this._oDialogUploadFileCreation.setModel(new JSONModel({}), "UploadFileReport");
			this._oDialogUploadFileCreation.setModel(new JSONModel({}), "UploadRequestLoadingStats");
			this._oDialogUploadFileCreation.setModel(new JSONModel({}), "UploadFileReportRequests");
			this._oDialogUploadFileCreation.setModel(new JSONModel({}), "UploadFileCreationMessages");
			this._oDialogUploadFileCreation.setModel(new JSONModel({}), "UploadFileCreationAttachments");

		},

		/**
		 * on press on template download
		 * @event
		 * @param {eventObject} oEvent the event data
		 * @public
		 */
		onPressDownloadTemplate: function (oEvent) {

			var oRequestModel = this.getView().getModel("RequestList"),
				aRequests = oRequestModel.getProperty("/results"),
				sEntityPath = "",
				aSelectionFields = [],
				aFilters = [],
				i = 0;

			for (i = 0; i < aRequests.length; i++) {
				if (aRequests[i].Filters.IsSelected) {
					aFilters.push(new Filter("RequestId", FilterOperator.EQ, aRequests[i].RequestId));
				}
			}

			switch (this.getIntercoType()) {
			case parameters.getIntercoTypeList().R3P:

				sEntityPath = "/TIMI_R3P_Template";
				aSelectionFields = [
					"DOCUMENT_TYPE",
					"IS_LEGAL_ENTITY",
					"RC_LEGAL_ENTITY",
					"CURRENCY",
					"HEADER_TEXT",
					"CUSTOMER_SGL_INDICATOR",
					"VENDOR_SGL_INDICATOR",
					"VENDOR_WITHHOLDING_TAXTYPE",
					"VENDOR_WITHHOLDING_TAXCODE",
					"ITEM_TYPE",
					"ITEM_TEXT",
					"DEBIT_CREDIT_INDICATOR",
					"AMOUNT",
					"TAX_CODE",
					"CUSTOMER",
					"VENDOR",
					"COSTCENTER",
					"WBS_EXT",
					"PROFIT_CENTER",
					"GMID",
					"RC_CONTROLLER",
					"GLACCOUNT",
					"INTERNAL_ORDER",
					"MARKUP",
					"BUSINESSAREA"
				];
				break;

			default:
				break;
			}

			busy.setBusyOn();
			var sUrl = odataService.getUploadTemplateData.call(this, aFilters, sEntityPath, aSelectionFields);
			sap.m.URLHelper.redirect(sUrl, true);
			busy.setBusyOff();

		},

		_setLoadingDialogText: function (sText) {
			this.byId(sap.ui.core.Fragment.createId("frgtLoadingDialog", "textLoading")).setText(sText);
		},

		_initiateLoadingDialogModel: function () {
			this._oLoadingDialog.setModel(new JSONModel({
				"NbProcessed": 0,
				"NbTotal": 0
			}), "LoadingDialogProgressionStats");
		},

		_setLoadingDialogModelTotalValue: function (iValue) {
			this._oLoadingDialog.getModel("LoadingDialogProgressionStats").setProperty("/NbTotal", iValue);
		},

		_setLoadingDialogProgressionText: function (sMode) {

			var oModel = this._oLoadingDialog.getModel("LoadingDialogProgressionStats"),
				iNbProcessed = oModel.getProperty("/NbProcessed"),
				iNbTotal = oModel.getProperty("/NbTotal");

			switch (sMode) {
			case parameters.getLoadingDialogModeList().UploadRequests:
				this._setLoadingDialogText(this.oBundle.getText("text.loading.requestuploadprocessing", [iNbProcessed, iNbTotal]));
				break;
			case parameters.getLoadingDialogModeList().CreateRequests:
				this._setLoadingDialogText(this.oBundle.getText("text.loading.requestcreationprocessing", [iNbProcessed, iNbTotal]));
				break;
			case parameters.getLoadingDialogModeList().SubmitRequests:
				this._setLoadingDialogText(this.oBundle.getText("text.loading.submittingrequests", [iNbProcessed, iNbTotal]));
				break;
			case parameters.getLoadingDialogModeList().ValidateRequests:
				this._setLoadingDialogText(this.oBundle.getText("text.loading.validatingrequests", [iNbProcessed, iNbTotal]));
				break;
			case parameters.getLoadingDialogModeList().GenerateRequests:
				this._setLoadingDialogText(this.oBundle.getText("text.loading.generatingrequests", [iNbProcessed, iNbTotal]));
				break;
			case parameters.getLoadingDialogModeList().RejectRequests:
				this._setLoadingDialogText(this.oBundle.getText("text.loading.rejectingrequests", [iNbProcessed, iNbTotal]));
				break;
			case parameters.getLoadingDialogModeList().DeleteRequests:
				this._setLoadingDialogText(this.oBundle.getText("text.loading.deletingrequests", [iNbProcessed, iNbTotal]));
				break;
			default:
				break;
			}

		},

		_incrementLoadingDialogProgressionText: function (sMode) {

			var oModel = this._oLoadingDialog.getModel("LoadingDialogProgressionStats"),
				iNbCurrentProcessed = oModel.getProperty("/NbProcessed"),
				iNbProcessed = iNbCurrentProcessed + 1,
				iNbTotal = oModel.getProperty("/NbTotal");

			oModel.setProperty("/NbProcessed", iNbProcessed);
			this._setLoadingDialogProgressionText(sMode);

		},

		_setUploadFileCreationDialogRequestsValidStatus: function (bStatus) {
			var oModel = this._oDialogUploadFileCreation.getModel("UploadFileCreationData");
			oModel.setProperty("/RequestsAreValid", bStatus);
		},

		_setUploadFileCreationDialogRequestsTotalNumber: function (iTotal) {
			var oModel = this._oDialogUploadFileCreation.getModel("UploadFileCreationData");
			oModel.setProperty("/NbTotalRequests", iTotal);
		},

		checkUploadFileCreationCondition: function (aAttachments, bRequestsAreValid) {
			if (aAttachments && aAttachments.length > 0 && bRequestsAreValid) {
				return true;
			}
			return false;
		},

		_setUploadId: function (sUploadId) {
			this.sUploadId = sUploadId;
		},

		_getUploadId: function () {
			return this.sUploadId;
		},

		_clearUploadId: function () {
			this.sUploadId = "";
		},

	});
}, true);