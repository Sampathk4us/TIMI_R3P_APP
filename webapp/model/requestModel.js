/************************************************************************
* Project            : TIMI                                 			*
* Process            : FI                                              	*
* Task code          : FI062                                           	*
* Functional document:                                					*
* Technical document :                                    				*
*-----------------------------------------------------------------------*
* File       		: model/requestModel.js   	        				*
* Author        	: David TEA                                         *
* Company       	: Resp                                              *
* Creation Date 	: 25/09/2017                                        *
*-----------------------------------------------------------------------*
* Description   : Provides request functions for its model 				*		
*                                                                      	*
*************************************************************************
* Modification nï¿½ ...........	: 										*
* Project ...................	: 										*
* Author .................... :                       	 				*
*-----------------------------------------------------------------------*
* Modification date ......... 	: 	 									*
* Transport order ........... 	:  										*
* Change Request ............ 	: 	  									*
* Description ............... 	: 	 									*
*************************************************************************
/**
* @fileOverview Provides request functions for its model
* @author David Tea 
* @version 1.0
*/
sap.ui.define([
    "cus/fi/timi/rel/model/businessRules",
    "cus/fi/timi/rel/model/messageHelper",
    "cus/fi/timi/rel/model/parameters"
], function(businessRules, messageHelper, parameters) {
    "use strict";

    var oRequestHelper = {

        handleDataValidation: function(sDataFieldTypeId, sItemPath, oData) {

            var oRequestModel = this.getComponentModel("Request"), i,
                aReceivingItems = oRequestModel.getProperty("/ReceivingItems/results"),
                aIssuingItems = oRequestModel.getProperty("/IssuingItems/results");

            switch (sDataFieldTypeId) {
                case parameters.getDataFieldTypeList().ReceivingController:
                    oRequestModel.setProperty("/HeaderData/RcController", oData.Username);
                    oRequestModel.setProperty("/HeaderData/Descriptions/RcControllerName", oData.Fullname);
                    break;
                case parameters.getDataFieldTypeList().IssuingTax:
                    oRequestModel.setProperty("/HeaderData/IsTaxCode", oData.TaxCode);
                    oRequestModel.setProperty("/HeaderData/Descriptions/IsTaxName", oData.TaxName);
                    // Remove state and message
                    oRequestModel.setProperty('/HeaderData/States/IsTaxCode', parameters.getSAPStateList().None);
                    oRequestModel.setProperty('/HeaderData/Messages/IsTaxCode', "");
                    // Set Tax for all Issuing Items
                    for (i = 0; i < aIssuingItems.length; i++) {
                        oRequestModel.setProperty("/IssuingItems/results/" + i + "/TaxCode", oData.TaxCode);
                    }
                    break;
                case parameters.getDataFieldTypeList().ReceivingTax:
                    oRequestModel.setProperty("/HeaderData/RcTaxCode", oData.TaxCode);
                    oRequestModel.setProperty("/HeaderData/Descriptions/RcTaxName", oData.TaxName);
                    // Remove state and message
                    oRequestModel.setProperty('/HeaderData/States/RcTaxCode', parameters.getSAPStateList().None);
                    oRequestModel.setProperty('/HeaderData/Messages/RcTaxCode', "");
                    // Set Tax for all Receiving Items
                    for (i = 0; i < aReceivingItems.length; i++) {
                        oRequestModel.setProperty("/ReceivingItems/results/" + i + "/TaxCode", oData.TaxCode);
                    }
                    break;
                case parameters.getDataFieldTypeList().IssuingItemTax:
                case parameters.getDataFieldTypeList().ReceivingItemTax:
                    oRequestModel.setProperty(sItemPath + '/TaxCode', oData.TaxCode);
                    // Remove state and message
                    oRequestModel.setProperty(sItemPath + '/States/TaxCode', parameters.getSAPStateList().None);
                    oRequestModel.setProperty(sItemPath + '/Messages/TaxCode', "");
                    break;
                case parameters.getDataFieldTypeList().IssuingItemCostCenter:
                case parameters.getDataFieldTypeList().ReceivingItemCostCenter:
                    oRequestModel.setProperty(sItemPath + '/CostCenter', oData.CostCenterCode);
                    oRequestModel.setProperty(sItemPath + '/BusinessAreaCode', oData.BusinessAreaCode);
                    // Remove state and message
                    oRequestModel.setProperty(sItemPath + '/States/CostCenter', parameters.getSAPStateList().None);
                    oRequestModel.setProperty(sItemPath + '/Messages/CostCenter', "");
                    //Update business area collection
                    businessRules.setBusinessAreaCollection.call(this, parameters.getItemTypeList().Issuing);
                    businessRules.setBusinessAreaCollection.call(this, parameters.getItemTypeList().Receiving);
                    break;
                case parameters.getDataFieldTypeList().IssuingItemNature:
                case parameters.getDataFieldTypeList().ReceivingItemNature:
                    oRequestModel.setProperty(sItemPath + '/AnalyticalNature', oData.NatureCode);
                    // Remove state and message
                    oRequestModel.setProperty(sItemPath + '/States/AnalyticalNature', parameters.getSAPStateList().None);
                    oRequestModel.setProperty(sItemPath + '/Messages/AnalyticalNature', "");
                    break;
                case parameters.getDataFieldTypeList().IssuingItemAccount:
                case parameters.getDataFieldTypeList().ReceivingItemAccount:
                    oRequestModel.setProperty(sItemPath + '/GLAccount', oData.AccountCode);
                    oRequestModel.setProperty(sItemPath + '/AnalyticalNature', oData.NatureCode);
                    oRequestModel.setProperty(sItemPath + '/LCOAAccount', oData.LCOAAccountCode);
                    // Remove state and message
                    oRequestModel.setProperty(sItemPath + '/States/AnalyticalNature', parameters.getSAPStateList().None);
                    oRequestModel.setProperty(sItemPath + '/Messages/AnalyticalNature', "");
                    oRequestModel.setProperty(sItemPath + '/States/GLAccount', parameters.getSAPStateList().None);
                    oRequestModel.setProperty(sItemPath + '/Messages/GLAccount', "");
                    oRequestModel.setProperty(sItemPath + '/States/LCOAAccount', parameters.getSAPStateList().None);
                    oRequestModel.setProperty(sItemPath + '/Messages/LCOAAccount', "");
                    break;
                case parameters.getDataFieldTypeList().IssuingItemInternalOrder:
                case parameters.getDataFieldTypeList().ReceivingItemInternalOrder:
                    oRequestModel.setProperty(sItemPath + '/InternalOrder', oData.InternalOrderCode);
                    // Remove state and message
                    oRequestModel.setProperty(sItemPath + '/States/InternalOrder', parameters.getSAPStateList().None);
                    oRequestModel.setProperty(sItemPath + '/Messages/InternalOrder', "");
                    break;
                case parameters.getDataFieldTypeList().IssuingItemWBS:
                case parameters.getDataFieldTypeList().ReceivingItemWBS:
                    oRequestModel.setProperty(sItemPath + '/WBSExternal', oData.WBSExternalCode);
                    oRequestModel.setProperty(sItemPath + '/WBS', oData.WBSCode);
                    // Remove state and message
                    oRequestModel.setProperty(sItemPath + '/States/WBSExternal', parameters.getSAPStateList().None);
                    oRequestModel.setProperty(sItemPath + '/Messages/WBSExternal', "");
                    break;
                case parameters.getDataFieldTypeList().IssuingSGLInd:
                    oRequestModel.setProperty("/HeaderData/IsSpecialGLIndicator", oData.SGLIndicatorCode);
                    oRequestModel.setProperty("/HeaderData/Descriptions/IsSpecialGLIndicatorName", oData.SGLIndicatorDescription);
                    // Remove state and message
                    oRequestModel.setProperty('/HeaderData/States/IsSpecialGLIndicator', parameters.getSAPStateList().None);
                    oRequestModel.setProperty('/HeaderData/Messages/IsSpecialGLIndicator', "");
                    break;
                case parameters.getDataFieldTypeList().ReceivingSGLInd:
                    oRequestModel.setProperty("/HeaderData/RcSpecialGLIndicator", oData.SGLIndicatorCode);
                    oRequestModel.setProperty("/HeaderData/Descriptions/RcSpecialGLIndicatorName", oData.SGLIndicatorDescription);
                    // Remove state and message
                    oRequestModel.setProperty('/HeaderData/States/RcSpecialGLIndicator', parameters.getSAPStateList().None);
                    oRequestModel.setProperty('/HeaderData/Messages/RcSpecialGLIndicator', "");
                    break;
                case parameters.getDataFieldTypeList().Vendor:
                    oRequestModel.setProperty('/HeaderData/VendorCode', oData.VendorCode);
//                    oRequestModel.setProperty('/HeaderData/PaymentTermCode', oData.PaymentTermCode);
//                    oRequestModel.setProperty("/HeaderData/Descriptions/PaymentTermName", oData.PaymentTermName);
                    oRequestModel.setProperty("/HeaderData/WithholdingTaxTypeCode", oData.WithholdingTaxTypeCode);
                    oRequestModel.setProperty("/HeaderData/WithholdingTaxCodeCode", oData.WithholdingTaxCodeCode);
                    // Remove state and message
                    oRequestModel.setProperty('/HeaderData/States/VendorCode', parameters.getSAPStateList().None);
                    oRequestModel.setProperty('/HeaderData/Messages/VendorCode', "");
                    oRequestModel.setProperty('/HeaderData/States/WithholdingTaxTypeCode', parameters.getSAPStateList().None);
                    oRequestModel.setProperty('/HeaderData/Messages/WithholdingTaxTypeCode', "");
                    oRequestModel.setProperty('/HeaderData/States/WithholdingTaxCodeCode', parameters.getSAPStateList().None);
                    oRequestModel.setProperty('/HeaderData/Messages/WithholdingTaxCodeCode', "");
                    break;
                case parameters.getDataFieldTypeList().Customer:
                    oRequestModel.setProperty('/HeaderData/CustomerCode', oData.CustomerCode);
                    // Remove state and message
                    oRequestModel.setProperty('/HeaderData/States/CustomerCode', parameters.getSAPStateList().None);
                    oRequestModel.setProperty('/HeaderData/Messages/CustomerCode', "");
                    break;
                case parameters.getDataFieldTypeList().Currency:
                    oRequestModel.setProperty('/HeaderData/CurrencyCode', oData.CurrencyCode);
                    // Remove state and message
                    oRequestModel.setProperty('/HeaderData/States/CurrencyCode', parameters.getSAPStateList().None);
                    oRequestModel.setProperty('/HeaderData/Messages/CurrencyCode', "");
                    break;
                case parameters.getDataFieldTypeList().WithholdingTaxType:
                    break;
                case parameters.getDataFieldTypeList().WithholdingTaxCode:
                    break;
                case parameters.getDataFieldTypeList().IssuingItemGMID:
                case parameters.getDataFieldTypeList().ReceivingItemGMID:
                    oRequestModel.setProperty(sItemPath + '/GMID', oData.GMIDCode);
                    // Remove state and message
                    oRequestModel.setProperty(sItemPath + '/States/GMID', parameters.getSAPStateList().None);
                    oRequestModel.setProperty(sItemPath + '/Messages/GMID', "");
                    break;
                case parameters.getDataFieldTypeList().IssuingItemUnit:
                case parameters.getDataFieldTypeList().ReceivingItemUnit:
                    oRequestModel.setProperty(sItemPath + '/UnitId', oData.UnitId);
                    break;
                case parameters.getDataFieldTypeList().IssuingItemBusinessArea:
                case parameters.getDataFieldTypeList().ReceivingItemBusinessArea:
                    oRequestModel.setProperty(sItemPath + '/BusinessAreaCode', oData.BusinessAreaCode);
            		oRequestModel.setProperty(sItemPath + '/Descriptions/BusinessAreaName', oData.BusinessAreaName);
                    // Remove state and message
                    oRequestModel.setProperty(sItemPath + '/States/BusinessAreaCode', parameters.getSAPStateList().None);
                    oRequestModel.setProperty(sItemPath + '/Messages/BusinessAreaCode', "");
                    //Update business area collection
                    businessRules.setBusinessAreaCollection.call(this, parameters.getItemTypeList().Issuing);
                    businessRules.setBusinessAreaCollection.call(this, parameters.getItemTypeList().Receiving);
                    break;
                case parameters.getDataFieldTypeList().IssuingItemHsnSac:
                case parameters.getDataFieldTypeList().ReceivingItemHsnSac:
                    oRequestModel.setProperty(sItemPath + '/HsnSacCode', oData.HsnSacCode);
            		oRequestModel.setProperty(sItemPath + '/Descriptions/HsnSacName', oData.HsnSacName);
                    // Remove state and message
                    oRequestModel.setProperty(sItemPath + '/States/HsnSacCode', parameters.getSAPStateList().None);
                    oRequestModel.setProperty(sItemPath + '/Messages/HsnSacCode', "");
                    break;
                case parameters.getDataFieldTypeList().IssuingBusinessPlace:
                    oRequestModel.setProperty('/HeaderData/IsBusinessPlaceCode', oData.BusinessPlaceCode);
            		oRequestModel.setProperty('/HeaderData/Descriptions/IsBusinessPlaceName', oData.BusinessPlaceName);
                    // Remove state and message
                    oRequestModel.setProperty('/HeaderData/States/IsBusinessPlaceCode', parameters.getSAPStateList().None);
                    oRequestModel.setProperty('/HeaderData/Messages/IsBusinessPlaceCode', "");
                    break;
                case parameters.getDataFieldTypeList().ReceivingBusinessPlace:
                    oRequestModel.setProperty('/HeaderData/RcBusinessPlaceCode', oData.BusinessPlaceCode);
	        		oRequestModel.setProperty('/HeaderData/Descriptions/RcBusinessPlaceName', oData.BusinessPlaceName);
	                // Remove state and message
	                oRequestModel.setProperty('/HeaderData/States/RcBusinessPlaceCode', parameters.getSAPStateList().None);
	                oRequestModel.setProperty('/HeaderData/Messages/RcBusinessPlaceCode', "");
	                break;
                case parameters.getDataFieldTypeList().IssuingBusinessAreaAlt:
                    oRequestModel.setProperty('/HeaderData/IsBusinessAreaAltCode', oData.BusinessAreaCode);
            		oRequestModel.setProperty('/HeaderData/Descriptions/IsBusinessAreaAltName', oData.BusinessAreaName);
                    // Remove state and message
                    oRequestModel.setProperty('/HeaderData/States/IsBusinessAreaAltCode', parameters.getSAPStateList().None);
                    oRequestModel.setProperty('/HeaderData/Messages/IsBusinessAreaAltCode', "");
                    break;
                case parameters.getDataFieldTypeList().ReceivingBusinessAreaAlt:
                    oRequestModel.setProperty('/HeaderData/RcBusinessAreaAltCode', oData.BusinessAreaCode);
	        		oRequestModel.setProperty('/HeaderData/Descriptions/RcBusinessAreaAltName', oData.BusinessAreaName);
	                // Remove state and message
	                oRequestModel.setProperty('/HeaderData/States/RcBusinessAreaAltCode', parameters.getSAPStateList().None);
	                oRequestModel.setProperty('/HeaderData/Messages/RcBusinessAreaAltCode', "");
	                break;
                default:
                    break;
            }

        },

        handleDataValidationFailed: function(sDataFieldTypeId, sItemPath, bDisplayMessage, oError) {

            var oRequestModel = this.getComponentModel("Request"),
                sMessage, sState;

            if (oError) {
                sMessage = JSON.parse(oError.responseText).error.message.value;
                sState = parameters.getSAPStateList().Warning;
            } else {
                sState = parameters.getSAPStateList().None;
            }

            switch (sDataFieldTypeId) {
                case parameters.getDataFieldTypeList().ReceivingController:
                    break;
                case parameters.getDataFieldTypeList().IssuingTax:
                    oRequestModel.setProperty("/HeaderData/Descriptions/IsTaxName", "");
                    // Set state to warning and set message 
                    oRequestModel.setProperty('/HeaderData/States/IsTaxCode', sState);
                    oRequestModel.setProperty('/HeaderData/Messages/IsTaxCode', sMessage);
                    break;
                case parameters.getDataFieldTypeList().ReceivingTax:
                    oRequestModel.setProperty("/HeaderData/Descriptions/RcTaxName", "");
                    // Set state to warning and set message 
                    oRequestModel.setProperty('/HeaderData/States/RcTaxCode', sState);
                    oRequestModel.setProperty('/HeaderData/Messages/RcTaxCode', sMessage);
                    break;
                case parameters.getDataFieldTypeList().IssuingItemTax:
                case parameters.getDataFieldTypeList().ReceivingItemTax:
                    // Set state to warning and set message 
                    oRequestModel.setProperty(sItemPath + '/States/TaxCode', sState);
                    oRequestModel.setProperty(sItemPath + '/Messages/TaxCode', sMessage);
                    break;
                case parameters.getDataFieldTypeList().IssuingItemCostCenter:
                case parameters.getDataFieldTypeList().ReceivingItemCostCenter:
                    // Reset Business Area
                    oRequestModel.setProperty(sItemPath + '/BusinessAreaCode', "");
                    // Set state to warning and set message 
                    oRequestModel.setProperty(sItemPath + '/States/CostCenter', sState);
                    oRequestModel.setProperty(sItemPath + '/Messages/CostCenter', sMessage);
                    //Update business area collection
                    businessRules.setBusinessAreaCollection.call(this, parameters.getItemTypeList().Issuing);
                    businessRules.setBusinessAreaCollection.call(this, parameters.getItemTypeList().Receiving);
                    break;
                case parameters.getDataFieldTypeList().IssuingItemNature:
                case parameters.getDataFieldTypeList().ReceivingItemNature:
                    // Set state to warning and set message 
                    oRequestModel.setProperty(sItemPath + '/States/AnalyticalNature', sState);
                    oRequestModel.setProperty(sItemPath + '/Messages/AnalyticalNature', sMessage);
                    break;
                case parameters.getDataFieldTypeList().IssuingItemAccount:
                case parameters.getDataFieldTypeList().ReceivingItemAccount:
                    // Set state to warning and set message 
                    oRequestModel.setProperty(sItemPath + '/States/GLAccount', sState);
                    oRequestModel.setProperty(sItemPath + '/Messages/GLAccount', sMessage);
                    // Set LCOA Account to nothing
                    oRequestModel.setProperty(sItemPath + '/LCOAAccount', "");
                    break;
                case parameters.getDataFieldTypeList().IssuingItemInternalOrder:
                case parameters.getDataFieldTypeList().ReceivingItemInternalOrder:
                    // Set state to warning and set message 
                    oRequestModel.setProperty(sItemPath + '/States/InternalOrder', sState);
                    oRequestModel.setProperty(sItemPath + '/Messages/InternalOrder', sMessage);
                    break;
                case parameters.getDataFieldTypeList().IssuingItemWBS:
                case parameters.getDataFieldTypeList().ReceivingItemWBS:
                    // Set state to warning and set message 
                    oRequestModel.setProperty(sItemPath + '/States/WBSExternal', sState);
                    oRequestModel.setProperty(sItemPath + '/Messages/WBSExternal', sMessage);
                    break;
                case parameters.getDataFieldTypeList().IssuingSGLInd:
                    oRequestModel.setProperty("/HeaderData/Descriptions/IsSpecialGLIndicatorName", "");
                    // Remove state and message
                    oRequestModel.setProperty('/HeaderData/States/IsSpecialGLIndicator', sState);
                    oRequestModel.setProperty('/HeaderData/Messages/IsSpecialGLIndicator', sMessage);
                    break;
                case parameters.getDataFieldTypeList().ReceivingSGLInd:
                    oRequestModel.setProperty("/HeaderData/Descriptions/RcSpecialGLIndicatorName", "");
                    // Remove state and message
                    oRequestModel.setProperty('/HeaderData/States/RcSpecialGLIndicator', sState);
                    oRequestModel.setProperty('/HeaderData/Messages/RcSpecialGLIndicator', sMessage);
                    break;
                case parameters.getDataFieldTypeList().Vendor:
                    oRequestModel.setProperty('/HeaderData/States/VendorCode', sState);
                    oRequestModel.setProperty('/HeaderData/Messages/VendorCode', sMessage);
                    // Set payment term to nothing
//                    oRequestModel.setProperty('/HeaderData/PaymentTermCode', "");
//                    oRequestModel.setProperty('/HeaderData/Descriptions/PaymentTermName', "");

                    oRequestModel.setProperty('/HeaderData/States/WithholdingTaxTypeCode', sState);
                    oRequestModel.setProperty('/HeaderData/Messages/WithholdingTaxTypeCode', "");
                    oRequestModel.setProperty('/HeaderData/States/WithholdingTaxCodeCode', sState);
                    oRequestModel.setProperty('/HeaderData/Messages/WithholdingTaxCodeCode', "");
                    break;
                case parameters.getDataFieldTypeList().Customer:
                    oRequestModel.setProperty('/HeaderData/States/CustomerCode', sState);
                    oRequestModel.setProperty('/HeaderData/Messages/CustomerCode', sMessage);
                    break;
                case parameters.getDataFieldTypeList().Currency:
                    oRequestModel.setProperty('/HeaderData/States/CurrencyCode', sState);
                    oRequestModel.setProperty('/HeaderData/Messages/CurrencyCode', sMessage);
                    break;
                case parameters.getDataFieldTypeList().WithholdingTaxType:
                    oRequestModel.setProperty('/HeaderData/States/WithholdingTaxTypeCode', sState);
                    oRequestModel.setProperty('/HeaderData/Messages/WithholdingTaxTypeCode', sMessage);
                    break;
                case parameters.getDataFieldTypeList().WithholdingTaxCode:
                    oRequestModel.setProperty('/HeaderData/States/WithholdingTaxCodeCode', sState);
                    oRequestModel.setProperty('/HeaderData/Messages/WithholdingTaxCodeCode', sMessage);
                    break;
                case parameters.getDataFieldTypeList().IssuingItemGMID:
                case parameters.getDataFieldTypeList().ReceivingItemGMID:
                    // Set state to warning and set message 
                    oRequestModel.setProperty(sItemPath + '/States/GMID', sState);
                    oRequestModel.setProperty(sItemPath + '/Messages/GMID', sMessage);     
                    break;
                case parameters.getDataFieldTypeList().IssuingItemBusinessArea:
                case parameters.getDataFieldTypeList().ReceivingItemBusinessArea:
                    // Set state to warning and set message 
                    oRequestModel.setProperty(sItemPath + '/Descriptions/BusinessAreaName', "");
                    oRequestModel.setProperty(sItemPath + '/States/BusinessAreaCode', sState);
                    oRequestModel.setProperty(sItemPath + '/Messages/BusinessAreaCode', sMessage);   
                    //Update business area collection
                    businessRules.setBusinessAreaCollection.call(this, parameters.getItemTypeList().Issuing);
                    businessRules.setBusinessAreaCollection.call(this, parameters.getItemTypeList().Receiving);
                    break;
                case parameters.getDataFieldTypeList().IssuingItemHsnSac:
                case parameters.getDataFieldTypeList().ReceivingItemHsnSac:
                    // Set state to warning and set message 
                    oRequestModel.setProperty(sItemPath + '/Descriptions/HsnSacName', "");
                    oRequestModel.setProperty(sItemPath + '/States/HsnSacCode', sState);
                    oRequestModel.setProperty(sItemPath + '/Messages/HsnSacCode', sMessage);   
                    break;
                case parameters.getDataFieldTypeList().IssuingBusinessPlace:
                    // Set state to warning and set message 
                    oRequestModel.setProperty('/HeaderData/Descriptions/IsBusinessPlaceName', "");
                    oRequestModel.setProperty('/HeaderData/States/IsBusinessPlaceCode', sState);
                    oRequestModel.setProperty('/HeaderData/Messages/IsBusinessPlaceCode', sMessage);   
                    break;
                case parameters.getDataFieldTypeList().ReceivingBusinessPlace:
                    // Set state to warning and set message 
                    oRequestModel.setProperty('/HeaderData/Descriptions/RcBusinessPlaceName', "");
                	oRequestModel.setProperty('/HeaderData/States/RcBusinessPlaceCode', sState);
                	oRequestModel.setProperty('/HeaderData/Messages/RcBusinessPlaceCode', sMessage);   
                	break;
                case parameters.getDataFieldTypeList().IssuingBusinessAreaAlt:
                    // Set state to warning and set message 
                    oRequestModel.setProperty('/HeaderData/Descriptions/IsBusinessAreaAltName', "");
                    oRequestModel.setProperty('/HeaderData/States/IsBusinessAreaAltCode', sState);
                    oRequestModel.setProperty('/HeaderData/Messages/IsBusinessAreaAltCode', sMessage);   
                    break;
                case parameters.getDataFieldTypeList().ReceivingBusinessAreaAlt:
                    // Set state to warning and set message 
                    oRequestModel.setProperty('/HeaderData/Descriptions/RcBusinessAreaAltName', "");
                	oRequestModel.setProperty('/HeaderData/States/RcBusinessAreaAltCode', sState);
                	oRequestModel.setProperty('/HeaderData/Messages/RcBusinessAreaAltCode', sMessage);   
                	break;
                case parameters.getDataFieldTypeList().IssuingItemUnit:
                case parameters.getDataFieldTypeList().ReceivingItemUnit:           
                default:
                    break;
            }

            if (sMessage && bDisplayMessage === true) {
                messageHelper.showMessageToast(sMessage);
            }

        }

    };

    return oRequestHelper;

});