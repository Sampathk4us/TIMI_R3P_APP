/************************************************************************
 * Project            : TIMI                                 			*
 * Process            : FI                                              *
 * Task code          : FI062                                           *
 * Functional document:                                					*
 * Technical document :                                    				*
 *----------------------------------------------------------------------*
 * File       	 : model/formatterText.js   	        				*
 * Author        : David TEA                                            *
 * Company       : Resp                                               	*
 * Creation Date : 12/05/2016                                           *
 *----------------------------------------------------------------------*
 * Description   : Provides text formatters functions   				*		
 *                                                                      *
 ************************************************************************
 * Modification nÂ° ...........	: M001									*
 * Project ...................	: TIMI									*
 * Author .................... 	: Marion Alberny                        *
 *----------------------------------------------------------------------*
 * Modification date ......... 	: 04/11/2016 							*
 * Transport order ........... 	:  										*
 * Change Request ............ 	: CR2016-273225  						*
 * Description ............... 	: Display Document Number if exists 	*
 ************************************************************************
 * Modification nÂ° ........... : M002									*
 * Project ................... : TIMI									*
 * Author .................... : Marion Alberny                         *
 *----------------------------------------------------------------------*
 * Modification date ......... : 01/02/2017								*
 * Transport order ........... : 										*
 * Change Request ............ : 										*
 * Description ............... : Add get Company CodeName From 			*
 *								 Company								*
 ************************************************************************
 * Modification nÂ° ........... : M003									*
 * Project ................... : TIMI									*
 * Author .................... : Abhisek Chaudhuri                      *
 *----------------------------------------------------------------------*
 * Modification date ......... : 06/03/2023								*
 * Transport order ........... : DO8K906365								*
 * Change Request ............ : ITS-CHG0318025							*
 * Description ............... : Add logic to get correct deadline text	*
 *								 for Balance Sheet Requester tile		*
 ************************************************************************/
/**
 * @fileOverview Provides text formatters functions
 * @author David Tea 
 * @version 1.0
 */
