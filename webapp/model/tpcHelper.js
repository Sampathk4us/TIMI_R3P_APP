/************************************************************************
 * Project            : TIMI                                 			*
 * Process            : FI                                              *
 * Task code          : FI062                                           *
 * Functional document:                                					*
 * Technical document :                                    				*
 *----------------------------------------------------------------------*
 * File       	 : model/tpcHelper.js   	        					*
 * Author        : David TEA                                            *
 * Company       : Resp                                               	*
 * Creation Date : 02/02/2017                                           *
 *----------------------------------------------------------------------*
 * Description   : Provides table personalization controller functions  *		
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
 * @fileOverview Table Personalization Controller functions
 * @author David Tea 
 * @version 1.0
 */
sap.ui.define([
    "sap/m/TablePersoController",
    "sap/ui/model/json/JSONModel",
    "cus/fi/timi/rel/model/parameters",
    "cus/fi/timi/rel/model/variantManagement",
    "cus/fi/timi/rel/model/ushellPersonalization"
], function(TablePersoController, JSONModel, parameters, variantManagement, ushellPersonalization) {
    "use strict";

    /**
     * Get the request items table id depending on the item type
     * @param {string} sItemType the item type
     * @private
     * @returns {string} the table id
     */
    function _getRequestItemsTableId(sItemType) {
        switch (sItemType) {
            case parameters.getItemTypeList().Issuing:
                return parameters.getTableControlIdList().RequestIssuingItems;
                break;
            case parameters.getItemTypeList().Receiving:
                return parameters.getTableControlIdList().RequestReceivingItems;
                break;
            default:
                return "";
                break;
        }
    };

    /**
     * Get the reporting table id depending on the reporting type
     * @param {string} sReportingType the reporting type
     * @private
     * @returns {string} the table id
     */
    function _getReportingTableId(sReportingType) {
        switch (sReportingType) {
            case parameters.getReportingTypeList().RequestHeader:
                return parameters.getTableControlIdList().ReportingRequestHeader;
            case parameters.getReportingTypeList().RequestItem:
                return parameters.getTableControlIdList().ReportingRequestItems;
            default:
                return "";
                break;
        };
    };

    /**
     * Initiate request item personalization service
     * @private
     * @returns {Object} the personalization service
     */
    function _getRequestItemsPersonalizationService() {

        var oPersonalizationService = {

            oResourceBundle: this.getResourceBundle(),

            getPersData: function() {
                var oDeferred = new jQuery.Deferred();
                var oBundle = this._oBundle;
                oDeferred.resolve(oBundle);
                return oDeferred.promise();
            },

            setPersData: function(oPersonalization) {
                // Store data in local storage
                var oDeferred = new jQuery.Deferred();
                this._oBundle = oPersonalization;
                oDeferred.resolve();
                return oDeferred.promise();
            },

            getCaption: function(oColumn) {
                if (oColumn.getHeader() && oColumn.getHeader().getText) {
                    if (oColumn.getHeader().getText() == ">") {
                        return this.oResourceBundle.getText("request.table.column.navigatetoitem");
                    }
                }
                return null;
            },

        };

        return oPersonalizationService;

    };

    var oTablePersonalization = {

        /**
         * Initiate request item table perso controller
         * @param {string} sAppType the application type
         * @param {string} sItemType the item type
         * @param {string} sItemPath the item binding path
         * @public
         * @returns {Object} the table perso controller
         */
        initiateItemTPC: function(sAppType, sItemType, sItemPath) {

            var fnGetRequestItemsTableId = _getRequestItemsTableId;
            var fnGetRequestItemsPersonalizationService = _getRequestItemsPersonalizationService;

            // Get the table
            var oTable = this.getView().byId(fnGetRequestItemsTableId(sItemType));
            // Get personalization service
            var oPersonalizationService = fnGetRequestItemsPersonalizationService.call(this);
            // Get the variant management control id
            var sVariantManagementControlId = variantManagement.getRequestItemsVariantManagementControlId(sItemType);

            // Initialize the table perso controller
            var oTPC = new TablePersoController({
                table: oTable,
                componentName: parameters.getPersonalizationComponentNameList().RequestItems,
                showSelectAll: true,
                persoService: oPersonalizationService,
                personalizationsDone: (function() {
                    this.getView().byId(sVariantManagementControlId).currentVariantSetModified(true)
                }.bind(this))
            }).activate();

            return oTPC;

        },

        /**
         * Initiate reporting table perso controller
         * @param {string} sReportingType the reporting type (request items, request header)
         * @public
         * @returns {Object} the table perso controller
         */
        initiateReportingTPC: function(sReportingType) {

            var fnGetReportingTableId = _getReportingTableId;

            // Get the table
            var oTable = this.getView().byId(fnGetReportingTableId(sReportingType));

            // Initialize the table perso controller
            var oTPC = new TablePersoController({
                table: oTable,
                componentName: parameters.getPersonalizationComponentNameList().Reporting,
                showSelectAll: true,
                persoService: ushellPersonalization.getUShellReportingPersonalizer(sReportingType),
            }).activate();

            return oTPC;

        },

    };

    return oTablePersonalization;

});