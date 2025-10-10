/************************************************************************
 * Project            : TIMI                                 			*
 * Process            : FI                                              *
 * Task code          : FI062                                           *
 * Functional document:                                					*
 * Technical document :                                    				*
 *----------------------------------------------------------------------*
 * File       	 : view/NotFound.controller.js   	        			*
 * Author        : David TEA                                            *
 * Company       : Resp                                               	*
 * Creation Date : 12/05/2016                                           *
 *----------------------------------------------------------------------*
 * Description   : NotFound view controller   							*		
 *                                                                      *
 ************************************************************************
 * Modification nÂ° ........... : 					                    *
 * Project ................... : 					                    *
 * Author .................... :                                        *
 *----------------------------------------------------------------------*
 * Modification date ......... : 					                    *
 * Transport order ........... : 					                    *
 * Change Request ............ : 					                    *
 * Description ............... : 					                    *
 ************************************************************************/
/**
 * @fileOverview NotFound view controller
 * @author David Tea
 * @version 0.1
 */
sap.ui.define([
    "cus/fi/timi/rel/controller/BaseController",
    "cus/fi/timi/rel/model/routerHelper",
], function(BaseController, routerHelper) {
    "use strict";

    return BaseController.extend("cus.fi.timi.rel.controller.NotFound", {

        onInit: function() {

            /**
             * Component defined routes
             * 
             * @type {sap.ui.core.routing.Router}
             */
            this.oRouter = this.getRouter();

        },

        // override the parent's onNavBack (inherited from BaseController)
        onNavBack: function(oEvent) {

            routerHelper.navToDefault.apply(this);

        }

    });

});