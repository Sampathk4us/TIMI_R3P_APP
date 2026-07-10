/************************************************************************
 * Project            : TIMI                                 			*
 * Process            : FI                                              *
 * Task code          : FI062                                           *
 * Functional document:                                					*
 * Technical document :                                    				*
 *----------------------------------------------------------------------*
 * File       	 : view/Request.controller.js   	        			*
 * Author        : David TEA                                            *
 * Company       : Resp                                               	*
 * Creation Date : 12/05/2016                                           *
 *----------------------------------------------------------------------*
 * Description   : Request view controller   							*		
 *                                                                      *
 ************************************************************************
 * Modification nÂ° ...........	: M001									*
 * Project ...................	: TIMI									*
 * Author .................... 	: Marion Alberny                        *
 *----------------------------------------------------------------------*
 * Modification date ......... 	: 04/11/2016 							*
 * Transport order ........... 	:  										*
 * Change Request ............ 	: CR2016-273225  						*
 * Description ............... 	: Withholding Tax and SGL Indicator 	*
 ************************************************************************
 * Modification nÂ° ...........	: M002									*
 * Project ...................	: TIMI									*
 * Author .................... 	: Marion Alberny                        *
 *----------------------------------------------------------------------*
 * Modification date ......... 	: 26/01/2017 							*
 * Transport order ........... 	:  										*
 * Change Request ............ 	: CR  									*
 * Description ............... 	: Manage regeneration warning and       * 
 * 								  column management for item tables	 	*
 *************************************************************************/
/**
 * @fileOverview Request view controller
 * @author David Tea
 * @version 1.0
 */
