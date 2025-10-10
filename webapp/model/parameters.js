/************************************************************************
* Project            : TIMI                                 			*
* Process            : FI                                              	*
* Task code          : FI062                                           	*
* Functional document:                                					*
* Technical document :                                    				*
*-----------------------------------------------------------------------*
* File       	: model/parameters.js   	        					*
* Author        : David TEA                                            	*
* Company       : Resp                                               	*
* Creation Date : 12/05/2016                                           	*
*-----------------------------------------------------------------------*
* Description   : List of constants parameters   						*		
*                                                                      	*
*************************************************************************
* Modification nÂ° ...........	: M001									*
* Project ...................	: TIMI									*
* Author .................... : Marion Alberny                       	*
*-----------------------------------------------------------------------*
* Modification date ......... 	: 04/11/2016 							*
* Transport order ........... 	:  										*
* Change Request ............ 	: CR2016-273225  						*
* Description ............... 	: Withholding Tax and SGL Indicator 	*
* 								  Automatic Integration Status List		*
*************************************************************************
/**
* @fileOverview List of constants parameters
* @author David Tea 
* @version 1.0
*/
sap.ui.define([

], function() {
    "use strict";

    var oParameters = {

        /**
         * Get Application type enumeration
         * @public
         * @returns {Object} the enumeration of the application type
         */
        getAppTypeList: function() {
            return {
                "Issuer": "I",
                "Receiver": "R",
                "Accountant": "A",
                "Display": "M",
                "Requester": "Q",
            }
        },
        
        /**
         * Request Creation Mode List
         * @public
         * @returns {Object} the enumeration of the request creation mode
         */
        getCreationModeList : function(){
            return {
                "Manual": "M",
                "Upload": "U",
            }
        },

        getCreationModeReportingColorList: function() {
            return {
                "Manual": "#2E75B6",
                "Upload": "#60A1D0",
            }
        },
        
        /**
         * Request Creation Mode List
         * @public
         * @returns {Object} the enumeration of the request creation mode
         */
        getRequestDisplayModeList : function(){
            return {
                "List": "1",
                "Group": "2",
            }
        },
        
        /**
         * Get Launchpad Ushell Personalization Container Name
         * @public
         * @returns {String} the SAP Launchpad Ushell Personalization Container name
         */
        getUShellPersonalizationContainerName: function() {
            return "YWS_FI062_TIMI";
        },

        /**
         * Get UShell Personalization item name list
         * @public
         * @returns {Object} the enumeration of UShell Personalization item name
         */
        getUShellPersonalizationItemNameList: function() {
            return {
                "ReportingRequestHeader": "ReportingRequestHeader",
                "ReportingRequestItems": "ReportingRequestItems",
                "RequestIssuingItemsDefaultVariantKey": "RequestIssuingItemsDefaultVariantKey",
                "RequestReceivingItemsDefaultVariantKey": "RequestReceivingItemsDefaultVariantKey",
            }
        },

        /**
         * Get UShell Personalization Variant set name list
         * @public
         * @returns {Object} the enumeration of UShell Personalization Variant set name
         */
        getUShellPersonalizationVariantSetNameList: function() {
            return {
                "RequestIssuingItems": "IssuingVariantSet",
                "RequestReceivingItems": "ReceivingVariantSet"
            }
        },

        /**
         * Get UShell Personalization Variant item value key
         * @public
         * @returns {Object} the enumeration of UShell Personalization Variant item value key
         */
        getUShellPersonalizationVariantItemValueKeyList: function() {
            return {
                "RequestItems": "RequestItemsVariant"
            }
        },

        /**
         * Get UShell Personalization component name list
         * @public
         * @returns {Object} the enumeration of UShell Personalization component name
         */
        getPersonalizationComponentNameList: function() {
            return {
                "Reporting": "Reporting",
                "RequestItems": "RequestItems"
            }
        },

        /**
         * Get Variant Management control id list 
         * @public
         * @returns {Object} the enumeration of Variant Management control id
         */
        getVariantManagementControlIdList: function() {
            return {
                "RequestIssuingItems": "vmIssuingItems",
                "RequestReceivingItems": "vmReceivingItems"
            }
        },

        /**
         * Get Variant JSON Model name list
         * @public
         * @returns {Object} the enumeration of Variant JSON Model name
         */
        getVariantJSONModelNameList: function() {
            return {
                "RequestIssuingItems": "IssuingVariantList",
                "RequestReceivingItems": "ReceivingVariantList"
            }
        },

        /**
         * Get tables id list
         * @public
         * @returns {Object} the enumeration of tables id
         */
        getTableControlIdList: function() {
            return {
                "RequestIssuingItems": "tIssuingItems",
                "RequestReceivingItems": "tReceivingItems",
                "ReportingRequestHeader": "tReportingRequestHeader",
                "ReportingRequestItems": "tReportingRequestItem",
            }
        },

        /**
         * Get request items column id prefix list for variant defaut data management
         * @public
         * @returns {Object} the enumeration of request items column id prefix
         */
        getRequestItemsColumnIdPrefixList: function() {
            return {
                "RequestIssuingPrefix": "colIssuing",
                "RequestReceivingPrefix": "colReceiving",
            }
        },

        /**
         * Get Application id enumeration
         * @public
         * @returns {Object} the enumeration of the application id
         */
        getAppActionList: function() {
            return {
                "Reporting": "R", //TIMI Reporting App
                "Managing": "M", //TIMI Managing App
            }
        },

        /**
         * Get Status List
         * @public
         * @returns {Object} the enumeration of the status
         */
        getStatusList: function() {
            return {
                "Draft": "0",
                "Submitted": "1",
                "Approved": "2",
                "RejectedIssuer": "3",
                "Validated": "9",
                "Generated": "10",
                "RejectedReceiver": "11",
                "ValidatedReceiver": "13"
            }
        },

        getStatusReportingColorList: function() {
            return {
                "Draft": "#999999",
                "Submitted": "#E66E00",
                "Approved": "#2E75B6",
                "RejectedIssuer": "#FF0000",
                "Validated": "#049C15",
                "Generated": "#008236",
                "RejectedReceiver": "#b91414",
                "ValidatedReceiver": "#0f961d",
            }
        },

        /**
         * Get Action List
         * @public
         * @returns {Object} the enumeration of the action
         */
        getActionList: function() {
            return {
                "Save": "1",
                "Submit": "2",
                "Approve": "3",
                "RejectIssuer": "4",
                "Delete": "5",
                "Reclaim": "7",
                "Validate": "8",
                "Generate": "9",
                "RejectReceiver": "10",
                "ValidateRA": "12",
                "Upload": "13"
            }
        },
        
        /**
         * Get Reporting Types
         * @public
         * @returns {Object} the enumeration of the action
         */
        getReportingTypeList: function() {
            return {
                "RequestHeader": "1",
                "RequestItem": "2",
                "Charts": "3",
            }
        },

        /**
         * Get Invoice Type List
         * @public
         * @returns {Object} the enumeration of the invoice type
         */
        getInvoiceTypeList: function() {
            return {
                "Invoice": "1",
                "CreditMemo": "2",
                "DebitCreditNote": "3",
                "AdvanceInvoice" : "4",
                "FinalInvoice" : "5",
                "GrantSubsidies" : "6"
            }
        },

        /**
         * Get Item Type List
         * @public
         * @returns {Object} the enumeration of the item type
         */
        getItemTypeList: function() {
            return {
                "Issuing": "1",
                "Receiving": "2",
            }
        },

        /**
         * Get Master Data Type for TIMI
         * @public
         * @returns {Object} the enumeration of the item type
         */
        getMasterDataType: function() {
            return "1";
        },

        /**
         * Get Debit/Credit Indicator List
         * @public
         * @returns {Object} the enumeration of the debit/credit indicator
         */
        getDCIndList: function() {
            return {
                "Credit": "H",
                "Debit": "S",
            }
        },

        /**
         * Get data field List id
         * @public
         * @returns {Object} the enumeration of data field List id for data validation or value help
         */
        getDataFieldTypeList: function() {
            return {
                "ReceivingController": "1",
                "IssuingTax": "2",
                "ReceivingTax": "3",
                "IssuingItemTax": "4",
                "ReceivingItemTax": "5",
                "IssuingItemCostCenter": "6",
                "ReceivingItemCostCenter": "7",
                "IssuingItemNature": "8",
                "ReceivingItemNature": "9",
                "IssuingItemAccount": "10",
                "ReceivingItemAccount": "11",
                "IssuingItemInternalOrder": "12",
                "ReceivingItemInternalOrder": "13",
                "IssuingItemWBS": "14",
                "ReceivingItemWBS": "15",
                "IssuingSGLInd": "16",
                "ReceivingSGLInd": "17",
                "Vendor": "18",
                "Customer": "19",
                "Currency": "20",
                "WithholdingTaxType": "21",
                "WithholdingTaxCode": "22",
                "IssuingItemGMID": "23",
                "ReceivingItemGMID": "24",   
                "IssuingItemUnit": "25",
                "ReceivingItemUnit": "26",   
                "IssuingItemBusinessArea": "27",
                "ReceivingItemBusinessArea": "28",   
                "IssuingItemHsnSac": "29",
                "ReceivingItemHsnSac": "30",       
                "IssuingBusinessPlace": "31",
                "ReceivingBusinessPlace": "32",        
                "IssuingBusinessAreaAlt": "33",
                "ReceivingBusinessAreaAlt": "34",           
            }
        },

        /**
         * List SAP state values (Domain YSTATE)
         * @public
         * @returns {Object} the enumeration of state
         */
        getSAPStateList: function() {
            return {
                "Error": "E",
                "Warning": "W",
                "None": ""
            }
        },

        /**
         * List message state values
         * @public
         * @returns {Object} the enumeration of state
         */
        getMessageStateList: function() {
            return {
                "Error": "E",
                "Warning": "W",
                "Success": "S",
                "Information": "I"
            }
        },
        
        /**
         * Get Attachment Mode enumeration
         * @public
         * @returns {Object} the enumeration of the attachment mode
         */
        getAttachmentModeList: function() {
            return {
                "Idle": "0",
                "Add": "1",
                "Delete": "2",
                "Update": "3"
            }
        },

        /**
         * List Automatic Integration status values
         * @public
         * @returns {Object} the enumeration of status
         */
        getAutomaticIntegrationStatusList: function() {
            return {
                "Error": "E",
                "Success": "S",
                "None": "",
                "InProgress": "I"
            }
        },

        /**
         * List Generation options
         * @public
         * @returns {Object} the enumeration of options
         */
        getGenerationOptionList: function() {
            return {
                "localfileonly": 1,
                "automaticonly": 2,
                "localfileandautomatic": 3
            }
        },

        /**
         * Batch Type List
         * @public
         * @returns {Object} the enumeration of batch type
         */
        getBatchTypeList: function() {
            return {
                "UpdateRequest": "1"
            }
        },
        
        /**
         * Get upload control enumeration
         * @public
         * @returns {Object} the enumeration of the upload control type
         */
        getUploadControlTypeList: function() {
            return {
                "FileUploader": "FU",
                "UploadCollection": "UC",
            }
        },
        
        getIntercoTypeList : function(){
            return {
                "Minor": "1",
                "Major": "2",
                "BalanceSheet": "3",
                "Treasury": "4",
                "R3P" : "5" //Related Third Party
            }
        },
        
        getIntercoTypeReportingColorList: function() {
            return {
                "Minor": "#2E75B6",
                "Major": "#E66E00",
                "BalanceSheet": "#049C15",
                "Treasury": "#424492",
                "R3P": "#2E75B6",
            }
        },
        
        getLoadingDialogModeList : function(){
        	return {
        		"UploadRequests" : "1",
        		"CreateRequests" : "2",
        		"SubmitRequests" : "3",
        		"ValidateRequests" : "4",
        		"GenerateRequests" : "5",
        		"RejectRequests" : "6",
        		"DeleteRequests" : "7",
        	}
        },
        
        getCountryList : function(){
        	return {
        		France : "FR",
        		Poland : "PL"
        	}
        },
        
        getInvoiceTypeList : function(){
        	return {
        		"Invoice" : "1",
        		"CreditMemo" : "2",
        		"DCNote" : "3",
        		"AdvanceInvoice" : "4",
        		"FinalInvoice" : "5",
                "GrantSubsidies" : "6"
        	}
        }
        
    };

    return oParameters;

}, true)