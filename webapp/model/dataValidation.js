/************************************************************************
 * Project            : TIMI                                 			*
 * Process            : FI                                              *
 * Task code          : FI062                                           *
 * Functional document:                                					*
 * Technical document :                                    				*
 *----------------------------------------------------------------------*
 * File       	 : model/dataValidation.js   	        				*
 * Author        : David TEA                                            *
 * Company       : Resp                                               	*
 * Creation Date : 01/06/2016                                           *
 *----------------------------------------------------------------------*
 * Description   : Provides functions to validate user input on data	*		
 *                                                                      *
 ************************************************************************
 * Modification nÂ° ...........	: M001									*
 * Project ...................	: TIMI									*
 * Author .................... 	: Marion Alberny                        *
 *----------------------------------------------------------------------*
 * Modification date ......... 	: 04/11/2016 							*
 * Transport order ........... 	:  										*
 * Change Request ............ 	: CR2016-273225  						*
 * Description ............... 	: SGL Indicator validation			 	*
 *************************************************************************/
/**
 * @fileOverview Provides functions to validate user input on data
 * @author David Tea 
 * @version 1.0
 */
sap.ui.define([
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "cus/fi/timi/rel/model/businessRules",
    "cus/fi/timi/rel/model/parameters",
    "cus/fi/timi/rel/model/odataService",
], function(Filter, FilterOperator, businessRules, parameters, odataService) {
    "use strict";

    /**
     * Call OData Service to check on value
     * 
     * @param {string} sValidationFieldType the field type to check
     * @param {string} sValue the value to check
     * @param {string}  sItemPath the item path to the request model
     * @public
     * @returns {object} promise
     */
    function _checkValueOnSAP(sValidationFieldType, sValue, sItemPath) {

        var aFilters = [],
            oRequestModel = this.getComponentModel("Request"),
            sLegalEntity = "";

        switch (sValidationFieldType) {
            case parameters.getDataFieldTypeList().IssuingItemCostCenter:
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/IsLegalEntityCode"))
                ];
                return odataService.readCostCenter.call(this, oRequestModel.getProperty("/HeaderData/IsCompanyCode"), sValue, aFilters);
            case parameters.getDataFieldTypeList().ReceivingItemCostCenter:
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcLegalEntityCode"))
                ];
                return odataService.readCostCenter.call(this, oRequestModel.getProperty("/HeaderData/RcCompanyCode"), sValue, aFilters);
            case parameters.getDataFieldTypeList().IssuingItemNature:
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/IsLegalEntityCode"))
                ];
                return odataService.readNature.call(this, sValue, aFilters);
            case parameters.getDataFieldTypeList().ReceivingItemNature:
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcLegalEntityCode"))
                ];
                return odataService.readNature.call(this, sValue, aFilters);
            case parameters.getDataFieldTypeList().IssuingItemGMID:
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/IsLegalEntityCode"))
                ];
                return odataService.readGMID.call(this, sValue, aFilters);            	
            case parameters.getDataFieldTypeList().ReceivingItemGMID:    
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcLegalEntityCode"))
                ];
                return odataService.readGMID.call(this, sValue, aFilters);                
            case parameters.getDataFieldTypeList().IssuingItemAccount:
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/IsLegalEntityCode")),
                    new Filter("DocumentTypeCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/DocumentTypeCode")),
                    new Filter("CompanyCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/IsCompanyCode")),
                    new Filter("ItemType", FilterOperator.EQ, oRequestModel.getProperty(sItemPath + "/ItemType")),
                    new Filter("NatureCode", FilterOperator.EQ, oRequestModel.getProperty(sItemPath + "/AnalyticalNature")),
                    new Filter("AccountCode", FilterOperator.EQ, sValue),
                    new Filter("Filters/IntercoType", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/IntercoTypeCode"))
                ];
                return odataService.queryAccount.call(this, "", aFilters)
                    .then(function(oData) {
                        return oData.results[0];
                    })
                    .catch(function(oError) {
                        throw oError;
                    });
            case parameters.getDataFieldTypeList().ReceivingItemAccount:
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcLegalEntityCode")),
                    new Filter("DocumentTypeCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/DocumentTypeCode")),
                    new Filter("CompanyCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcCompanyCode")),
                    new Filter("ItemType", FilterOperator.EQ, oRequestModel.getProperty(sItemPath + "/ItemType")),
                    new Filter("NatureCode", FilterOperator.EQ, oRequestModel.getProperty(sItemPath + "/AnalyticalNature")),
                    new Filter("AccountCode", FilterOperator.EQ, sValue),
                    new Filter("Filters/IntercoType", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/IntercoTypeCode"))
                ];
                return odataService.queryAccount.call(this, "", aFilters)
                    .then(function(oData) {
                        return oData.results[0];
                    })
                    .catch(function(oError) {
                        throw oError;
                    });
            case parameters.getDataFieldTypeList().IssuingTax:
            case parameters.getDataFieldTypeList().IssuingItemTax:
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/IsLegalEntityCode")),
                    new Filter("DocumentTypeCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/DocumentTypeCode")),
                    new Filter("CompanyCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/IsCompanyCode")),
                    new Filter("ItemType", FilterOperator.EQ, parameters.getItemTypeList().Issuing),
                    new Filter("TaxCode", FilterOperator.EQ, sValue)
                ];
                return odataService.queryTax.call(this, "", aFilters)
                    .then(function(oData) {
                        return oData.results[0];
                    })
                    .catch(function(oError) {
                        throw oError;
                    });
            case parameters.getDataFieldTypeList().ReceivingTax:
            case parameters.getDataFieldTypeList().ReceivingItemTax:
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcLegalEntityCode")),
                    new Filter("DocumentTypeCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/DocumentTypeCode")),
                    new Filter("CompanyCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcCompanyCode")),
                    new Filter("ItemType", FilterOperator.EQ, parameters.getItemTypeList().Receiving),
                    new Filter("TaxCode", FilterOperator.EQ, sValue)
                ];
                return odataService.queryTax.call(this, "", aFilters)
                    .then(function(oData) {
                        return oData.results[0];
                    })
                    .catch(function(oError) {
                        throw oError;
                    });
            case parameters.getDataFieldTypeList().IssuingItemInternalOrder:
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/IsLegalEntityCode")),
                    new Filter("CompanyCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/IsCompanyCode")),
                    new Filter("CurrencyCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/CurrencyCode")),
                    new Filter("InternalOrderCode", FilterOperator.EQ, sValue)
                ];
                return odataService.queryInternalOrder.call(this, "", aFilters)
                    .then(function(oData) {
                        return oData.results[0];
                    })
                    .catch(function(oError) {
                        throw oError;
                    });
            case parameters.getDataFieldTypeList().ReceivingItemInternalOrder:
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcLegalEntityCode")),
                    new Filter("CompanyCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcCompanyCode")),
                    new Filter("CurrencyCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/CurrencyCode")),
                    new Filter("InternalOrderCode", FilterOperator.EQ, sValue)
                ];
                return odataService.queryInternalOrder.call(this, "", aFilters)
                    .then(function(oData) {
                        return oData.results[0];
                    })
                    .catch(function(oError) {
                        throw oError;
                    });
            case parameters.getDataFieldTypeList().IssuingItemWBS:
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/IsLegalEntityCode")),
                    new Filter("CompanyCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/IsCompanyCode")),
                    new Filter("CurrencyCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/CurrencyCode")),
                    new Filter("WBSExternalCode", FilterOperator.EQ, sValue)
                ];
                return odataService.queryWBS.call(this, "", aFilters)
                    .then(function(oData) {
                        return oData.results[0];
                    })
                    .catch(function(oError) {
                        throw oError;
                    });
            case parameters.getDataFieldTypeList().ReceivingItemWBS:
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcLegalEntityCode")),
                    new Filter("CompanyCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcCompanyCode")),
                    new Filter("CurrencyCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/CurrencyCode")),
                    new Filter("WBSExternalCode", FilterOperator.EQ, sValue)
                ];
                return odataService.queryWBS.call(this, "", aFilters)
                    .then(function(oData) {
                        return oData.results[0];
                    })
                    .catch(function(oError) {
                        throw oError;
                    });
            case parameters.getDataFieldTypeList().IssuingItemBusinessArea:
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/IsLegalEntityCode")),
                    new Filter("BusinessAreaCode", FilterOperator.EQ, sValue)
                ];
                return odataService.queryBusinessArea.call(this, "", aFilters)
                    .then(function(oData) {
                        return oData.results[0];
                    })
                    .catch(function(oError) {
                        throw oError;
                    });
            case parameters.getDataFieldTypeList().ReceivingItemBusinessArea:
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcLegalEntityCode")),
                    new Filter("BusinessAreaCode", FilterOperator.EQ, sValue)
                ];
                return odataService.queryBusinessArea.call(this, "", aFilters)
                    .then(function(oData) {
                        return oData.results[0];
                    })
                    .catch(function(oError) {
                        throw oError;
                    });
            case parameters.getDataFieldTypeList().Vendor:
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcLegalEntityCode")),
                    new Filter("CompanyCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcCompanyCode")),
                    new Filter("LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/IsLegalEntityCode")),
                    new Filter("VendorCode", FilterOperator.EQ, sValue)
                ];
                return odataService.queryVendor.call(this, "", aFilters)
                    .then(function(oData) {
                        return oData.results[0];
                    })
                    .catch(function(oError) {
                        throw oError;
                    });
            case parameters.getDataFieldTypeList().Customer:
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/IsLegalEntityCode")),
                    new Filter("CompanyCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/IsCompanyCode")),
                    new Filter("LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcLegalEntityCode")),
                    new Filter("CustomerCode", FilterOperator.EQ, sValue)
                ];
                return odataService.queryCustomer.call(this, "", aFilters)
                    .then(function(oData) {
                        return oData.results[0];
                    })
                    .catch(function(oError) {
                        throw oError;
                    });
            case parameters.getDataFieldTypeList().Currency:
            	if ( this.getIntercoType() === parameters.getIntercoTypeList().Treasury ) {
            		if ( oRequestModel.getProperty("/HeaderData/IsTreasury") ){
            			sLegalEntity = oRequestModel.getProperty("/HeaderData/IsLegalEntityCode");
            		} else {
            			sLegalEntity = oRequestModel.getProperty("/HeaderData/RcLegalEntityCode");
            		}
            	} else {
            		sLegalEntity = oRequestModel.getProperty("/HeaderData/IsLegalEntityCode");
            	}
            
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, sLegalEntity),
                    new Filter("CurrencyCode", FilterOperator.EQ, sValue)
                ];
                return odataService.queryCurrency.call(this, "", aFilters)
                    .then(function(oData) {
                        return oData.results[0];
                    })
                    .catch(function(oError) {
                        throw oError;
                    });
            case parameters.getDataFieldTypeList().IssuingSGLInd:
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/IsLegalEntityCode")),
                    new Filter("CompanyCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/IsCompanyCode")),
                    new Filter("CustomerCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/CustomerCode")),
                    new Filter("SGLIndicatorCode", FilterOperator.EQ, sValue)
                ];
                return odataService.querySLGIndicatorIssuing.call(this, "", aFilters)
                    .then(function(oData) {
                        return oData.results[0];
                    })
                    .catch(function(oError) {
                        throw oError;
                    });
            case parameters.getDataFieldTypeList().ReceivingSGLInd:
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcLegalEntityCode")),
                    new Filter("CompanyCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcCompanyCode")),
                    new Filter("VendorCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/VendorCode")),
                    new Filter("SGLIndicatorCode", FilterOperator.EQ, sValue)
                ];
                return odataService.querySLGIndicatorReceiving.call(this, "", aFilters)
                    .then(function(oData) {
                        return oData.results[0];
                    })
                    .catch(function(oError) {
                        throw oError;
                    });
            case parameters.getDataFieldTypeList().IssuingItemHsnSac:
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/IsLegalEntityCode")),
                    new Filter("HsnSacCode", FilterOperator.EQ, sValue)
                ];
                return odataService.queryHsnSac.call(this, "", aFilters)
                    .then(function(oData) {
                        return oData.results[0];
                    })
                    .catch(function(oError) {
                        throw oError;
                    });
            case parameters.getDataFieldTypeList().ReceivingItemHsnSac:
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcLegalEntityCode")),
                    new Filter("HsnSacCode", FilterOperator.EQ, sValue)
                ];
                return odataService.queryHsnSac.call(this, "", aFilters)
                    .then(function(oData) {
                        return oData.results[0];
                    })
                    .catch(function(oError) {
                        throw oError;
                    });
            case parameters.getDataFieldTypeList().IssuingBusinessPlace:
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/IsLegalEntityCode")),
                    new Filter("CompanyCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/IsCompanyCode")),
                    new Filter("BusinessPlaceCode", FilterOperator.EQ, sValue)
                ];
                return odataService.queryBusinessPlace.call(this, "", aFilters)
                    .then(function(oData) {
                        return oData.results[0];
                    })
                    .catch(function(oError) {
                        throw oError;
                    });
            case parameters.getDataFieldTypeList().ReceivingBusinessPlace:
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcLegalEntityCode")),
                    new Filter("CompanyCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcCompanyCode")),
                    new Filter("BusinessPlaceCode", FilterOperator.EQ, sValue)
                ];
                return odataService.queryBusinessPlace.call(this, "", aFilters)
                    .then(function(oData) {
                        return oData.results[0];
                    })
                    .catch(function(oError) {
                        throw oError;
                    });
            case parameters.getDataFieldTypeList().IssuingBusinessAreaAlt:
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/IsLegalEntityCode")),
                    new Filter("BusinessAreaCode", FilterOperator.EQ, sValue)
                ];
                return odataService.queryBusinessPlace.call(this, "", aFilters)
                    .then(function(oData) {
                        return oData.results[0];
                    })
                    .catch(function(oError) {
                        throw oError;
                    });
            case parameters.getDataFieldTypeList().ReceivingBusinessAreaAlt:
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcLegalEntityCode")),
                    new Filter("BusinessAreaCode", FilterOperator.EQ, sValue)
                ];
                return odataService.queryBusinessPlace.call(this, "", aFilters)
                    .then(function(oData) {
                        return oData.results[0];
                    })
                    .catch(function(oError) {
                        throw oError;
                    });
            default:
                return Promise.reject();
        }

    };

    var oDataValidation = {

        /**
         * Validate value 
         * @param {string} sValidationFieldType the type of the validation field
         * @param {string} sValue the value to validate
         * @param {string} sItemPath the item binding path
         * @public
         * @returns {object} promise
         */
        validateValue: function(sValidationFieldType, sValue, sItemPath) {

            var fnCheckValueOnSAP = _checkValueOnSAP;

            if (sValue !== "") {
                return fnCheckValueOnSAP.call(this, sValidationFieldType, sValue, sItemPath);
            } else {
                return Promise.reject(null);
            }

        }

    };

    return oDataValidation;

}, true)