sap.ui.define([
    "cus/fi/timi/rel/model/parameters",
    "cus/fi/timi/rel/assets/js/helpers/utilities",
    "cus/fi/timi/rel/model/formatterFormat",
    "cus/fi/timi/rel/model/businessRules",
    "cus/fi/timi/rel/model/miscellaneous"
], function(parameters, utilities, formatterFormat, businessRules, miscellaneous) {
    "use strict";

    /**
     * Count non delete items
     * @param {Object[]} aItems the request receiving items table
     * @public
     * @returns {integer} the number of items 
     */
    var fnCountRequestItems = function(aItems) {
        var iCount = 0;
        aItems.forEach(function(oItem, iIdx) {
            if(oItem.FlagDelete === false) {
                iCount += 1;
            }
        });
        return iCount;
    };

    var oText = {

        /**
         * Set select control text format : "PropertyCode" - "PropertyName"
         * @param {string} sPropertyCode the property id
         * @param {string} sPropertyName the property name
         * @public
         * @returns {string} the formatted text
         */
        formatTextAndId: function(sPropertyCode, sPropertyName) {

            if(sPropertyName) {
                return sPropertyCode + ' - ' + sPropertyName;
            }

            return sPropertyCode;

        },

        /**
         * Get overview page title
         * @param {string} sAppType the application type code
         * @public
         * @returns {string} title text
         */
        getAppTitle: function(sIntercoType, sAppType) {
        	switch(sIntercoType){
        	case parameters.getIntercoTypeList().R3P:
	            switch (sAppType) {
	                case parameters.getAppTypeList().Issuer:
	                    return this.oBundle.getText("overview.title.r3p.issuerapp");
	                case parameters.getAppTypeList().Receiver:
	                    return this.oBundle.getText("overview.title.r3p.receiverapp");
	                case parameters.getAppTypeList().Accountant:
	                    return this.oBundle.getText("overview.title.r3p.accountantapp");
	                default:
	                    return "";
	            }      	
        	default:
        		return "";
        	}
        },

        getAttachmentText: function(aAttachments) {

            if(aAttachments &&
                aAttachments.length > 0) {
                return this.oBundle.getText("text.attachment.number", aAttachments.length);
            }

            return this.oBundle.getText("text.attachment");

        },

        /**
         * Set request Automatic Integration tooltip text
         * 
         * @param {string} sAppType the app type
         * @param {object} oHeaderData the header data 
         * @public
         * @returns {string} the formatted text
         */
        getAutomaticIntegrationTooltip: function(sAppType, oHeaderData) {

            if(sAppType === parameters.getAppTypeList().Accountant  || sAppType === parameters.getAppTypeList().Display) {
                switch (businessRules.determineAutopostingGlobalStatus(oHeaderData)) {
                    case parameters.getAutomaticIntegrationStatusList().Success:
                        return this.oBundle.getText("overview.table.tooltip.success", [oHeaderData.Descriptions.IsSystemName, oHeaderData.IsBatch, oHeaderData.Descriptions.RcSystemName, oHeaderData.RcBatch]);
                    case parameters.getAutomaticIntegrationStatusList().InProgress:
                        return this.oBundle.getText("overview.table.tooltip.inprogress", [oHeaderData.Descriptions.IsSystemName, oHeaderData.IsBatch, oHeaderData.Descriptions.RcSystemName, oHeaderData.RcBatch]);
                    case parameters.getAutomaticIntegrationStatusList().Error:
                        return this.oBundle.getText("overview.table.tooltip.error", [oHeaderData.Descriptions.IsSystemName, oHeaderData.IsBatch, oHeaderData.Descriptions.RcSystemName, oHeaderData.RcBatch]);
                    case parameters.getAutomaticIntegrationStatusList().None:
                    default:
                        return "";
                };
            } else {
                return "";
            }

        },

        /**
         * Get company code and name
         * @param {string} sCompanyCode the local company code
         * @public
         * @returns {string} the company code and name
         */
        getCompanyCodeNameFromCompanyCode: function(sCompanyCode) {

            var oCompanyItem = {};
            var aCompanyList = !!this.getComponentModel("CompanyCollection") ? this.getComponentModel("CompanyCollection").getData().results : [];

            oCompanyItem = utilities.findFirstItem(aCompanyList, "CompanyCode", sCompanyCode);

            if(oCompanyItem) {
                return this.formatterText.formatTextAndId(oCompanyItem.CompanyCode, oCompanyItem.CompanyName);
            }

            return sCompanyCode;

        },

        /**
         * Get company name
         * @param {string} sCompanyCode the company code
         * @public
         * @returns {string} the company name
         */
        getCompanyNameFromCompanyCode: function(sCompanyCode) {

            var oCompanyItem = {},
                aCompanyList = !!this.getComponentModel("CompanyCollection") ? this.getComponentModel("CompanyCollection").getData().results : [];

            oCompanyItem = utilities.findFirstItem(aCompanyList, "CompanyCode", sCompanyCode);

            if(oCompanyItem) {
                return oCompanyItem.CompanyName;
            }

            return sCompanyCode;

        },

        
        /**
         * Get company code and name
         * @param {string} sCompanyCode the local company code
         * @public
         * @returns {string} the company code and name
         */
        getCompanyNameFromCompanyCode: function(sCompanyCode) {

            var oCompanyItem = {};
            var aCompanyList = !!this.getComponentModel("CompanyCollection") ? this.getComponentModel("CompanyCollection").getData().results : [];

            oCompanyItem = utilities.findFirstItem(aCompanyList, "CompanyCode", sCompanyCode);

            if(oCompanyItem) {
                return oCompanyItem.CompanyName;
            }

            return sCompanyCode;

        },

        /**
         * Get country name
         * @param {string} sCountryCode the country
         * @public
         * @returns {string} the country
         */
        getCountryNameFromCountryCode: function(sCountryCode) {

            var oCountryItem = {},
                aCountryList = !!this.getComponentModel("CountryCollection") ? this.getComponentModel("CountryCollection").getData().results : [];

            oCountryItem = utilities.findFirstItem(aCountryList, "CountryCode", sCountryCode);

            if(oCountryItem) {
                return oCountryItem.CountryName;
            }

            return sCountryCode;

        },
        
        /**
         * Get major request creation mode
         * @param {string} sCreationModeId the creation mode code
         * @public
         * @returns {string} the creation mode text
         */        
        getCreationModeText: function(sCreationModeId) {
            switch (sCreationModeId) {
                case parameters.getCreationModeList().Manual:
                    return this.oBundle.getText("creationtype.manual");
                case parameters.getCreationModeList().Upload:
                    return this.oBundle.getText("creationtype.fileuploading");
                default:
                    return "";
            }
        },

        /**
         * Get interco type text
         * @param {string} sIntercoType the interco type
         * @public
         * @returns {string} the interco type text
         */
        getIntercoTypeText: function(sIntercoType) {
            switch (sIntercoType) {
                case parameters.getIntercoTypeList().R3P:
                    return this.oBundle.getText("intercotype.r3p");
                default:
                    return "";
            }
        },     
        
        /**
         * Get deadline text
         * @param {string} sAppType the application type code
         * @param {object} oAppData the application data
         * @public
         * @returns {string} the deadline text
         */
        getDeadlineText: function(oAppData) {

            var oDate = {},
                bIsDeadlinePassed = false;
            
            bIsDeadlinePassed = businessRules.checkDeadlineIsPassed.call(this);
            
            if(businessRules.isAppIssuer(oAppData.appType)){
            	if(bIsDeadlinePassed === true) {
                    return this.oBundle.getText("overview.deadlinemesssage.issuerapp.passed");
                } else {
                    oDate = formatterFormat.formatSAPDate(oAppData.IS_DEADLINE_DATE);
                    return this.oBundle.getText("overview.deadlinemesssage.issuerapp", formatterFormat.formatDate(oDate));
                }
            }
            
            if(businessRules.isAppReceiver(oAppData.appType)){
                if(bIsDeadlinePassed === true) {
                    return this.oBundle.getText("overview.deadlinemesssage.receiverapp.passed");
                } else {
                    oDate = formatterFormat.formatSAPDate(oAppData.RC_DEADLINE_DATE);
                    return this.oBundle.getText("overview.deadlinemesssage.receiverapp", formatterFormat.formatDate(oDate));
                }
            }
           return "";
           
        },

        /**
         * Get debit/credit indicator text
         * @param {string} sDCIndicatorCode the d/c indicator code
         * @public
         * @returns {string} the debit/credit text
         */
        getDCIndicatorText: function(sDCIndicatorCode) {

            var oDCIndicatorItem = {};
            var aDCIndicatorList = !!this.getComponentModel("DCIndicatorCollection") ? this.getComponentModel("DCIndicatorCollection").getData().results : [];

            oDCIndicatorItem = utilities.findFirstItem(aDCIndicatorList, "DCIndicatorCode", sDCIndicatorCode);

            if(oDCIndicatorItem) {
                return oDCIndicatorItem.DCIndicatorName;
            }

            return sDCIndicatorCode;
        },

        /**
         * Set header issuing business area placeholder text 
         * 
         * 	set text only for editable field
         * 
         * @param {boolean} bEditable the field editable value
         * @public
         * @returns {string} the formatted text
         */
        getHeaderIssuingBusinessAreaPlaceholderText: function(bEditable) {
            if(bEditable === true) {
                return this.oBundle.getText("request.header.placeholder.issuingbusinessarea");
            } else {
                return "";
            }
        },

        /**
         * Set header receiving business area placeholder text 
         * 
         * 	set text only for editable field
         * 
         * @param {boolean} bEditable the field editable value
         * @public
         * @returns {string} the formatted text
         */
        getHeaderReceivingBusinessAreaPlaceholderText: function(bEditable) {
            if(bEditable === true) {
                return this.oBundle.getText("request.header.placeholder.receivingbusinessarea");
            } else {
                return "";
            }
        },

        /**
         * Get invoice type text
         * @param {string} sInvoiceType the invoice type code
         * @public
         * @returns {string} the invoice type text
         */
        getInvoiceTypeText: function(sInvoiceType) {

            var oInvoiceTypeItem = {};
            var aInvoiceTypeList = !!this.getComponentModel("DocumentTypeCollection") ? this.getComponentModel("DocumentTypeCollection").getData().results : [];

            oInvoiceTypeItem = utilities.findFirstItem(aInvoiceTypeList, "DocumentTypeCode", sInvoiceType);

            if (oInvoiceTypeItem) {
                return oInvoiceTypeItem.DocumentTypeName;
            }

            return sInvoiceType;
        },
        
        /**
         * Get issuing items table title 
         * @param {string}   sAppType 			the application type
         * @param {Object[]} aItems 			the request receiving items table
         * @public
         * @returns {string} the title text
         */
        getIssuingItemsTableTitle: function(aItems) {

            var iCount = 0;
            iCount = fnCountRequestItems(aItems);
            return this.oBundle.getText("request.table.issuingitems.count", iCount.toString());
        },

        /**
         * Get item type text
         * @param {string} sItemType the item type code
         * @public
         * @returns {string} the item type text
         */
        getItemTypeText: function(sItemType) {

            switch (sItemType) {
                case parameters.getItemTypeList().Issuing:
                    return this.oBundle.getText("request.label.itemtype.issuing");
                case parameters.getItemTypeList().Receiving:
                    return this.oBundle.getText("request.label.itemtype.receiving");
                default:
                    return '';
            }

        },

        /**
         * Get item view title
         * @param {string} sItemType the item type
         * @param {string} sItemId the item id
         * @param {string} sItemText the item text
         * @public
         * @returns {string} title text
         */
        getItemViewTitle: function(sItemType, sItemId, sItemText) {
            switch (sItemType) {
                case parameters.getItemTypeList().Issuing:
                    return this.oBundle.getText("item.view.title.issuingitems", [sItemId, sItemText]);
                case parameters.getItemTypeList().Receiving:
                    return this.oBundle.getText("item.view.title.receivingitems", [sItemId, sItemText]);
                default:
                    return "";
            }
        },

        /**
         * Get legal entity code from local company
         * @param {string} sCompanyCode the local company code
         * @public
         * @returns {string} the Legal Entity code
         */
        getLegalEntityCodeFromCompanyCode: function(sCompanyCode) {

            var oCompanyItem = {},
                aCompanyList = !!this.getComponentModel("CompanyCollection") ? this.getComponentModel("CompanyCollection").getData().results : [];

            oCompanyItem = utilities.findFirstItem(aCompanyList, "CompanyCode", sCompanyCode);

            if(oCompanyItem) {
                return oCompanyItem.LegalEntityCode;
            }

            return "";

        },

        /**
         * Get legal entity code name
         * @param {string} sLegalEntityCode the local company code
         * @public
         * @returns {string} the legal entity name
         */
        getLegalEntityCodeNameFromLegalEntityCode: function(sLegalEntityCode) {

            var oLegalEntityItem = {},
                aLegalEntityList = !!this.getComponentModel("LegalEntityCollection") ? this.getComponentModel("LegalEntityCollection").getData().results : [];

            oLegalEntityItem = utilities.findFirstItem(aLegalEntityList, "LegalEntityCode", sLegalEntityCode);

            if(oLegalEntityItem) {
                return this.formatterText.formatTextAndId(oLegalEntityItem.LegalEntityCode, oLegalEntityItem.LegalEntityName);
            }

            return sLegalEntityCode;

        },

        /**
         * Get legal entity name
         * @param {string} sLegalEntityCode the local company code
         * @public
         * @returns {string} the legal entity name
         */
        getLegalEntityNameFromLegalEntityCode: function(sLegalEntityCode) {

            var oLegalEntityItem = {},
                aLegalEntityList = !!this.getComponentModel("LegalEntityCollection") ? this.getComponentModel("LegalEntityCollection").getData().results : [];

            oLegalEntityItem = utilities.findFirstItem(aLegalEntityList, "LegalEntityCode", sLegalEntityCode);

            if(oLegalEntityItem) {
                return oLegalEntityItem.LegalEntityName;
            }

            return sLegalEntityCode;

        },

        /**
         * Set request offmarkup amount text
         * 
         * @param {Object[]} aIssuingItems the request issuing items
         * @public
         * @returns {string} the formatted text
         */
        getOffMarkupAmountText: function(aIssuingItems) {

            var sDocType = this.getComponentModel("Request").getProperty("/HeaderData/DocumentTypeCode"),
                sCurrencyCode = this.getComponentModel("Request").getProperty("/HeaderData/CurrencyCode"),
                sItemType = parameters.getItemTypeList().Issuing;

            var sAmount = miscellaneous.calculateItemsTotalAmount.call(this, sDocType, sItemType, aIssuingItems, true);

            return this.oBundle.getText("request.label.offmarkup", businessRules.formatAmountWithDecimalAndSpaceSeparator.call(this, sAmount, sCurrencyCode));

        },

        getPostingDocumentText: function(sDocumentNumber, sFiscalYear) {

            if(sDocumentNumber && sDocumentNumber !== '') {
                if(sFiscalYear && sFiscalYear !== '0000') {
                    return sDocumentNumber + " " + sFiscalYear;
                } else {
                    return sDocumentNumber;
                }
            }

            return "";

        },

        getPostingFiscalYearText: function(sDocumentNumber, sFiscalYear) {

            if(sDocumentNumber && sDocumentNumber !== '') {
                if(sFiscalYear && sFiscalYear !== '0000') {
                    return sFiscalYear;
                } else {
                    return "";
                }
            }

            return "";

        },

        /**
         * Get receiving items table title 
         * @param {string}   sAppType 			the application type
         * @param {Object[]} aItems 			the request receiving items table
         * @public
         * @returns {string} the title text
         */
        getReceivingItemsTableTitle: function(aItems) {

            var iCount = 0;
            iCount = fnCountRequestItems(aItems);
            return this.oBundle.getText("request.table.receivingitems.count", iCount.toString());

        },

        /**
         * Get request view title
         * @param {string} sRequestId the request id
         * @public
         * @returns {string} title text
         */
        getRequestViewTitle: function(sRequestId) {
            return this.oBundle.getText("request.label.requestid", sRequestId.toString());
        },

        /**
         * Get submitted status text
         * @param {string} sAppType the application type code
         * @public
         * @returns {string} submitted status text
         */
        getStatusSubmittedText: function(sIntercoType, sAppType) {
        	
        	if(businessRules.isAppIssuer(sAppType)){
        		return this.oBundle.getText("request.status.submitted.issuer");
        	}
        	
        	if(businessRules.isAppReceiver(sAppType)){
        		return this.oBundle.getText("request.status.submitted.receiver");
        	}
        	
        	return this.oBundle.getText("request.status.submitted");

        },

        /**
         * Get submitted status text
         * @param {string} sAppType the application type code
         * @param {string} sStatusId the status id
         * @public
         * @returns {string} status text
         */
        getStatusText: function(sIntercoType, sAppType, sStatusId) {

            var oStatusItem = {};
            var aStatusList = !!this.getComponentModel("StatusCollection") ? this.getComponentModel("StatusCollection").getData().results : [];

            if(aStatusList.length > 0) {

                oStatusItem = utilities.findFirstItem(aStatusList, "StatusCode", sStatusId);

                if(oStatusItem) {
                    if(sStatusId === parameters.getStatusList().Submitted) {
                        return this.formatterText.getStatusSubmittedText.call(this, sIntercoType, sAppType);
                    } else {
                        return oStatusItem.StatusName;
                    }
                }

            }

            // If no status collection then get text from i18n	
            switch (sStatusId) {
                case parameters.getStatusList().Draft:
                    return this.oBundle.getText("request.status.draft");
                case parameters.getStatusList().Submitted:
                    return this.formatterText.getStatusSubmittedText.call(this, sAppType);
                case parameters.getStatusList().Approved:
                    return this.oBundle.getText("request.status.approved");
                case parameters.getStatusList().RejectedIssuer:
                    return this.oBundle.getText("request.status.rejected.issuer");
                case parameters.getStatusList().RejectedReceiver:
                    return this.oBundle.getText("request.status.rejected.receiver");
                case parameters.getStatusList().Validated:
                    return this.oBundle.getText("request.status.validated");
                case parameters.getStatusList().ValidatedReceiver:
                    return this.oBundle.getText("request.status.validated.receiver");
                case parameters.getStatusList().Generated:
                    return this.oBundle.getText("request.status.generated");
                default:
                    return "";
            }

        },

        /**
         * Get substitute request tooltip text
         * @param {boolean} bIsSubstitution the request substitution flag
         * @param {string} sSubstituteUser the substitute fullname
         * @param {object} oDateBegin the starting date
         * @param {object} oDateEnd the ending date
         * @public
         * @returns {string} the formatted text
         */
        getSubstituteRequestTooltip: function(bIsSubstitution, sSubstituteUser, oDateBegin, oDateEnd) {

            if(bIsSubstitution === true) {
                return this.oBundle.getText("request.substitution.tooltip", [sSubstituteUser, formatterFormat.formatDate(oDateBegin), formatterFormat.formatDate(oDateEnd)]);
            }

            return "";
        },

        getWFActionText: function(sActionId) {

            switch (sActionId) {
                case parameters.getActionList().Submit:
                    return this.oBundle.getText("request.workflow.actiontext.submit");
                case parameters.getActionList().Approve:
                    return this.oBundle.getText("request.workflow.actiontext.approve");
                case parameters.getActionList().RejectIssuer:
                    return this.oBundle.getText("request.workflow.actiontext.reject.issuer");
                case parameters.getActionList().RejectReceiver:
                    return this.oBundle.getText("request.workflow.actiontext.reject.receiver");
                case parameters.getActionList().Reclaim:
                    return this.oBundle.getText("request.workflow.actiontext.reclaim");
                case parameters.getActionList().Validate:
                    return this.oBundle.getText("request.workflow.actiontext.validate");
                case parameters.getActionList().ValidateRA:
                    return this.oBundle.getText("request.workflow.actiontext.validate.receiver");
                case parameters.getActionList().Generate:
                    return this.oBundle.getText("request.workflow.actiontext.generate");
                case parameters.getActionList().Upload:
                    return this.oBundle.getText("request.workflow.actiontext.upload");
                case '': // Means initial creation
                    return this.oBundle.getText("request.workflow.actiontext.create");
                default:
                    return '';
            }
        },

        /**
         * Set workflow action text 
         * @param {string} sUsername the username
         * @param {string} sActionId the action id
         * @param {boolean} bIsSubstitution the property name
         * @param {string} sUsernameOrigin the property name
         * @public
         * @returns {string} the formatted text
         */
        getWFUserActionText: function(sUsername, sActionId, bIsSubstitution, sUsernameOrigin) {

            var sText = "";

            if(bIsSubstitution === true) {
                sText = this.oBundle.getText("request.worflow.substitution.text", [sUsername, sUsernameOrigin]);
            } else {
                sText = sUsername;
            }

            switch (sActionId) {
                case parameters.getActionList().Submit:
                    return this.oBundle.getText("request.workflow.actiontext.submit", sText);
                case parameters.getActionList().Approve:
                    return this.oBundle.getText("request.workflow.actiontext.approve", sText);
                case parameters.getActionList().RejectIssuer:
                    return this.oBundle.getText("request.workflow.actiontext.reject.issuer", sText);
                case parameters.getActionList().RejectReceiver:
                    return this.oBundle.getText("request.workflow.actiontext.reject.receiver", sText);
                case parameters.getActionList().Reclaim:
                    return this.oBundle.getText("request.workflow.actiontext.reclaim", sText);
                case parameters.getActionList().Validate:
                    return this.oBundle.getText("request.workflow.actiontext.validate", sText);
                case parameters.getActionList().ValidateRA:
                    return this.oBundle.getText("request.workflow.actiontext.validate.receiver", sText);
                case parameters.getActionList().Generate:
                    return this.oBundle.getText("request.workflow.actiontext.generate", sText);
                case '': // Means initial creation
                    return this.oBundle.getText("request.workflow.actiontext.create", sText);
                default:
                    return sText;
            }
        },

        getWFUserText: function(sUsername, bIsSubstitution, sUsernameOrigin) {
            var sText = "";

            if(bIsSubstitution === true) {
                sText = this.oBundle.getText("request.worflow.substitution.text", [sUsername, sUsernameOrigin]);
            } else {
                sText = sUsername;
            }
            return sText;
        },
        
        getRequestHeaderInfoType : function(sInvoiceTypeValue, sMajorTypeValue){
        	
        	// if(businessRules.isAppMajor(this.getIntercoType())){
        	// 	return sInvoiceTypeValue + " / " + sMajorTypeValue;
        	// }else{
        		return sInvoiceTypeValue
        	// }
        	
        },
        
        getRequestNumberText : function(aRequests){
        	if(aRequests){
            	if(aRequests.length>1){
            		return aRequests.length + " " + this.oBundle.getText("label.request.plural");
            	}else{
            		return aRequests.length + " " + this.oBundle.getText("label.request.singular");
            	}
        	}
        	return "";
        	
        },
        
        getMajorTypeText : function(sMajorTypeId){
        	
            var oMajorTypeItem = {},
            	aMajorTypeList = !!this.getComponentModel("MajorTypeCollection") ? this.getComponentModel("MajorTypeCollection").getData().results : [];

            if(aMajorTypeList.length > 0) {

                oMajorTypeItem = utilities.findFirstItem(aMajorTypeList, "MajorTypeCode", sMajorTypeId);

                if(oMajorTypeItem) {
                    return oMajorTypeItem.MajorTypeName;
                }

            }
            
            return "";
        	
        },

        getDocumentTypeText : function(sDocumentTypeId){
        	
            var oDocumentTypeItem = {},
            	aDocumentTypeList = !!this.getComponentModel("DocumentTypeCollection") ? this.getComponentModel("DocumentTypeCollection").getData().results : [];

            if(aDocumentTypeList.length > 0) {

                oDocumentTypeItem = utilities.findFirstItem(aDocumentTypeList, "DocumentTypeCode", sDocumentTypeId);

                if(oDocumentTypeItem) {
                    return oDocumentTypeItem.DocumentTypeName;
                }

            }
            
            return "";
        	
        },
        
        getTreasuryNatureText : function(sTreasuryNatureId){
        	
            var oTreasuryNatureItem = {},
            	aTreasuryNatureList = [];//this.getComponentModel("NatureCollection").getData().results;

            if(aTreasuryNatureList.length > 0) {

                oTreasuryNatureItem = utilities.findFirstItem(aTreasuryNatureList, "NatureCode", sTreasuryNatureId);

                if(oTreasuryNatureItem) {
                    return oTreasuryNatureItem.NatureName;
                }

            }
            
            return "";
        	
        },      
        
        formatTierComboBox : function(sPropertyCode, sPropertyName, sTrainStationId){

            var sText = ""

            if(sPropertyName) {
                sText = sPropertyCode + ' - ' + sPropertyName;
                if(!!sTrainStationId){
                    sText = sText + ' [' + sTrainStationId + ']';
                }
                return sText;
            }
            
            sText = sPropertyCode;
            if(!!sTrainStationId){
                sText = sText + ' [' + sTrainStationId + ']';
            }
            return sText;
        }
        
    };

    return oText;

}, true);