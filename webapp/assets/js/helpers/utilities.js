/************************************************************************
 * Project            : TIMI                                 			*
 * Process            : FI                                              *
 * Task code          : FI062                                           *
 * Functional document:                                					*
 * Technical document :                                    				*
 *----------------------------------------------------------------------*
 * File       	: assets/js/helpers/utilities.js   	                    *
 * Author        : David TEA                                            *
 * Company       : Resp                                               	*
 * Creation Date : 12/05/2016                                           *
 *----------------------------------------------------------------------*
 * Description   : Provides utilities functions         				*
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
 * @fileOverview Provides utilities functions
 * @author David Tea
 * @version 0.1
 */
sap.ui.define([

], function() {
    "use strict";

    var oUtilities = {

        /**
         * Find first item of a object array.
         * 
         * @param {Object[]} aList the object array to loop into
         * @param {string} sFieldName the array line object fieldname to compare
         * @param {string} sValueTarget the value to compare to
         * @public
         * @returns {Object} the object entry object which condition is met
         */
        findFirstItem: function(aList, sFieldName, sValueTarget) {
            var iListLength = 0;
            if (aList && aList.length > 0) {
                iListLength = aList.length;
                for (var i = 0; i < iListLength; i++) {
                    if (aList[i][sFieldName] === sValueTarget) {
                        return aList[i];
                    }
                }
            }
            return null;
        },

        /**
         * Copy properties from source to target only for properties which exist
         * between both two
         * 
         * @param {Object} oTarget the target object which receive data from oSource
         * @param {Object} oSource the source object which contains data to be copy
         * @public
         */
        copyProperties: function(oTarget, oSource) {
            for (var property in oTarget) {
                if (property in oSource) {
                    if (typeof oTarget[property] === "object") {
                        this.copyProperties(oTarget[property], oSource[property]);
                    } else {
                        oTarget[property] = oSource[property];
                    }
                }
            }
        },

        /**
         * Check if is a number
         * 
         * @param {string} sNumber the number to test
         * @public
         * @returns {boolean} the boolean
         */
        isNumber: function(sNumber) {
            return !isNaN(parseFloat(sNumber)) && isFinite(sNumber);
        },

        /**
         * Round the number of the number of decimals
         * 
         * @param {string} sNumber the number to round
         * @param {integer} iDecimals the number of decimals
         * @public
         * @returns {boolean} the boolean
         */
        round: function(sNumber, iDecimals) {
            return +(Math.round(sNumber + "e+" + iDecimals) + "e-" + iDecimals);
        },

        /**
         * Count Array
         * 
         * @param {string[]} aArray the array
         * @public
         * @returns {integer} the length
         */
        count: function(aArray) {
            var c = 0;
            if(aArray){
                for (var i in aArray) { // in returns key, not object
                    if (aArray[i] != undefined) {
                        c++;
                    }
                }
            }

            return c;
        },

        /**
         * Round to nearest full/half thousand/million/billion
         * 
         * @param {string} sValue the value
         * @param {boolean} bUp the boolean to around up
         * @public
         * @returns {integer} the length
         */
        roundNearest: function(sValue, bUp) {

            var aLowHalf = ["1", "2", "3", "4"]

            var iValue = parseInt(sValue, 10),
                iRoundTo, iLength = 0;

            if (aLowHalf.indexOf(iValue.toString().substring(0, 1)) !== -1) {
                iRoundTo = '5';
                iLength = iValue.toString().length - 1;
            } else {
                iRoundTo = '1';
                iLength = iValue.toString().length;
            };

            for (var i = 0; i < iLength; i++) {
                iRoundTo = iRoundTo.concat('0');
            }

            if (bUp === true) {
                return Math.ceil(iValue / iRoundTo) * iRoundTo;
            } else {
                return Math.floor(iValue / iRoundTo) * iRoundTo;
            }

        },

        /**
         * Format amount label
         * 
         * @param {integer} iValue the value to check
         * @public
         * @returns {string} the formatted amount label
         */
        amountLabelFormat: function(iValue) {

            if (Math.abs(Number(iValue)) >= 1.0e+9) {
                // Nine Zeroes for Billions
                return Math.abs(Number(iValue)) / 1.0e+9 + "B";
            } else if (Math.abs(Number(iValue)) >= 1.0e+6) {
                // Six Zeroes for Millions
                return Math.abs(Number(iValue)) / 1.0e+6 + "M"
            } else if (Math.abs(Number(iValue)) >= 1.0e+3) {
                // Three Zeroes for Thousands
                return Math.abs(Number(iValue)) / 1.0e+3 + "K"
            } else {
                return Math.abs(Number(iValue));
            }

        }

    };

    return oUtilities;

}, true);