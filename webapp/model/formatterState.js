/************************************************************************
 * Project            : TIMI                                 			*
 * Process            : FI                                              *
 * Task code          : FI062                                           *
 * Functional document:													*
 * Technical document :													*
 *----------------------------------------------------------------------*
 * File       	 : model/formatterState.js								*
 * Author        : David TEA                                            *
 * Company       : Resp													*
 * Creation Date : 12/05/2016                                           *
 *----------------------------------------------------------------------*
 * Description   : Provides state formatters functions					*		
 *                                                                      *
 ************************************************************************
 * Modification nÂ° ...........	: M001									*
 * Project ...................	: TIMI									*
 * Author ....................	: Marion Alberny						*
 *----------------------------------------------------------------------*
 * Modification date .........	: 04/11/2016							*
 * Transport order ...........	:										*
 * Change Request ............	: CR2016-273225							*
 * Description ...............	: Automating Integration Status Icon	*
 ************************************************************************
 * Modification nÂ° ...........	: M002									*
 * Project ...................	: TIMI									*
 * Author ....................	: Marion Alberny						*
 *----------------------------------------------------------------------*
 * Modification date ......... 	: 26/01/2017							*
 * Transport order ........... 	:										*
 * Change Request ............ 	: CR									*
 * Description ............... 	: Manage Highlightin of substitution 	*
 *								  requests								*
 ************************************************************************/
/**
 * @fileOverview Provides state formatters functions
 * @author David Tea 
 * @version 1.0
 */
