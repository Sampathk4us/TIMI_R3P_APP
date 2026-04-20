/************************************************************************
 * Project            : TIMI                                 			*
 * Process            : FI                                              *
 * Task code          : FI062                                           *
 * Functional document:                                					*
 * Technical document :                                    				*
 *----------------------------------------------------------------------*
 * File       	 : controller/BaseController.js   	        			*
 * Author        : David TEA                                            *
 * Company       : Resp                                               	*
 * Creation Date : 12/05/2016                                           *
 *----------------------------------------------------------------------*
 * Description   : BaseController for adding convenience method   		*		
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
 * @fileOverview BaseController for adding convenience method
 * @author David Tea 
 * @version 1.0
 */
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/Device",
    "sap/ui/core/routing/History",
	"cus/fi/timi/rel/model/odataService",
    "cus/fi/timi/rel/model/parameters"
], function(Controller, Device, History, odataService, parameters) {
    "use strict";

    /**
     * Instantiates a (MVC-style) controller. Consumers should call the
     * constructor only in the typed controller scenario. In the generic
     * controller use case, they should use {@link sap.ui.controller} instead.
     * 
     * @class A generic controller implementation for the UI5
     *        Model-View-Controller concept.
     * @extends sap.ui.core.mvc.Controller
     * @constructor
     * @param {string|object[]} sName The name of the controller to instantiate.
     *          If a controller is defined as real sub-class, the "arguments" of
     *          the sub-class constructor should be given instead.
     * @public
     * @alias resp.se16n.controller.BaseController
     */
    return Controller.extend("cus.fi.timi.rel.controller.BaseController", {

        /**
         * Get component defined routes.
         * 
         * @public
         * @returns {sap.ui.core.routing.Router} the routes
         */
        getRouter: function() {
            return this.getOwnerComponent().getRouter();
        },

        /**
         * Convenience method for getting the resource bundle defined in the
         * component
         * 
         * @public
         * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the
         *          component
         */
        getResourceBundle: function() {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        /**
         * Get component model
         * 
         * @param {string} sModelName the name of the model defined in the component
         * @public
         * @returns {sap.ui.model.odata.ODataModel} the ODataModel
         */
        getComponentModel: function(sModelName) {
            return this.getOwnerComponent().getModel(sModelName);
        },

        /**
         * Set model in component
         * 
         * @param {object} oModel the model to set
         * @param {string} sModelName the name of the model to set
         * @public
         */
        setComponentModel: function(oModel, sModelName) {
            this.getOwnerComponent().setModel(oModel, sModelName);
        },
        
        getAppDataModel : function(){
        	return this.getOwnerComponent().getModel("AppData");
        },

        /**
         * Get application type : I=Issuer, R=Receiver, A=Accountant
         * 
         * @public
         * @returns {string} the application type
         */
        getIntercoType: function() {
            return this.getComponentModel("AppData").getProperty("/intercoType");
            return this.getOwnerComponent().getComponentData().startupParameters.intercoType[0];
        },

        /**
         * Get application type : I=Issuer, R=Receiver, A=Accountant
         * 
         * @public
         * @returns {string} the application type
         */
        getAppType: function() {
            return this.getComponentModel("AppData").getProperty("/appType")
            return this.getOwnerComponent().getComponentData().startupParameters.appType[0];
        },

        /**
         * Get application type : I=Issuer, R=Receiver, A=Accountant
         * 
         * @public
         * @returns {string} the application type
         */
        getAppAction: function() {
            return this.getComponentModel("AppData").getProperty("/appAction")
            return this.getOwnerComponent().getComponentData().startupParameters.appAction[0];
        },

        /**
         * This method can be called to determine whether the sapUiSizeCompact or
         * sapUiSizeCozy design mode class should be set, which influences the size
         * appearance of some controls.
         * 
         * @public
         * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' -
         *         or an empty string if no css class should be set
         */
        getContentDensityClass: function() {
            if (this._sContentDensityClass === undefined) {
                // check whether FLP has already set the content density class; do
                // nothing in this case
                if (jQuery(document.body).hasClass("sapUiSizeCozy") || jQuery(document.body).hasClass("sapUiSizeCompact")) {
                    this._sContentDensityClass = "";
                } else if (!Device.support.touch) { // apply "compact" mode if touch is
                    // not supported
                    this._sContentDensityClass = "sapUiSizeCompact";
                } else {
                    // "cozy" in case of touch support; default for most sap.m controls,
                    // but needed for desktop-first controls like sap.ui.table.Table
                    this._sContentDensityClass = "sapUiSizeCozy";
                }
            }
            return this._sContentDensityClass;
        },
        
        setRequestChangedFlag: function(bState) {
            this.getComponentModel("AppData").setProperty("/hasRequestChanged", bState);
        },

        getRequestChangedFlag: function() {
            return this.getComponentModel("AppData").getProperty("/hasRequestChanged");
        },

        /**
         * Back navigation function.
         * 
         * @public
         */
        onNavBack: function() {
            var oHistory, sPreviousHash;
            oHistory = History.getInstance();
            sPreviousHash = oHistory.getPreviousHash();
            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getRouter().navTo("overview", {}, true /* no history */ );
            }
        },
        

        onPressShowMasterDataDoc : function(){
            odataService.getMasterDataDocUrl.call(this)
                .then(function(oData){
                    if(!!oData.MasterDataDocUrl && !!oData.MasterDataDocUrl.Data){
                        sap.m.URLHelper.redirect(oData.MasterDataDocUrl.Data, true);
                    }else{
                    
                    }
                }.bind(this))
        }
    });
}, true);