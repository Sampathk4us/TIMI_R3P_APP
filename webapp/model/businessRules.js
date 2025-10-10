/************************************************************************
 * Project            : TIMI                                 			*
 * Process            : FI                                              *
 * Task code          : FI062                                           *
 * Functional document:                                					*
 * Technical document :                                    				*
 *----------------------------------------------------------------------*
 * File       	: model/businessRules.js   	        					*
 * Author        : David TEA                                            *
 * Company       : Resp                                               	*
 * Creation Date : 19/05/2016                                           *
 *----------------------------------------------------------------------*
 * Description   : Provides business rules functions   					*		
 *                                                                      *
 ************************************************************************
/**
 * @fileOverview Provides business rules functions
 * @author David Tea 
 * @version 1.0
 */
sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "cus/fi/timi/rel/model/parameters",
    "cus/fi/timi/rel/assets/js/helpers/utilities",
    "cus/fi/timi/rel/model/formatterFormat",
    "cus/fi/timi/rel/model/odataService"
], function(JSONModel, parameters, utilities, formatterFormat, odataService) {
    "use strict";

    function _countItems(aItems, sItemType) {

        var iLength = aItems.length,
            iCount = 0,
            i = 0;

        for (i = 0; i < iLength; i++) {
            if (aItems[i].ItemType === sItemType) {
                iCount = iCount + 1;
            }
        }

        return iCount;

    }

    function _getCurrencyMaxDecimals(sCurrencyCode) {

        var oCurrencyCollection = this.getComponentModel("CurrencyCollection"),
            aCurrencyList = oCurrencyCollection ? oCurrencyCollection.getProperty("/results") : [],
            oCurrency = {};

        oCurrency = utilities.findFirstItem(aCurrencyList, "CurrencyCode", sCurrencyCode);

        if (oCurrency) {
            return oCurrency.CurrencyDecimals;
        } else {
            return 2;
        }

    }

    var oBusinessRules = {

            /**
         * Check if issuer submission deadline has passed
         * 
         * @public
         * @returns {boolean} true = Deadline has passed, false = deadline has not passed
         */
        checkIssuerDeadlineIsPassed: function() {
                var oCurrentDate = new Date();
                var oDeadlineDate = formatterFormat.formatSAPDate(this.getComponentModel("AppData").getProperty("/IS_DEADLINE_DATE"));
                var sCurrentDate = formatterFormat.formatDatetoSAPDate(oCurrentDate);
                var sDeadlineDate = formatterFormat.formatDatetoSAPDate(oDeadlineDate);
                if (sCurrentDate > sDeadlineDate) {
                    return true;
                } else {
                    return false;
                }
            },

            /**
         * Check if receiver approval deadline has passed
         * 
         * @public
         * @returns {boolean} true = Deadline has passed, false = deadline has not passed
         */
        checkReceiverDeadlineIsPassed: function() {
                var oCurrentDate = new Date();
                var oDeadlineDate = formatterFormat.formatSAPDate(this.getComponentModel("AppData").getProperty("/RC_DEADLINE_DATE"));
                var sCurrentDate = formatterFormat.formatDatetoSAPDate(oCurrentDate);
                var sDeadlineDate = formatterFormat.formatDatetoSAPDate(oDeadlineDate);
                if (sCurrentDate > sDeadlineDate) {
                    return true;
                } else {
                    return false;
                }
            },

        /**
         * Check if receiver approval deadline has passed
         * 
         * @public
         * @returns {boolean} true = Deadline has passed, false = deadline has not passed
         */
        checkRequesterDeadlineIsPassed: function() {
            var oCurrentDate = new Date();
            var oDeadlineDate = formatterFormat.formatSAPDate(this.getComponentModel("AppData").getProperty("/RQ_DEADLINE_DATE"));
            var sCurrentDate = formatterFormat.formatDatetoSAPDate(oCurrentDate);
            var sDeadlineDate = formatterFormat.formatDatetoSAPDate(oDeadlineDate);
            if (sCurrentDate > sDeadlineDate) {
                return true;
            } else {
                return false;
            }
        },    
        
        checkDeadlineIsPassed : function(){
        	
        	var sApplicationType = this.getAppType(),
        		sIntercoType = this.getIntercoType(),
        		oCurrentDate = new Date(),
        		sCurrentDate = formatterFormat.formatDatetoSAPDate(oCurrentDate),
        		oDeadlineDate, sDeadlineDate;
        		
        	switch(sIntercoType){
            case parameters.getIntercoTypeList().R3P:
        		switch(sApplicationType){
        		case parameters.getAppTypeList().Issuer:
        			oDeadlineDate = formatterFormat.formatSAPDate(this.getComponentModel("AppData").getProperty("/IS_DEADLINE_DATE"));
        			break;
        		case parameters.getAppTypeList().Receiver:
        			oDeadlineDate = formatterFormat.formatSAPDate(this.getComponentModel("AppData").getProperty("/RC_DEADLINE_DATE"));
            		break;
        	    default:
        	    	return false;
        		}
    		    break;
        	default:
        		return false;
        	}
        	
        	sDeadlineDate = formatterFormat.formatDatetoSAPDate(oDeadlineDate);
            if (sCurrentDate > sDeadlineDate) {
                return true;
            } else {
                return false;
            }
        },
    	
        /**
         * Is issuer app ? 
         * @param {string} sAppType the application type
         * @public
         * @returns {boolean} visibility value
         */          
        isAppIssuer : function(sAppType){
            switch (sAppType) {
	            case parameters.getAppTypeList().Issuer:
	                return true;
	            default:
	                return false;
            }
        },  

        /**
         * Is receiver app ? 
         * @param {string} sAppType the application type
         * @public
         * @returns {boolean} visibility value
         */          
        isAppReceiver : function(sAppType){
            switch (sAppType) {
	            case parameters.getAppTypeList().Receiver:
	                return true;
	            default:
	                return false;
            }
        },  

        /**
         * Is accountant app ? 
         * @param {string} sAppType the application type
         * @public
         * @returns {boolean} visibility value
         */          
        isAppAccountant : function(sAppType){
            switch (sAppType) {
	            case parameters.getAppTypeList().Accountant:
	                return true;
	            default:
	                return false;
            }
        },   /**
        * Is accountant app ? 
        * @param {string} sAppType the application type
        * @public
        * @returns {boolean} visibility value
        */          
       isAppR3PAccountant : function(sAppType){
           switch (sAppType) {
               case parameters.getAppTypeList().Accountant:
                   return true;
               default:
                   return false;
           }
       }, 
        
         /**
          * Check if app is r3p related
          * 
          * @param {string} sAppType the application type
          * @public
          * @returns {boolean} true or false
          */
        isAppR3P: function(sIntercoType){
        	if(sIntercoType === parameters.getIntercoTypeList().R3P){
        		return true;
        	}
        	return false;
        },
   
       isAppDisplay: function(sAppType){
          	if(sAppType === parameters.getAppTypeList().Display){
          		return true;
           	}
          	return false;
       },
       
       isInvoicePL: function(sIntercoType, sCountry, sInvoiceType){
    	   if(sIntercoType === parameters.getIntercoTypeList().Major
    			   && sCountry === parameters.getCountryList().Poland
    			   && sInvoiceType === parameters.getInvoiceTypeList().Invoice){
    		   return true;
    	   }
    	   return false;
       },
    		
        /**
         * Calculate markup amount
         * @param {float} fItemAmount the item amount
         * @public
         * @returns {string} the markup amount
         */
        getMarkupAmount: function(fItemAmount) {

            var iMarkupPercent = parseFloat(this.getComponentModel("AppData").getProperty("/MARKUP_PERCENT"));
            var fMarkupItemAmount = 0;

            fMarkupItemAmount = fItemAmount * iMarkupPercent / 100;

            return fMarkupItemAmount;

        },

        /**
         * Get markup text
         * @public
         * @returns {string} the markup item text
         */
        getMarkupText: function() {

            var iMarkupPercent = parseFloat(this.getComponentModel("AppData").getProperty("/MARKUP_PERCENT"));

            return this.oBundle.getText("request.table.items.markup", iMarkupPercent.toString());

        },

        /**
         * Determine default debit/credit indicator 
         * @param {string} sInvoiceType the request invoice type
         * @param {string} sItemType the item type
         * @public
         * @returns {string} the debit/credit indicator
         */
        getDefaultDCInd: function(sInvoiceType, sItemType) {
            switch (sInvoiceType) {
                case parameters.getInvoiceTypeList().Invoice:
                case parameters.getInvoiceTypeList().DebitCreditNote:	
                case parameters.getInvoiceTypeList().GrantSubsidies:
                    switch (sItemType) {
                        case parameters.getItemTypeList().Issuing:
                            return parameters.getDCIndList().Credit;
                        case parameters.getItemTypeList().Receiving:
                            return parameters.getDCIndList().Debit;
                        default:
                            return "";
                    }
                case parameters.getInvoiceTypeList().CreditMemo:
                    switch (sItemType) {
                        case parameters.getItemTypeList().Issuing:
                            return parameters.getDCIndList().Debit;
                        case parameters.getItemTypeList().Receiving:
                            return parameters.getDCIndList().Credit;
                        default:
                            return "";
                    }
                default:
                    return "";
            }
        },

        /**
         * Set Business Area collection based on request items 
         * Check if value in request is still in the collection else set in null
         * @param {string} sItemType the item type wihch defined whether to treat issuing or receiving
         * @public
         */
        setBusinessAreaCollection: function(sItemType) {

            var oRequestModel = this.getComponentModel("Request");
            var aRequestItems = [],
                oBusinessArea = {
                    results: []
                },
                oFoundRequestBusinessArea = {};

            switch (sItemType) {
                case parameters.getItemTypeList().Issuing:
                    aRequestItems = oRequestModel.getProperty("/IssuingItems/results");
                    break;
                case parameters.getItemTypeList().Receiving:
                    aRequestItems = oRequestModel.getProperty("/ReceivingItems/results");
                    break;
                default:
                    break;
            }

            aRequestItems.forEach(function(oItem, iIdx, aRequestItems) {
                if (oItem.FlagDelete === false) {
                    var oSearchItem = utilities.findFirstItem(oBusinessArea.results, "BusinessAreaCode", oItem.BusinessAreaCode);
                    if (!oSearchItem && oItem.BusinessAreaCode !== "") {
                        oBusinessArea.results.push({
                            "BusinessAreaCode": oItem.BusinessAreaCode,
                            "BusinessAreaName": oItem.Descriptions.BusinessAreaName
                        });
                    }
                }
            }, this);

            switch (sItemType) {
                case parameters.getItemTypeList().Issuing:
                    this.setComponentModel(new JSONModel(oBusinessArea), "IssuingBusinessAreaCollection");
                    oFoundRequestBusinessArea = utilities.findFirstItem(oBusinessArea.results, "BusinessAreaCode", oRequestModel.getProperty("/HeaderData/IsBusinessAreaCode"));
                    if (!oFoundRequestBusinessArea) {
                        oRequestModel.setProperty("/HeaderData/IsBusinessAreaCode", "");
                    }
                    break;
                case parameters.getItemTypeList().Receiving:
                    this.setComponentModel(new JSONModel(oBusinessArea), "ReceivingBusinessAreaCollection");
                    oFoundRequestBusinessArea = utilities.findFirstItem(oBusinessArea.results, "BusinessAreaCode", oRequestModel.getProperty("/HeaderData/RcBusinessAreaCode"));
                    if (!oFoundRequestBusinessArea) {
                        oRequestModel.setProperty("/HeaderData/RcBusinessAreaCode", "");
                    }
                    break;
                default:
                    break;
            }

        },

        /**
         * Duplicate a selected item 
         * @param {string} sItemType the item type which defined whether to treat issuing or receiving
         * @param {string} sItemPath the item path which defined whether to treat issuing or receiving
         * @public
         * @returns {object} the newly created item
         */
        initiateDuplicateItem: function(sItemType, sItemPath) {

            var oRequestItem = {},
                oRequestModel = this.getComponentModel("Request"),
                fnCountItems = _countItems;

            oRequestItem = odataService.createODataEntityObject(this.oDataModel, "RequestItem", []);
            utilities.copyProperties(oRequestItem, oRequestModel.getProperty(sItemPath));

            switch (sItemType) {
                case parameters.getItemTypeList().Issuing:
                    oRequestItem.ItemId = (fnCountItems(oRequestModel.getProperty("/IssuingItems/results"), sItemType) + 1).toString();
                    break;
                case parameters.getItemTypeList().Receiving:
                    oRequestItem.ItemId = (fnCountItems(oRequestModel.getProperty("/ReceivingItems/results"), sItemType) + 1).toString();
                    break;
                default:
                    break;
            }

            return oRequestItem;

        },

        /**
         * Get substitution app url
         * @public
         * @returns {string} the url
         */
        getSubstitutionAppUrl: function() {

            var sLocation = window.location.href;
            var sSubstitutionHash = this.getComponentModel("AppData").getProperty("/SUBSTITUTION_HASH");

            if (sLocation && sSubstitutionHash) {
                return window.location.href.split('#')[0] + sSubstitutionHash;
            } else {
                return "";
            }

        },

        /**
         * Determine reporting date from initial value
         * @param {string} sRetentionDays	  the number of retention days    
         * @public
         * @returns {object} the date
         */
        getReportingDateFromInitialValue: function(sRetentionDays) {
            //	    		var oCurrentDate = new Date();
            //	    		return formatterFormat.formatDatetoSAPDate(oCurrentDate);
            var iRetentionDays = sRetentionDays ? parseInt(sRetentionDays, 10) : 0;
            if (iRetentionDays > 0) {
                return new Date(new Date().getTime() - (iRetentionDays * 24 * 60 * 60 * 1000));
            }
            return new Date();
        },

        /**
         * Determine reporting date to initial value
         * @param {string} sRetentionDays	  the number of retention days    
         * @public
         * @returns {object} the date
         */
        getReportingDateToInitialValue: function(sRetentionDays) {
            return new Date();
        },

        /**
         * Determine reporting date from minimum value
         * @param {string} sMaxRetentionYear	the max number of retention year 
         * @public
         * @returns {object} the date
         */
        getReportingDateFromMinValue: function(sMaxRetentionYear) {

            var oCurrentDate = new Date();
            var iMaxRetentionYear = sMaxRetentionYear ? parseInt(sMaxRetentionYear, 10) : 0;
            if (iMaxRetentionYear > 0) {
                return new Date(oCurrentDate.getFullYear() - 2, oCurrentDate.getMonth(), 1);
            }
            return new Date();
        },

        requestItemHasError: function(oRequestItemStates) {

            var bHasError = false;

            if (oRequestItemStates) {
                for (var sState in oRequestItemStates) {
                    if (oRequestItemStates.hasOwnProperty(sState) &&
                        oRequestItemStates[sState] === parameters.getSAPStateList().Error) {
                        bHasError = true;
                    }
                }
            }

            return bHasError;

        },

        determineAutopostingGlobalStatus: function(oHeaderData) {

            if (oHeaderData) {

                if (oHeaderData.IsAutoposting === true && oHeaderData.RcAutoposting === true) {
                    if (oHeaderData.IsAutopostingStatus === parameters.getAutomaticIntegrationStatusList().Success &&
                        oHeaderData.RcAutopostingStatus === parameters.getAutomaticIntegrationStatusList().Success) {
                        return parameters.getAutomaticIntegrationStatusList().Success;
                    } else if (oHeaderData.IsAutopostingStatus === parameters.getAutomaticIntegrationStatusList().None ||
                        oHeaderData.RcAutopostingStatus === parameters.getAutomaticIntegrationStatusList().None) {
                        return parameters.getAutomaticIntegrationStatusList().InProgress;
                    } else {
                        return parameters.getAutomaticIntegrationStatusList().Error;
                    }
                } else {
                    return parameters.getAutomaticIntegrationStatusList().None;
                }
            } else {
                return parameters.getAutomaticIntegrationStatusList().None;
            }

        },

        getCurrencyMaxDecimals: function(sCurrencyCode) {

            var fnGetCurrencyMaxDecimals = _getCurrencyMaxDecimals;

            return fnGetCurrencyMaxDecimals.call(this, sCurrencyCode);

        },
        
        formatAmountWithDecimal: function(sAmount, sCurrencyCode) {

            var fnGetCurrencyMaxDecimals = _getCurrencyMaxDecimals,
                iDecimal = fnGetCurrencyMaxDecimals.call(this, sCurrencyCode);

            return formatterFormat.formatAmountWithDecimal(sAmount, iDecimal);
        },

        formatAmountWithDecimalAndSpaceSeparator: function(sAmount, sCurrencyCode) {

            var fnGetCurrencyMaxDecimals = _getCurrencyMaxDecimals,
                iDecimal = fnGetCurrencyMaxDecimals.call(this, sCurrencyCode);

            return formatterFormat.formatAmountWithDecimalAndSpaceSeparator(sAmount, iDecimal);
        },

    };

    return oBusinessRules;

}, this)