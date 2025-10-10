/************************************************************************
 * Project            : TIMI                                 			*
 * Process            : FI                                              *
 * Task code          : FI062                                           *
 * Functional document:                                					*
 * Technical document :                                    				*
 *----------------------------------------------------------------------*
 * File       	 : assets/js/library/NumericInput.js   	        		*
 * Author        : David TEA                                            *
 * Company       : Resp                                               	*
 * Creation Date : 12/05/2016                                           *
 *----------------------------------------------------------------------*
 * Description   : Custom NumericInput extends from sap.m.Input         *
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
 * @fileOverview Numeric Input Controls
 * @author David Tea 
 * @version 1.0
 */
sap.ui.define([
    "sap/ui/core/TextAlign",
    "sap/ui/core/format/NumberFormat",
    "sap/m/Input"
], function(TextAlign, NumberFormat, Input) {
    "use strict";

    /**
     * Constructor for a new numeric input which extends sap.m.Input 
     * 
     * @extends sap.m.Input
     * @constructor
     * @public
     * @alias resp.se16n.assets.js.lib.NumericInput
     */
    return Input.extend("cus.fi.timi.rel.assets.js.lib.NumericInput", {

        metadata: {
            properties: {

                /**
                 * Number max of decimals
                 * @type {number}
                 */
                "decimals": {
                    type: "int"
                },

                /**
                 * Horizontal text alignment 
                 * @type {sap.ui.core.TextAlign}
                 */
                "hAlign": {
                    type: "sap.ui.core.TextAlign",
                    defaultValue: TextAlign.Begin
                },

                /**
                 * Numeric Char ? 
                 * @type {boolean}
                 */
                "isNumC": {
                    type: "boolean",
                    defaultValue: false
                },
                
                
            }
        },

        /**
         * Handles onpaste event - Prevent paste functionnality
         * @event 
         * @param {eventObject} oEvent the event data
         * @public
         */
        onpaste: function(oEvent) {
            oEvent.preventDefault();
        },

        /**
         * Handles onkeypress event 
         * 
         * Rules : 
         * 		only one separator (.) only, 
         * 		only number and separator (if decimals>0) allowed
         * 
         * @event 
         * @param {eventObject} oEvent the event data
         * @public
         */
        onkeypress: function(oEvent) {

            var sSeparator = ".",
                sRegExp;

            var iKeyCode = oEvent.which || oEvent.keyCode;

            var sKey = String.fromCharCode(iKeyCode);

            //If no decimal then allow only number, else allow also "." 
            sRegExp = this.getDecimals() === 0 ? /[0-9]/ : /[0-9.]/;
            if (sKey !== "" && !sKey.match(sRegExp)) {
                oEvent.preventDefault();
            }

            // One separator allowed only
            if (sKey == sSeparator) {
                // Else stop
                if (this._$input.val().indexOf(sSeparator) !== -1) {
                    oEvent.preventDefault();
                }
            }
        },

        /**
         * Handles onkeyup event - format the result
         * 
         * @event 
         * @param {eventObject} oEvent the event data
         * @public
         */
        onkeyup: function(oEvent) {

            // Only on editable mode
            if (this.getEditable() === true) {

                var oNumberFormat = NumberFormat.getFloatInstance({
                    maxFractionDigits: this.getDecimals(),
                    minFractionDigits: this.getDecimals(),
                    decimalSeparator: ".",
                    groupingSeparator: "",
                });

                var sSeparator = ".",
                    sNbDecimal = 0;
                var sValue = this._$input.val();

                if (sValue.indexOf(sSeparator) != -1) {
                    sNbDecimal = sValue.length - sValue.indexOf(sSeparator) - 1;
                    if (sNbDecimal >= this.getDecimals()) {
                        //If number of decimal >= max decimal allowed then format 
                        this.setValue(oNumberFormat.format(Number(sValue)));
                    } else {
                        // Else do nothing
                    }
                    this.fireChangeEvent(sValue);
                } else if (sValue == "") {
                    //						  this.setValue(oNumberFormat.format(Number(0)));
                    //						  this.fireChangeEvent(0);
                }

            }

        },

        onfocusout: function(oEvent) {

            // Only on editable mode
            if (this.getEditable() === true) {

                var oNumberFormat = NumberFormat.getFloatInstance({
                    maxFractionDigits: this.getDecimals(),
                    minFractionDigits: this.getDecimals(),
                    decimalSeparator: ".",
                    groupingSeparator: "",
                });

                var sSeparator = ".",
                    sNbDecimal = 0,
                    bIsNumC = this.getIsNumC(),
                    sValue = this._$input.val();

                if (sValue.indexOf(sSeparator) != -1) {
                    sNbDecimal = sValue.length - sValue.indexOf(sSeparator) - 1;
                    if (sNbDecimal >= this.getDecimals()) {
                        //If number of decimal >= max decimal allowed then format 
                        this.setValue(oNumberFormat.format(Number(sValue)));
                    } else {
                        // Else do nothing
                    }
                    this.fireChangeEvent(sValue);
                } else if (sValue == "") {
                	if(bIsNumC === false){
                        this.setValue(oNumberFormat.format(Number(0)));
                        this.fireChangeEvent(0);
                	}
                }

            }

            Input.prototype.onfocusout.apply(this, arguments);

        },


        /**
         * Get Input Value - Set thousand separator
         * @public
         * @returns {float} the value
         */
        getValue: function() {

            // Non Editable -> Thousand separator = space
            // Editable Mode -> Thousand separator = none
            var sValue, sGroupingSeparator,
            bIsNumC = this.getIsNumC();

            if (this.getEditable()) {
                sGroupingSeparator = "";
                sValue = this.getProperty('value');
            } else {
                sGroupingSeparator = " ";
                sValue = this.getDomRef("inner") && this._$input ? this._$input.val() : this.getProperty('value').replace(sGroupingSeparator, "");
            }

            var oNumberFormat = NumberFormat.getFloatInstance({
                maxFractionDigits: this.getDecimals(),
                minFractionDigits: this.getDecimals(),
                decimalSeparator: ".",
                groupingSeparator: sGroupingSeparator,
            });
            
            if(bIsNumC){
            	return sValue;
            }else{
                return oNumberFormat.format(Number(sValue.replace(/\s/g, "")));
            }

        },

        /**
         * Control renderer 
         * 
         * Add text-align css style property
         * @public
         */
        renderer: {
            writeInnerAttributes: function(oRm, oControl) {
                oRm.addStyle('text-align', oControl.getHAlign());
            }
        }

    })
}, true);