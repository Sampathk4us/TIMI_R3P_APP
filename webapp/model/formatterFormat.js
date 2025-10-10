/************************************************************************
 * Project            : TIMI                                 			*
 * Process            : FI                                              *
 * Task code          : FI062                                           *
 * Functional document:                                					*
 * Technical document :                                    				*
 *----------------------------------------------------------------------*
 * File       	 : model/formatterFormat.js   	        				*
 * Author        : David TEA                                            *
 * Company       : Resp                                               	*
 * Creation Date : 12/05/2016                                           *
 *----------------------------------------------------------------------*
 * Description   : Provides format formatters functions   				*		
 *                                                                      *
 ************************************************************************
 * Modification nÂ°...........  : M001									*
 * Project ................... : TIMI									*
 * Author .................... : Marion Alberny							*
 *----------------------------------------------------------------------*
 * Modification date ......... : 01/02/2017								*
 * Transport order ........... :										*
 * Change Request ............ :										*
 * Description ............... : Add formatAmountForCSV					*
 ************************************************************************/
/**
 * @fileOverview Provides format formatters functions
 * @author David Tea 
 * @version 1.0
 */
sap.ui.define([
    "jquery.sap.global",
    "sap/ui/core/format/NumberFormat",
    "sap/ui/core/format/DateFormat",
    "sap/ui/core/format/FileSizeFormat",
    "cus/fi/timi/rel/assets/js/helpers/utilities"
], function(jQuery, NumberFormat, DateFormat, FileSizeFormat, utilities) {
    "use strict";

    var oFormat = {

        parseFloat: parseFloat,

        /**
         * Set Amount format
         * @param {string} sAmount the amount
         * @public
         * @returns {string} the formatted amount
         */
        formatAmount: function(sAmount) {
            if(utilities.isNumber(sAmount)) {
                var oNumberFormat = NumberFormat.getFloatInstance({
                    maxFractionDigits: 2,
                    minFractionDigits: 2,
                    groupingEnabled: true,
                    groupingSeparator: " ",
                    decimalSeparator: "."
                });
                return oNumberFormat.format(Number(utilities.round(sAmount, 2)));
            } else {
                return sAmount;
            }
        },

        /**
         * Set Amount format for CSV Export
         * @param {string} sAmount the amount
         * @public
         * @returns {string} the formatted amount
         */
        formatAmountForCSV: function(sAmount) {
            if(utilities.isNumber(sAmount)) {
                var oNumberFormat = NumberFormat.getFloatInstance({
                    maxFractionDigits: 2,
                    minFractionDigits: 2,
                    groupingEnabled: true,
                    groupingSeparator: "",
                    decimalSeparator: ","
                });
                return oNumberFormat.format(Number(utilities.round(sAmount, 2)));
            } else {
                return sAmount;
            }
        },

        /**
         * Set Amount format
         * @param {string} sAmount the amount
         * @param {integer} iDecimal the number of decimal
         * @public
         * @returns {string} the formatted amount
         */
        formatAmountWithDecimal: function(sAmount, iDecimal) {
            if(utilities.isNumber(sAmount)) {
                var oNumberFormat = NumberFormat.getFloatInstance({
                    maxFractionDigits: iDecimal,
                    minFractionDigits: iDecimal,
                    groupingEnabled: true,
                    groupingSeparator: "",
                    decimalSeparator: "."
                });
                return oNumberFormat.format(Number(utilities.round(sAmount, iDecimal)));
            } else {
                return sAmount;
            }
        },

        /**
         * Set Amount format
         * @param {string} sAmount the amount
         * @param {integer} iDecimal the number of decimal
         * @public
         * @returns {string} the formatted amount
         */
        formatAmountWithDecimalAndSpaceSeparator: function(sAmount, iDecimal) {
            if(utilities.isNumber(sAmount)) {
                var oNumberFormat = NumberFormat.getFloatInstance({
                    maxFractionDigits: iDecimal,
                    minFractionDigits: iDecimal,
                    groupingEnabled: true,
                    groupingSeparator: " ",
                    decimalSeparator: "."
                });
                return oNumberFormat.format(Number(utilities.round(sAmount, iDecimal)));
            } else {
                return sAmount;
            }
        },

        /**
         * Format attachment file size
         * @param {string} sFileSize the file size 
         * @public
         * @returns {string} the formatted filesize
         */
        formatAttachmentSize: function(sFileSize) {

            if(jQuery.isNumeric(sFileSize)) {
                return FileSizeFormat.getInstance({
                    binaryFilesize: false,
                    maxFractionDigits: 1,
                    maxIntegerDigits: 3
                }).format(sFileSize);
            } else {
                return sFileSize;
            }

        },

        /**
         * Set SAP Amount format
         * @param {string} sAmount the amount
         * @public
         * @returns {string} the formatted amount
         */
        formatSAPAmount: function(sAmount) {
            if(utilities.isNumber(sAmount)) {
                var oNumberFormat = NumberFormat.getFloatInstance({
                    maxFractionDigits: 2,
                    minFractionDigits: 2,
                    groupingEnabled: true,
                    groupingSeparator: "",
                    decimalSeparator: "."
                });
                return oNumberFormat.format(Number(utilities.round(sAmount, 2)));
            } else {
                return sAmount;
            }
        },

        /**
         * Set Date format
         * @param {string} sDate the date
         * @public
         * @returns {string} the formatted date
         */
        formatDate: function(sDate) {
            if(sDate) {
                var oDateFormat = DateFormat.getDateTimeInstance({
                    pattern: "dd/MM/yyyy"
                });
                return oDateFormat.format(new Date(sDate));
            } else {
                return sDate;
            }
        },

        /**
         * Set Date format
         * @param {object} oDate the date
         * @public
         * @returns {string} the formatted date in yyyyMMdd
         */
        formatDatetoSAPDate: function(oDate) {
            if(oDate) {
                var oDateFormat = DateFormat.getDateTimeInstance({
                    pattern: "yyyyMMdd"
                });
                return oDateFormat.format(new Date(oDate));
            } else {
                return sDate;
            }
        },

        /**
         * Set Date format
         * @param {object} oDate the date
         * @public
         * @returns {string} the formatted date in yyyyMMddHHmmss
         */
        formatDatetoSAPDateTime: function(oDate) {
            if(oDate) {
                var oDateFormat = DateFormat.getDateTimeInstance({
                    pattern: "yyyyMMddHHmmss"
                });
                return oDateFormat.format(new Date(oDate));
            } else {
                return sDate;
            }
        },

        formatIntegerShort: function(sAmount) {
            if(utilities.isNumber(sAmount)) {
                var oNumberFormat = NumberFormat.getIntegerInstance({
                    style: "short",
                    maxFractionDigits: 10
                });
                return oNumberFormat.format(sAmount);
            } else {
                return sAmount;
            }
        },

        /**
         * Convert dd/mm/yyyy date to date object
         * @param {string} sDate the date
         * @public
         * @returns {object} the date
         */
        formatOutputDateToSAPDate: function(sDate) {

            var y = sDate.substr(6, 4),
                m = sDate.substr(3, 2) - 1,
                d = sDate.substr(0, 2);
            var D = new Date(y, m, d);

            if(sDate.length > 10) {
                return 'invalid date';
            }

            return (D.getFullYear() == y && D.getMonth() == m && D.getDate() == d) ? D : 'invalid date';

        },

        /**
         * Set Quantity format
         * @param {string} sQuantity the quantity
         * @public
         * @returns {string} the formatted quantity
         */
        formatQuantity: function(sQuantity) {
            if(sQuantity) {
                var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
                    maxFractionDigits: 2,
                    minFractionDigits: 2,
                    decimalSeparator: "."
                });
                return oNumberFormat.format(Number(utilities.round(sAmount, 2)));
            } else {
                return sQuantity;
            }
        },

        /**
         * Convert yyyymmdd date to date object
         * @param {string} sDate the date
         * @public
         * @returns {object} the date
         */
        formatSAPDate: function(sDate) {

            var y = sDate.substr(0, 4),
                m = sDate.substr(4, 2) - 1,
                d = sDate.substr(6, 2);
            var D = new Date(y, m, d);
            var userTimezoneOffset = D.getTimezoneOffset()*60000;
            if(sDate.length > 8) {
                return 'invalid date';
            }

            return (D.getFullYear() == y && D.getMonth() == m && D.getDate() == d) ? new Date(D.getTime() - userTimezoneOffset)  : 'invalid date';
            //return (D.getFullYear() == y && D.getMonth() == m && D.getDate() == d) ? D : 'invalid date';

        },

        /**
         * Set TimeStamp format
         * @param {string} sTimestamp the timestamp
         * @public
         * @returns {string} the formatted date & time
         */
        formatTimestamp: function(sTimestamp) {
            if(sTimestamp) {
                var oTSFormat = DateFormat.getDateTimeInstance({
                    pattern: "dd/MM/yyyy HH:mm:ss"
                });
                return oTSFormat.format(new Date(sTimestamp));
            } else {
                return sTimestamp;
            }
        },

    };

    return oFormat;

}, true);