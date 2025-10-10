/************************************************************************
 * Project            : TIMI                                 			*
 * Process            : FI                                              *
 * Task code          : FI062                                           *
 * Functional document:                                					*
 * Technical document :                                    				*
 *----------------------------------------------------------------------*
 * File       	 : model/formatterVisibility.js   	        			*
 * Author        : David TEA                                            *
 * Company       : Resp                                               	*
 * Creation Date : 12/05/2016                                           *
 *----------------------------------------------------------------------*
 * Description   : Provides visibility formatters functions   			*		
 *                                                                      *
 ************************************************************************
/**
 * @fileOverview Provides visibility functions
 * @author David Tea 
 * @version 1.0
 */
sap.ui.define([
    "cus/fi/timi/rel/model/businessRules",
    "cus/fi/timi/rel/model/parameters"
], function(businessRules, parameters) {
    "use strict";

    var oVisibility = {

        /**
         * Set Automatic Posting column visibility (status of Automatic Integration)
         * @param {string} sAppType the application type code
         * @public
         * @returns {boolean} visibility value
         */
        triggerAutomaticPostingColumnVisibility: function(sIntercoType, sAppType) {
            switch (sAppType) {
                case parameters.getAppTypeList().Accountant:
                case parameters.getAppTypeList().Display:
                    return true;
                default:
                    return false;
            }
        },

        /**
         * Set Approved icon visibility value
         * @param {string} sAppType the application type code
         * @public
         * @returns {boolean} visibility value
         */
        triggerIconApprovedVisibility: function(sIntercoType, sAppType) {
        	return businessRules.isAppR3P(sIntercoType);
        },

        /**
         * Set Draft icon visibility value
         * @param {string} sAppType the application type code
         * @public
         * @returns {boolean} visibility value
         */
        triggerIconDraftVisibility: function(sIntercoType, sAppType) {
        	if(businessRules.isAppIssuer(sAppType)){
        		return true;
        	}
        	return false;
        },

        /**
         * Set Submitted icon visibility value
         * @param {string} sAppType the application type code
         * @public
         * @returns {boolean} visibility value
         */
        triggerIconSubmittedVisibility: function(sIntercoType, sAppType) {
        	
        	if(businessRules.isAppIssuer(sAppType)
                || businessRules.isAppReceiver(sAppType)){
        		return true;
        	}
        	return false;
        	
        },

        /**
         * Set Rejected icon visibility value
         * @param {string} sAppType the application type code
         * @public
         * @returns {boolean} visibility value
         */
        triggerIconRejectedVisibility: function(sIntercoType, sAppType) {
        	if(businessRules.isAppR3P(sIntercoType)){
        		return true;
        	}
        	return false;
        },
        
        /**
         * Set Validated icon visibility value
         * @param {string} sAppType the application type code
         * @public
         * @returns {boolean} visibility value
         */
        triggerIconValidatedVisibility: function(sIntercoType, sAppType) {
        	if(businessRules.isAppR3P(sIntercoType)){
        		return true;
        	}
        	return false;
        },
        
        /**
         * Set Error icon visibility on item error
         * @param {object} oRequestItemStates the states of the item
         * @public
         * @returns {boolean} visibility value
         */
        triggerItemErrorIconVisibility: function(oRequestItemStates) {
            return businessRules.requestItemHasError(oRequestItemStates);
        },

        /**
         * Set Active Substitutions button visibility
         * @param {string} sAppType 			the application type code
         * @public
         * @returns {boolean} visibility value
         */
        triggerNavigateToSubstitutionButtonVisibility: function(sIntercoType, sAppType) {
        	if(businessRules.isAppIssuer(sIntercoType, sAppType)
                || businessRules.isAppReceiver(sIntercoType, sAppType)){
        		return true;
        	}
        	return false;
        },
        
        /**
         * Set overview deadline message visibility for Issuer, Receiver & Requester App
         * @param {string} sAppType the application type code
         * @public
         * @returns {boolean} visibility value
         */
        triggerOverviewMessageVisibility: function(sIntercoType, sAppType) {
        	if(businessRules.isAppIssuer(sAppType)
        			|| businessRules.isAppReceiver(sAppType)){
        		return true;
        	}
        	return false;
        },
  
        /**
         * Set Reject Button Visibility
         * @param {boolean} bVisibilityIssuer the visibility status
         * @param {boolean} bVisibilityReceiver the visibility status
         * @public
         * @returns {boolean} visibility value
         */
        triggerRejectButtonVisibility: function(bVisibilityIssuer, bVisibilityReceiver) {
            if(bVisibilityIssuer || bVisibilityReceiver) {
                return true;
            }
            return false;
        },

        /**
         * Set charts container visibility status
         * @param {object[]} aReportingRequests 	the array of requests data
         * @public
         * @returns {boolean} visibility value
         */
        triggerReportingChartsNoDataMessageVisibility: function(aReportingRequests) {
            return aReportingRequests && aReportingRequests.length > 0 ? false : true;
        },

        /**
         * Set Reporting Charts Visibility
         * @param {string} sReportingType the reporting type code
         * @public
         * @returns {boolean} visibility value
         */
        triggerReportingChartsVisibility: function(sReportingType) {
            return false;
            // switch (sReportingType) {
            //     case parameters.getReportingTypeList().Charts:
            //         return true;
            //     case parameters.getReportingTypeList().RequestHeader:
            //     case parameters.getReportingTypeList().RequestItem:
            //     default:
            //         return false;
            // }
        },

        /**
         * Set Reporting Request Header Visibility
         * @param {string} sReportingType the reporting type code
         * @public
         * @returns {boolean} visibility value
         */
        triggerReportingRequestHeaderVisibility: function(sReportingType) {
            switch (sReportingType) {
                case parameters.getReportingTypeList().RequestHeader:
                    return true;
                case parameters.getReportingTypeList().RequestItem:
                case parameters.getReportingTypeList().Charts:
                default:
                    return false;
            }
        },

        /**
         * Set Reporting Request Item Visibility
         * @param {string} sReportingType the reporting type code
         * @public
         * @returns {boolean} visibility value
         */
        triggerReportingRequestItemVisibility: function(sReportingType) {
            switch (sReportingType) {
                case parameters.getReportingTypeList().RequestItem:
                    return true;
                case parameters.getReportingTypeList().RequestHeader:
                case parameters.getReportingTypeList().Charts:
                default:
                    return false;
            }
        },

        /**
         * Set Reporting tables setting button Visibility
         * @param {string} sReportingType the reporting type code
         * @public
         * @returns {boolean} visibility value
         */
        triggerReportingSettingsButtonVisibility: function(sReportingType) {
            switch (sReportingType) {
                case parameters.getReportingTypeList().RequestHeader:
                    return true;
                case parameters.getReportingTypeList().RequestItem:
                    return true;
                case parameters.getReportingTypeList().Charts:
                default:
                    return false;
            }
        },

        /**
         * Set Request list actions column visibility (Copy & Delete Column)
         * @param {string} sAppType the application type code
         * @public
         * @returns {boolean} visibility value
         */
        triggerRequestListActionColumnVisibility: function(sIntercoType, sAppType) {
        	if(businessRules.isAppIssuer(sAppType)){
        		return true;
        	}
        	return false;
        },

        /**
         * Set Request select column visibility 
         * @param {string} sAppType the application type code
         * @public
         * @returns {boolean} visibility value
         */
        triggerRequestSelectColumnVisibility: function(sIntercoType, sAppType) {
        	if(businessRules.isAppAccountant(sAppType)
                    || businessRules.isAppIssuer(sAppType)){
        		return true;
        	}
        	return false;
        },

        /**
         * Show value state message 
         * @param {string} sStateId the state id
         * @param {string} sMessage the message to display
         * @public
         * @returns {boolean} visibility value
         */
        triggerValueStateMessageVisibility: function(sStateId, sMessage) {
            switch (sStateId) {
                case parameters.getSAPStateList().Error:
                case parameters.getSAPStateList().Warning:
                    if(sMessage !== "") {
                        return true;
                    } else {
                        return false;
                    }
                default:
                    return false;
            }
        },


        /**
         * Set Add New Item Button Visibility
         * @param {string} sAppType the application type code
         * @param {string} sStatusId the status id
         * @param {string} sItemType the item type (Issuing / Receiving)
         * @public
         * @returns {boolean} visibility value
         */
        triggerAddNewItemButtonVisibility: function(sIntercoType, sAppType, sStatusId, sItemType, sCreationMode) {
        	
        	if(businessRules.isAppIssuer(sAppType)){
                switch (sStatusId) {
                	case parameters.getStatusList().Draft:
                	case parameters.getStatusList().RejectedIssuer:
                		return true;
                	default:
                		return false;
	            }
        	}
        	
        	if(businessRules.isAppReceiver(sAppType)){
                switch (sStatusId) {
	                case parameters.getStatusList().Submitted:
	                case parameters.getStatusList().RejectedReceiver:
	                    return sItemType === parameters.getItemTypeList().Receiving ? true : false;
	                default:
	                    return false;
	            }
        	}
 
            return false;
        },

        /**
         * Set Delete Item Button Visibility
         * @param {string} sAppType the application type code
         * @param {string} sStatusId the status id
         * @param {string} sItemType the item type (Issuing / Receiving)
         * @public
         * @returns {boolean} visibility value
         */
        triggerDeleteItemButtonVisibility: function(sIntercoType, sAppType, sStatusId, sItemType, sCreationMode) {
        	
        	if(businessRules.isAppIssuer(sAppType)){
                switch (sStatusId) {
	                case parameters.getStatusList().Draft:
	                case parameters.getStatusList().RejectedIssuer:
	                    return true;
	                default:
	                    return false;
	            }
        	}
        	
        	if(businessRules.isAppReceiver(sAppType)){
                switch (sStatusId) {
	                case parameters.getStatusList().Submitted:
	                case parameters.getStatusList().RejectedReceiver:
	                    return sItemType === parameters.getItemTypeList().Receiving ? true : false;
	                default:
	                    return false;
	            }
        	}
             	
            return false;
        	
        },

        /**
         * Set Duplicate Item Button Visibility
         * @param {string} sAppType the application type code
         * @param {string} sStatusId the status id
         * @param {string} sItemType the item type (Issuing / Receiving)
         * @public
         * @returns {boolean} visibility value
         */
        triggerDuplicateItemButtonVisibility: function(sIntercoType, sAppType, sStatusId, sItemType, sCreationMode) {
            
        	if(businessRules.isAppIssuer(sAppType)){
                switch (sStatusId) {
	                case parameters.getStatusList().Draft:
	                case parameters.getStatusList().RejectedIssuer:
	                    return true;
	                default:
	                    return false;
	            }
        	}
        	
        	if(businessRules.isAppReceiver(sAppType)){
                switch (sStatusId) {
	                case parameters.getStatusList().Submitted:
	                case parameters.getStatusList().RejectedReceiver:
	                    return sItemType === parameters.getItemTypeList().Receiving ? true : false;
	                default:
	                    return false;
	            }
        	}
        	
            return false;
        	
        },

        /**
         * Set Attachment Upload Enabled Button Visibility
         * @param {object[]} aAttachments the attachments array
         * @param {string} sMaxAttachments the maximum number of attachments allowed
         * @param {string} sAppType the application type code
         * @param {string} sStatusId the status id
         * @public
         * @returns {boolean} visibility value
         */
        triggerAttachmentUploadEnabledVisibility: function(aAttachments, sMaxAttachments, sIntercoType, sAppType, sStatusId) {

            if(aAttachments && aAttachments.length >= sMaxAttachments) {
                return false;
            }
            
            if(businessRules.isAppIssuer(sAppType)){
                switch (sStatusId) {
	                case parameters.getStatusList().Draft:
	                case parameters.getStatusList().RejectedIssuer:
	                    return true;
	                default:
	                    return false;
	            }
            }
            
            if(businessRules.isAppReceiver(sAppType)){
                switch (sStatusId) {
	                case parameters.getStatusList().Submitted:
	                case parameters.getStatusList().RejectedReceiver:
	                    return true;
	                default:
	                    return false;
                }
            }
            
            if(businessRules.isAppAccountant(sAppType)){
                switch (sStatusId) {
	                case parameters.getStatusList().Approved:
	                    return true;
	                default:
	                    return false;
	            }
            }
            
            return false;
        },

        /**
         * Set Attachment Delete Button Visibility
         * @param {string} sUserId the current user Id
         * @param {string} sAppType the application type code
         * @param {string} sAttachmentUserCreation the user who uploaded the file
         * @param {string} sStatusId the status id
         * @public
         * @returns {boolean} visibility value
         */
        triggerAttachmentDeleteVisibility: function(sUserId, sIntercoType, sAppType, sAttachmentUserCreation, sStatusId) {

            if(businessRules.isAppIssuer(sAppType)){
                switch (sStatusId) {
	                case parameters.getStatusList().Draft:
	                case parameters.getStatusList().RejectedIssuer:
	                    //Only for the user who has uploaded it
	                    return sUserId === sAttachmentUserCreation ? true : false;
	                default:
	                    return false;
	            }
            }
            
            if(businessRules.isAppReceiver(sAppType)){
                switch (sStatusId) {
	                case parameters.getStatusList().Submitted:
	                case parameters.getStatusList().RejectedReceiver:
	                    //Only for the user who has uploaded it
	                    return sUserId === sAttachmentUserCreation ? true : false;
	                default:
	                    return false;
	            }
            }
            
            if(businessRules.isAppAccountant(sAppType)){
                switch (sStatusId) {
	                case parameters.getStatusList().Approved:
	                    //Only for the user who has uploaded it
	                    return sUserId === sAttachmentUserCreation ? true : false;
	                default:
	                    return false;
	            }
            }
            
            return false;

        },

    };

    return oVisibility;

}, true);