sap.ui.define([
    "sap/ui/core/ValueState",
    "cus/fi/timi/rel/model/businessRules",
    "cus/fi/timi/rel/model/parameters"
], function(ValueState, businessRules, parameters) {
    "use strict";

    var oState = {


        getActionIconColor: function(sActionId) {
            switch (sActionId) {
                case parameters.getActionList().Save:
                    return "#6a6a6a";
                case parameters.getActionList().Submit:
                    return "#e66e00";
                case parameters.getActionList().Approve:
                    return "#2e75B6";
                case parameters.getActionList().RejectIssuer:
                    return "#d51515";
                case parameters.getActionList().Delete:
                    return "#6a6a6a";
                case parameters.getActionList().Reclaim:
                    return "#e66e00";
                case parameters.getActionList().Validate:
                    return "#049c15";
                case parameters.getActionList().Generate:
                    return "#008236";
                case parameters.getActionList().RejectReceiver:
                    return "#b91414";
                case parameters.getActionList().ValidateRA:
                    return "#0f961d";
                default:
                    return "#6a6a6a";
            }
        },

        getActionsOnRequestIconBGColor: function(bSelected) {
            if(bSelected) {
                return "#4f667a";
            }
            return "transparent";
        },

        getActionsOnRequestIconColor: function(bSelected) {
            if(bSelected) {
                return "#FFFFFF";
            }
            return "#4f667a";
        },

        getAutomaticIntegrationIcon: function(sAppType, oHeaderData) {

            if(sAppType === parameters.getAppTypeList().Accountant || sAppType === parameters.getAppTypeList().Display) {
                switch (businessRules.determineAutopostingGlobalStatus(oHeaderData)) {
                    case parameters.getAutomaticIntegrationStatusList().Success:
                        return "sap-icon://sys-enter";
                    case parameters.getAutomaticIntegrationStatusList().InProgress:
                        return "sap-icon://future";
                    case parameters.getAutomaticIntegrationStatusList().Error:
                        return "sap-icon://sys-cancel";
                    case parameters.getAutomaticIntegrationStatusList().None:
                    default:
                        return "";
                };
            } else {
                return "";
            }

        },

        getAutomaticIntegrationIconColor: function(sAppType, oHeaderData) {

            if(sAppType === parameters.getAppTypeList().Accountant  || sAppType === parameters.getAppTypeList().Display) {
                switch (businessRules.determineAutopostingGlobalStatus(oHeaderData)) {
                    case parameters.getAutomaticIntegrationStatusList().Success:
                        return "#008236";
                    case parameters.getAutomaticIntegrationStatusList().InProgress:
                        return "#888888";
                    case parameters.getAutomaticIntegrationStatusList().Error:
                        return "#D51515";
                    case parameters.getAutomaticIntegrationStatusList().None:
                    default:
                        return "";
                };
            } else {
                return "";
            }

        },

        getCustomErrorColor: function(bValue) {
            if(bValue) {
                return "red";
            } else {
                return " ";
            }
        },

        /**
         * Get Status state
         * @param {string} sStatusId the status id 
         * @public
         * @returns {string} the state value
         */
        getCustomStatusState: function(sStatusId) {

            switch (sStatusId) {
                case parameters.getStatusList().Draft:
                    return "Draft";
                case parameters.getStatusList().Submitted:
                    return "Submitted";
                case parameters.getStatusList().Approved:
                    return "Approved";
                case parameters.getStatusList().RejectedIssuer:
                    return "Rejected";
                case parameters.getStatusList().RejectedReceiver:
                    return "RejectedReceiver";
                case parameters.getStatusList().Validated:
                    return "Validated";
                case parameters.getStatusList().ValidatedReceiver:
                    return "ValidatedReceiver";
                case parameters.getStatusList().Generated:
                    return "Generated";
                default:
                    return "";
            }

        },

        /**
         * Get deadline text
         * @param {string} sAppType the application type code
         * @param {object} oAppData the application data
         * @public
         * @returns {string} the deadline state
         */
        getDeadlineMessageState: function(oAppData) {

            var bIsDeadlinePassed = false;
            
            bIsDeadlinePassed = businessRules.checkDeadlineIsPassed.call(this);
            if(bIsDeadlinePassed === true) {
                return ValueState.Error;
            } else {
                return ValueState.Warning;
            }

            return ValueState.Warning;
            
        },

        getItemIdJustifyContent: function(oRequestItemStates) {
            if(businessRules.requestItemHasError(oRequestItemStates)) {
                return "SpaceBetween";
            } else {
                return "End";
            }
        },

        getMessageStateIcon: function(sMessageType) {
            switch (sMessageType) {
                case parameters.getMessageStateList().Error:
                    return "sap-icon://message-error";
                case parameters.getMessageStateList().Warning:
                    return "sap-icon://message-warning";
                case parameters.getMessageStateList().Success:
                    return "sap-icon://message-success";
                case parameters.getMessageStateList().Information:
                    return "sap-icon://message-information";
                default:
                    return "";
            }
        },

        getMessageStateIconColor: function(sMessageType) {
            switch (sMessageType) {
                case parameters.getMessageStateList().Error:
                    return "#d51515";
                case parameters.getMessageStateList().Warning:
                    return "#e66e00";
                case parameters.getMessageStateList().Success:
                    return "#008236";
                case parameters.getMessageStateList().Information:
                    return "#ffff00";
                default:
                    return "#888888";
            }
        },

        getRejectActionId: function(bVisibilityIssuer, bVisibilityReceiver) {
            if(bVisibilityIssuer && bVisibilityReceiver) {
                return parameters.getActionList().RejectIssuer; // Return at least something -> be managed later
            } else if(bVisibilityIssuer) {
                return parameters.getActionList().RejectIssuer;
            } else if(bVisibilityReceiver) {
                return parameters.getActionList().RejectReceiver;
            }
            return "";
        },

        /**
         * Get request substitution state
         * @param {boolean} bIsSubstitution the request substitution flag
         * @public
         * @returns {boolean} state value
         */
        getRequestSubstitutionState: function(bIsSubstitution) {

            if(bIsSubstitution === true) {
                return 'X';
            } else {
                return '';
            }

        },
        
        getRequestSubstitutionHighlight : function(bIsSubstitution) {

            if(bIsSubstitution === true) {
                return "Information";;
            } else {
                return "None";
            }

        },

        /**
         * Get value state base on mandatory property
         * @param {string} sStateId the state property from SAP
         * @public
         * @returns {string} the state value
         */
        getValueState: function(sStateId) {
            switch (sStateId) {
                case parameters.getSAPStateList().Error:
                    return ValueState.Error;
                case parameters.getSAPStateList().Warning:
                    return ValueState.Warning;
                default:
                    return ValueState.None;
            }
        },

        getUploadFileCreationFileUploaderState : function(sIntercoType, sMajorTypeCode){
        	
        	switch(sIntercoType) {
        	case parameters.getIntercoTypeList().Major:
        	if(sMajorTypeCode && sMajorTypeCode !== ""){
    			return true;
        	}
        	break;
        	
        	default:
        		return true;
        		break;	
        	}	
        	return false;
        	
        },
        
    };

    return oState;

}, true);