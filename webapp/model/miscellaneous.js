/************************************************************************
 * Project            : TIMI                                 			*
 * Process            : FI                                              *
 * Task code          : FI062                                           *
 * Functional document:                                					*
 * Technical document :                                    				*
 *----------------------------------------------------------------------*
 * File       	 : model/miscellaneous.js   	        				*
 * Author        : David TEA                                            *
 * Company       : Resp                                               	*
 * Creation Date : 12/05/2016                                           *
 *----------------------------------------------------------------------*
 * Description   : Provides miscellaneous functions   					*		
 *                                                                      *
 ************************************************************************
 * Modification nÂ° ...........	: M001									*
 * Project ...................	: TIMI									*
 * Author .................... 	: Marion Alberny                        *
 *----------------------------------------------------------------------*
 * Modification date ......... 	: 03/11/2016 							*
 * Transport order ........... 	:  										*
 * Change Request ............ 	: CR2016-273225  						*
 * Description ............... 	: Items total amount depends on 		*
 *								  Debit / Credit indicator				*
 ************************************************************************/
/**
 * @fileOverview Provides miscellaneous functions
 * @author David Tea 
 * @version 1.0
 */
sap.ui.define([
    "cus/fi/timi/rel/model/formatterFormat",
    "cus/fi/timi/rel/model/businessRules"
], function(formatterFormat, businessRules) {
    "use strict";

    var oMiscellaneous = {

        /**
         * Calculate items total amount 
         * @param {string} sDocType the request document type
         * @param {string} sItemType the items table item table (issuing or receiving)
         * @param {Object[]} aItems the request issuing or receiving items table
         * @param {boolean} bFormatAmount to format the result or not
         * @public
         * @returns {string} the total amount
         */
        calculateItemsTotalAmount: function(sDocType, sItemType, aItems, bFormatAmount) {

            var sAmount = 0,
                aLocalRules = [],
                vCoef = 0,
                // Filter rules to keep only applicable ones
                aRules = this.getComponentModel("TotalAmountCalculationRulesCollection").getProperty("/results"),
                oRequest = this.getComponentModel("Request"),
                iDecimal = businessRules.getCurrencyMaxDecimals.call(this, oRequest.getProperty("/HeaderData/CurrencyCode"));

            if (aRules != undefined) {
                aLocalRules = $.grep(aRules, function(oItem) {
                    return oItem.DocumentTypeCode == sDocType && oItem.ItemType == sItemType;
                });
            }

            for (var i = 0; i < aItems.length; i++) {
                if (aItems[i].FlagDelete === false) {
                    for (var j = 0; j < aLocalRules.length; j++) {
                        if (aLocalRules[j].DCIndicator == aItems[i].DCIndicator) {
                            vCoef = aLocalRules[j].Coef;
                            break;
                        }
                    }
                    if (vCoef != 0) {
                        sAmount += parseFloat(aItems[i].Amount * vCoef);
                    } else {
                        sAmount += parseFloat(aItems[i].Amount);
                    }
                }
            }

            if (bFormatAmount === true) {
                return formatterFormat.formatAmountWithDecimalAndSpaceSeparator(parseFloat(sAmount), iDecimal);
            } else {
                return parseFloat(sAmount);
            }
        },

        /**
         * Calculate items total markup amount
         * @param {string} sDocType the request document type
         * @param {string} sItemType the items table item table (issuing or receiving) 
         * @param {Object[]} aItems the request issuing or receiving items table
         * @param {boolean} bFormatAmount to format the result or not
         * @param {string} sCurrencyCode the currency
         * @public
         * @returns {string} the total amount
         */
        calculateItemsTotalMarkupAmount: function(sDocType, sItemType, aItems, bFormatAmount, sCurrencyCode) {

            var sAmount = 0,
                aLocalRules = [],
                vCoef = 0,
                // Filter rules to keep only applicable ones
                aRules = this.getComponentModel("TotalAmountCalculationRulesCollection").getProperty("/results"),
                iDecimal = businessRules.getCurrencyMaxDecimals.call(this, sCurrencyCode);

            if (aRules != undefined) {
                aLocalRules = $.grep(aRules, function(oItem) {
                    return oItem.DocumentTypeCode == sDocType && oItem.ItemType == sItemType;
                });
            }

            for (var i = 0; i < aItems.length; i++) {
                if (aItems[i].FlagDelete === false) {
                    for (var j = 0; j < aLocalRules.length; j++) {
                        if (aLocalRules[j].DCIndicator == aItems[i].DCIndicator) {
                            vCoef = aLocalRules[j].Coef;
                            break;
                        }
                    }
                    if (vCoef != 0) {
                        sAmount += parseFloat(aItems[i].Amount * vCoef * aItems[i].Markup / 100);
                    } else {
                        sAmount += parseFloat(aItems[i].Amount * aItems[i].Markup / 100);
                    }
                }
            }

            if (bFormatAmount === true) {
                return formatterFormat.formatAmountWithDecimalAndSpaceSeparator(parseFloat(sAmount), iDecimal);
            } else {
                return parseFloat(sAmount);
            }

        },

        /**
         * Calculate items total amount with markup
         * @param {string} sDocType the request document type
         * @param {string} sItemType the items table item table (issuing or receiving) 
         * @param {Object[]} aItems the request issuing or receiving items table
         * @param {boolean} bFormatAmount to format the result or not
         * @public
         * @returns {string} the total amount
         */
        calculateItemsTotalAmountWithMarkup: function(sDocType, sItemType, aItems, bFormatAmount) {

            var sAmount = 0,
                aLocalRules = [],
                vCoef = 0,
                // Filter rules to keep only applicable ones
                aRules = this.getComponentModel("TotalAmountCalculationRulesCollection").getProperty("/results"),
                oRequest = this.getComponentModel("Request"),
                iDecimal = businessRules.getCurrencyMaxDecimals.call(this, oRequest.getProperty("/HeaderData/CurrencyCode"));

            if (aRules != undefined) {
                aLocalRules = $.grep(aRules, function(oItem) {
                    return oItem.DocumentTypeCode == sDocType && oItem.ItemType == sItemType;
                });
            }

            for (var i = 0; i < aItems.length; i++) {
                if (aItems[i].FlagDelete === false) {
                    for (var j = 0; j < aLocalRules.length; j++) {
                        if (aLocalRules[j].DCIndicator == aItems[i].DCIndicator) {
                            vCoef = aLocalRules[j].Coef;
                            break;
                        }
                    }
                    if (vCoef != 0) {
                        sAmount += parseFloat(aItems[i].TotalAmount * vCoef);
                    } else {
                        sAmount += parseFloat(aItems[i].TotalAmount);
                    }
                }
            }

            if (bFormatAmount === true) {
                return formatterFormat.formatAmountWithDecimalAndSpaceSeparator(parseFloat(sAmount), iDecimal);
            } else {
                return parseFloat(sAmount);
            }

        },

        /**
         * Update Item Total Amount
         * 
         *  If Item markup > 0 then add markup to total amount 
         *  Else total amount = amount
         * 
         * @param {string} sItemPath the item path of the Request Model
         * @public
         */
        updateItemTotalAmount: function(sItemPath) {

            var oRequestModel = this.getComponentModel("Request");
            var sPropertyPathAmount = sItemPath + "/Amount";
            var sPropertyPathMarkup = sItemPath + "/Markup";
            var sPropertyPathTotalAmount = sItemPath + "/TotalAmount";
            var sPropertyPathFlagDelete = sItemPath + "/FlagDelete";
            var fAmount = oRequestModel.getProperty(sPropertyPathAmount);
            var fMarkup = oRequestModel.getProperty(sPropertyPathMarkup);
            var fTotalAmount = 0.00,
                iDecimal = businessRules.getCurrencyMaxDecimals.call(this, oRequestModel.getProperty("/HeaderData/CurrencyCode"));

            //Calculate only for non delete item
            if (oRequestModel.getProperty(sPropertyPathFlagDelete) === false) {

                if (parseFloat(fMarkup) !== 0) {
                    fTotalAmount = fAmount * (1 + fMarkup / 100);
                } else {
                    fTotalAmount = fAmount;
                }

                oRequestModel.setProperty(sPropertyPathTotalAmount, formatterFormat.formatAmountWithDecimal(fTotalAmount, iDecimal));

            }
        }

    };

    return oMiscellaneous;

}, true);