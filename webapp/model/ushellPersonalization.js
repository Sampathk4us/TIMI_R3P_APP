/************************************************************************
 * Project            : TIMI                                 			*
 * Process            : FI                                              *
 * Task code          : FI062                                           *
 * Functional document:                                					*
 * Technical document :                                    				*
 *----------------------------------------------------------------------*
 * File       	 : model/ushellPersonalization.js   	        		*
 * Author        : David TEA                                            *
 * Company       : Resp                                               	*
 * Creation Date : 02/02/2017                                           *
 *----------------------------------------------------------------------*
 * Description   : Provides ushell personalization functions   			*		
 *                                                                      *
 ************************************************************************
 * Modification nÂ° ........... : 										*
 * Project ................... : 										*
 * Author .................... :                                        *
 *----------------------------------------------------------------------*
 * Modification date ......... : 										*
 * Transport order ........... : 										*
 * Change Request ............ : 										*
 * Description ............... : 										*
 ************************************************************************/
/**
 * @fileOverview ushell (Launchpad) personalization functions
 * @author David Tea 
 * @version 1.0
 */
sap.ui.define([
    "cus/fi/timi/rel/model/parameters"
], function(parameters) {
    "use strict";

    /**
     * Get reporting ushell personalization item name depending on reporting type
     * @param {string} sReportingType the reporting type
     * @public
     * @return {string} the ushell personalization item name
     */
    function _getReportingUShellPersonalizationItemName(sReportingType) {

        switch (sReportingType) {
            case parameters.getReportingTypeList().RequestHeader:
                return parameters.getUShellPersonalizationItemNameList().ReportingRequestHeader;
            case parameters.getReportingTypeList().RequestItem:
                return parameters.getUShellPersonalizationItemNameList().ReportingRequestItems;
            default:
                return '';
                break;
        }

    };

    /**
     * Get request items default variant key ushell personalization item name 
     * @param {string} sItemType the item type
     * @public
     * @return {string} the request items default variant key ushell personalization item name 
     */
    function _getRequestItemsDefaultVariantKeyUShellPersonalizationItemName(sItemType) {

        switch (sItemType) {
            case parameters.getItemTypeList().Issuing:
                return parameters.getUShellPersonalizationItemNameList().RequestIssuingItemsDefaultVariantKey;
            case parameters.getItemTypeList().Receiving:
                return parameters.getUShellPersonalizationItemNameList().RequestReceivingItemsDefaultVariantKey;
            default:
                return '';
                break;
        }

    };

    var oPersonalization = {

        /**
         * Get from launchpad personlization data container
         * @param {string} sReportingType the reporting type
         * @public
         * @return {object} the returned saved object
         */
        getUShellReportingPersonalizer: function(sReportingType) {

            var fnGetReportingUShellPersonalizationItemName = _getReportingUShellPersonalizationItemName;
            var oPersonalizer = {};

            if (sap.ushell.Container) {
                oPersonalizer = sap.ushell.Container.getService("Personalization").getPersonalizer({
                    "container": parameters.getUShellPersonalizationContainerName(),
                    "item": fnGetReportingUShellPersonalizationItemName(sReportingType),
                });
            }

            return oPersonalizer;

        },

        /**
         * Get from launchpad personlization data container
         * @param {string} sItemType the item type
         * @public
         * @return {object} the returned saved object
         */
        getUShellRequestItemsDefaultVariantKeyPersonalizer: function(sItemType) {

            var fnGetRequestItemsDefaultVariantKeyUShellPersonalizationItemName = _getRequestItemsDefaultVariantKeyUShellPersonalizationItemName,
            	oPersonalizer = {},
            	sDefaultKeyVariantItemName = fnGetRequestItemsDefaultVariantKeyUShellPersonalizationItemName(sItemType);

            if (sap.ushell.Container) {
                oPersonalizer = sap.ushell.Container.getService("Personalization", sDefaultKeyVariantItemName).getPersonalizer({
                    "container": parameters.getUShellPersonalizationContainerName(),
                    "item": sDefaultKeyVariantItemName,
                });
            }

            return oPersonalizer;

        },

        /**
         * Get from launchpad personalization data container
         * @public
         * @return {object} the returned saved object
         */
        getUShellRequestItemsPersonalizationContainer: function() {

            var oPersonalizationContainer = {};

            if (sap.ushell.Container) {
                oPersonalizationContainer = sap.ushell.Container.getService("Personalization").getPersonalizationContainer(parameters.getUShellPersonalizationContainerName());
            }

            return oPersonalizationContainer;

        },

    };

    return oPersonalization;

});