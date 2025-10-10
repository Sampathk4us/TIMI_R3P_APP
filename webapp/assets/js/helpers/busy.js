/************************************************************************
 * Project            : TIMI                                 			*
 * Process            : FI                                              *
 * Task code          : FI062                                           *
 * Functional document:                                					*
 * Technical document :                                    				*
 *----------------------------------------------------------------------*
 * File       	: assets/js/helpers/busy.js   	                    	*
 * Author        : David TEA                                            *
 * Company       : Resp                                               	*
 * Creation Date : 12/05/2016                                           *
 *----------------------------------------------------------------------*
 * Description   : Provides function to set/unset busy indicator        *
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
 * @fileOverview Provides function to set/unset busy indicator 
 * @author David Tea 
 * @version 1.0
 */
sap.ui.define([
    "sap/m/BusyDialog"
], function(BusyDialog) {
    "use strict";

    var oBusy = {

        /**
         * Busy indicator object.
         * @private
         * @type object
         */
        _busyIndicator: null,

        /**
         * Show busy indicator to whole page.
         * @param {number} iOpacity the css opacity value
         * @public
         */
        setBusyOn: function(iOpacity) {
            if (!this._busyIndicator) {
                this._busyIndicator = new BusyDialog();
            }
            this._busyIndicator.setBusyIndicatorDelay(0).open();
            if (iOpacity === undefined) {
                iOpacity = 0.3;
            }
            $(".sapUiBLy").css('opacity', iOpacity);
        },

        /**
         * Close busy indicator.
         * @public
         */
        setBusyOff: function() {
            if (this._busyIndicator) {
                this._busyIndicator.close();
            }
        },

    };

    return oBusy;

}, true);