sap.ui.define([
    "cus/fi/timi/rel/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/layout/VerticalLayout",
    "sap/m/Dialog",
    "sap/m/Text",
    "sap/m/Button",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "cus/fi/timi/rel/model/businessRules",
    "cus/fi/timi/rel/model/dataValidation",
    "cus/fi/timi/rel/model/exports",
    "cus/fi/timi/rel/model/formatterFormat",
    "cus/fi/timi/rel/model/formatterState",
    "cus/fi/timi/rel/model/formatterText",
    "cus/fi/timi/rel/model/formatterVisibility",
    "cus/fi/timi/rel/model/messageHelper",
    "cus/fi/timi/rel/model/miscellaneous",
    "cus/fi/timi/rel/model/odataService",
    "cus/fi/timi/rel/model/parameters",
    "cus/fi/timi/rel/model/requestModel",
    "cus/fi/timi/rel/model/routerHelper",
    "cus/fi/timi/rel/model/tpcHelper",
    "cus/fi/timi/rel/model/tsdHelper",
    "cus/fi/timi/rel/model/variantManagement",
    "cus/fi/timi/rel/assets/js/helpers/utilities",
    "cus/fi/timi/rel/assets/js/helpers/busy"
], function(BaseController, JSONModel, Filter, FilterOperator, VerticalLayout, Dialog, Text, Button, MessageToast, MessageBox, businessRules, dataValidation, exports, formatterFormat, formatterState, formatterText, formatterVisibility, messageHelper, miscellaneous, odataService, parameters, requestModel, routerHelper, tpcHelper, tsdHelper, variantManagement, utilities, busy) {
    "use strict";

    return BaseController.extend("cus.fi.timi.rel.controller.Request", {

        formatterFormat: formatterFormat,
        formatterState: formatterState,
        formatterText: formatterText,
        formatterVisibility: formatterVisibility,
        miscellaneous: miscellaneous,
        utilities: utilities,
        businessRules: businessRules,

        /**
         * Called when a controller is instantiated and its View controls (if
         * available) are already created. Can be used to modify the View before
         * it is displayed, to bind event handlers and do other one-time
         * initialization.
         * 
         * @memberOf view.Request
         */
        onInit: function() {

            /**
             * Component defined routes
             * 
             * @type {sap.ui.core.routing.Router}
             */
            this.oRouter = this.getRouter();

            /**
             * Component defined Model
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
             * Upload Collection initiation
             */
            this._initiateUploadCollection();

            /**
             * Call _setStyle method
             */
            this._setStyle();

            /**
             * Attach on route navigation event match
             */
            this.oRouter.getRoute("request").attachMatched(this._onRouteMatched, this);

            /**
             * Attach on target navigation event match
             */
            this.oRouter.getTargets("request").attachDisplay(this._onTargetMatched, this);

            /**
             * Event Subscription
             */
            this.getOwnerComponent().getEventBus().subscribe("cus.fi.timi.rel", "refreshRequestData", this._refreshRequestData, this);

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

            var oArgs = oEvent.getParameter("arguments");
            // Get Request Details
            this._getRequest(oArgs.requestId);
        },

        /**
         * Handles target matched function
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        _onTargetMatched: function(oEvent) {

            this._oTargetData = oEvent.getParameter("data");

            // If nav back from Item view
            if (this._oTargetData && this._oTargetData.fromTarget && this._oTargetData.fromTarget === "item") {

                // Refresh items table bindings
                this._refreshItemsTableBindings(parameters.getItemTypeList().Issuing);
                this._refreshItemsTableBindings(parameters.getItemTypeList().Receiving);

            }
        },

        /**
         * Refresh request data
         * 
         * @event
         * @param {string}
         *                sChannel the event channel 
         * @param {string}
         *                sEventName the event name
         * @param {string}
         *                sRequestId the request Id 
         * @public
         */
        _refreshRequestData: function(sChannel, sEventName, sRequestId) {
            this._getRequest(sRequestId);
        },

        /**
         * Get request details
         * 
         * @param {string}
         *                sRequestId the request id
         * @private
         */
        _getRequest: function(sRequestId) {

            // Set busy indicator on before OData read
            this._setBusyRequest(true);
            
            this._asyncGetRequest.call(this, sRequestId)
                .catch(messageHelper.showODataFailedMessages.bind(this))
                .then(function() {
                    this._setBusyRequest(false);
                }.bind(this));

        },
        
        _asyncGetRequest: function(sRequestId) {

            var oRequestFieldAttributesUrlParameters = {
                "IntercoType": this.getIntercoType(),
                "ApplicationType": this.getAppType(),
                "RequestId": sRequestId
            };

            return odataService.getRequest.call(this, sRequestId)
                .catch(function(oError) {
                    messageHelper.showODataFailedMessages.call(this, oError, routerHelper.navToDefault.bind(this));
                    return Promise.reject(); //Break chain
                }.bind(this))
                .then(function(oData) {
                    // Set JSON Model
                    this.setComponentModel(new JSONModel(oData), "Request");
                    return oData;
                }.bind(this))
                .then(this._asyncGetRequestBusinessData.bind(this))
                .then(function(oData) {
                    this._handleGetRequestBusinessData.call(this, oData);
                    return "";
                }.bind(this))
                .then(odataService.requestFieldsAttributes.bind(this, oRequestFieldAttributesUrlParameters))
                .then(function(oData) {
                    this._handleRequestFieldsAttributes.call(this, oData);
                    return "";
                }.bind(this))
                .then(function() {

                    // Set Attachments URL
                    this._updateRequestAttachmentsUrl();

                    // Set Business Area Collection
                    businessRules.setBusinessAreaCollection.call(this, parameters.getItemTypeList().Issuing);
                    businessRules.setBusinessAreaCollection.call(this, parameters.getItemTypeList().Receiving);

                    // Initiate Items Personalization Controller & Variant Data
                    this._initiateRequestItemsTablesPersonalization(this.getAppType());
                    this._initiateRequestItemsVariantManagement(this.getAppType());

                    this._applyRequestCustomerVendorCustomState();

                    this.getComponentModel("CurrencyCollection").updateBindings(true);
                    this.getComponentModel("Request").updateBindings(true);

                    // Set request change flag
                    this.setRequestChangedFlag(false);

                }.bind(this))

        },

        /**
         * Update Request Attachments Url
         * 
         * @private
         */
        _updateRequestAttachmentsUrl: function() {

            var oRequest = this.getComponentModel("Request");
            var aAttachments = [],
                iCount = 0,
                oAttachment = {},
                i = 0;

            if (oRequest.getProperty("/Attachments").results && oRequest.getProperty("/Attachments").results.length > 0) {

                aAttachments = oRequest.getProperty("/Attachments").results;
                iCount = aAttachments.length;

                for (i = 0; i < iCount; i++) {
                    oAttachment = aAttachments[i];
                    if (aAttachments[i].__metadata && aAttachments[i].__metadata.media_src !== undefined && aAttachments[i].__metadata.media_src !== null) {
                        oRequest.setProperty("/Attachments/results/" + i + "/Url", oAttachment.__metadata.media_src);
                    }
                }

            }

        },

        /**
         * OData get request fields attributes success callback
         * 
         * Sets data into JSON Model
         * 
         * @param {Object} oData the data
         * @param {Object} response the response
         * @private
         */
        _handleRequestFieldsAttributes: function(oData) {

            var aFieldsAttributes = oData.results;
            var iCount = aFieldsAttributes.length,
                i = 0;
            var oItem = {},
                oFieldsStructureList = {};

            var oFieldsHeader = {},
                oFieldsIssuingItems = {},
                oFieldsReceivingItems = {},
                oFieldsIssuingWTax = {},
                oFieldsReceivingWTax = {};

            for (i = 0; i < iCount; i++) {

                var oFieldAttributeList = {};

                oItem = aFieldsAttributes[i];

                oFieldAttributeList["Editable"] = oItem.Editable;
                oFieldAttributeList["Visible"] = oItem.Visible;
                oFieldAttributeList["Mandatory"] = oItem.Mandatory;

                switch (oItem.FieldTable) {
                    case 'HEADER_DATA':
                        oFieldsHeader[oItem.FieldId] = oFieldAttributeList;
                        break;
                    case 'ISSUING_ITEMS':
                        oFieldsIssuingItems[oItem.FieldId] = oFieldAttributeList;
                        break;
                    case 'RECEIVING_ITEMS':
                        oFieldsReceivingItems[oItem.FieldId] = oFieldAttributeList;
                        break;
                    case 'ISSUING_WTAX':
                    	oFieldsIssuingWTax[oItem.FieldId] = oFieldAttributeList;
                        break;
                    case 'RECEIVING_WTAX':
                    	oFieldsReceivingWTax[oItem.FieldId] = oFieldAttributeList;
                        break;
                    default:
                        break;
                }

            }

            oFieldsStructureList["HEADER_DATA"] = oFieldsHeader;
            oFieldsStructureList["ISSUING_ITEMS"] = oFieldsIssuingItems;
            oFieldsStructureList["RECEIVING_ITEMS"] = oFieldsReceivingItems;
            oFieldsStructureList["ISSUING_WTAX"] = oFieldsIssuingWTax;
            oFieldsStructureList["RECEIVING_WTAX"] = oFieldsReceivingWTax;

            // Set JSON Model
            this.setComponentModel(new JSONModel(oFieldsStructureList), "FieldsAttributes");

        },
        
        _applyRequestCustomerVendorCustomState : function(){
            var oRequest = this.getComponentModel("Request"),
                oFieldsAttributes = this.getComponentModel("FieldsAttributes"),
                oCustomerCollection = this.getComponentModel("CustomerCollection"),
                aCustomer = !!oCustomerCollection.getProperty("/results") ? oCustomerCollection.getProperty("/results") : [],
                oVendorCollection = this.getComponentModel("VendorCollection"),
                aVendor = !!oVendorCollection.getProperty("/results") ? oVendorCollection.getProperty("/results") : [];

            // Handle Vendor
            if(!!aCustomer && aCustomer.length === 0
                && oFieldsAttributes.getProperty("/HEADER_DATA/CUSTOMER/Editable") === true){
                 oRequest.setProperty("/HeaderData/States/CustomerCode","E");   
                 oRequest.setProperty("/HeaderData/Messages/CustomerCode",this.oBundle.getText("link.masterdatadoc.message.info"));
            }

            // Handle Customer
            if(!!aVendor && aVendor.length === 0
                && oFieldsAttributes.getProperty("/HEADER_DATA/VENDOR/Editable") === true){
                 oRequest.setProperty("/HeaderData/States/VendorCode","E");   
                 oRequest.setProperty("/HeaderData/Messages/VendorCode",this.oBundle.getText("link.masterdatadoc.message.info"));
            }

        },

        _asyncGetRequestBusinessData: function(oRequestData) {

            var aOperations = [],
                sIssuingLegalEntity, sReceivingLegalEntity, sIssuingCompany, sReceivingCompany, sLegalEntity,
                sCountry, sVendor, sWithholdingTaxType;

            sIssuingLegalEntity = oRequestData.HeaderData.IsLegalEntityCode;
            sReceivingLegalEntity = oRequestData.HeaderData.RcLegalEntityCode;
            sIssuingCompany = oRequestData.HeaderData.IsCompanyCode;
            sReceivingCompany = oRequestData.HeaderData.RcCompanyCode;
            sCountry = oRequestData.HeaderData.RcCountryCode;
            sVendor = oRequestData.HeaderData.VendorCode;
            sWithholdingTaxType = oRequestData.HeaderData.WithholdingTaxTypeCode;

        	if ( this.getIntercoType() === parameters.getIntercoTypeList().Treasury ) {
        		if ( oRequestData.IsTreasury ){
        			sLegalEntity = sIssuingLegalEntity;
        		} else {
        			sLegalEntity = sReceivingLegalEntity;
        		}
        	} else {
        		sLegalEntity = sIssuingLegalEntity;
        	}
        	
            aOperations.push({
                "path": "/CustomerCollection",
                "filters": [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, sIssuingLegalEntity),
                    new Filter("LegalEntityCode", FilterOperator.EQ, sReceivingLegalEntity),
                    new Filter("CompanyCode", FilterOperator.EQ, sIssuingCompany)
                ]
            });

            aOperations.push({
                "path": "/VendorCollection",
                "filters": [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, sReceivingLegalEntity),
                    new Filter("LegalEntityCode", FilterOperator.EQ, sIssuingLegalEntity),
                    new Filter("CompanyCode", FilterOperator.EQ, sReceivingCompany)
                ]
            });

            aOperations.push({
                "path": "/WithholdingTaxTypeCollection",
                "filters": [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, sReceivingLegalEntity),
                    new Filter("Country", FilterOperator.EQ, sCountry),
                    new Filter("CompanyCode", FilterOperator.EQ, sReceivingCompany),
                    new Filter("VendorCode", FilterOperator.EQ, sVendor)
                ]
            });

            aOperations.push({
                "path": "/WithholdingTaxCodeCollection",
                "filters": [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, sReceivingLegalEntity),
                    new Filter("Country", FilterOperator.EQ, sCountry),
                    new Filter("CompanyCode", FilterOperator.EQ, sReceivingCompany),
                    new Filter("VendorCode", FilterOperator.EQ, sVendor),
                    new Filter("WithholdingTaxTypeCode", FilterOperator.EQ, sWithholdingTaxType)
                ]
            });

            aOperations.push({
                "path": "/CurrencyCollection",
                "filters": [new Filter("Filters/LegalEntityCode", FilterOperator.EQ, sLegalEntity)]
            });

            return odataService.batchRead.call(this, "requestBusinessData", aOperations);

        },

        /**
         * OData get request business data success callback
         * 
         * Sets data into JSON Model
         * 
         * @param {Object} oData the data
         * @private
         */
        _handleGetRequestBusinessData: function(oData) {

            var aBatchResponses = [];

            aBatchResponses = oData.__batchResponses;

            if (aBatchResponses[0].data !== undefined) {
                this.setComponentModel(new JSONModel(aBatchResponses[0].data), "CustomerCollection");
            } else {
                this.setComponentModel(new JSONModel(), "CustomerCollection");
            }

            if (aBatchResponses[1].data !== undefined) {
                this.setComponentModel(new JSONModel(aBatchResponses[1].data), "VendorCollection");
            } else {
                this.setComponentModel(new JSONModel(), "VendorCollection");
            }

            if (aBatchResponses[2].data !== undefined) {
                this.setComponentModel(new JSONModel(aBatchResponses[2].data), "WithholdingTaxTypeCollection");
            } else {
                this.setComponentModel(new JSONModel(), "WithholdingTaxTypeCollection");
            }

            if (aBatchResponses[3].data !== undefined) {
                this.setComponentModel(new JSONModel(aBatchResponses[3].data), "WithholdingTaxCodeCollection");
            } else {
                this.setComponentModel(new JSONModel(), "WithholdingTaxCodeCollection");
            }

            if (aBatchResponses[4].data !== undefined) {
                this.setComponentModel(new JSONModel(aBatchResponses[4].data), "CurrencyCollection");
                this.getComponentModel("CurrencyCollection").setSizeLimit(aBatchResponses[4].data.results.length);
            } else {
                this.setComponentModel(new JSONModel(), "CurrencyCollection");
            }

        },

        /**
         * Handles press navigate to item view
         * 
         * @event
         * @param {eventObject} oEvent the event data
         * @public
         */
        onPressNavigateToItem: function(oEvent) {

            var oButton = oEvent.getSource();
            var sItemPath = oButton.getBindingContext("Request").getPath();
            var sItemType = oButton.data("itemType"); // 01=Issuing, 02=Receiving

            var oItemInfo = {
                "ItemType": sItemType,
                "ItemContextPath": sItemPath
            };

            // Set Item Info JSON Model
            this.setComponentModel(new JSONModel(oItemInfo), "ItemInfo");

            // Display target "item"
            this.getRouter().getTargets().display("item", {
                "fromTarget": "request"
            });

        },

        /**
         * Back navigation function. Override base controller
         * 
         * @param {eventObject} oEvent the event data
         * @public
         */
        onNavBack: function(oEvent) {

            routerHelper.navToOverview.apply(this);

        },

        /**
         * Handles press event on add new item
         * 
         * @param {eventObject} oEvent the event data
         * @public
         */
        onPressAddNewItem: function(oEvent) {

            var oButton = oEvent.getSource(),
                oRequestItem = {};
            var oRequestModel = this.getComponentModel("Request");
            var sItemType = oButton.data("itemType");
            var sInvoiceType = oRequestModel.getProperty("/HeaderData/DocumentTypeCode"),
             	oUrlParameters = {
            		"RequestId" : oRequestModel.getProperty("/HeaderData/RequestId"),
            		"ItemType" 	: sItemType
            	};

            oRequestItem = odataService.createODataEntityObject(this.oDataModel, "RequestItem", []);

            oRequestItem.RequestId = oRequestModel.getProperty("/HeaderData/RequestId");
            oRequestItem.TypeId = oRequestModel.getProperty("/HeaderData/TypeId");
            oRequestItem.ItemType = sItemType;
            oRequestItem.DCIndicator = businessRules.getDefaultDCInd(sInvoiceType, sItemType);

            switch (sItemType) {
                case parameters.getItemTypeList().Issuing:
                    oRequestItem.ItemId = (this.getComponentModel("Request").getProperty("/IssuingItems/results").length + 1).toString();
                	
                	if (oRequestModel.getProperty("/HeaderData/IntercoTypeCode") === parameters.getIntercoTypeList().Major
                	 && oRequestModel.getProperty("/HeaderData/IsTaxCode") !== '') {
                		oRequestItem.TaxCode = oRequestModel.getProperty("/HeaderData/IsTaxCode");
                	}
                	
                	if(oRequestModel.getProperty("/HeaderData/IntercoTypeCode") === parameters.getIntercoTypeList().Major){
                		
	                	odataService.determineRequestItemDefaultValues.call(this, oUrlParameters)
	                		.then(function(oData){
	                			
	                			oRequestItem.GLAccount = oData.GLAccount;
	                			oRequestItem.AnalyticalNature = oData.AnalyticalNature;
	                			oRequestItem.CostCenter = oData.CostCenter;
	                			oRequestItem.ProfitCenter = oData.ProfitCenter;
	                			oRequestItem.LCOAAccount = oData.LCOAAccount;
	                			oRequestItem.BusinessAreaCode = oData.BusinessAreaCode;

	                            this.getComponentModel("Request").getProperty("/IssuingItems/results").push(oRequestItem);
	                            // Refresh items table bindings
	                            this._refreshItemsTableBindings(sItemType);
	                            // Set Business Area Collection
	                            businessRules.setBusinessAreaCollection.call(this, sItemType);
	                            // Set request change flag
	                            this.setRequestChangedFlag(true);
	                            
	                		}.bind(this));
	                	
                	}else{

                        this.getComponentModel("Request").getProperty("/IssuingItems/results").push(oRequestItem);
                        // Refresh items table bindings
                        this._refreshItemsTableBindings(sItemType);
                        // Set request change flag
                        this.setRequestChangedFlag(true);
                	}
                	
                    break;
                case parameters.getItemTypeList().Receiving:
                    oRequestItem.ItemId = (this.getComponentModel("Request").getProperty("/ReceivingItems/results").length + 1).toString();

            		if (oRequestModel.getProperty("/HeaderData/IntercoTypeCode") === parameters.getIntercoTypeList().Major
                   	 && oRequestModel.getProperty("/HeaderData/RcTaxCode") !== '') {
                   		oRequestItem.TaxCode = oRequestModel.getProperty("/HeaderData/RcTaxCode");
                   	}    
                	if(oRequestModel.getProperty("/HeaderData/IntercoTypeCode") === parameters.getIntercoTypeList().Major){
                		
	                	odataService.determineRequestItemDefaultValues.call(this, oUrlParameters)
	                		.then(function(oData){
	                			
	                			oRequestItem.GLAccount = oData.GLAccount;
	                			oRequestItem.AnalyticalNature = oData.AnalyticalNature;
	                			oRequestItem.CostCenter = oData.CostCenter;
	                			oRequestItem.ProfitCenter = oData.ProfitCenter;
	                			oRequestItem.LCOAAccount = oData.LCOAAccount;
	                			oRequestItem.BusinessAreaCode = oData.BusinessAreaCode;

	                            this.getComponentModel("Request").getProperty("/ReceivingItems/results").push(oRequestItem);
	                            // Refresh items table bindings
	                            this._refreshItemsTableBindings(sItemType);
	                            // Set Business Area Collection
	                            businessRules.setBusinessAreaCollection.call(this, sItemType);
	                            // Set request change flag
	                            this.setRequestChangedFlag(true);
	                            
	                		}.bind(this));
	                	
                	}else{

                        this.getComponentModel("Request").getProperty("/ReceivingItems/results").push(oRequestItem);
                        // Refresh items table bindings
                        this._refreshItemsTableBindings(sItemType);
                        // Set request change flag
                        this.setRequestChangedFlag(true);
                	}
                	
                    break;
                default:
                    break;
            }
            
            
//            // Refresh items table bindings
//            this._refreshItemsTableBindings(sItemType);
//
//            // Set request change flag
//            this.setRequestChangedFlag(true);
        },

        /**
         * Handles press event on delete item
         * 
         * @param {eventObject} oEvent the event data
         * @public
         */
        onPressDeleteItem: function(oEvent) {

            var oButton = oEvent.getSource();
            var sItemPath = oButton.getBindingContext("Request").getPath();
            var sItemDeleteFlagPath = sItemPath + "/FlagDelete";
            var sItemType = oButton.data("itemType");

            this.getComponentModel("Request").setProperty(sItemDeleteFlagPath, true);

            // Refresh items table bindings
            this._refreshItemsTableBindings(sItemType);

            // Refresh Business Area Collection on item delete
            businessRules.setBusinessAreaCollection.call(this, sItemType);

            // Set request change flag
            this.setRequestChangedFlag(true);

        },

        /**
         * Handles press event on duplicate item
         * 
         * @param {eventObject} oEvent the event data
         * @public
         */
        onPressDuplicateItem: function(oEvent) {

            var oButton = oEvent.getSource(),
                oNIInput = null,
                sItemType = oButton.data("itemType"),
                sItemPath = oEvent.getSource().getBindingContext("Request").getPath();

            // create delete request responsive popover
            if (!this._oPopoverDuplicateRequestItem) {
                this._oPopoverDuplicateRequestItem = sap.ui.xmlfragment(this.createId("frgtDuplicateRequestItem"), "cus.fi.timi.rel.view.fragment.RequestDuplicateItemPopover", this);
                this.getView().addDependent(this._oPopoverDuplicateRequestItem);
            }

            oNIInput = this.byId(sap.ui.core.Fragment.createId("frgtDuplicateRequestItem", "niTimes"));
            oNIInput.setValue("1");


            // Add item path
            this._oPopoverDuplicateRequestItem.data("ItemType", sItemType);
            this._oPopoverDuplicateRequestItem.data("ItemPath", sItemPath);

            this._oPopoverDuplicateRequestItem.openBy(oButton);

        },

        /**
         * on press cancellation on request duplication
         * 
         * @event
         * @param {eventObject} oEvent the event data
         * @public
         */
        onPressConfirmDuplicateRequestItem: function(oEvent) {

            var oNIInput = this.byId(sap.ui.core.Fragment.createId("frgtDuplicateRequestItem", "niTimes")),
                oRequestModel = this.getComponentModel("Request"),
                sItemType = this._oPopoverDuplicateRequestItem.data("ItemType"),
                sItemPath = this._oPopoverDuplicateRequestItem.data("ItemPath"),
                iNbTimes = oNIInput.getValue(),
                i = 0;

            for (i = 0; i < iNbTimes; i++) {
                switch (sItemType) {
                    case parameters.getItemTypeList().Issuing:
                        oRequestModel.getProperty("/IssuingItems/results").push(businessRules.initiateDuplicateItem.call(this, sItemType, sItemPath));
                        break;
                    case parameters.getItemTypeList().Receiving:
                        oRequestModel.getProperty("/ReceivingItems/results").push(businessRules.initiateDuplicateItem.call(this, sItemType, sItemPath));
                        break;
                    default:
                        break;
                }
            }

            // Refresh items table bindings
            this._refreshItemsTableBindings(sItemType);

            // Set request change flag
            this.setRequestChangedFlag(true);

            // close dialog
            this._oPopoverDuplicateRequestItem.close();
        },

        /**
         * on press cancellation on request duplication
         * 
         * @event
         * @param {eventObject} oEvent the event data
         * @public
         */
        onPressCancelDuplicateRequestItem: function(oEvent) {
            // close dialog
            this._oPopoverDuplicateRequestItem.close();
        },

        /**
         * Handles press event on add markup item
         * 
         * @param {eventObject} oEvent the event data
         * @public
         */
        onPressAddMarkupItem: function(oEvent) {

            var oButton = oEvent.getSource(),
                oRequestItem = {};
            var sItemPath = oEvent.getSource().getBindingContext("Request").getPath();
            var oRequestModel = this.getComponentModel("Request");
            var sItemType = oButton.data("itemType");

            oRequestItem = odataService.createODataEntityObject(this.oDataModel, "RequestItem", []);

            // Copy properties
            utilities.copyProperties(oRequestItem, oRequestModel.getProperty(sItemPath));
            // Set Percentage to 0
            oRequestItem.Percentage = 0;
            // Calculate markup amount
            oRequestItem.Amount = businessRules.getMarkupAmount.call(this, oRequestItem.Amount);
            // Set default markup text
            oRequestItem.ItemText = businessRules.getMarkupText.call(this);

            switch (sItemType) {
                case parameters.getItemTypeList().Issuing:
                    oRequestItem.ItemId = (this.getComponentModel("Request").getProperty("/IssuingItems/results").length + 1).toString();
                    this.getComponentModel("Request").getProperty("/IssuingItems/results").push(oRequestItem);
                    break;
                case parameters.getItemTypeList().Receiving:
                    oRequestItem.ItemId = (this.getComponentModel("Request").getProperty("/ReceivingItems/results").length + 1).toString();
                    this.getComponentModel("Request").getProperty("/ReceivingItems/results").push(oRequestItem);
                    break;
                default:
                    break;
            }

            // Refresh items table bindings
            this._refreshItemsTableBindings(sItemType);

            // Set request change flag
            this.setRequestChangedFlag(true);

        },

        onPressShowItemMessages: function(oEvent) {

            var oButton = oEvent.getSource(),
                oMessages = {
                    results: []
                },
                sItemPath = oButton.getBindingContext("Request").getPath(),
                oRequest = this.getComponentModel("Request"),
                oRequestItemMessages = oRequest.getProperty(sItemPath + "/Messages");

            // create delete request responsive popover
            if (!this._oPopoverRequestItemMessages) {
                this._oPopoverRequestItemMessages = sap.ui.xmlfragment(this.createId("frgtRequestItemMessages"), "cus.fi.timi.rel.view.fragment.RequestItemMessagesPopover", this);
                this.getView().addDependent(this._oPopoverRequestItemMessages);
            }

            for (var sPropertyMessage in oRequestItemMessages) {
                if (oRequestItemMessages.hasOwnProperty(sPropertyMessage) &&
                    typeof (oRequestItemMessages[sPropertyMessage]) == "string" &&
                    oRequestItemMessages[sPropertyMessage] !== "") {
                    oMessages.results.push({
                        message: oRequestItemMessages[sPropertyMessage]
                    })
                }
            }

            this._oPopoverRequestItemMessages.setModel(new JSONModel(oMessages), "ItemMessages");
            this._oPopoverRequestItemMessages.openBy(oButton);

        },

        /**
         * Refresh Request JSON Model
         * 
         * @public
         */
        _refreshRequestModel: function() {
            this.getComponentModel("Request").refresh();
        },

        /**
         * Refresh header total amount text only on issuing items update
         * 
         * @param {string} sItemType the items type table
         * @public
         */
        _refreshRequestHeaderAmount: function(sItemType) {

            switch (sItemType) {
                case parameters.getItemTypeList().Issuing:
                    var aIssuingItemsData = this.getComponentModel("Request").getProperty("/IssuingItems/results");
                    var sDocType = this.getComponentModel("Request").getProperty("/HeaderData/DocumentTypeCode");
                    this.getComponentModel("Request").setProperty("/HeaderData/Amount", miscellaneous.calculateItemsTotalAmountWithMarkup.call(this, sDocType, sItemType, aIssuingItemsData, false));
                    break;
                default:
                    break;
            }

        },

        /**
         * Refresh items table title text
         * 
         * @param {string} sItemType the items type table
         * @public
         */
        _refreshItemsTableTitle: function(sItemType) {
            var oModel = this.getComponentModel("Request");
            var aItems = [],
                sDocumentNumber;
            var bAutoposting = oModel.getProperty("/HeaderData/Autoposting");
            var sAutopostingStatus = oModel.getProperty("/HeaderData/AutopostingStatus");;

            switch (sItemType) {
                case parameters.getItemTypeList().Issuing:
                    aItems = oModel.getProperty("/IssuingItems/results");
                    sDocumentNumber = oModel.getProperty("/HeaderData/IsDocumentNumber");
                    this.getView().byId("tTitleIssuing").setText(formatterText.getIssuingItemsTableTitle.call(this, aItems));
                    break;
                case parameters.getItemTypeList().Receiving:
                    aItems = oModel.getProperty("/ReceivingItems/results");
                    sDocumentNumber = oModel.getProperty("/HeaderData/RcDocumentNumber");
                    this.getView().byId("tTitleReceiving").setText(formatterText.getReceivingItemsTableTitle.call(this, aItems));
                    break;
                default:
                    break;
            }
        },

        /**
         * Refresh header off markup amount text
         * 
         * @param {string} sItemType the items type table
         * @public
         */
        _refreshRequestHeaderOffMarkupAmountText: function(sItemType) {

            switch (sItemType) {
                case parameters.getItemTypeList().Issuing:
                    this.getView().byId("osOffMarkupAmount").setText(formatterText.getOffMarkupAmountText.call(this, this.getComponentModel("Request").getProperty("/IssuingItems/results")));
                    break;
                default:
                    break;
            }

        },

        /**
         * Refresh items total amount text
         * 
         * @param {string} sItemType the items type table
         * @public
         */
        _refreshItemsTotalAmountText: function(sItemType) {
            var sDocType = this.getComponentModel("Request").getProperty("/HeaderData/DocumentTypeCode");

            switch (sItemType) {
                case parameters.getItemTypeList().Issuing:
                    var aIssuingItemsData = this.getComponentModel("Request").getProperty("/IssuingItems/results");
                    this.getView().byId("tIssuingItemsTotalAmount").setText(miscellaneous.calculateItemsTotalAmount.call(this, sDocType, sItemType, aIssuingItemsData, true));
                    break;
                case parameters.getItemTypeList().Receiving:
                    var aReceivingItemsData = this.getComponentModel("Request").getProperty("/ReceivingItems/results");
                    this.getView().byId("tReceivingItemsTotalAmount").setText(miscellaneous.calculateItemsTotalAmount.call(this, sDocType, sItemType, aReceivingItemsData, true));
                    break;
                default:
                    break;
            }

        },

        /**
         * Refresh items total amount with markup text
         * 
         * @param {string} sItemType the items type table
         * @public
         */
        _refreshItemsTotalAmountWithMarkupText: function(sItemType) {
            var sDocType = this.getComponentModel("Request").getProperty("/HeaderData/DocumentTypeCode");

            switch (sItemType) {
                case parameters.getItemTypeList().Issuing:
                    var aIssuingItemsData = this.getComponentModel("Request").getProperty("/IssuingItems/results");
                    this.getView().byId("tIssuingItemsTotalAmountWithMarkup").setText(miscellaneous.calculateItemsTotalAmountWithMarkup.call(this, sDocType, sItemType, aIssuingItemsData, true));
                    break;
                case parameters.getItemTypeList().Receiving:
                    var aReceivingItemsData = this.getComponentModel("Request").getProperty("/ReceivingItems/results");
                    this.getView().byId("tReceivingItemsTotalAmountWithMarkup").setText(miscellaneous.calculateItemsTotalAmountWithMarkup.call(this, sDocType, sItemType, aReceivingItemsData, true));
                    break;
                default:
                    break;
            }

        },

        /**
         * Refresh items table bindings
         * 
         * @param {string} sItemType the items type table
         * @public
         */
        _refreshItemsTableBindings: function(sItemType) {
            // Refresh Request Model
            this._refreshRequestModel();
            // Refresh Request Header Amount
            this._refreshRequestHeaderAmount(sItemType);
            // Refresh Request Header Amount
            this._refreshRequestHeaderOffMarkupAmountText(sItemType);
            // Refresh items total amount
            this._refreshItemsTotalAmountText(sItemType);
            // Refresh items total markup amount
            this._refreshItemsTotalAmountWithMarkupText(sItemType);
            // Refresh items table title
            this._refreshItemsTableTitle(sItemType);
        },

        /**
         * Refresh items' amount format
         * 
         * @public
         */
        _refreshItemsAmountFormat: function() {

            var oRequest = this.getComponentModel("Request"), i,
                aIssuingItems = oRequest.getProperty("/IssuingItems/results"),
                iCountIssuingItems = aIssuingItems.length,
                aReceivingItems = oRequest.getProperty("/ReceivingItems/results"),
                iCountReceivingItems = aReceivingItems.length,
                sCurrencyCode = oRequest.getProperty("/HeaderData/CurrencyCode"),
                iDecimal;

            if (sCurrencyCode && sCurrencyCode !== "") {
                iDecimal = businessRules.getCurrencyMaxDecimals.call(this, sCurrencyCode);

                for (i = 0; i < iCountIssuingItems; i++) {
                    aIssuingItems[i].Amount = formatterFormat.formatAmountWithDecimal(aIssuingItems[i].Amount, iDecimal);
                    // Update Item TotalAmount
                    miscellaneous.updateItemTotalAmount.call(this, "/IssuingItems/results/" + i);
                }

                for (i = 0; i < iCountReceivingItems; i++) {
                    aReceivingItems[i].Amount = formatterFormat.formatAmountWithDecimal(aIssuingItems[i].Amount, iDecimal);
                    // Update Item TotalAmount
                    miscellaneous.updateItemTotalAmount.call(this, "/ReceivingItems/results/" + i);
                }

            }

        },

        /**
         * Handle change event on item amount input
         * 
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onChangeItemAmount: function(oEvent) {

            var sItemPath = oEvent.getSource().getBindingContext("Request").getPath();
            var sPropertyPathPercentage = sItemPath + "/Percentage";

            // Set percentage to 0.00
            this.getComponentModel("Request").setProperty(sPropertyPathPercentage, '0.00');
            // Update Item TotalAmount
            miscellaneous.updateItemTotalAmount.call(this, sItemPath);

            this._refreshItemsTableBindings(this.getComponentModel("Request").getProperty(sItemPath + "/ItemType"));

            // Set request change flag
            this.setRequestChangedFlag(true);

        },

        /**
         * Handle change event on item markup input
         * 
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onChangeItemMarkup: function(oEvent) {

            var sItemPath = oEvent.getSource().getBindingContext("Request").getPath();

            // Update Item TotalAmount
            miscellaneous.updateItemTotalAmount.call(this, sItemPath);

            this._refreshItemsTableBindings(this.getComponentModel("Request").getProperty(sItemPath + "/ItemType"));

            // Set request change flag
            this.setRequestChangedFlag(true);

        },

        /**
         * Handle press event on request action button
         * 
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onPressRequestAction: function(oEvent) {

            var oButton = oEvent.getSource();
            var sActionId = oButton.data("actionId");

            this._InitiateRequestActionDialog(sActionId);

        },

        /**
         * Initiate dialog on request action
         * 
         * @param {string}
         *                sActionId the user action on request
         * @public
         */
        _InitiateRequestActionDialog: function(sActionId) {

            var sState = sap.ui.core.ValueState.None,
            	oText = {},
                oTextArea = {},
                oRadionButtonRejectIssuer = {},
                oRadionButtonRejectReceiver = {},
                oButtonConfirm = {},
                oIssuerSubmitStep = {},
                oReceiverApproveStep = {},
                sRequestId, oRequest = {},
                oRequestActions = {},
                sTitle, sText, sTextRBRejectIssuer = "",
                sTextRBRejectReceiver = "",
                sPlaceholder,
                bTextAreaVisible = false,
                bRGBVisible = false,
                bBtnConfirmEnabled = false,
                bIsDeadlinePassed = false,
                sAppType = this.getAppType(),
                sIntercoType = this.getIntercoType(),
                aWorkflowHistory = this.getComponentModel("Request").getProperty("/WorkflowHistory/results");

            // create delete request responsive popover
            if (!this._oRequestActionPopover) {
                this._oRequestActionPopover = sap.ui.xmlfragment(this.createId("frgtRequestActionDialog"), "cus.fi.timi.rel.view.fragment.RequestActionPopup", this);
                this.getView().addDependent(this._oRequestActionPopover);
            }

            oRequest = this.getComponentModel("Request");
            oRequestActions = oRequest.getProperty("/Actions");
            sRequestId = oRequest.getProperty("/HeaderData/RequestId");

            oText = this.byId(sap.ui.core.Fragment.createId("frgtRequestActionDialog", "tActionText"));
            oTextArea = this.byId(sap.ui.core.Fragment.createId("frgtRequestActionDialog", "taActionComment"));
            oRadionButtonRejectIssuer = this.byId(sap.ui.core.Fragment.createId("frgtRequestActionDialog", "rbRejectIssuer"));
            oRadionButtonRejectReceiver = this.byId(sap.ui.core.Fragment.createId("frgtRequestActionDialog", "rbRejectReceiver"));
            oButtonConfirm = this.byId(sap.ui.core.Fragment.createId("frgtRequestActionDialog", "btnRequestActionConfirm"));

            // Attach action id to the dialog
            this._oRequestActionPopover.data("ActionId", sActionId);

            // Clear Comments value
            oTextArea.setValue("");

            // TextArea change event function handler
            var fnonChangeTextArea = function(oEvent, oButtonConfirm) {
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

            // Text class is normal
            if (oText.hasStyleClass("sapThemeCriticalText") == true) {
                oText.removeStyleClass("sapThemeCriticalText");
            }

            switch (sActionId) {
                case parameters.getActionList().Save:
                    sTitle = this.oBundle.getText("request.popup.title.save");
                    sText = this.oBundle.getText("request.popup.text.save", sRequestId);
                    sPlaceholder = "";
                    bTextAreaVisible = false;
                    bRGBVisible = false;
                    bBtnConfirmEnabled = true;
                    break;
                case parameters.getActionList().Submit:
                    //Check deadline date is not passed
//                    bIsDeadlinePassed = businessRules.checkIssuerDeadlineIsPassed.call(this);
                	bIsDeadlinePassed = businessRules.checkDeadlineIsPassed.call(this);
                    if (bIsDeadlinePassed === true) { //Deadline has passed
                        sText = this.oBundle.getText("overview.deadlinemesssage.issuerapp.passed");
                        sPlaceholder = "";
                        bTextAreaVisible = false;
                        bRGBVisible = false;
                        bBtnConfirmEnabled = false;
                    } else {
                        sText = this.oBundle.getText("request.popup.text.submit", sRequestId);
                        sPlaceholder = this.oBundle.getText("request.popup.placeholder.optional", sRequestId);
                        bTextAreaVisible = true;
                        bRGBVisible = false;
                        bBtnConfirmEnabled = true;
                    }
                    sTitle = this.oBundle.getText("request.popup.title.submit");
                    break;
                case parameters.getActionList().Approve:
                    //Check deadline date is not passed
//                    bIsDeadlinePassed = businessRules.checkReceiverDeadlineIsPassed.call(this);
            		bIsDeadlinePassed = businessRules.checkDeadlineIsPassed.call(this);
                    if (bIsDeadlinePassed === true) { //Deadline has passed
                        sText = this.oBundle.getText("overview.deadlinemesssage.receiverapp.passed");
                        sPlaceholder = ""
                        bTextAreaVisible = false;
                        bRGBVisible = false;
                        bBtnConfirmEnabled = false;
                    } else {
                        sText = this.oBundle.getText("request.popup.text.approve", sRequestId);
                        sPlaceholder = this.oBundle.getText("request.popup.placeholder.optional", sRequestId);
                        bTextAreaVisible = true;
                        bRGBVisible = false;
                        bBtnConfirmEnabled = true;
                    }
                    sTitle = this.oBundle.getText("request.popup.title.approve");
                    break;
                case parameters.getActionList().RejectIssuer:
                case parameters.getActionList().RejectReceiver:
                    sTitle = this.oBundle.getText("request.popup.title.reject");
                    sText = this.oBundle.getText("request.popup.text.reject", sRequestId);
                    sPlaceholder = this.oBundle.getText("request.popup.placeholder.mandatory", sRequestId);
                    bTextAreaVisible = true;
                    bBtnConfirmEnabled = false;
                    oTextArea.attachChange(oButtonConfirm, fnonChangeTextArea, this);
                    if (oRequestActions.VisibleRejectIssuer 
                        && oRequestActions.VisibleRejectReceiver 
                        && businessRules.isAppAccountant(this.getAppType())) {
                        bRGBVisible = true;
                    } else {
                        bRGBVisible = false;
                    }
                    if (bRGBVisible) {
                        // As the workflow history is sorted from newest action to the oldest -> look for the first submit and approve action to get the latest
                        oIssuerSubmitStep = utilities.findFirstItem(aWorkflowHistory, "ActionId", parameters.getActionList().Submit);
                        oReceiverApproveStep = utilities.findFirstItem(aWorkflowHistory, "ActionId", parameters.getActionList().Approve);
                        if (oIssuerSubmitStep.IsSubstitution === true) {
                            sTextRBRejectIssuer = this.oBundle.getText("request.popup.text.reject.issuer", oIssuerSubmitStep.UserOriginName);
                        } else {
                            sTextRBRejectIssuer = this.oBundle.getText("request.popup.text.reject.issuer", oIssuerSubmitStep.UserCreationName);
                        }
                        if (oReceiverApproveStep.IsSubstitution === true) {
                            sTextRBRejectReceiver = this.oBundle.getText("request.popup.text.reject.receiver", oReceiverApproveStep.UserOriginName);
                        } else {
                            sTextRBRejectReceiver = this.oBundle.getText("request.popup.text.reject.receiver", oReceiverApproveStep.UserCreationName);
                        }
                    }
                    break;
                case parameters.getActionList().Delete:
                    sTitle = this.oBundle.getText("request.popup.title.delete");
                    sText = this.oBundle.getText("request.popup.text.delete", sRequestId);
                    sPlaceholder = "";
                    bTextAreaVisible = false;
                    bRGBVisible = false;
                    bBtnConfirmEnabled = true;
                    break;
                case parameters.getActionList().Reclaim:
                    sTitle = this.oBundle.getText("request.popup.title.reclaim");
                    sText = this.oBundle.getText("request.popup.text.reclaim", sRequestId);
                    sPlaceholder = "";
                    bTextAreaVisible = false;
                    bRGBVisible = false;
                    bBtnConfirmEnabled = true;
                    break;
                case parameters.getActionList().Validate:
                case parameters.getActionList().ValidateRA:
                    sTitle = this.oBundle.getText("request.popup.title.validate");
                    sText = this.oBundle.getText("request.popup.text.validate", sRequestId);
                    sPlaceholder = "";
                    bTextAreaVisible = false;
                    bRGBVisible = false;
                    bBtnConfirmEnabled = true;
                    break;
                case parameters.getActionList().Generate:
                    sTitle = this.oBundle.getText("request.popup.title.generate");
                    if (oRequest.getProperty("/StatusId") === parameters.getStatusList().Generated) {
                        sText = this.oBundle.getText("request.popup.text.regenerate", sRequestId);
                        oText.addStyleClass("sapThemeCriticalText");
                        sState = sap.ui.core.ValueState.Warning;
                    } else {
                        sText = this.oBundle.getText("request.popup.text.generate", sRequestId);
                    }
                    sPlaceholder = "";
                    bTextAreaVisible = false;
                    bRGBVisible = false;
                    bBtnConfirmEnabled = true;
                    break;
                default:
                    break;
            }

            this._oRequestActionPopover.setTitle(sTitle);
            this._oRequestActionPopover.setState(sState);
            oText.setText(sText);
            oTextArea.setVisible(bTextAreaVisible);
            oTextArea.setPlaceholder(sPlaceholder);
            oRadionButtonRejectIssuer.setVisible(bRGBVisible);
            oRadionButtonRejectReceiver.setVisible(bRGBVisible);
            oRadionButtonRejectIssuer.setText(sTextRBRejectIssuer);
            oRadionButtonRejectReceiver.setText(sTextRBRejectReceiver);
            oButtonConfirm.setEnabled(bBtnConfirmEnabled);
            this._oRequestActionPopover.open();
        },

        /**
         * Handles press confirmation on action request popup
         * 
         * @event
         * @param {eventObject} oEvent the event data
         * @public
         */
        onPressConfirmRequestAction: function(oEvent) {

            var sActionId = this._oRequestActionPopover.data("ActionId"),
                sAppType = this.getAppType(),
                sIntercoType = this.getIntercoType(),
                oRequest = this.getComponentModel("Request"),
                sRequestId = oRequest.getProperty("/HeaderData/RequestId"),
                oRequestActions = oRequest.getProperty("/Actions"),
                oTextArea = this.byId(sap.ui.core.Fragment.createId("frgtRequestActionDialog", "taActionComment")),
                sComments = oTextArea.getValue(),
                oRadionButtonRejectIssuer = this.byId(sap.ui.core.Fragment.createId("frgtRequestActionDialog", "rbRejectIssuer")),
                oRadionButtonRejectReceiver = this.byId(sap.ui.core.Fragment.createId("frgtRequestActionDialog", "rbRejectReceiver"));

            if (oRequestActions.VisibleRejectIssuer &&
                oRequestActions.VisibleRejectReceiver &&
                businessRules.isAppAccountant(this.getAppType()) && 
                (sActionId === parameters.getActionList().RejectIssuer || sActionId === parameters.getActionList().RejectReceiver)) {
                // Get Action id Data bound to the radiobutton 
                if (oRadionButtonRejectIssuer.getSelected() === true) {
                    sActionId = oRadionButtonRejectIssuer.data("actionId");
                } else if (oRadionButtonRejectReceiver.getSelected() === true) {
                    sActionId = oRadionButtonRejectReceiver.data("actionId");
                }
            }

            // close dialog
            this._oRequestActionPopover.close();

            switch (sActionId) {
                case parameters.getActionList().Save: //Save + Apply
                    busy.setBusyOn();
                    this._asyncSaveRequestData.apply(this)
                        .then(this._asyncApplyRequestDecision.bind(this, sIntercoType, sAppType, sRequestId, sActionId, sComments))
                        .catch(messageHelper.showODataFailedMessages.bind(this))
                        .then(function() {
                            busy.setBusyOff();
                        });
                    break;
                case parameters.getActionList().Submit: //Save + Check + Apply
                case parameters.getActionList().Approve: //Save + Check + Apply
                case parameters.getActionList().Validate: //Save + Check + Apply
                case parameters.getActionList().ValidateRA: //Save + Check + Apply
                    busy.setBusyOn();
                	this._asyncSaveRequestData.apply(this)
                        .then(this._asyncCheckRequest.bind(this, sRequestId, sActionId))
                        .then(this._asyncSaveRequestData.bind(this))
                        .then(this._asyncApplyRequestDecision.bind(this, sIntercoType, sAppType, sRequestId, sActionId, sComments))
                        .catch(messageHelper.showODataFailedMessages.bind(this))
                        .then(function() {
                        	busy.setBusyOff();
                        });                	
                    break;
                case parameters.getActionList().RejectIssuer: //Apply
                case parameters.getActionList().RejectReceiver: //Apply
                case parameters.getActionList().Delete: //Apply
                case parameters.getActionList().Reclaim: //Apply
                    busy.setBusyOn();
                    this._asyncApplyRequestDecision.call(this, sIntercoType, sAppType, sRequestId, sActionId, sComments)
                        .catch(messageHelper.showODataFailedMessages.bind(this))
                        .then(function() {
                            busy.setBusyOff();
                        });
                    break;
                case parameters.getActionList().Generate: //Posting
                    busy.setBusyOn();
                    this._asyncPostRequest.call(this, sIntercoType, sAppType, sRequestId)
                        .catch(messageHelper.showODataFailedMessages.bind(this))
                        .then(function() {
                            busy.setBusyOff();
                        });
                    break;
                default:
                    break;
            }

        },

        /**
         * Save request data into SAP
         * 
         * @param {boolean} bSaveOnly the boolean meaning whether it is only a save or it is a save before a user action (submit/approve/validate)
         * @private
         * @returns {object} promise
         */
        _asyncSaveRequestData: function() {

            var oRequest = {}, oRequestItem = {}, oAttachment = {}, i = 0,
                aBatchOperations = [],
                oRequestData = this.getComponentModel("Request").getData(),
                aIssuingItems = this.getComponentModel("Request").getProperty("/IssuingItems/results"),
                aReceivingItems = this.getComponentModel("Request").getProperty("/ReceivingItems/results"),
                aIssuingWTax = this.getComponentModel("Request").getProperty("/IssuingWithholdingTax/results"),
                aReceivingWTax = this.getComponentModel("Request").getProperty("/ReceivingWithholdingTax/results"),
                aAttachments = this.getComponentModel("Request").getProperty("/Attachments/results"),
                aAttachmentsToDelete = this.getComponentModel("Request").getProperty("/AttachmentsToDelete/results"),
                iCountIssuingItems = aIssuingItems.length,
                iCountReceivingItems = aReceivingItems.length,
                iCountIssuingWTax = aIssuingWTax.length,
                iCountReceivingWTax = aReceivingWTax.length,
                iCountAttachments = aAttachments !== undefined ? aAttachments.length : 0,
                iCountAttachmentsToDelete = aAttachmentsToDelete !== undefined ? aAttachmentsToDelete.length : 0;
            
            function fnCorrectDate(oDate){
            	if(oDate){
            		oDate.setMinutes(oDate.getMinutes() - oDate.getTimezoneOffset());
            	}
            }
            
            oRequest = odataService.createODataEntityObject(this.oDataModel, "Request", []);

            // Update RequestCollection
            utilities.copyProperties(oRequest, oRequestData);
            oRequest.HeaderData.Amount = formatterFormat.formatSAPAmount(oRequest.HeaderData.Amount.toString());
            oRequest.HeaderData.IsTaxReportingDate = oRequestData.HeaderData.IsTaxReportingDate;
            oRequest.HeaderData.RcTaxReportingDate = oRequestData.HeaderData.RcTaxReportingDate;
            oRequest.HeaderData.IsInvoiceReceiptDate = oRequestData.HeaderData.IsInvoiceReceiptDate;
            oRequest.HeaderData.RcInvoiceReceiptDate = oRequestData.HeaderData.RcInvoiceReceiptDate;
            
            fnCorrectDate(oRequest.HeaderData.IsTaxReportingDate);
            fnCorrectDate(oRequest.HeaderData.RcTaxReportingDate);
            fnCorrectDate(oRequest.HeaderData.IsInvoiceReceiptDate);
            fnCorrectDate(oRequest.HeaderData.RcInvoiceReceiptDate);
            
            oRequest.ApplicationType = this.getAppType();
            oRequest.HeaderData.IntercoTypeCode = this.getIntercoType();

            aBatchOperations.push({
                path: "/RequestCollection(TypeId='" + oRequest.TypeId + "',RequestId='" + oRequest.RequestId + "')",
                data: oRequest
            });

            // Update Request Issuing Items
            for (i = 0; i < iCountIssuingItems; i++) {
                oRequestItem = aIssuingItems[i];
                oRequestItem.Percentage = formatterFormat.formatSAPAmount(oRequestItem.Percentage.toString());
                oRequestItem.Amount = formatterFormat.formatSAPAmount(oRequestItem.Amount.toString());
                oRequestItem.Markup = formatterFormat.formatSAPAmount(oRequestItem.Markup.toString());
                oRequestItem.TotalAmount = formatterFormat.formatSAPAmount(oRequestItem.TotalAmount.toString());
                aBatchOperations.push({
                    path: "/RequestIssuingItemCollection(TypeId='" + oRequestItem.TypeId + "',RequestId='" + oRequestItem.RequestId + "',ItemType='" + oRequestItem.ItemType + "',ItemId='" + oRequestItem.ItemId + "')",
                    data: oRequestItem
                });
            }

            // Update Request Receiving Items
            for (i = 0; i < iCountReceivingItems; i++) {
                oRequestItem = aReceivingItems[i];
                oRequestItem.Percentage = formatterFormat.formatSAPAmount(oRequestItem.Percentage.toString());
                oRequestItem.Amount = formatterFormat.formatSAPAmount(oRequestItem.Amount.toString());
                oRequestItem.Markup = formatterFormat.formatSAPAmount(oRequestItem.Markup.toString());
                oRequestItem.TotalAmount = formatterFormat.formatSAPAmount(oRequestItem.TotalAmount.toString());
                aBatchOperations.push({
                    path: "/RequestReceivingItemCollection(TypeId='" + oRequestItem.TypeId + "',RequestId='" + oRequestItem.RequestId + "',ItemType='" + oRequestItem.ItemType + "',ItemId='" + oRequestItem.ItemId + "')",
                    data: oRequestItem
                });
            }

            // Update Request Issuing Withholding Tax
            for (i = 0; i < iCountIssuingWTax; i++) {
                oRequestItem = aIssuingWTax[i];
                oRequestItem.BaseAmount = formatterFormat.formatSAPAmount(oRequestItem.BaseAmount.toString());
                oRequestItem.TaxAmount = formatterFormat.formatSAPAmount(oRequestItem.TaxAmount.toString());
                delete oRequestItem.WithholdingTaxCodes;
                aBatchOperations.push({
                    path: "/RequestIssuingWithholdingTaxCollection(RequestId='" + oRequestItem.RequestId + "',WTaxType='" + oRequestItem.WTaxType + "')",
                    data: oRequestItem
                });
            }

            // Update Request Receiving Withholding Tax
            for (i = 0; i < iCountReceivingWTax; i++) {
                oRequestItem = aReceivingWTax[i];
                oRequestItem.BaseAmount = formatterFormat.formatSAPAmount(oRequestItem.BaseAmount.toString());
                oRequestItem.TaxAmount = formatterFormat.formatSAPAmount(oRequestItem.TaxAmount.toString());
                delete oRequestItem.WithholdingTaxCodes;
                aBatchOperations.push({
                    path: "/RequestReceivingWithholdingTaxCollection(RequestId='" + oRequestItem.RequestId + "',WTaxType='" + oRequestItem.WTaxType + "')",
                    data: oRequestItem
                });
            }

            // Update Attachments 
            for (i = 0; i < iCountAttachments; i++) {
                oAttachment = aAttachments[i];
                oAttachment.FileSize = oAttachment.FileSize.toString();
                aBatchOperations.push({
                    path: "/AttachmentCollection('" + oAttachment.FolderId + "')",
                    data: oAttachment
                });
            }

            // Update Attachments To Delete
            for (i = 0; i < iCountAttachmentsToDelete; i++) {
                oAttachment = aAttachmentsToDelete[i];
                oAttachment.FileSize = oAttachment.FileSize.toString();
                aBatchOperations.push({
                    path: "/AttachmentCollection('" + oAttachment.FolderId + "')",
                    data: oAttachment
                });
            }

            return odataService.batchUpdate.call(this, "updateRequest", aBatchOperations);

        },

        _asyncApplyRequestDecision: function(sIntercoType, sApplicationType, sRequestId, sActionId, sComments) {

            var oUrlParameters = {
                "IntercoType": sIntercoType,
                "ApplicationType": sApplicationType,
                "RequestId": sRequestId,
                "ActionId": sActionId,
                "Comments": sComments
            };

            return odataService.applyRequestDecision.call(this, oUrlParameters)
                .then(this._handleApplyRequestDecision.bind(this));

        },

        _handleApplyRequestDecision: function(oData) {

            var sActionId = this._oRequestActionPopover.data("ActionId"),
                oRequestData = oData.results[0];

            switch (sActionId) {
                case parameters.getActionList().Save:
                    messageHelper.showMessageToast(this.oBundle.getText("request.save.success", oRequestData.HeaderData.RequestId));
                    this.getOwnerComponent().getEventBus().publish("cus.fi.timi.rel", "refreshRequestData", oRequestData.HeaderData.RequestId);
                    break;
                case parameters.getActionList().Submit:
                    messageHelper.showMessageToast(this.oBundle.getText("request.submit.success", oRequestData.HeaderData.RequestId));
                    routerHelper.navToDefault.apply(this);
                    break;
                case parameters.getActionList().Approve:
                    messageHelper.showMessageToast(this.oBundle.getText("request.approve.success", oRequestData.HeaderData.RequestId));
                    routerHelper.navToDefault.apply(this);
                    break;
                case parameters.getActionList().RejectIssuer:
                    messageHelper.showMessageToast(this.oBundle.getText("request.reject.success", oRequestData.HeaderData.RequestId));
                    routerHelper.navToDefault.apply(this);
                    break;
                case parameters.getActionList().Delete:
                    messageHelper.showMessageToast(this.oBundle.getText("request.delete.success", oRequestData.HeaderData.RequestId));
                    routerHelper.navToDefault.apply(this);
                    break;
                case parameters.getActionList().Reclaim:
                    messageHelper.showMessageToast(this.oBundle.getText("request.reclaim.success", oRequestData.HeaderData.RequestId));
                    this.getOwnerComponent().getEventBus().publish("cus.fi.timi.rel", "refreshRequestData", oRequestData.HeaderData.RequestId);
                    break;
                case parameters.getActionList().Validate:
                case parameters.getActionList().ValidateRA:
                    messageHelper.showMessageToast(this.oBundle.getText("request.validate.success", oRequestData.HeaderData.RequestId));
                    this.getOwnerComponent().getEventBus().publish("cus.fi.timi.rel", "refreshRequestData", oRequestData.HeaderData.RequestId);
                    break;
                case parameters.getActionList().RejectReceiver:
                    messageHelper.showMessageToast(this.oBundle.getText("request.reject.success", oRequestData.HeaderData.RequestId));
                    routerHelper.navToDefault.apply(this);
                    break;
                default:
                    break;
            }

        },

        _asyncCheckRequest: function(sRequestId, sActionId) {

            var aFilters = [];

            aFilters.push(new Filter("RequestId", FilterOperator.EQ, sRequestId));
            aFilters.push(new Filter("ApplicationType", FilterOperator.EQ, this.getAppType()));
            aFilters.push(new Filter("Filters/IntercoType", FilterOperator.EQ, this.getIntercoType()));

            return odataService.checkRequest.call(this, sActionId, aFilters)
                .then(function(oData) {

                    var oRequestData = oData.results[0],
                        aContent = oRequestData.Messages.results,
                        aMessages = [];

                    if (aContent.length > 0) {

                        // Set JSON Model
                        this.setComponentModel(new JSONModel(oRequestData), "Request");
                        this._applyRequestCustomerVendorCustomState();

                        // Set Messages
                        messageHelper.setRequestMessagesModel.call(this, aContent);

                        aMessages = aContent.map(function(oMessage) {
                            return oMessage.Message;
                        })

                        throw {
                            "title": this.oBundle.getText("messagebox.error.title"),
                            "messages": aMessages
                        };
                    }else{
                        // Set JSON Model
                        this.setComponentModel(new JSONModel(oRequestData), "Request");
                        this._applyRequestCustomerVendorCustomState();
                    }

                    return null;

                }.bind(this))

        },

        _asyncPostRequest: function(sIntercoType, sApplicationType, sRequestId) {

            var oUrlParameters = {
                "RequestsIdInline": sRequestId,
                "IntercoType": sIntercoType,
                "ApplicationType": sApplicationType
            }

            return odataService.generateRequests.call(this, oUrlParameters)
                .then(function(oData) {

                    var sRequestId;

                    if (oData.results.length > 0) {
                        // Exports data
                        exports.exportPostingFileCSV.call(this, oData.results);
                        sRequestId = oData.results[0].RequestId;
                    }

                    routerHelper.navToDefault.apply(this);

                }.bind(this))

        },

        /**
         * Handles press cancel on action request popup
         * 
         * @event
         * @param {eventObject} oEvent the event data
         * @public
         */
        onPressCancelRequestAction: function(oEvent) {
            // close dialog
            this._oRequestActionPopover.close();
        },

        /**
         * Handles press on value help request receiving controller
         * 
         * @event
         * @param {eventObject} oEvent the event data
         * @public
         */
        onValueHelpReceivingController: function(oEvent) {

            var sPath = "",
                sDataFieldTypeId = parameters.getDataFieldTypeList().ReceivingController;

            tsdHelper.initiateTSD.call(this, sDataFieldTypeId, sPath, false, function(oItem) {
                requestModel.handleDataValidation.call(this, sDataFieldTypeId, sPath, oItem);
                // Set request change flag
                this.setRequestChangedFlag(true);
            }.bind(this));

        },

        /**
         * Handles press on value help request issuing SGL Indicator
         * 
         * @event
         * @param {eventObject} oEvent the event data
         * @public
         */
        onValueHelpIssuingSGLInd: function(oEvent) {

            var sPath = "",
                sDataFieldTypeId = parameters.getDataFieldTypeList().IssuingSGLInd;

            tsdHelper.initiateTSD.call(this, sDataFieldTypeId, sPath, false, function(oItem) {
                requestModel.handleDataValidation.call(this, sDataFieldTypeId, sPath, oItem);
                // Set request change flag
                this.setRequestChangedFlag(true);
            }.bind(this));

        },

        /**
         * Handles press on value help request receiving SGL Indicator
         * 
         * @event
         * @param {eventObject} oEvent the event data
         * @public
         */
        onValueHelpReceivingSGLInd: function(oEvent) {

            var sPath = "",
                sDataFieldTypeId = parameters.getDataFieldTypeList().ReceivingSGLInd;

            tsdHelper.initiateTSD.call(this, sDataFieldTypeId, sPath, false, function(oItem) {
                requestModel.handleDataValidation.call(this, sDataFieldTypeId, sPath, oItem);
                // Set request change flag
                this.setRequestChangedFlag(true);
            }.bind(this));

        },

        /**
         * Handles press on value help request issuing tax
         * 
         * @event
         * @param {eventObject} oEvent the event data
         * @public
         */
        onValueHelpIssuingTax: function(oEvent) {

            var sPath = "",
                sDataFieldTypeId = parameters.getDataFieldTypeList().IssuingTax;

            tsdHelper.initiateTSD.call(this, sDataFieldTypeId, sPath, false, function(oItem) {
                requestModel.handleDataValidation.call(this, sDataFieldTypeId, sPath, oItem);
                // Set request change flag
                this.setRequestChangedFlag(true);
            }.bind(this));
        },

        /**
         * Handles press on value help request receiving tax
         * 
         * @event
         * @param {eventObject} oEvent the event data
         * @public
         */
        onValueHelpReceivingTax: function(oEvent) {

            var sPath = "",
                sDataFieldTypeId = parameters.getDataFieldTypeList().ReceivingTax;

            tsdHelper.initiateTSD.call(this, sDataFieldTypeId, sPath, false, function(oItem) {
                requestModel.handleDataValidation.call(this, sDataFieldTypeId, sPath, oItem);
                // Set request change flag
                this.setRequestChangedFlag(true);
            }.bind(this));

        },

        /**
         * Handles press on value help request issuing GMID
         * 
         * @event
         * @param {eventObject} oEvent the event data
         * @public
         */
        onValueHelpIssuingItemGMID: function(oEvent) {

            var oControlEvent = oEvent.getSource(),
                sPath = oControlEvent.getBindingContext("Request").getPath(),
                sDataFieldTypeId = parameters.getDataFieldTypeList().IssuingItemGMID;

            tsdHelper.initiateTSD.call(this, sDataFieldTypeId, sPath, false, function(oItem) {
                requestModel.handleDataValidation.call(this, sDataFieldTypeId, sPath, oItem);
                // Set request change flag
                this.setRequestChangedFlag(true);
            }.bind(this));

        },

        /**
         * Handles press on value help request receiving GMID
         * 
         * @event
         * @param {eventObject} oEvent the event data
         * @public
         */
        onValueHelpReceivingItemGMID: function(oEvent) {

            var oControlEvent = oEvent.getSource(),
                sPath = oControlEvent.getBindingContext("Request").getPath(),
                sDataFieldTypeId = parameters.getDataFieldTypeList().ReceivingItemGMID;

            tsdHelper.initiateTSD.call(this, sDataFieldTypeId, sPath, false, function(oItem) {
                requestModel.handleDataValidation.call(this, sDataFieldTypeId, sPath, oItem);
                // Set request change flag
                this.setRequestChangedFlag(true);
            }.bind(this));
        },
        
        /**
         * Handles press on value help request issuing cost center
         * 
         * @event
         * @param {eventObject} oEvent the event data
         * @public
         */
        onValueHelpIssuingItemCostCenter: function(oEvent) {

            var oControlEvent = oEvent.getSource(),
                sPath = oControlEvent.getBindingContext("Request").getPath(),
                sDataFieldTypeId = parameters.getDataFieldTypeList().IssuingItemCostCenter;

            tsdHelper.initiateTSD.call(this, sDataFieldTypeId, sPath, false, function(oItem) {
                requestModel.handleDataValidation.call(this, sDataFieldTypeId, sPath, oItem);
                // Set request change flag
                this.setRequestChangedFlag(true);
            }.bind(this));

        },

        /**
         * Handles press on value help request receiving cost center
         * 
         * @event
         * @param {eventObject} oEvent the event data
         * @public
         */
        onValueHelpReceivingItemCostCenter: function(oEvent) {

            var oControlEvent = oEvent.getSource(),
                sPath = oControlEvent.getBindingContext("Request").getPath(),
                sDataFieldTypeId = parameters.getDataFieldTypeList().ReceivingItemCostCenter;

            tsdHelper.initiateTSD.call(this, sDataFieldTypeId, sPath, false, function(oItem) {
                requestModel.handleDataValidation.call(this, sDataFieldTypeId, sPath, oItem);
                // Set request change flag
                this.setRequestChangedFlag(true);
            }.bind(this));
        },

        /**
         * Handles press on value help request nature
         * 
         * @event
         * @param {eventObject} oEvent the event data
         * @public
         */
        onValueHelpIssuingItemNature: function(oEvent) {

            var oControlEvent = oEvent.getSource(),
                sPath = oControlEvent.getBindingContext("Request").getPath(),
                sDataFieldTypeId = parameters.getDataFieldTypeList().IssuingItemNature;

            tsdHelper.initiateTSD.call(this, sDataFieldTypeId, sPath, false, function(oItem) {
                requestModel.handleDataValidation.call(this, sDataFieldTypeId, sPath, oItem);
                // Set request change flag
                this.setRequestChangedFlag(true);
            }.bind(this));

        },

        /**
         * Handles press on value help request nature
         * 
         * @event
         * @param {eventObject} oEvent the event data
         * @public
         */
        onValueHelpReceivingItemNature: function(oEvent) {

            var oControlEvent = oEvent.getSource(),
                sPath = oControlEvent.getBindingContext("Request").getPath(),
                sDataFieldTypeId = parameters.getDataFieldTypeList().ReceivingItemNature;

            tsdHelper.initiateTSD.call(this, sDataFieldTypeId, sPath, false, function(oItem) {
                requestModel.handleDataValidation.call(this, sDataFieldTypeId, sPath, oItem);
                // Set request change flag
                this.setRequestChangedFlag(true);
            }.bind(this));

        },

        /**
         * Handles press on value help request issuing item gl account
         * 
         * @event
         * @param {eventObject} oEvent the event data
         * @public
         */
        onValueHelpIssuingItemAccount: function(oEvent) {

            var oControlEvent = oEvent.getSource(),
                sPath = oControlEvent.getBindingContext("Request").getPath(),
                sDataFieldTypeId = parameters.getDataFieldTypeList().IssuingItemAccount;

            tsdHelper.initiateTSD.call(this, sDataFieldTypeId, sPath, false, function(oItem) {
                requestModel.handleDataValidation.call(this, sDataFieldTypeId, sPath, oItem);
                // Set request change flag
                this.setRequestChangedFlag(true);
            }.bind(this));

        },

        /**
         * Handles press on value help request receiving item gl account
         * 
         * @event
         * @param {eventObject} oEvent the event data
         * @public
         */

        onValueHelpReceivingItemAccount: function(oEvent) {

            var oControlEvent = oEvent.getSource(),
                sPath = oControlEvent.getBindingContext("Request").getPath(),
                sDataFieldTypeId = parameters.getDataFieldTypeList().ReceivingItemAccount;

            tsdHelper.initiateTSD.call(this, sDataFieldTypeId, sPath, false, function(oItem) {
                requestModel.handleDataValidation.call(this, sDataFieldTypeId, sPath, oItem);
                // Set request change flag
                this.setRequestChangedFlag(true);
            }.bind(this));

        },

        /**
         * Handles press on value help request issuing item tax
         * 
         * @event
         * @param {eventObject} oEvent the event data
         * @public
         */
        onValueHelpIssuingItemTax: function(oEvent) {

            var oControlEvent = oEvent.getSource(),
                sPath = oControlEvent.getBindingContext("Request").getPath(),
                sDataFieldTypeId = parameters.getDataFieldTypeList().IssuingItemTax;

            tsdHelper.initiateTSD.call(this, sDataFieldTypeId, sPath, false, function(oItem) {
                requestModel.handleDataValidation.call(this, sDataFieldTypeId, sPath, oItem);
                // Set request change flag
                this.setRequestChangedFlag(true);
            }.bind(this));

        },

        /**
         * Handles press on value help request receiving item tax
         * 
         * @event
         * @param {eventObject} oEvent the event data
         * @public
         */
        onValueHelpReceivingItemTax: function(oEvent) {

            var oControlEvent = oEvent.getSource(),
                sPath = oControlEvent.getBindingContext("Request").getPath(),
                sDataFieldTypeId = parameters.getDataFieldTypeList().ReceivingItemTax;

            tsdHelper.initiateTSD.call(this, sDataFieldTypeId, sPath, false, function(oItem) {
                requestModel.handleDataValidation.call(this, sDataFieldTypeId, sPath, oItem);
                // Set request change flag
                this.setRequestChangedFlag(true);
            }.bind(this));

        },

        /**
         * Handles press on value help request issuing item internal order
         * 
         * @event
         * @param {eventObject} oEvent the event data
         * @public
         */
        onValueHelpIssuingItemInternalOrder: function(oEvent) {

            var oControlEvent = oEvent.getSource(),
                sPath = oControlEvent.getBindingContext("Request").getPath(),
                sDataFieldTypeId = parameters.getDataFieldTypeList().IssuingItemInternalOrder;

            tsdHelper.initiateTSD.call(this, sDataFieldTypeId, sPath, false, function(oItem) {
                requestModel.handleDataValidation.call(this, sDataFieldTypeId, sPath, oItem);
                // Set request change flag
                this.setRequestChangedFlag(true);
            }.bind(this));
        },

        /**
         * Handles press on value help request receiving item internal order
         * 
         * @event
         * @param {eventObject} oEvent the event data
         * @public
         */
        onValueHelpReceivingItemInternalOrder: function(oEvent) {

            var oControlEvent = oEvent.getSource(),
                sPath = oControlEvent.getBindingContext("Request").getPath(),
                sDataFieldTypeId = parameters.getDataFieldTypeList().ReceivingItemInternalOrder;

            tsdHelper.initiateTSD.call(this, sDataFieldTypeId, sPath, false, function(oItem) {
                requestModel.handleDataValidation.call(this, sDataFieldTypeId, sPath, oItem);
                // Set request change flag
                this.setRequestChangedFlag(true);
            }.bind(this));

        },

        /**
         * Handles press on value help request issuing item wbs
         * 
         * @event
         * @param {eventObject} oEvent the event data
         * @public
         */
        onValueHelpIssuingItemWBS: function(oEvent) {

            var oControlEvent = oEvent.getSource(),
                sPath = oControlEvent.getBindingContext("Request").getPath(),
                sDataFieldTypeId = parameters.getDataFieldTypeList().IssuingItemWBS;

            tsdHelper.initiateTSD.call(this, sDataFieldTypeId, sPath, false, function(oItem) {
                requestModel.handleDataValidation.call(this, sDataFieldTypeId, sPath, oItem);
                // Set request change flag
                this.setRequestChangedFlag(true);
            }.bind(this));

        },

        /**
         * Handles press on value help request receiving item wbs
         * 
         * @event
         * @param {eventObject} oEvent the event data
         * @public
         */
        onValueHelpReceivingItemWBS: function(oEvent) {

            var oControlEvent = oEvent.getSource(),
                sPath = oControlEvent.getBindingContext("Request").getPath(),
                sDataFieldTypeId = parameters.getDataFieldTypeList().ReceivingItemWBS;

            tsdHelper.initiateTSD.call(this, sDataFieldTypeId, sPath, false, function(oItem) {
                requestModel.handleDataValidation.call(this, sDataFieldTypeId, sPath, oItem);
                // Set request change flag
                this.setRequestChangedFlag(true);
            }.bind(this));

        },

        /**
         * Handles press on value help request issuing item wbs
         * 
         * @event
         * @param {eventObject} oEvent the event data
         * @public
         */
        onValueHelpIssuingItemUnit: function(oEvent) {

            var oControlEvent = oEvent.getSource(),
                sPath = oControlEvent.getBindingContext("Request").getPath(),
                sDataFieldTypeId = parameters.getDataFieldTypeList().IssuingItemUnit;

            tsdHelper.initiateTSD.call(this, sDataFieldTypeId, sPath, false, function(oItem) {
                requestModel.handleDataValidation.call(this, sDataFieldTypeId, sPath, oItem);
                // Set request change flag
                this.setRequestChangedFlag(true);
            }.bind(this));

        },

        /**
         * Handles press on value help request receiving item wbs
         * 
         * @event
         * @param {eventObject} oEvent the event data
         * @public
         */
        onValueHelpReceivingItemUnit: function(oEvent) {

            var oControlEvent = oEvent.getSource(),
                sPath = oControlEvent.getBindingContext("Request").getPath(),
                sDataFieldTypeId = parameters.getDataFieldTypeList().ReceivingItemUnit;

            tsdHelper.initiateTSD.call(this, sDataFieldTypeId, sPath, false, function(oItem) {
                requestModel.handleDataValidation.call(this, sDataFieldTypeId, sPath, oItem);
                // Set request change flag
                this.setRequestChangedFlag(true);
            }.bind(this));

        },       

        /**
         * Handles press on value help request issuing item business area
         * 
         * @event
         * @param {eventObject} oEvent the event data
         * @public
         */
        onValueHelpIssuingItemBusinessArea: function(oEvent) {

            var oControlEvent = oEvent.getSource(),
                sPath = oControlEvent.getBindingContext("Request").getPath(),
                sDataFieldTypeId = parameters.getDataFieldTypeList().IssuingItemBusinessArea;

            tsdHelper.initiateTSD.call(this, sDataFieldTypeId, sPath, false, function(oItem) {
                requestModel.handleDataValidation.call(this, sDataFieldTypeId, sPath, oItem);
                // Set request change flag
                this.setRequestChangedFlag(true);
            }.bind(this));

        },

        /**
         * Handles press on value help request receiving item business place
         * 
         * @event
         * @param {eventObject} oEvent the event data
         * @public
         */
        onValueHelpReceivingBusinessPlace: function(oEvent) {

            var oControlEvent = oEvent.getSource(),
                sPath = '',
                sDataFieldTypeId = parameters.getDataFieldTypeList().ReceivingBusinessPlace;

            tsdHelper.initiateTSD.call(this, sDataFieldTypeId, sPath, false, function(oItem) {
                requestModel.handleDataValidation.call(this, sDataFieldTypeId, sPath, oItem);
                // Set request change flag
                this.setRequestChangedFlag(true);
            }.bind(this));

        },       

        /**
         * Handles press on value help request issuing item business place
         * 
         * @event
         * @param {eventObject} oEvent the event data
         * @public
         */
        onValueHelpIssuingBusinessPlace: function(oEvent) {

            var oControlEvent = oEvent.getSource(),
                sPath = '',
                sDataFieldTypeId = parameters.getDataFieldTypeList().IssuingBusinessPlace;

            tsdHelper.initiateTSD.call(this, sDataFieldTypeId, sPath, false, function(oItem) {
                requestModel.handleDataValidation.call(this, sDataFieldTypeId, sPath, oItem);
                // Set request change flag
                this.setRequestChangedFlag(true);
            }.bind(this));

        },

        /**
         * Handles press on value help request receiving item business place
         * 
         * @event
         * @param {eventObject} oEvent the event data
         * @public
         */
        onValueHelpReceivingBusinessAreaAlt: function(oEvent) {

            var oControlEvent = oEvent.getSource(),
                sPath = '',
                sDataFieldTypeId = parameters.getDataFieldTypeList().ReceivingBusinessAreaAlt;

            tsdHelper.initiateTSD.call(this, sDataFieldTypeId, sPath, false, function(oItem) {
                requestModel.handleDataValidation.call(this, sDataFieldTypeId, sPath, oItem);
                // Set request change flag
                this.setRequestChangedFlag(true);
            }.bind(this));

        },       

        /**
         * Handles press on value help request issuing item business place
         * 
         * @event
         * @param {eventObject} oEvent the event data
         * @public
         */
        onValueHelpIssuingBusinessAreaAlt: function(oEvent) {

            var oControlEvent = oEvent.getSource(),
                sPath = '',
                sDataFieldTypeId = parameters.getDataFieldTypeList().IssuingBusinessAreaAlt;

            tsdHelper.initiateTSD.call(this, sDataFieldTypeId, sPath, false, function(oItem) {
                requestModel.handleDataValidation.call(this, sDataFieldTypeId, sPath, oItem);
                // Set request change flag
                this.setRequestChangedFlag(true);
            }.bind(this));

        },
        
        /**
         * Handles press on value help request receiving item hsn sac
         * 
         * @event
         * @param {eventObject} oEvent the event data
         * @public
         */
        onValueHelpReceivingItemHsnSac: function(oEvent) {

            var oControlEvent = oEvent.getSource(),
                sPath = oControlEvent.getBindingContext("Request").getPath(),
                sDataFieldTypeId = parameters.getDataFieldTypeList().ReceivingItemHsnSac;

            tsdHelper.initiateTSD.call(this, sDataFieldTypeId, sPath, false, function(oItem) {
                requestModel.handleDataValidation.call(this, sDataFieldTypeId, sPath, oItem);
                // Set request change flag
                this.setRequestChangedFlag(true);
            }.bind(this));

        },       

        /**
         * Handles press on value help request issuing item hsn sac
         * 
         * @event
         * @param {eventObject} oEvent the event data
         * @public
         */
        onValueHelpIssuingItemHsnSac: function(oEvent) {

            var oControlEvent = oEvent.getSource(),
                sPath = oControlEvent.getBindingContext("Request").getPath(),
                sDataFieldTypeId = parameters.getDataFieldTypeList().IssuingItemHsnSac;

            tsdHelper.initiateTSD.call(this, sDataFieldTypeId, sPath, false, function(oItem) {
                requestModel.handleDataValidation.call(this, sDataFieldTypeId, sPath, oItem);
                // Set request change flag
                this.setRequestChangedFlag(true);
            }.bind(this));

        },

        /**
         * Handles press on value help request receiving item business area
         * 
         * @event
         * @param {eventObject} oEvent the event data
         * @public
         */
        onValueHelpReceivingItemBusinessArea: function(oEvent) {

            var oControlEvent = oEvent.getSource(),
                sPath = oControlEvent.getBindingContext("Request").getPath(),
                sDataFieldTypeId = parameters.getDataFieldTypeList().ReceivingItemBusinessArea;

            tsdHelper.initiateTSD.call(this, sDataFieldTypeId, sPath, false, function(oItem) {
                requestModel.handleDataValidation.call(this, sDataFieldTypeId, sPath, oItem);
                // Set request change flag
                this.setRequestChangedFlag(true);
            }.bind(this));

        },      
        
        /**
         * Handles selection change on vendor
         * 
         * @event
         * @param {eventObject} oEvent the event data
         * @public
         */
        onSelectionChangeVendor: function(oEvent) {

            var oRequestModel = this.getComponentModel("Request"),
                sRequestId = oRequestModel.getProperty("/HeaderData/RequestId"),
                oSelectedVendor = oEvent.getParameters().selectedItem.getBindingContext("VendorCollection"),
                sDataFieldTypeIdVendor = parameters.getDataFieldTypeList().Vendor,
                sPath = "",
                aOperations = [];

            aOperations.push({
                "path": "/WithholdingTaxTypeCollection",
                "filters": [new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcLegalEntityCode")),
                    new Filter("Country", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcCountryCode")),
                    new Filter("CompanyCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcCompanyCode")),
                    new Filter("VendorCode", FilterOperator.EQ, oSelectedVendor.getProperty("VendorCode"))
                ]
            });

            aOperations.push({
                "path": "/WithholdingTaxCodeCollection",
                "filters": [new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcLegalEntityCode")),
                    new Filter("Country", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcCountryCode")),
                    new Filter("CompanyCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcCompanyCode")),
                    new Filter("VendorCode", FilterOperator.EQ, oSelectedVendor.getProperty("VendorCode")),
                    new Filter("WithholdingTaxTypeCode", FilterOperator.EQ, oSelectedVendor.getProperty("WithholdingTaxTypeCode"))
                ]
            });

            odataService.batchRead.call(this, "withholdingTaxData", aOperations)
                .then(function(oData) {
                    var aBatchResponses = oData.__batchResponses;
                    if (aBatchResponses[0].data !== undefined) {
                        this.setComponentModel(new JSONModel(aBatchResponses[0].data), "WithholdingTaxTypeCollection");
                    } else {
                        this.setComponentModel(new JSONModel(), "WithholdingTaxTypeCollection");
                    }

                    if (aBatchResponses[1].data !== undefined) {
                        this.setComponentModel(new JSONModel(aBatchResponses[1].data), "WithholdingTaxCodeCollection");
                    } else {
                        this.setComponentModel(new JSONModel(), "WithholdingTaxCodeCollection");
                    }
                }.bind(this))
                .then(this._asyncUpdatesForFieldAttributes.bind(this, "VENDOR", "HEADER_DATA", oSelectedVendor.getProperty("VendorCode"), sRequestId))
                .catch(messageHelper.showODataFailedMessages.bind(this))
                .then(function() {
                    requestModel.handleDataValidation.call(this, sDataFieldTypeIdVendor, sPath, oSelectedVendor.getObject());
                    // Set request change flag
                    this.setRequestChangedFlag(true);
                }.bind(this));

        },

        _asyncUpdatesForFieldAttributes: function(sFieldId, sFieldTable, sFieldValue, sRequestId) {

            var oUrlParameters = {
            	"IntercoType": this.getIntercoType(),	
                "ApplicationType": this.getAppType(),
                "FieldId": sFieldId,
                "FieldTable": sFieldTable,
                "FieldValue": sFieldValue,
                "RequestId": sRequestId
            };

            return odataService.updatesForFieldsAttributes.call(this, oUrlParameters)
                .then(function(oData) {

                    var aUpdFieldsAttributes = oData.results,
                        iCount = aUpdFieldsAttributes.length,
                        sFieldPath, 
                        oModel = this.getComponentModel("FieldsAttributes"),
                        sEditable = "/Editable",
                        sMandatory = "/Mandatory",
                        sVisible = "/Visible";

                    //Update each Field Attribute
                    for (var i = 0; i < iCount; i++) {
                        sFieldPath = "/" + aUpdFieldsAttributes[i].FieldTable + "/" + aUpdFieldsAttributes[i].FieldId;
                        oModel.setProperty(sFieldPath + sEditable, aUpdFieldsAttributes[i].Editable);
                        oModel.setProperty(sFieldPath + sMandatory, aUpdFieldsAttributes[i].Mandatory);
                        oModel.setProperty(sFieldPath + sVisible, aUpdFieldsAttributes[i].Visible);
                    }

                }.bind(this))

        },

        /**
         * Handles selection change on withholding tax type
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onSelectionChangeWithholdingTaxType: function(oEvent) {

            var oRequestModel = this.getComponentModel("Request"),
                aFilters = [],
                sWithholdingTaxType = oEvent.getSource().getSelectedKey();

            if (sWithholdingTaxType == '') {
                this.setComponentModel(new JSONModel(), "WithholdingTaxCodeCollection");
                requestModel.handleDataValidationFailed(parameters.getDataFieldTypeList().WithholdingTaxType, "", false);
                requestModel.handleDataValidationFailed(parameters.getDataFieldTypeList().WithholdingTaxCode, "", false);
            } else {

                aFilters = [
                	new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcLegalEntityCode")),
                    new Filter("Country", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcCountryCode")),
                    new Filter("CompanyCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcCompanyCode")),
                    new Filter("VendorCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/VendorCode")),
                    new Filter("WithholdingTaxTypeCode", FilterOperator.EQ, sWithholdingTaxType)
                ];

                odataService.queryWithholdingTaxCode.call(this, "", aFilters)
                    .then(function(oData) {
                        if (oData !== undefined) {
                            this.setComponentModel(new JSONModel(oData), "WithholdingTaxCodeCollection");
                        } else {
                            this.setComponentModel(new JSONModel(), "WithholdingTaxCodeCollection");
                        }
                    }.bind(this))
                    .catch(messageHelper.showODataFailedMessages.bind(this))
                    .then(function() {
                        requestModel.handleDataValidationFailed(parameters.getDataFieldTypeList().WithholdingTaxType, "", false);
                        requestModel.handleDataValidationFailed(parameters.getDataFieldTypeList().WithholdingTaxCode, "", false);
                        // Set request change flag
                        this.setRequestChangedFlag(true);
                    }.bind(this))

            }

        },

        /**
         * Handles change on issuing / receiving item DC Indicator
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onSelectionChangeItemDCIndicator: function(oEvent) {

            var oControlEvent = oEvent.getSource(),
                sPath = oControlEvent.getBindingContext("Request").getPath(),
                sItemType = this.getComponentModel("Request").getProperty(sPath + "/ItemType");

            // Refresh Request Header Amount
            this._refreshRequestHeaderAmount(sItemType);
            // Refresh Request Header Amount
            this._refreshRequestHeaderOffMarkupAmountText(sItemType);
            // Refresh items total amount
            this._refreshItemsTotalAmountText(sItemType);
            // Refresh items total markup amount
            this._refreshItemsTotalAmountWithMarkupText(sItemType);
            // Refresh items table title
            this._refreshItemsTableTitle(sItemType);
            // Set request change flag
            this.setRequestChangedFlag(true);
        },

        /**
         * Handles change on issuing SGL Indicator
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onChangeIssuingSGLInd: function(oEvent) {

            var sValue = oEvent.getParameter("value"),
                sPath = "",
                sDataFieldTypeId = parameters.getDataFieldTypeList().IssuingSGLInd;

            dataValidation.validateValue.call(this, sDataFieldTypeId, sValue, sPath)
                .then(requestModel.handleDataValidation.bind(this, sDataFieldTypeId, sPath))
                .catch(requestModel.handleDataValidationFailed.bind(this, sDataFieldTypeId, sPath, true))
                .then(function() {
                    // Set request change flag
                    this.setRequestChangedFlag(true);
                }.bind(this));

        },

        /**
         * Handles change on receiving SGL Indicator
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onChangeReceivingSGLInd: function(oEvent) {

            var sValue = oEvent.getParameter("value"),
                sPath = "",
                sDataFieldTypeId = parameters.getDataFieldTypeList().ReceivingSGLInd;

            dataValidation.validateValue.call(this, sDataFieldTypeId, sValue, sPath)
                .then(requestModel.handleDataValidation.bind(this, sDataFieldTypeId, sPath))
                .catch(requestModel.handleDataValidationFailed.bind(this, sDataFieldTypeId, sPath, true))
                .then(function() {
                    // Set request change flag
                    this.setRequestChangedFlag(true);
                }.bind(this));

        },

        /**
         * Handles change on issuing item GMID value
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onChangeIssuingItemGMID: function(oEvent) {

            var oControlEvent = oEvent.getSource(),
                sPath = oControlEvent.getBindingContext("Request").getPath(),
                sValue = oEvent.getParameter("value"),
                sDataFieldTypeId = parameters.getDataFieldTypeList().IssuingItemGMID;

            dataValidation.validateValue.call(this, sDataFieldTypeId, sValue, sPath)
                .then(requestModel.handleDataValidation.bind(this, sDataFieldTypeId, sPath))
                .catch(requestModel.handleDataValidationFailed.bind(this, sDataFieldTypeId, sPath, true))
                .then(function() {
                    // Set request change flag
                    this.setRequestChangedFlag(true);
                }.bind(this));

        },
        
        /**
         * Handles change on issuing item cost center value
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onChangeIssuingItemCostCenter: function(oEvent) {

            var oControlEvent = oEvent.getSource(),
                sPath = oControlEvent.getBindingContext("Request").getPath(),
                sValue = oEvent.getParameter("value"),
                sDataFieldTypeId = parameters.getDataFieldTypeList().IssuingItemCostCenter;

            dataValidation.validateValue.call(this, sDataFieldTypeId, sValue, sPath)
                .then(requestModel.handleDataValidation.bind(this, sDataFieldTypeId, sPath))
                .catch(requestModel.handleDataValidationFailed.bind(this, sDataFieldTypeId, sPath, true))
                .then(function() {
                    // Set request change flag
                    this.setRequestChangedFlag(true);
                }.bind(this));

        },

        /**
         * Handles change on issuing item nature value
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onChangeIssuingItemNature: function(oEvent) {

            var oControlEvent = oEvent.getSource(),
                sPath = oControlEvent.getBindingContext("Request").getPath(),
                sValue = oEvent.getParameter("value"),
                sDataFieldTypeId = parameters.getDataFieldTypeList().IssuingItemNature;

            dataValidation.validateValue.call(this, sDataFieldTypeId, sValue, sPath)
                .then(requestModel.handleDataValidation.bind(this, sDataFieldTypeId, sPath))
                .catch(requestModel.handleDataValidationFailed.bind(this, sDataFieldTypeId, sPath, true))
                .then(function() {
                    // Set request change flag
                    this.setRequestChangedFlag(true);
                }.bind(this));

        },

        /**
         * Handles change on issuing item account value
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onChangeIssuingItemAccount: function(oEvent) {

            var oControlEvent = oEvent.getSource(),
                sPath = oControlEvent.getBindingContext("Request").getPath(),
                sValue = oEvent.getParameter("value"),
                sDataFieldTypeId = parameters.getDataFieldTypeList().IssuingItemAccount;

            dataValidation.validateValue.call(this, sDataFieldTypeId, sValue, sPath)
                .then(requestModel.handleDataValidation.bind(this, sDataFieldTypeId, sPath))
                .catch(requestModel.handleDataValidationFailed.bind(this, sDataFieldTypeId, sPath, true))
                .then(function() {
                    // Set request change flag
                    this.setRequestChangedFlag(true);
                }.bind(this));

        },

        /**
         * Handles change on issuing item tax value
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onChangeIssuingItemTax: function(oEvent) {

            var oControlEvent = oEvent.getSource(),
                sPath = oControlEvent.getBindingContext("Request").getPath(),
                sValue = oEvent.getParameter("value"),
                sDataFieldTypeId = parameters.getDataFieldTypeList().IssuingItemTax;

            dataValidation.validateValue.call(this, sDataFieldTypeId, sValue, sPath)
                .then(requestModel.handleDataValidation.bind(this, sDataFieldTypeId, sPath))
                .catch(requestModel.handleDataValidationFailed.bind(this, sDataFieldTypeId, sPath, true))
                .then(function() {
                    // Set request change flag
                    this.setRequestChangedFlag(true);
                }.bind(this));

        },

        /**
         * Handles change on issuing item internal order  value
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onChangeIssuingItemInternalOrder: function(oEvent) {

            var oControlEvent = oEvent.getSource(),
                sPath = oControlEvent.getBindingContext("Request").getPath(),
                sValue = oEvent.getParameter("value"),
                sDataFieldTypeId = parameters.getDataFieldTypeList().IssuingItemInternalOrder;

            dataValidation.validateValue.call(this, sDataFieldTypeId, sValue, sPath)
                .then(requestModel.handleDataValidation.bind(this, sDataFieldTypeId, sPath))
                .catch(requestModel.handleDataValidationFailed.bind(this, sDataFieldTypeId, sPath, true))
                .then(function() {
                    // Set request change flag
                    this.setRequestChangedFlag(true);
                }.bind(this));

        },

        /**
         * Handles change on issuing item wbs value
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onChangeIssuingItemWBS: function(oEvent) {

            var oControlEvent = oEvent.getSource(),
                sPath = oControlEvent.getBindingContext("Request").getPath(),
                sValue = oEvent.getParameter("value"),
                sDataFieldTypeId = parameters.getDataFieldTypeList().IssuingItemWBS;

            dataValidation.validateValue.call(this, sDataFieldTypeId, sValue, sPath)
                .then(requestModel.handleDataValidation.bind(this, sDataFieldTypeId, sPath))
                .catch(requestModel.handleDataValidationFailed.bind(this, sDataFieldTypeId, sPath, true))
                .then(function() {
                    // Set request change flag
                    this.setRequestChangedFlag(true);
                }.bind(this));

        },

        /**
         * Handles change on issuing item business area value
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onChangeIssuingItemBusinessArea: function(oEvent) {

            var oControlEvent = oEvent.getSource(),
                sPath = oControlEvent.getBindingContext("Request").getPath(),
                sValue = oEvent.getParameter("value"),
                sDataFieldTypeId = parameters.getDataFieldTypeList().IssuingItemBusinessArea;

            dataValidation.validateValue.call(this, sDataFieldTypeId, sValue, sPath)
                .then(requestModel.handleDataValidation.bind(this, sDataFieldTypeId, sPath))
                .catch(requestModel.handleDataValidationFailed.bind(this, sDataFieldTypeId, sPath, true))
                .then(function() {
                    // Set request change flag
                    this.setRequestChangedFlag(true);
                }.bind(this));

        },

        /**
         * Handles change on issuing item business place value
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onChangeIssuingBusinessPlace: function(oEvent) {

            var oControlEvent = oEvent.getSource(),
                sPath = '',
                sValue = oEvent.getParameter("value"),
                sDataFieldTypeId = parameters.getDataFieldTypeList().IssuingBusinessPlace;

            dataValidation.validateValue.call(this, sDataFieldTypeId, sValue, sPath)
                .then(requestModel.handleDataValidation.bind(this, sDataFieldTypeId, sPath))
                .catch(requestModel.handleDataValidationFailed.bind(this, sDataFieldTypeId, sPath, true))
                .then(function() {
                    // Set request change flag
                    this.setRequestChangedFlag(true);
                }.bind(this));

        },

        /**
         * Handles change on issuing item business place value
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onChangeIssuingBusinessAreaAlt: function(oEvent) {

            var oControlEvent = oEvent.getSource(),
                sPath = '',
                sValue = oEvent.getParameter("value"),
                sDataFieldTypeId = parameters.getDataFieldTypeList().IssuingBusinessAreaAlt;

            dataValidation.validateValue.call(this, sDataFieldTypeId, sValue, sPath)
                .then(requestModel.handleDataValidation.bind(this, sDataFieldTypeId, sPath))
                .catch(requestModel.handleDataValidationFailed.bind(this, sDataFieldTypeId, sPath, true))
                .then(function() {
                    // Set request change flag
                    this.setRequestChangedFlag(true);
                }.bind(this));

        },

        /**
         * Handles change on issuing item hsn/sac value
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onChangeIssuingItemHsnSac: function(oEvent) {

            var oControlEvent = oEvent.getSource(),
                sPath = oControlEvent.getBindingContext("Request").getPath(),
                sValue = oEvent.getParameter("value"),
                sDataFieldTypeId = parameters.getDataFieldTypeList().IssuingItemHsnSac;

            dataValidation.validateValue.call(this, sDataFieldTypeId, sValue, sPath)
                .then(requestModel.handleDataValidation.bind(this, sDataFieldTypeId, sPath))
                .catch(requestModel.handleDataValidationFailed.bind(this, sDataFieldTypeId, sPath, true))
                .then(function() {
                    // Set request change flag
                    this.setRequestChangedFlag(true);
                }.bind(this));

        },

        /**
         * Handles change on receiving item GMID value
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onChangeReceivingItemGMID: function(oEvent) {

            var oControlEvent = oEvent.getSource(),
                sPath = oControlEvent.getBindingContext("Request").getPath(),
                sValue = oEvent.getParameter("value"),
                sDataFieldTypeId = parameters.getDataFieldTypeList().ReceivingItemGMID;

            dataValidation.validateValue.call(this, sDataFieldTypeId, sValue, sPath)
                .then(requestModel.handleDataValidation.bind(this, sDataFieldTypeId, sPath))
                .catch(requestModel.handleDataValidationFailed.bind(this, sDataFieldTypeId, sPath, true))
                .then(function() {
                    // Set request change flag
                    this.setRequestChangedFlag(true);
                }.bind(this));

        },
        
        /**
         * Handles change on receiving item cost center value
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onChangeReceivingItemCostCenter: function(oEvent) {

            var oControlEvent = oEvent.getSource(),
                sPath = oControlEvent.getBindingContext("Request").getPath(),
                sValue = oEvent.getParameter("value"),
                sDataFieldTypeId = parameters.getDataFieldTypeList().ReceivingItemCostCenter;

            dataValidation.validateValue.call(this, sDataFieldTypeId, sValue, sPath)
                .then(requestModel.handleDataValidation.bind(this, sDataFieldTypeId, sPath))
                .catch(requestModel.handleDataValidationFailed.bind(this, sDataFieldTypeId, sPath, true))
                .then(function() {
                    // Set request change flag
                    this.setRequestChangedFlag(true);
                }.bind(this));

        },

        /**
         * Handles change on receiving item nature value
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onChangeReceivingItemNature: function(oEvent) {

            var oControlEvent = oEvent.getSource(),
                sPath = oControlEvent.getBindingContext("Request").getPath(),
                sValue = oEvent.getParameter("value"),
                sDataFieldTypeId = parameters.getDataFieldTypeList().ReceivingItemNature;

            dataValidation.validateValue.call(this, sDataFieldTypeId, sValue, sPath)
                .then(requestModel.handleDataValidation.bind(this, sDataFieldTypeId, sPath))
                .catch(requestModel.handleDataValidationFailed.bind(this, sDataFieldTypeId, sPath, true))
                .then(function() {
                    // Set request change flag
                    this.setRequestChangedFlag(true);
                }.bind(this));

        },

        /**
         * Handles change on receiving item account value
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onChangeReceivingItemAccount: function(oEvent) {

            var oControlEvent = oEvent.getSource(),
                sPath = oControlEvent.getBindingContext("Request").getPath(),
                sValue = oEvent.getParameter("value"),
                sDataFieldTypeId = parameters.getDataFieldTypeList().ReceivingItemAccount;

            dataValidation.validateValue.call(this, sDataFieldTypeId, sValue, sPath)
                .then(requestModel.handleDataValidation.bind(this, sDataFieldTypeId, sPath))
                .catch(requestModel.handleDataValidationFailed.bind(this, sDataFieldTypeId, sPath, true))
                .then(function() {
                    // Set request change flag
                    this.setRequestChangedFlag(true);
                }.bind(this));

        },

        /**
         * Handles change on receiving item tax value
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onChangeReceivingItemTax: function(oEvent) {

            var oControlEvent = oEvent.getSource(),
                sPath = oControlEvent.getBindingContext("Request").getPath(),
                sValue = oEvent.getParameter("value"),
                sDataFieldTypeId = parameters.getDataFieldTypeList().ReceivingItemTax;

            dataValidation.validateValue.call(this, sDataFieldTypeId, sValue, sPath)
                .then(requestModel.handleDataValidation.bind(this, sDataFieldTypeId, sPath))
                .catch(requestModel.handleDataValidationFailed.bind(this, sDataFieldTypeId, sPath, true))
                .then(function() {
                    // Set request change flag
                    this.setRequestChangedFlag(true);
                }.bind(this));

        },

        /**
         * Handles change on receiving item internal order value
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onChangeReceivingItemInternalOrder: function(oEvent) {

            var oControlEvent = oEvent.getSource(),
                sPath = oControlEvent.getBindingContext("Request").getPath(),
                sValue = oEvent.getParameter("value"),
                sDataFieldTypeId = parameters.getDataFieldTypeList().ReceivingItemInternalOrder;

            dataValidation.validateValue.call(this, sDataFieldTypeId, sValue, sPath)
                .then(requestModel.handleDataValidation.bind(this, sDataFieldTypeId, sPath))
                .catch(requestModel.handleDataValidationFailed.bind(this, sDataFieldTypeId, sPath, true))
                .then(function() {
                    // Set request change flag
                    this.setRequestChangedFlag(true);
                }.bind(this));

        },

        /**
         * Handles change on receiving item wbs value
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onChangeReceivingItemWBS: function(oEvent) {

            var oControlEvent = oEvent.getSource(),
                sPath = oControlEvent.getBindingContext("Request").getPath(),
                sValue = oEvent.getParameter("value"),
                sDataFieldTypeId = parameters.getDataFieldTypeList().ReceivingItemWBS;

            dataValidation.validateValue.call(this, sDataFieldTypeId, sValue, sPath)
                .then(requestModel.handleDataValidation.bind(this, sDataFieldTypeId, sPath))
                .catch(requestModel.handleDataValidationFailed.bind(this, sDataFieldTypeId, sPath, true))
                .then(function() {
                    // Set request change flag
                    this.setRequestChangedFlag(true);
                }.bind(this));

        },

        /**
         * Handles change on issuing item business area value
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onChangeReceivingItemBusinessArea: function(oEvent) {

            var oControlEvent = oEvent.getSource(),
                sPath = oControlEvent.getBindingContext("Request").getPath(),
                sValue = oEvent.getParameter("value"),
                sDataFieldTypeId = parameters.getDataFieldTypeList().ReceivingItemBusinessArea;

            dataValidation.validateValue.call(this, sDataFieldTypeId, sValue, sPath)
                .then(requestModel.handleDataValidation.bind(this, sDataFieldTypeId, sPath))
                .catch(requestModel.handleDataValidationFailed.bind(this, sDataFieldTypeId, sPath, true))
                .then(function() {
                    // Set request change flag
                    this.setRequestChangedFlag(true);
                }.bind(this));

        },

        /**
         * Handles change on receiving item business place value
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onChangeReceivingBusinessPlace: function(oEvent) {

            var oControlEvent = oEvent.getSource(),
                sPath = '',
                sValue = oEvent.getParameter("value"),
                sDataFieldTypeId = parameters.getDataFieldTypeList().ReceivingBusinessPlace;

            dataValidation.validateValue.call(this, sDataFieldTypeId, sValue, sPath)
                .then(requestModel.handleDataValidation.bind(this, sDataFieldTypeId, sPath))
                .catch(requestModel.handleDataValidationFailed.bind(this, sDataFieldTypeId, sPath, true))
                .then(function() {
                    // Set request change flag
                    this.setRequestChangedFlag(true);
                }.bind(this));

        },

        /**
         * Handles change on receiving item business place value
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onChangeReceivingBusinessAreaAlt: function(oEvent) {

            var oControlEvent = oEvent.getSource(),
                sPath = '',
                sValue = oEvent.getParameter("value"),
                sDataFieldTypeId = parameters.getDataFieldTypeList().ReceivingBusinessAreaAlt;

            dataValidation.validateValue.call(this, sDataFieldTypeId, sValue, sPath)
                .then(requestModel.handleDataValidation.bind(this, sDataFieldTypeId, sPath))
                .catch(requestModel.handleDataValidationFailed.bind(this, sDataFieldTypeId, sPath, true))
                .then(function() {
                    // Set request change flag
                    this.setRequestChangedFlag(true);
                }.bind(this));

        },

        /**
         * Handles change on receiving item hsn/sac value
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onChangeReceivingItemHsnSac: function(oEvent) {

            var oControlEvent = oEvent.getSource(),
                sPath = oControlEvent.getBindingContext("Request").getPath(),
                sValue = oEvent.getParameter("value"),
                sDataFieldTypeId = parameters.getDataFieldTypeList().ReceivingItemHsnSac;

            dataValidation.validateValue.call(this, sDataFieldTypeId, sValue, sPath)
                .then(requestModel.handleDataValidation.bind(this, sDataFieldTypeId, sPath))
                .catch(requestModel.handleDataValidationFailed.bind(this, sDataFieldTypeId, sPath, true))
                .then(function() {
                    // Set request change flag
                    this.setRequestChangedFlag(true);
                }.bind(this));

        },

        /**
         * Handles change on header issuing tax value
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onChangeIssuingTax: function(oEvent) {

            var sPath = "",
                sValue = oEvent.getParameter("value"),
                sDataFieldTypeId = parameters.getDataFieldTypeList().IssuingTax;

            dataValidation.validateValue.call(this, sDataFieldTypeId, sValue, sPath)
                .then(requestModel.handleDataValidation.bind(this, sDataFieldTypeId, sPath))
                .catch(requestModel.handleDataValidationFailed.bind(this, sDataFieldTypeId, sPath, true))
                .then(function() {
                    // Set request change flag
                    this.setRequestChangedFlag(true);
                }.bind(this));

        },

        /**
         * Handles change on header receiving tax value
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onChangeReceivingTax: function(oEvent) {

            var sPath = "",
                sValue = oEvent.getParameter("value"),
                sDataFieldTypeId = parameters.getDataFieldTypeList().ReceivingTax;

            dataValidation.validateValue.call(this, sDataFieldTypeId, sValue, sPath)
                .then(requestModel.handleDataValidation.bind(this, sDataFieldTypeId, sPath))
                .catch(requestModel.handleDataValidationFailed.bind(this, sDataFieldTypeId, sPath, true))
                .then(function() {
                    // Set request change flag
                    this.setRequestChangedFlag(true);
                }.bind(this));

        },

        /**
         * Handles change on header vendor
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onChangeVendor: function(oEvent) {

            var sPath = "",
                sValue = oEvent.getParameter("value"),
                sDataFieldTypeId = parameters.getDataFieldTypeList().Vendor;

            // If no item selected, check value on SAP
            if (oEvent.getSource().getSelectedItem() === null) {
                dataValidation.validateValue.call(this, sDataFieldTypeId, sValue, sPath)
                    .then(requestModel.handleDataValidation.bind(this, sDataFieldTypeId, sPath))
                    .catch(requestModel.handleDataValidationFailed.bind(this, sDataFieldTypeId, sPath, true))
                    .then(function() {
                        // Set request change flag
                        this.setRequestChangedFlag(true);
                    }.bind(this));
            } else {
                requestModel.handleDataValidationFailed.call(this, sDataFieldTypeId, sPath, false);
                // Set request change flag
                this.setRequestChangedFlag(true);
            }
        },

        /**
         * Handles change on header vendor
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onChangeCustomer: function(oEvent) {

            var sPath = "",
                sValue = oEvent.getParameter("value"),
                sDataFieldTypeId = parameters.getDataFieldTypeList().Customer;

            // If no item selected, check value on SAP
            if (oEvent.getSource().getSelectedItem() === null) {
                dataValidation.validateValue.call(this, sDataFieldTypeId, sValue, sPath)
                    .then(requestModel.handleDataValidation.bind(this, sDataFieldTypeId, sPath))
                    .catch(requestModel.handleDataValidationFailed.bind(this, sDataFieldTypeId, sPath, true))
                    .then(function() {
                        // Set request change flag
                        this.setRequestChangedFlag(true);
                    }.bind(this));
            } else {
                requestModel.handleDataValidationFailed.call(this, sDataFieldTypeId, sPath, false);
                // Set request change flag
                this.setRequestChangedFlag(true);
            }
        },

        /**
         * Handles change on header currency
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onChangeCurrency: function(oEvent) {

            var sPath = "",
                sValue = oEvent.getParameter("value"),
                sDataFieldTypeId = parameters.getDataFieldTypeList().Currency;

            // If no item selected, check value on SAP
            if (oEvent.getSource().getSelectedItem() === null) {
                dataValidation.validateValue.call(this, sDataFieldTypeId, sValue, sPath)
                    .then(requestModel.handleDataValidation.bind(this, sDataFieldTypeId, sPath))
                    .then(function() {

                        // Refresh all amount format based to the currency 
                        this._refreshItemsAmountFormat();
                        this._refreshItemsTableBindings(parameters.getItemTypeList().Issuing);
                        this._refreshItemsTableBindings(parameters.getItemTypeList().Receiving);

                        return "";
                    }.bind(this))
                    .catch(requestModel.handleDataValidationFailed.bind(this, sDataFieldTypeId, sPath, true))
                    .then(function() {

                        // Set request change flag
                        this.setRequestChangedFlag(true);
                    }.bind(this));
            } else {
                requestModel.handleDataValidationFailed.call(this, sDataFieldTypeId, sPath, false);

                // Refresh all amount format based to the currency 
                this._refreshItemsAmountFormat();
                this._refreshItemsTableBindings(parameters.getItemTypeList().Issuing);
                this._refreshItemsTableBindings(parameters.getItemTypeList().Receiving);
                // Set request change flag
                this.setRequestChangedFlag(true);
            }
        },

        onChangeGeneric: function(oEvent) {

            // Set request change flag
            this.setRequestChangedFlag(true);

        },

        /**
         * Handles on upload file change
         * @event
         * @param {eventObject} oEvent the event data
         * @public
         */
        onChangeUpload: function(oEvent) {

            var oUCAttachments = oEvent.getSource();
            var sFileName;
            var oCustomerHeaderToken = {},
                oHeaderParameterSlug = {};

            this.oDataModel.refreshSecurityToken();

            oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
                name: "x-csrf-token",
                value: this.oDataModel.getHeaders()['x-csrf-token']
            });

            if (oEvent.getParameter("files") && oEvent.getParameter("files")[0].name) {
                sFileName = oEvent.getParameter("files")[0].name;
            } else if (oEvent.getParameters()["fileName"]) {
                sFileName = oEvent.getParameters()["fileName"];
            }

            oHeaderParameterSlug = new sap.m.UploadCollectionParameter({
                name: "slug",
                value: encodeURIComponent(sFileName)
            });

            oUCAttachments.addHeaderParameter(oCustomerHeaderToken).addHeaderParameter(oHeaderParameterSlug);

        },

        /**
         * Handles on file deletion
         * @event
         * @param {eventObject} oEvent the event data
         * @public
         */
        onFileDeleted: function(oEvent) {

            var oRequest = this.getComponentModel("Request");
            var sDocumentId = oEvent.getParameter("documentId");
            var aAttachments = oRequest.getProperty("/Attachments/results");
            var oAttachmentItem = {},
                iCount = 0,
                i = 0
            iCount = aAttachments.length;

            for (i = 0; i < iCount; i++) {
                if (aAttachments[i].FolderId === sDocumentId) {
                    oAttachmentItem = aAttachments[i];
                    break;
                }
            }

            aAttachments.splice(i, 1);

            // Deleted Attachment only make sense for those on idle mode 
            if (oAttachmentItem.Mode === parameters.getAttachmentModeList().Idle) {
                if (!oRequest.getProperty("/AttachmentsToDelete/results")) {
                    oRequest.getData().AttachmentsToDelete = {
                        results: []
                    };
                }
                oAttachmentItem.Mode = parameters.getAttachmentModeList().Delete;
                oRequest.getProperty("/AttachmentsToDelete/results").push(oAttachmentItem);
            }

            this.getComponentModel("Request").updateBindings(true);

            // Set request change flag
            this.setRequestChangedFlag(true);
        },

        /**
         * Handles on upload file completed
         * @event
         * @param {eventObject} oEvent the event data
         * @public
         */
        onUploadComplete: function(oEvent) {

            var oUCAttachments = oEvent.getSource();
            var sResponseRaw, oXMLData = {},
                oAttachment = {},
                oChildrenProperties = {},
                oChildNodesProperties = {};
            var oRequest = this.getComponentModel("Request");

            sResponseRaw = oEvent.getParameter("files")[0].responseRaw;

            oXMLData = $.parseXML(sResponseRaw);
            oAttachment = odataService.createODataEntityObject(this.oDataModel, "Attachment", []);
            oAttachment.TypeId = oRequest.getProperty("/TypeId");
            oAttachment.RequestId = oRequest.getProperty("/RequestId");
            
            if (oXMLData.children !== undefined) {

                if ($(oXMLData).find("FolderId").text() !== "") {

                    oAttachment.FolderId = $(oXMLData).find("FolderId").text();
                    oAttachment.GuidId = $(oXMLData).find("GuidId").text();
                    oAttachment.Description = $(oXMLData).find("Description").text();
                    oAttachment.FileName = $(oXMLData).find("FileName").text();
                    oAttachment.MimeType = $(oXMLData).find("MimeType").text();
                    oAttachment.FileSize = parseFloat($(oXMLData).find("FileSize").text());
                    oAttachment.UserCreation = $(oXMLData).find("UserCreation").text();
                    oAttachment.UserCreationName = $(oXMLData).find("UserCreationName").text();
                    oAttachment.TimestampCreation = new Date($(oXMLData).find("TimestampCreation").text());
                    oAttachment.Mode = $(oXMLData).find("Mode").text();
                    oAttachment.Url = $(oXMLData).find("id").text() + '/$value';

                } else {

                    oChildrenProperties = utilities.findFirstItem(oXMLData.children[0].children, "localName", "properties");

                    if (oChildrenProperties !== null) {
                        oAttachment.FolderId = utilities.findFirstItem(oChildrenProperties.children, "localName", "FolderId").textContent;
                        oAttachment.GuidId = utilities.findFirstItem(oChildrenProperties.children, "localName", "GuidId").textContent;
                        oAttachment.Description = utilities.findFirstItem(oChildrenProperties.children, "localName", "Description").textContent;
                        oAttachment.FileName = utilities.findFirstItem(oChildrenProperties.children, "localName", "FileName").textContent;
                        oAttachment.MimeType = utilities.findFirstItem(oChildrenProperties.children, "localName", "MimeType").textContent;
                        oAttachment.FileSize = parseFloat(utilities.findFirstItem(oChildrenProperties.children, "localName", "FileSize").textContent);
                        oAttachment.UserCreation = utilities.findFirstItem(oChildrenProperties.children, "localName", "UserCreation").textContent;
                        oAttachment.UserCreationName = utilities.findFirstItem(oChildrenProperties.children, "localName", "UserCreationName").textContent;
                        oAttachment.TimestampCreation = new Date(utilities.findFirstItem(oChildrenProperties.children, "localName", "TimestampCreation").textContent);
                        oAttachment.Mode = utilities.findFirstItem(oChildrenProperties.children, "localName", "Mode").textContent;
                        oAttachment.Url = utilities.findFirstItem(oXMLData.children[0].children, "localName", "id").textContent + '/$value';
                    }

                }

            } else {

                oChildNodesProperties = utilities.findFirstItem(oXMLData.childNodes[0].childNodes, "localName", "properties");

                if (oChildNodesProperties !== null) {
                    oAttachment.FolderId = utilities.findFirstItem(oChildNodesProperties.childNodes, "localName", "FolderId").textContent;
                    oAttachment.GuidId = utilities.findFirstItem(oChildNodesProperties.childNodes, "localName", "GuidId").textContent;
                    oAttachment.Description = utilities.findFirstItem(oChildNodesProperties.childNodes, "localName", "Description").textContent;
                    oAttachment.FileName = utilities.findFirstItem(oChildNodesProperties.childNodes, "localName", "FileName").textContent;
                    oAttachment.MimeType = utilities.findFirstItem(oChildNodesProperties.childNodes, "localName", "MimeType").textContent;
                    oAttachment.FileSize = parseFloat(utilities.findFirstItem(oChildNodesProperties.childNodes, "localName", "FileSize").textContent);
                    oAttachment.UserCreation = utilities.findFirstItem(oChildNodesProperties.childNodes, "localName", "UserCreation").textContent;
                    oAttachment.UserCreationName = utilities.findFirstItem(oChildNodesProperties.childNodes, "localName", "UserCreationName").textContent;
                    oAttachment.TimestampCreation = new Date(utilities.findFirstItem(oChildNodesProperties.childNodes, "localName", "TimestampCreation").textContent);
                    oAttachment.Mode = utilities.findFirstItem(oChildNodesProperties.childNodes, "localName", "Mode").textContent;
                    oAttachment.Url = utilities.findFirstItem(oXMLData.childNodes[0].childNodes, "localName", "id").textContent + '/$value';
                }

            }
            
            oRequest.getProperty("/Attachments/results").unshift(oAttachment);

            oUCAttachments.destroyItems();
            this.getComponentModel("Request").updateBindings(true);

            // Set request change flag
            this.setRequestChangedFlag(true);

        },

        _initiateUploadCollection: function() {
            var oUCAttachments = this.getView().byId("ucAttachments");
            oUCAttachments.setUploadUrl(this.oDataModel.sServiceUrl + "/AttachmentCollection");
        },

        _initiateRequestItemsTablesPersonalization: function(sAppType) {

            // Initiate Table Personalization Controller for both Issuing and Receiving Item tables
            if (!this.oTPCIssuing) {
                this.oTPCIssuing = tpcHelper.initiateItemTPC.call(this, sAppType, parameters.getItemTypeList().Issuing);
            }

            if (!this.oTPCReceiving) {
                this.oTPCReceiving = tpcHelper.initiateItemTPC.call(this, sAppType, parameters.getItemTypeList().Receiving);
            }

        },

        /**
         * Handles button press on Items settings
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onPressItemsSettings: function(oEvent) {

            var oButton = oEvent.getSource();
            var sItemType = oButton.data("itemType");

            switch (sItemType) {
                case parameters.getItemTypeList().Issuing:
                    this.oTPCIssuing.openDialog();
                    break;
                case parameters.getItemTypeList().Receiving:
                    this.oTPCReceiving.openDialog();
                    break;
                default:
                    break;
            }

        },

        /**
         * Initialization on request issuing and receiving items variant managements
         * @param {object} oError the error object
         * @private
         */
        _onVariantCallBackError: function(oError) {
            //reuse odata failed function
            messageHelper.showODataFailedMessages(oError);
        },

        /**
         * Initialization on request issuing and receiving items variant managements
         * @param {string} sAppType the application type
         * @private
         */
        _initiateRequestItemsVariantManagement: function(sAppType) {

            var sVariantModelName;

            //Set Issuing Item Variant Data
            variantManagement.initiateRequestItemsVariantData.call(this, parameters.getItemTypeList().Issuing, function(aVariants) {
                // Get variant JSON model name and set it to the view
                sVariantModelName = parameters.getVariantJSONModelNameList().RequestIssuingItems;
                this.getView().setModel(new JSONModel({
                    results: aVariants
                }), sVariantModelName);
                // Set variant management default value
                this._setRequestItemsVariantManagementDefaultSelection(sAppType, parameters.getItemTypeList().Issuing);
            }.bind(this), this._onVariantCallBackError);

            //Set Receiving Item Variant Data
            variantManagement.initiateRequestItemsVariantData.call(this, parameters.getItemTypeList().Receiving, function(aVariants) {
                // Get variant JSON model name and set it to the view
                sVariantModelName = parameters.getVariantJSONModelNameList().RequestReceivingItems;
                this.getView().setModel(new JSONModel({
                    results: aVariants
                }), sVariantModelName);
                // Set variant management default value
                this._setRequestItemsVariantManagementDefaultSelection(sAppType, parameters.getItemTypeList().Receiving);
            }.bind(this), this._onVariantCallBackError);

        },

        /**
         * Set variant management default value
         * @param {string} sAppType the application type
         * @param {string} sItemType the item type
         * @private
         */
        _setRequestItemsVariantManagementDefaultSelection: function(sAppType, sItemType) {

            var sVariantManagementId = variantManagement.getRequestItemsVariantManagementControlId(sItemType);
            var oVariantManagement = this.getView().byId(sVariantManagementId);
            var sVariantModelName = variantManagement.getRequestItemsVariantJSONModelName(sItemType);
            var aVariantData = [],
                iCount = 0,
                i = 0,
                sDefaultVariantKey = "",
                oVariantData = {};

            // Get variant data from model
            aVariantData = this.getView().getModel(sVariantModelName).getProperty("/results");
            iCount = aVariantData.length;

            // Get request item default variant key
            variantManagement.getRequestItemsDefaultVariantKey.call(this, sItemType, function(sStoredVariantKey) {

                //check if default variant key is valid
                for (i = 0; i < iCount; i++) {
                    if (sStoredVariantKey === aVariantData[i].VAR_KEY) {
                        sDefaultVariantKey = sStoredVariantKey;
                        oVariantData = aVariantData[i];
                        break;
                    }
                }

                if (sDefaultVariantKey === "") {
                    // if no default variant key is defined, get the initial variant key
                    oVariantData = variantManagement.getRequestItemsInitialVariant.call(this, sAppType, sItemType);
                    sDefaultVariantKey = oVariantData["VAR_KEY"];
                }

                // Initialize variant management initial data
                oVariantManagement.setInitialSelectionKey(sDefaultVariantKey);
                oVariantManagement.setSelectionKey(sDefaultVariantKey);
                oVariantManagement.setDefaultVariantKey(sDefaultVariantKey);

                switch (sItemType) {
                    case parameters.getItemTypeList().Issuing:
                        // Set & refresh variant data into the table perso controller
                        this.oTPCIssuing.getPersoService().setPersData(oVariantData).done(function() {
                            this.oTPCIssuing.refresh();
                        }.bind(this)).fail(function(oError) {
                            this._onVariantCallBackError(oError);
                        }.bind(this));
                    case parameters.getItemTypeList().Receiving:
                        // Set & refresh variant data into the table perso controller
                        this.oTPCReceiving.getPersoService().setPersData(oVariantData).done(function() {
                            this.oTPCReceiving.refresh();
                        }.bind(this)).fail(function(oError) {
                            this._onVariantCallBackError(oError);
                        }.bind(this));
                    default:
                }

            }.bind(this), this._onVariantCallBackError);

        },

        /**
         * on variant item selection
         * @event
         * @param {object} oEvent the event data
         * @private
         */
        onSelectItemVariant: function(oEvent) {

            var oVariantManagement = oEvent.getSource();
            var sItemType = oVariantManagement.data("itemType");
            // In case of variant "Standard" selected, set it automatically to the default variant (either accountant or controller)
            var sSelectedVariantKey = oVariantManagement.getSelectionKey() === "*standard*" ? variantManagement.getRequestItemsInitialVariant.call(this, this.getAppType(), sItemType)["VAR_KEY"] : oVariantManagement.getSelectionKey();
            var sVariantModelName = variantManagement.getRequestItemsVariantJSONModelName(sItemType);
            var oModel = oVariantManagement.getModel(sVariantModelName);
            var iCount = oModel.getProperty("/results/length");
            var sBindingPath, oVariantData = {},
                i = 0

            for (i = 0; i <= iCount; i++) {
                sBindingPath = "/results/" + i;
                // Check if it is the selected variant
                if (sSelectedVariantKey == oModel.getProperty(sBindingPath + "/VAR_KEY")) {
                    // get the selection variant data
                    oVariantData = oModel.getProperty(sBindingPath);
                    if (oVariantData) {
                        // set selected variant key as selection into the variant management
                        oVariantManagement.setSelectionKey(sSelectedVariantKey);
                        switch (sItemType) {
                            case parameters.getItemTypeList().Issuing:
                                // Set & refresh variant data into the table perso controller
                                this.oTPCIssuing.getPersoService().setPersData(oVariantData).done(function() {
                                    this.oTPCIssuing.refresh();
                                }.bind(this)).fail(function(oError) {
                                    this._onVariantCallBackError(oError);
                                }.bind(this));
                                break;
                            case parameters.getItemTypeList().Receiving:
                                // Set & refresh variant data into the table perso controller
                                this.oTPCReceiving.getPersoService().setPersData(oVariantData).done(function() {
                                    this.oTPCReceiving.refresh();
                                }.bind(this)).fail(function(oError) {
                                    this._onVariantCallBackError(oError);
                                }.bind(this))
                                break;
                            default:
                                break;
                        }
                        // Set selected variant as default into the UShell personalization
                        variantManagement.setRequestItemsDefaultVariantKey.call(this, sItemType, sSelectedVariantKey, function() {
                            oVariantManagement.setDefaultVariantKey(sSelectedVariantKey);
                        }.bind(this), this._onVariantCallBackError);

                        // Set variant management selection data
                        oVariantManagement.setInitialSelectionKey(sSelectedVariantKey);
                        oVariantManagement.setSelectionKey(sSelectedVariantKey);

                    }
                    break;
                }
            }
        },

        /**
         * on variant item save
         * @event
         * @param {object} oEvent the event data
         * @private
         */
        onSaveItemVariant: function(oEvent) {

            var oVariantManagement = oEvent.getSource();
            var sItemType = oVariantManagement.data("itemType");

            var sVariantName = oEvent.getParameter("name");
            var sVariantKey = oEvent.getParameter("key");
            var sVariantModelName, oVariantData = {}

            switch (sItemType) {
                case parameters.getItemTypeList().Issuing:

                    // Build variant data
                    oVariantData = this.oTPCIssuing.getPersoService()._oBundle;
                    oVariantData.VAR_KEY = sVariantKey;
                    oVariantData.VAR_NAME = sVariantName;
                    oVariantData.readOnly = false;
                    oVariantData.global = false;
                    oVariantData.labelReadOnly = false;
                    oVariantData.author = "";

                    // Save variant data into ushell personalization
                    variantManagement.saveRequestItemsVariantData.call(this, sItemType, sVariantKey, oVariantData, function(oVariantData) {
                        sVariantModelName = parameters.getVariantJSONModelNameList().RequestIssuingItems;
                        this.getView().getModel(sVariantModelName).getProperty("/results").push(oVariantData);

                        //Always This variant will be set as default
                        variantManagement.setRequestItemsDefaultVariantKey.call(this, sItemType, sVariantKey, function() {
                            oVariantManagement.setDefaultVariantKey(sVariantKey);
                        }.bind(this), this._onVariantCallBackError);

                    }.bind(this), this._onVariantCallBackError);

                    break;
                case parameters.getItemTypeList().Receiving:

                    // Build variant data
                    oVariantData = this.oTPCReceiving.getPersoService()._oBundle;
                    oVariantData.VAR_KEY = sVariantKey;
                    oVariantData.VAR_NAME = sVariantName;
                    oVariantData.readOnly = false;
                    oVariantData.global = false;
                    oVariantData.labelReadOnly = false;
                    oVariantData.author = "";

                    // Save variant data into ushell personalization
                    variantManagement.saveRequestItemsVariantData.call(this, sItemType, sVariantKey, oVariantData, function(oVariantData) {
                        sVariantModelName = parameters.getVariantJSONModelNameList().RequestReceivingItems;
                        this.getView().getModel(sVariantModelName).getProperty("/results").push(oVariantData);

                        //Always This variant will be set as default
                        variantManagement.setRequestItemsDefaultVariantKey.call(this, sItemType, sVariantKey, function() {
                            oVariantManagement.setDefaultVariantKey(sVariantKey);
                        }.bind(this), this._onVariantCallBackError);

                    }.bind(this), this._onVariantCallBackError);

                    break;
                default:
                    break;
            }

        },

        /**
         * on variant item management confirmation
         * @event
         * @param {object} oEvent the event data
         * @private
         */
        onManageItemVariant: function(oEvent) {

            var oVariantManagement = oEvent.getSource(),
                sVariantModelName;
            var sItemType = oVariantManagement.data("itemType");
            var aDeletedVariants = oEvent.getParameter("deleted"),
                aRenamedVariants = oEvent.getParameter("renamed"),
                sDefautVariantKey = oEvent.getParameter("def");

            switch (sItemType) {
                case parameters.getItemTypeList().Issuing:

                    // Manage variant data into ushell personalization
                    variantManagement.manageRequestItemsVariantData.call(this, sItemType, aDeletedVariants, aRenamedVariants, function(oVariantData) {
                        sVariantModelName = parameters.getVariantJSONModelNameList().RequestIssuingItems;
                        this.getView().getModel(sVariantModelName).updateBindings();

                        //Set the selected default variant key into ushell personalization
                        variantManagement.setRequestItemsDefaultVariantKey.call(this, sItemType, sDefautVariantKey, function(sVariantKey) {
                            oVariantManagement.setDefaultVariantKey(sVariantKey);
                        }.bind(this), this._onVariantCallBackError);

                    }.bind(this), this._onVariantCallBackError);

                    break;
                case parameters.getItemTypeList().Receiving:

                    variantManagement.manageRequestItemsVariantData.call(this, sItemType, aDeletedVariants, aRenamedVariants, function(oVariantData) {

                        sVariantModelName = parameters.getVariantJSONModelNameList().RequestReceivingItems;
                        this.getView().getModel(sVariantModelName).updateBindings();

                        //Set the selected default variant key into ushell personalization
                        variantManagement.setRequestItemsDefaultVariantKey.call(this, sItemType, sDefautVariantKey, function(sVariantKey) {
                            oVariantManagement.setDefaultVariantKey(sVariantKey);
                        }.bind(this), this._onVariantCallBackError);

                    }.bind(this), this._onVariantCallBackError);

                    break;
                default:
                    break;
            }

        },

        /**
         * Handles press to show/hide issuing items table
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onPressToogleIssuingItemsVisibility: function(oEvent) {

            var oAppDataModel = this.getComponentModel("AppData"),
                bVisibility = oAppDataModel.getProperty("/issuingItemVisibility");

            oAppDataModel.setProperty("/issuingItemVisibility", !bVisibility);

        },

        /**
         * Handles press to show/hide receiving items table
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onPressToogleReceivingItemsVisibility: function(oEvent) {

            var oAppDataModel = this.getComponentModel("AppData"),
                bVisibility = oAppDataModel.getProperty("/receivingItemVisibility");

            oAppDataModel.setProperty("/receivingItemVisibility", !bVisibility);

        },

        onPressToogleIssuingItemFullscreen: function(oEvent) {

            var oAppDataModel = this.getComponentModel("AppData"),
                bFullscreen = oAppDataModel.getProperty("/issuingItemFullscreen");
            if (bFullscreen) {
                oAppDataModel.setProperty("/issuingItemFullscreen", false);
                oAppDataModel.setProperty("/issuingItemVisibility", true);
                oAppDataModel.setProperty("/receivingItemVisibility", true);
            } else {
                oAppDataModel.setProperty("/issuingItemFullscreen", true);
                oAppDataModel.setProperty("/issuingItemVisibility", true);
                oAppDataModel.setProperty("/receivingItemFullscreen", false);
                oAppDataModel.setProperty("/receivingItemVisibility", false);
            }

        },

        onPressToogleReceivingItemFullscreen: function(oEvent) {

            var oAppDataModel = this.getComponentModel("AppData"),
                bFullscreen = oAppDataModel.getProperty("/receivingItemFullscreen");
            if (bFullscreen) {
                oAppDataModel.setProperty("/receivingItemFullscreen", false);
                oAppDataModel.setProperty("/issuingItemVisibility", true);
                oAppDataModel.setProperty("/receivingItemVisibility", true);
            } else {
                oAppDataModel.setProperty("/receivingItemFullscreen", true);
                oAppDataModel.setProperty("/receivingItemVisibility", true);
                oAppDataModel.setProperty("/issuingItemFullscreen", false);
                oAppDataModel.setProperty("/issuingItemVisibility", false);
            }

        },
        
        onPressShowAdditionalData : function(oEvent){
        	
            var oButton = oEvent.getSource();

	        // create delete request responsive popover
	        if (!this._oPopoverRequestHeaderAdditionalData) {
	            this._oPopoverRequestHeaderAdditionalData = sap.ui.xmlfragment(this.createId("frgt_oPopoverRequestHeaderAdditionalData"), "cus.fi.timi.rel.view.fragment.RequestHeaderAdditionalDataPopover", this);
	            this.getView().addDependent(this._oPopoverRequestHeaderAdditionalData);
	        }
	
	        this._oPopoverRequestHeaderAdditionalData.openBy(oButton);
        	
        },

        onPressGetInvoiceAttachment : function(oEvent){
            var oRequestData = this.getComponentModel("Request").getData(),
                sRequestId = oRequestData.RequestId;

            var sPath = "/AttachmentInvoiceCollection(RequestId='" + sRequestId + "')",
                sServiceUrl = this.oDataModel.sServiceUrl;
            var sPdfUrl = sServiceUrl + sPath + "/$value";

            sap.m.URLHelper.redirect(sPdfUrl, true);
        },

        onChangeImportIssuingItems : function(oEvent){

            var oRequestModel = this.getComponentModel("Request"),
                sItemType = parameters.getItemTypeList().Issuing,
                aRequestItems = this.getComponentModel("Request").getProperty("/IssuingItems/results"),
                aUploadItems = [],
                iItemId = 0,
				oFileToRead = oEvent.getParameter("files")[0],
                oReader = new FileReader();
            
                    var _fnGetData = function (sText) {
                        var aDataLines = sText.split(/\r\n|\n/);

                        aDataLines.forEach(function (sLine, iIndex) {
                            var aTabValues = sLine.split("\t");

                            if(iIndex === 0){
                                return;
                            }

                            var oRequestItem = odataService.createODataEntityObject(this.oDataModel, "RequestItem", []);

                            iItemId = iItemId + 1 

                            oRequestItem.RequestId = oRequestModel.getProperty("/HeaderData/RequestId");
                            oRequestItem.ItemId = iItemId;
                            oRequestItem.TypeId = oRequestModel.getProperty("/HeaderData/TypeId");
                            oRequestItem.ItemType = sItemType;
                            oRequestItem.ItemText = aTabValues[0];
                            oRequestItem.DCIndicator = aTabValues[1];
                            oRequestItem.Amount = aTabValues[2];
                            oRequestItem.TaxCode = aTabValues[3];
                            oRequestItem.CostCenter = aTabValues[4];
                            oRequestItem.WBSExternal = aTabValues[5];
                            oRequestItem.ProfitCenter = aTabValues[6];
                            oRequestItem.GMID = aTabValues[7];
                            oRequestItem.GLAccount = aTabValues[8];
                            oRequestItem.InternalOrder = aTabValues[9];
                            oRequestItem.Markup = aTabValues[10];
                            oRequestItem.BusinessAreaCode = aTabValues[11];

                            aUploadItems.push(oRequestItem);

                        }.bind(this));

                        this.getComponentModel("Request").setProperty("/IssuingItems/results", aUploadItems);
                        this._refreshItemsTableBindings(sItemType);
                        businessRules.setBusinessAreaCollection.call(this, sItemType);
                        this.setRequestChangedFlag(true);

                    };

                    var _fnErrorHandler = function (evt) {
                        if (evt.target.error.name === "NotReadableError") {
                            messageHelper.showErrorMessageBox(this.oBundle.getText("messagebox.error.title"), [this.oBundle.getText("text.upload.item.error")]);
                        }
                    };
    
                    var _fnLoadHandler = function (event) {
                        var sText = event.target.result;
                        _fnGetData.call(this, sText);
                    };

                    oReader.readAsText(oFileToRead, "iso-8859-1");
                    oReader.onload = _fnLoadHandler.bind(this);
                    oReader.onerror = _fnErrorHandler.bind(this);        
        },

        onChangeImportReceivingItems : function(oEvent){

            var oRequestModel = this.getComponentModel("Request"),
                sItemType = parameters.getItemTypeList().Receiving,
                aRequestItems = this.getComponentModel("Request").getProperty("/ReceivingItems/results"),
                aUploadItems = [],
                iItemId = 0,
				oFileToRead = oEvent.getParameter("files")[0],
                oReader = new FileReader();
            
                    var _fnGetData = function (sText) {
                        var aDataLines = sText.split(/\r\n|\n/);

                        aDataLines.forEach(function (sLine, iIndex) {
                            var aTabValues = sLine.split("\t");

                            if(iIndex === 0){
                                return;
                            }

                            var oRequestItem = odataService.createODataEntityObject(this.oDataModel, "RequestItem", []);

                            iItemId = iItemId + 1 

                            oRequestItem.RequestId = oRequestModel.getProperty("/HeaderData/RequestId");
                            oRequestItem.ItemId = iItemId;
                            oRequestItem.TypeId = oRequestModel.getProperty("/HeaderData/TypeId");
                            oRequestItem.ItemType = sItemType;
                            oRequestItem.ItemText = aTabValues[0];
                            oRequestItem.DCIndicator = aTabValues[1];
                            oRequestItem.Amount = aTabValues[2];
                            oRequestItem.TaxCode = aTabValues[3];
                            oRequestItem.CostCenter = aTabValues[4];
                            oRequestItem.WBSExternal = aTabValues[5];
                            oRequestItem.ProfitCenter = aTabValues[6];
                            oRequestItem.GMID = aTabValues[7];
                            oRequestItem.GLAccount = aTabValues[8];
                            oRequestItem.InternalOrder = aTabValues[9];
                            oRequestItem.Markup = aTabValues[10];
                            oRequestItem.BusinessAreaCode = aTabValues[11];

                            aUploadItems.push(oRequestItem);

                        }.bind(this));

                        this.getComponentModel("Request").setProperty("/ReceivingItems/results", aUploadItems);
                        this._refreshItemsTableBindings(sItemType);
                        businessRules.setBusinessAreaCollection.call(this, sItemType);
                        this.setRequestChangedFlag(true);

                    };

                    var _fnErrorHandler = function (evt) {
                        if (evt.target.error.name === "NotReadableError") {
                            messageHelper.showErrorMessageBox(this.oBundle.getText("messagebox.error.title"), [this.oBundle.getText("text.upload.item.error")]);
                        }
                    };
    
                    var _fnLoadHandler = function (event) {
                        var sText = event.target.result;
                        _fnGetData.call(this, sText);
                    };

                    oReader.readAsText(oFileToRead, "iso-8859-1");
                    oReader.onload = _fnLoadHandler.bind(this);
                    oReader.onerror = _fnErrorHandler.bind(this);        
        },

        _setBusyRequest: function(bOn) {
            this._setBusy("pRequest", bOn);
        },

        _setBusy: function(sControlId, bOn) {
            if (this.getView().byId(sControlId)) {
                this.getView().byId(sControlId).setBusy(bOn);
            }
        },

        /**
         * Set view styles & css classes
         * 
         * @private
         */
        _setStyle: function() {

            // Set view compact/cosy class
            this.getView().byId("ohRequest").addStyleClass(this.getContentDensityClass());
            this.getView().byId("itbRequest").addStyleClass(this.getContentDensityClass()).addStyleClass('timi');
            this.getView().byId("otbIssuing").addStyleClass(this.getContentDensityClass());
            this.getView().byId("otbReceiving").addStyleClass(this.getContentDensityClass());
            this.getView().byId("tIssuingItems").addStyleClass(this.getContentDensityClass());
            this.getView().byId("tReceivingItems").addStyleClass(this.getContentDensityClass());

        },

    });
}, true);