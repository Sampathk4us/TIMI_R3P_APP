/************************************************************************
 * Project            : TIMI                                 			*
 * Process            : FI                                              *
 * Task code          : FI062                                           *
 * Functional document:                                					*
 * Technical document :                                    				*
 *----------------------------------------------------------------------*
 * File       	: view/Main.controller.js   	        				*
 * Author        : David TEA                                            *
 * Company       : Resp                                               	*
 * Creation Date : 12/05/2016                                           *
 *----------------------------------------------------------------------*
 * Description   : Main view controller   								*		
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
 * @fileOverview Main view controller
 * @author David Tea 
 * @version 0.1
 */
sap.ui.define([
    "cus/fi/timi/rel/controller/BaseController",
    "cus/fi/timi/rel/model/routerHelper"
], function(BaseController, routerHelper) {
    "use strict";

    return BaseController.extend("cus.fi.timi.rel.controller.Main", {

        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         */
        onInit: function() {

            // IE Hack : Turn on Console 
            if (typeof console.log == "object" && Function.prototype.bind && console) {
                ["log", "info", "warn", "error", "assert", "dir", "clear", "profile", "profileEnd"].forEach(function(method) {
                    console[method] = this.call(console[method], console);
                }, Function.prototype.bind);
            }

            this.getRouter().attachRoutePatternMatched(function(event) {

                var sCurrentRouteName = event.getParameter("name");

                if (sCurrentRouteName === "main") {
                    routerHelper.navToDefault.apply(this);
                }

            }, this);

        },

    });
}, true);