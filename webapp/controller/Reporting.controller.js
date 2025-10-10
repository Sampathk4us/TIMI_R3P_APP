/************************************************************************
 * Project            : TIMI                                 			*
 * Process            : FI                                              *
 * Task code          : FI084                                           *
 * Functional document:                                					*
 * Technical document :                                    				*
 *----------------------------------------------------------------------*
 * File       	 : controller/Reporting.controller.js   	        	*
 * Author        : David TEA                                            *
 * Company       : Resp                                               	*
 * Creation Date : 26/01/2017                                           *
 *----------------------------------------------------------------------*
 * Description   : Reporting view controller   							*		
 *                                                                      *
 ************************************************************************
 * Modification nï¿½ ........... : 										*
 * Project ................... : 										*
 * Author .................... :                                        *
 *----------------------------------------------------------------------*
 * Modification date ......... : 										*
 * Transport order ........... : 										*
 * Change Request ............ : 										*
 * Description ............... : 										*
 ************************************************************************/
/**
 * @fileOverview Reporting view controller
 * @author David Tea 
 * @version 0.1
 */
sap.ui.define([
    "cus/fi/timi/rel/controller/BaseController",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "cus/fi/timi/rel/model/businessRules",
    "cus/fi/timi/rel/model/charts",
    "cus/fi/timi/rel/model/exports",
    "cus/fi/timi/rel/model/formatterFormat",
    "cus/fi/timi/rel/model/formatterState",
    "cus/fi/timi/rel/model/formatterText",
    "cus/fi/timi/rel/model/formatterVisibility",
    "cus/fi/timi/rel/model/messageHelper",
    "cus/fi/timi/rel/model/odataService",
    "cus/fi/timi/rel/model/parameters",
    "cus/fi/timi/rel/model/tpcHelper",
    "cus/fi/timi/rel/assets/js/helpers/utilities",
    "cus/fi/timi/rel/assets/js/helpers/busy"
], function(BaseController, Device, JSONModel, Filter, FilterOperator, MessageToast, businessRules, charts, exports, formatterFormat, formatterState, formatterText, formatterVisibility, messageHelper, odataService, parameters, tpcHelper, utilities, busy) {
    "use strict";

    return BaseController.extend("cus.fi.timi.rel.controller.Reporting", {

        businessRules: businessRules,
        formatterFormat: formatterFormat,
        formatterState: formatterState,
        formatterText: formatterText,
        formatterVisibility: formatterVisibility,

        /**
         * Called when a controller is instantiated and its View controls (if
         * available) are already created. Can be used to modify the View before
         * it is displayed, to bind event handlers and do other one-time
         * initialization.
         * 
         * @memberOf view.Overview
         */
        onInit: function() {

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
            this.oDataModel = this.getComponentModel("YWS_FI062_TIMI");

            /**
             * Component defined localization resource model
             * 
             * @type {sap.ui.model.resource.ResourceModel}
             */
            this.oBundle = this.getResourceBundle();

            /**
             * Initiate column management on tables (header and items)
             */
            this._initiateTablePersonalization();

            /**
             * Call _setStyle method
             */
            this._setStyle();

            /**
             * Attach on route navigation event match
             */
            this.oRouter.getRoute("reporting").attachMatched(this._onRouteMatched, this);

        },

        /**
         * Handles route matched function
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        _onRouteMatched: function(oEvent) {

            var sReportingType = this.getComponentModel("AppData").getProperty("/reportingType");
            this._getReportingData(sReportingType);

        },

        /**
         * Build reporting filters for search
         * @private
         * @returns {array} the array of filters
         */
        _buildReportingFilters: function() {

            var aFilters = [],
                i = 0;
            var sDateFrom = this.getView().byId("dpReportingCriteriaDateFrom").getValue(),
                oDateFrom = {};
            var sDateTo = this.getView().byId("dpReportingCriteriaDateTo").getValue(),
                oDateTo = {};
            var aStatus = this.getView().byId("mcbReportingCriteriaStatus").getSelectedItems();
            var sCountry = this.getView().byId("CbReportingCriteriaCountry").getSelectedKey();
            var aIssuingCompany = this.getView().byId("mcbReportingCriteriaIssuingCompany").getSelectedItems();
            var aReceivingCompany = this.getView().byId("mcbReportingCriteriaReceivingCompany").getSelectedItems();
            var aIntercoType = this.getView().byId("mcbReportingCriteriaIntercoType").getSelectedItems();
            var aCreationMode = this.getView().byId("mcbReportingCriteriaCreationMode").getSelectedItems();
            var aMajorType = this.getView().byId("mcbReportingCriteriaMajorType").getSelectedItems();            
            var aIssuingCompanyLength = aIssuingCompany.length,
                aReceivingCompanyLength = aReceivingCompany.length,
                aStatusLength = aStatus.length,
                aIntercoTypeLength = aIntercoType.length,
                aCreationModeLength = aCreationMode.length,
                aMajorTypeLength = aMajorType.length;
            var sRequestId = this.getView().byId("iReportingCriteriaRequest").getValue();

            if (aStatusLength > 0) {
                for (i = 0; i < aStatusLength; i++) {
                    aFilters.push(new Filter("StatusId", FilterOperator.EQ, aStatus[i].getBindingContext("StatusCollection").getProperty("StatusCode")));
                }
            }
            
            if (sRequestId !== "") {
				aFilters.push(new Filter("RequestId", FilterOperator.EQ, sRequestId));
			}

            if (sDateFrom !== "" && sDateTo !== "") {
                oDateFrom = formatterFormat.formatSAPDate(sDateFrom);
                //oDateFrom = new Date(oDateFrom.setHours(oDateFrom.getHours() + 0));
                oDateTo = formatterFormat.formatSAPDate(sDateTo);
                //oDateTo = new Date(oDateTo.setHours(oDateTo.getHours() + 0));
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

            if (sCountry != ""){
            	aFilters.push(new Filter("IsCountry", FilterOperator.EQ, sCountry, ''));
            	aFilters.push(new Filter("RcCountry", FilterOperator.EQ, sCountry, ''));            	
            } 
            
            if (aIssuingCompanyLength > 0) {
                for (i = 0; i < aIssuingCompanyLength; i++) {
                    aFilters.push(new Filter("IsCompanyCode", FilterOperator.EQ, aIssuingCompany[i].getBindingContext("CompanyCollection").getProperty("CompanyCode")));
                }
            }

            if (aReceivingCompanyLength > 0) {
                for (i = 0; i < aReceivingCompanyLength; i++) {
                    aFilters.push(new Filter("RcCompanyCode", FilterOperator.EQ, aReceivingCompany[i].getBindingContext("CompanyCollection").getProperty("CompanyCode")));
                }
            }

            if (aIntercoTypeLength > 0) {
                for (i = 0; i < aIntercoTypeLength; i++) {
                    aFilters.push(new Filter("IntercoTypeCode", FilterOperator.EQ, aIntercoType[i].getBindingContext("IntercoTypeCollection").getProperty("IntercoTypeCode")));
                }
            }

            if (aCreationModeLength > 0) {
                for (i = 0; i < aCreationModeLength; i++) {
                    aFilters.push(new Filter("CreationMode", FilterOperator.EQ, aCreationMode[i].getProperty("key")));
                }
            }

            if (aMajorTypeLength > 0) {
                for (i = 0; i < aMajorTypeLength; i++) {
                    aFilters.push(new Filter("MajorTypeCode", FilterOperator.EQ, aMajorType[i].getBindingContext("MajorTypeCollection").getProperty("MajorTypeCode")));
                }
            }
            
            return aFilters;

        },

        /**
         * Handles press on reporting type switching
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onPressOnReportingType: function(oEvent) {

            var oSegmentedButton = oEvent.getSource();
            var sSelectedKey = oSegmentedButton.getKey();

            this.getComponentModel("AppData").setProperty("/reportingType", sSelectedKey);

            this._getReportingData(sSelectedKey);

            this.getView().byId("vfRequestsbyStatus").rerender();
        },

        /**
         * Handles press on search on reporting data
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onPressSearchReportingData: function(oEvent) {

            var sReportingType = this.getComponentModel("AppData").getProperty("/reportingType");

            this._getReportingData(sReportingType);
        },

        /**
         * Handles press on clear on reporting data
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onPressClearReportingData: function(oEvent) {

            var sRetentionDays = this.getComponentModel("AppData").getProperty("/REP_RETENTION_DAYS") ? this.getComponentModel("AppData").getProperty("/REP_RETENTION_DAYS") : 0;

            this.getView().byId("dpReportingCriteriaDateFrom").setDateValue(businessRules.getReportingDateFromInitialValue(sRetentionDays));
            this.getView().byId("dpReportingCriteriaDateTo").setDateValue(businessRules.getReportingDateToInitialValue(sRetentionDays));
            this.getView().byId("mcbReportingCriteriaStatus").clearSelection();
            this.getView().byId("mcbReportingCriteriaIssuingCompany").clearSelection();
            this.getView().byId("mcbReportingCriteriaReceivingCompany").clearSelection();
            this.getView().byId("CbReportingCriteriaCountry").clearSelection();
            this.getView().byId("mcbReportingCriteriaIntercoType").clearSelection();
            this.getView().byId("mcbReportingCriteriaCreationMode").clearSelection();
            this.getView().byId("mcbReportingCriteriaMajorType").clearSelection();

            this._checkReportingCriteria();

        },

        /**
         * Handles press on navigate to request details from reporting header
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onPressNavigateToRequestDetailsFromHeader: function(oEvent) {

            var oSource = oEvent.getSource(),
                sPath, oRequestData = {};
            sPath = oSource.getBindingContext("ReportingRequestHeaderList").getPath();
            oRequestData = this.getView().getModel("ReportingRequestHeaderList").getProperty(sPath);

            this.oRouter.navTo("request", {
                requestId: oRequestData.RequestId
            });

        },

        /**
         * Handles press on navigate to request details from reporting item
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onPressNavigateToRequestDetailsFromItem: function(oEvent) {

            var oSource = oEvent.getSource(),
                sPath, oItemData = {};
            sPath = oSource.getBindingContext("ReportingRequestItemList").getPath();
            oItemData = this.getView().getModel("ReportingRequestItemList").getProperty(sPath);

            this.oRouter.navTo("request", {
                requestId: oItemData.RequestId
            });

        },

        /**
         * Get reporting request headers
         * @param {string}
         *                sReportingType the reporting type code
         * @private
         */
        _getReportingData: function(sReportingType) {

            var aFilters = this._buildReportingFilters();

            switch (sReportingType) {
                case parameters.getReportingTypeList().RequestHeader:
                case parameters.getReportingTypeList().Charts:

                    busy.setBusyOn();
                    odataService.queryReportingRequestHeader.call(this, aFilters)
                        .then(this._handleODataGetReportingRequestHeaderSuccess.bind(this))
                        .catch(messageHelper.showODataFailedMessages.bind(this))
                        .then(function() {
                            busy.setBusyOff();
                        })

                    break;
                case parameters.getReportingTypeList().RequestItem:

                    busy.setBusyOn();
                    odataService.queryReportingRequestItem.call(this, aFilters)
                        .then(this._handleODataGetReportingRequestItemSuccess.bind(this))
                        .catch(messageHelper.showODataFailedMessages.bind(this))
                        .then(function() {
                            busy.setBusyOff();
                        })

                    break;
                default:
                    break;
            };

        },

        /**
         * OData get reporting request header success callback
         * 
         * Sets data into JSON Model
         * @param {Object} oData the data
         * @private
         */
        _handleODataGetReportingRequestHeaderSuccess: function(oData) {

            var sReportingType = this.getComponentModel("AppData").getProperty("/reportingType");

            // Set JSON Model
            this.getView().setModel(new JSONModel(oData), "ReportingRequestHeaderList");

            // Set reporting toolbar title
            this._setReportingTitle();

            if (sReportingType === parameters.getReportingTypeList().Charts) {

                charts.setChartsDataRequestsByStatus.call(this);
                charts.setChartsDataAmountByStatus.call(this);
                charts.setChartsDataAmountByIssuingCompany.call(this);
                charts.setChartsDataAmountByReceivingCompany.call(this);
                charts.setAmountByCompanyChartsScales.call(this);
                charts.setChartsDataRequestsByIntercoType.call(this);
                charts.setChartsDataAmountByIntercoType.call(this);
                charts.setChartsDataRequestsByCreationMode.call(this);
                charts.setChartsDataAmountByCreationMode.call(this);
               
            }

        },

        /**
         * OData get reporting request item success callback
         * 
         * Sets data into JSON Model
         * @param {Object} oData the data
         * @private
         */
        _handleODataGetReportingRequestItemSuccess: function(oData) {

            // Set JSON Model
            this.getView().setModel(new JSONModel(oData), "ReportingRequestItemList");

            // Set reporting toolbar title
            this._setReportingTitle();

        },

        /**
         * Handles press to show/hide search criteria
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onPressToogleSearchCriteriaVisibility: function(oEvent) {

            var oBtn = oEvent.getSource();
            var sDisplayStateValue = oBtn.data("displayStateValue");
            var oFormSearchCriteria = this.getView().byId("formReportingSearchCriteria");
            var oFormSearchButton = this.getView().byId("formReportingSearchButton");
            var oBtnReportingSearchCriteriaVisibility = this.getView().byId("btnReportingSearchCriteriaVisibility");

            switch (sDisplayStateValue) {
                case "show":
                    // hide the table
                    oBtn.setIcon("sap-icon://navigation-down-arrow");
                    oBtn.data("displayStateValue", "hide");
                    oBtnReportingSearchCriteriaVisibility.setTooltip(this.oBundle.getText("searchcriteria.button.tooltip.show"));
                    oFormSearchCriteria.setVisible(false);
                    oFormSearchButton.setVisible(false);
                    break;
                case "hide":
                default:
                    // show the table
                    oBtn.setIcon("sap-icon://navigation-up-arrow");
                    oBtn.data("displayStateValue", "show");
                    oBtnReportingSearchCriteriaVisibility.setTooltip(this.oBundle.getText("searchcriteria.button.tooltip.hide"));
                    oFormSearchCriteria.setVisible(true);
                    oFormSearchButton.setVisible(true);
                    break;
            }
        },

        /**
         * Initiate table personalizations
         * 
         * @private
         */
        _initiateTablePersonalization: function() {

            this.oTPCReportingHeader = tpcHelper.initiateReportingTPC.call(this, parameters.getReportingTypeList().RequestHeader);
            this.oTPCReportingItem = tpcHelper.initiateReportingTPC.call(this, parameters.getReportingTypeList().RequestItem);

        },

        /**
         * Handles button press on Settings button press
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onSettingsButtonPressed: function(oEvent) {
            var sReportingType = this.getView().getModel("AppData").getProperty("/reportingType");
            switch (sReportingType) {
                case parameters.getReportingTypeList().RequestItem:
                    this.oTPCReportingItem.openDialog();
                    break;
                case parameters.getReportingTypeList().RequestHeader:
                    this.oTPCReportingHeader.openDialog();
                    break;
                default:
                    break;
            }
        },

        /**
         * Handles button press on Export Button press
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onExportButtonPressed: function(oEvent) {
            var aData = [];
            var sReportingType = this.getView().getModel("AppData").getProperty("/reportingType");
            var sTableId = "";

            switch (sReportingType) {
                case parameters.getReportingTypeList().RequestItem:
                    sTableId = "tReportingRequestItem";
                    aData = this.getView().getModel("ReportingRequestItemList").getProperty("/results");
                    break;
                case parameters.getReportingTypeList().RequestHeader:
                case parameters.getReportingTypeList().Charts:
                default:
                    sTableId = "tReportingRequestHeader";
                    aData = this.getView().getModel("ReportingRequestHeaderList").getProperty("/results");
                    break;
            }
            exports.exportReportingFileCSV.call(this, aData, sTableId);
        },
        
        onPressExportXLSX : function(oEvent){
            var aData = [];
            var sReportingType = this.getView().getModel("AppData").getProperty("/reportingType");
            var sTableId = "";

            switch (sReportingType) {
                case parameters.getReportingTypeList().RequestItem:
                    sTableId = "tReportingRequestItem";
                    aData = this.getView().getModel("ReportingRequestItemList").getProperty("/results");
                    break;
                case parameters.getReportingTypeList().RequestHeader:
                case parameters.getReportingTypeList().Charts:
                default:
                    sTableId = "tReportingRequestHeader";
                    aData = this.getView().getModel("ReportingRequestHeaderList").getProperty("/results");
                    break;
            }
            exports.exportReportingFileXLSX.call(this, aData, sTableId);
        },

        /**
         * Set reporting title
         * 
         * @private
         */
        _setReportingTitle: function() {

            var oTitle = this.getView().byId("tReportingTitle");
            var sReportingType = this.getView().getModel("AppData").getProperty("/reportingType");
            var sDateFrom = this.getView().byId("dpReportingCriteriaDateFrom").getDateValue();
            var sDateTo = this.getView().byId("dpReportingCriteriaDateTo").getDateValue();
            var sTextReportingType, sTitle;

            switch (sReportingType) {
                case parameters.getReportingTypeList().RequestHeader:
                    sTextReportingType = this.oBundle.getText("reporting.title.header", this.getView().getModel("ReportingRequestHeaderList").getProperty("/results").length.toString());
                    break;
                case parameters.getReportingTypeList().RequestItem:
                    sTextReportingType = this.oBundle.getText("reporting.title.item", this.getView().getModel("ReportingRequestItemList").getProperty("/results").length.toString());
                    break;
                case parameters.getReportingTypeList().Charts:
                    sTextReportingType = this.oBundle.getText("reporting.title.chart");
                    break;
                default:
                    sTextReportingType = "";
                    break;
            };

            if (sDateFrom !== null && sDateTo !== null) {
                sTitle = this.oBundle.getText("reporting.title.parts.datefromto", [sTextReportingType, formatterFormat.formatDate(sDateFrom), formatterFormat.formatDate(sDateTo)]);
            } else if (sDateFrom === null && sDateTo !== null) {
                sTitle = this.oBundle.getText("reporting.title.parts.dateto", [sTextReportingType, formatterFormat.formatDate(sDateTo)]);
            } else if (sDateFrom !== null && sDateTo === null) {
                sTitle = this.oBundle.getText("reporting.title.parts.datefrom", [sTextReportingType, formatterFormat.formatDate(sDateFrom)]);
            } else {
                sTitle = sTextReportingType;
            }

            oTitle.setText(sTitle);

        },

        /**
         * on change date from
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onChangeReportingDateFrom: function(oEvent) {
            this._checkReportingCriteria();
        },

        /**
         * on change date from
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onChangeReportingDateTo: function(oEvent) {
            this._checkReportingCriteria();
        },

        /**
         * check reporting criteria
         * 
         * @private
         */
        _checkReportingCriteria: function() {

            var oBtnSearch = this.getView().byId("btnReportingSearch");
            var bCheckDateFrom = true,
                bCheckDateTo = true,
                bIsSearchEnabled = false;
            var oDPDateFrom = this.getView().byId("dpReportingCriteriaDateFrom");
            var sDateFrom = oDPDateFrom.getValue();
            var oDPDateTo = this.getView().byId("dpReportingCriteriaDateTo");
            var sDateTo = oDPDateTo.getValue();
            var sDateFromMinValue = formatterFormat.formatDatetoSAPDate(businessRules.getReportingDateFromMinValue(this.getComponentModel("AppData").getProperty("/REP_MAX_RETENTION_YR")));
            var sDateFromMinValueOutput = formatterFormat.formatDate(businessRules.getReportingDateFromMinValue(this.getComponentModel("AppData").getProperty("/REP_MAX_RETENTION_YR")));

            //Check on Date From
            if (sDateFrom === "") {
                oDPDateFrom.setValueStateText(this.oBundle.getText("reporting.check.datefrom.null"));
                oDPDateFrom.setValueState("Error");
                bCheckDateFrom = false;
            } else if (sDateFrom.indexOf("/") !== -1) {
                if (formatterFormat.formatOutputDateToSAPDate(sDateFrom) === 'invalid date') {
                    oDPDateFrom.setValueStateText(this.oBundle.getText("reporting.check.date.invalidformat"));
                    oDPDateFrom.setValueState("Error");
                    bCheckDateFrom = false;
                } else {
                    oDPDateFrom.setValueStateText(this.oBundle.getText("reporting.check.datefrom.min", sDateFromMinValueOutput));
                    oDPDateFrom.setValueState("Error");
                    bCheckDateFrom = false;
                }
            } else if (sDateFrom < sDateFromMinValue) {
                oDPDateFrom.setValueStateText(this.oBundle.getText("reporting.check.datefrom.min", sDateFromMinValueOutput));
                oDPDateFrom.setValueState("Error");
                bCheckDateFrom = false;
            } else {
                oDPDateFrom.setValueStateText("");
                oDPDateFrom.setValueState("None");
                bCheckDateFrom = true;
            }

            //Check on Date To
            if (sDateTo.indexOf("/") !== -1) {
                if (formatterFormat.formatOutputDateToSAPDate(sDateTo) === 'invalid date') {
                    oDPDateTo.setValueStateText(this.oBundle.getText("reporting.check.date.invalidformat"));
                    oDPDateTo.setValueState("Error");
                    bCheckDateTo = false;
                }
            } else if (sDateTo < sDateFrom) {
                oDPDateTo.setValueStateText(this.oBundle.getText("reporting.check.dateto.lowerthandateform"));
                oDPDateTo.setValueState("Error");
                bCheckDateTo = false;
            } else {
                oDPDateTo.setValueStateText("");
                oDPDateTo.setValueState("None");
                bCheckDateTo = true;
            }

            bIsSearchEnabled = (bCheckDateFrom === true && bCheckDateTo === true) ? true : false;
            oBtnSearch.setEnabled(bIsSearchEnabled);

        },

        onPressShowRequestBatchLogs: function(oEvent) {

            var oSource = oEvent.getSource();
            var sPath = oSource.getBindingContext("ReportingRequestHeaderList").getPath();
            var oReqData = this.getView().getModel("ReportingRequestHeaderList").getProperty(sPath);

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
        
        /**
         * Set view styles & css classes
         * 
         * @private
         */
        _setStyle: function() {

            // Set view compact/cosy class
            this.getView().byId("tReportingRequestHeader").addStyleClass(this.getContentDensityClass());
            this.getView().byId("tReportingRequestItem").addStyleClass(this.getContentDensityClass());
            this.getView().byId("tbReportingResults").addStyleClass(this.getContentDensityClass());
        },

    });
}, true);