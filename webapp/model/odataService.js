/************************************************************************
* Project            : TIMI                                 			*
* Process            : FI                                              	*
* Task code          : FI062                                           	*
* Functional document:                                					*
* Technical document :                                    				*
*-----------------------------------------------------------------------*
* File       	: model/odataService.js   	        					*
* Author        : David TEA                                            	*
* Company       : Resp                                               	*
* Creation Date : 24/09/2017                                           	*
*-----------------------------------------------------------------------*
* Description   : Call OData functions		    						*		
*                                                                      	*
*************************************************************************
* Modification nÂ° ...........	: 										*
* Project ...................	: 										*
* Author .................... :                       	 				*
*-----------------------------------------------------------------------*
* Modification date ......... 	: 	 									*
* Transport order ........... 	:  										*
* Change Request ............ 	: 	  									*
* Description ............... 	: 	 									* 
*************************************************************************
 * Modification n° ...........  : M0001								    *
 * Project ...................	: TIMI									*
 * Author .................... 	: David TEA                        	    *
 *----------------------------------------------------------------------*
 * Modification date ......... 	: 18/12/2025 							*
 * Transport order ........... 	: DO8K908635 							*
 * Change Request ............ 	: CHG0173797  							*
 * Description ............... 	: Enhancement Q4 2025					*
*************************************************************************
/**
* @fileOverview Provides functions for OData service 
* @author David Tea 
* @version 1.0
*/
sap.ui.define([
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "cus/fi/timi/rel/model/parameters",
    "sap/ui/model/odata/ODataUtils"
], function(Filter, FilterOperator, parameters, ODataUtils) {
    'use strict';

    function _getODataModel() {
        if (this.getComponentModel !== undefined) {
            return this.getComponentModel("YWS_FI062_TIMI");
        } else {
            return this.getModel("YWS_FI062_TIMI");
        }
    };

    function _createODataEntityObject(oDataModel, sEntityName, aNavigations) {

        var oEntityModelData = {},
            oEntity = {},
            oNavigationEntity = {},
            oMetadata = {},
            sNamespace, sNameType,
            aEntityType = [],
            aComplexType = [],
            aEntityNavigation = [],
            aEntityProperty = [],
            iCountNavigation = 0,
            iCountEntityProperty = 0,
            iCountComplexType = 0,
            bFound = false;

        /**
         * Get EDM type initial/default value
         * @param {string} sEdmType the type
         * @public
         * @returns {string} the default value
         */
        function _getEdmTypeInitialValue(sEdmType) {
            switch (sEdmType) {
                case 'Edm.DateTime':
                    return null;
                case 'Edm.String':
                    return "";
                case 'Edm.Decimal':
                    return "0";
                case 'Edm.Int16':
                case 'Edm.Int32':
                case 'Edm.Int64':
                	return 0;
                case 'Edm.Boolean':
                    return false;
                default:
                    return '';
            }
        };

        oMetadata = oDataModel.getServiceMetadata();
        aEntityType = oMetadata.dataServices.schema[0].entityType;
        sNamespace = oMetadata.dataServices.schema[0].namespace;
        aComplexType = oMetadata.dataServices.schema[0].complexType;

        aEntityType.some(function(oItem) {
            if (oItem.name === sEntityName) {
                oEntity = oItem;
                return true;
            };
            return false;
        });

        if (oEntity) {
            aEntityProperty = oEntity.property;
            iCountEntityProperty = aEntityProperty.length;
            aEntityNavigation = oEntity.navigationProperty;

            iCountNavigation = aNavigations.length;
            iCountComplexType = aComplexType.length;

            for (var i = 0; i < iCountEntityProperty; i++) {

                // If property type is a Edm.* then get initial value else it is a complex type
                if (aEntityProperty[i].type.substr(0, 3) === "Edm") {
                    oEntityModelData[aEntityProperty[i].name] = _getEdmTypeInitialValue(aEntityProperty[i].type);
                } else {

                    var oComplexType = {}

                    for (var k = 0; k < iCountComplexType; k++) {
                        sNameType = sNamespace + "." + aComplexType[k].name;
                        if (sNameType === aEntityProperty[i].type) {
                            // Complex Type found
                            aComplexType[k].property.forEach((function(oItem, iIdx) {

                                if (oItem.type.substr(0, 3) === "Edm") {

                                    oComplexType[oItem.name] = _getEdmTypeInitialValue(oItem.type);

                                } else {
                                	
                                	var oComplexTypeLvl2 = {};

                                    for (var l = 0; l < iCountComplexType; l++) {
                                        var sNameTypeLvl2 = sNamespace + "." + oItem.name;
                                        if (sNameTypeLvl2 === oItem.type) {
                                            // Complex Type found
                                            aComplexType[l].property.forEach((function(oItemLvl2, iIdx) {
                                                oComplexTypeLvl2[oItemLvl2.name] = _getEdmTypeInitialValue(oItemLvl2.type);
                                            }).bind(this))

                                            oComplexType[oItem.name] = oComplexTypeLvl2;
                                            break;
                                        }
                                    }

                                }
                            }).bind(this))

                            oEntityModelData[aEntityProperty[i].name] = oComplexType;

                            break;
                        }
                    }

                }

            }

            for (var j = 0; j < iCountNavigation; j++) {
                /* check if navigation exists */
                bFound = aEntityNavigation.some(function(oItem) {
                    if (oItem.name = aNavigations[j]) {
                        return true;
                    };
                    return false;
                })

                if (bFound) {
                    oNavigationEntity = this.createODataEntityObject(oDataModel, aNavigations[j], []);
                    oEntityModelData[aNavigations[j]] = [];
                    oEntityModelData[aNavigations[j]].push(oNavigationEntity);
                }
            }

        }

        return oEntityModelData;

    };

    var oODataService = {

        getODataModel: function() {

            var fnGetODataModel = _getODataModel;

            return fnGetODataModel.apply(this);

        },

        /**
         * Get full correct OData service url to use
         * @param {string} sODataUrl the OData uri
         * @public
         * @returns {string} the full service url
         */
        getODataServiceUrl: function(sODataUrl) {

            var sServiceUrl;

            /**
             * Get correct pathname which can be incorrect depending on situation like 
             * 		- localhost url
             * 		- localhost sandbox url
             * 		- server url
             * @public
             * @returns {string} the pathname to use
             */
            function _getPathname() {
                var sPathname;

                // Case Localhost or 127.0.0.1
                if (document.location.hostname === "127.0.0.1" || document.location.hostname === "localhost") {
                    if (document.location.hash === "") {
                        if (document.location.pathname !== "/") {
                            sPathname = "/" + document.location.pathname.split("/")[1] + "/";
                        } else {
                            sPathname = document.location.pathname
                        }
                    } else {
                        sPathname = "/" + document.location.hash.split("#")[1].split("-")[0] + "/";
                    }

                } else {
                    // Case Server
                    sPathname = "/";
                }

                return sPathname;
            }

            if (sODataUrl && sODataUrl.substr(0, 1) === "/") {
                sServiceUrl = _getPathname() + sODataUrl.substr(1);
            } else {
                sServiceUrl = _getPathname() + sODataUrl;
            }

            return sServiceUrl;
        },

        /**
         * Create Object Entity based on ODataModel metadata
         * @param {object} oDataModel the OData model
         * @param {string} sEntityName the name of the entity which object is based on
         * @param {string[]} aNavigations the list of navigations of the entity 
         * @public
         * @returns {object} the object based on entity & its navigation metadata
         */
        createODataEntityObject: function(oDataModel, sEntityName, aNavigations) {

            var fnCreateODataEntityObject = _createODataEntityObject;

            return fnCreateODataEntityObject(oDataModel, sEntityName, aNavigations);

        },

        batchRead: function(sGroupId, aOperations) {

            var oDataModel = _getODataModel.apply(this),
                iOperation = aOperations.length,
                i = 0;

            return new Promise(
                function resolver(resolve, reject) {

                    oDataModel.setDeferredGroups([sGroupId]);

                    for (i = 0; i < iOperation; i++) {
                        oDataModel.read(aOperations[i].path, {
                            "groupId": sGroupId,
                            "filters": aOperations[i].filters
                        });
                    }

                    oDataModel.submitChanges({
                        "groupId": sGroupId,
                        "success": function(oData, oResponse, aErrorResponses) {
                            if (aErrorResponses && aErrorResponses.length > 0) {
                                reject(aErrorResponses[0]);
                            }
                            resolve(oData);
                        },
                        "error": function(oError) {
                            reject(oError);
                        }
                    });
                }
            );

        },

        batchUpdate: function(sGroupId, aOperations) {

            var oDataModel = _getODataModel.apply(this),
                fnCreateODataEntityObject = _createODataEntityObject,
                oBatchInitiator = {},
                iOperation = aOperations.length,
                i = 0;

            return new Promise(
                function resolver(resolve, reject) {

                    oDataModel.setDeferredGroups([sGroupId]);

                    // First call batch initiator collection
                    oBatchInitiator = fnCreateODataEntityObject(oDataModel, "BatchInitiator", []);
                    oBatchInitiator.BatchType = parameters.getBatchTypeList().UpdateRequest;
                    oDataModel.update("/BatchInitiatorCollection('" + parameters.getBatchTypeList().UpdateRequest + "')", oBatchInitiator, {
                        groupId: sGroupId,
                        changeSetId: sGroupId
                    });

                    for (i = 0; i < iOperation; i++) {
                        oDataModel.update(aOperations[i].path, aOperations[i].data, {
                            groupId: sGroupId,
                            changeSetId: sGroupId
                        });
                    }

                    oDataModel.submitChanges({
                        "groupId": sGroupId,
                        "success": function(oData, oResponse, aErrorResponses) {
                            if (aErrorResponses && aErrorResponses.length > 0) {
                                reject(aErrorResponses[0]);
                            }
                            resolve(oData);
                        },
                        "error": function(oError) {
                            reject(oError);
                        }
                    });
                }
            );

        },

        checkUploadRequest : function(oRequestData){
        	
            var oDataModel = _getODataModel.apply(this);
            oDataModel.setUseBatch(false);

            return new Promise(
                function resolver(resolve, reject) {
                    oDataModel.create("/RequestCheckCollection", oRequestData, {
                        "success": function(oData, oResponse) {
                            oDataModel.setUseBatch(true);
                            resolve(oData);
                        },
                        "error": function(oError) {
                            oDataModel.setUseBatch(true);
                            reject(oError);
                        }
                    });
                });
            
        },
        
        getRequest: function(sRequestId) {

            var oDataModel = _getODataModel.apply(this),
                aFilters = [
                	new Filter("ApplicationType", FilterOperator.EQ, this.getComponentModel("AppData").getProperty("/appType")),
                	new Filter("Filters/IntercoType", FilterOperator.EQ, this.getComponentModel("AppData").getProperty("/intercoType"))
            	]

            return new Promise(
                function resolver(resolve, reject) {
                    oDataModel.read("/RequestCollection(TypeId='" + parameters.getMasterDataType() + "',RequestId='" + sRequestId + "')", {
                        "urlParameters": {
                            "$expand": "IssuingItems,ReceivingItems,WorkflowHistory,Attachments,IssuingWithholdingTax/WithholdingTaxCodes,ReceivingWithholdingTax/WithholdingTaxCodes"
                        },
                        "filters": aFilters,
                        "success": function(oData) {
                            resolve(oData);
                        },
                        "error": function(oError) {
                            reject(oError);
                        }
                    });
                }
            );

        },

        queryRequest: function(aFilters) {

            var oDataModel = _getODataModel.apply(this);

            return new Promise(
                function resolver(resolve, reject) {
                    oDataModel.read("/RequestCollection", {
                        urlParameters: {
                            "$expand": "WorkflowHistory,BatchLogs"
                        },
                        "filters": aFilters,
                        "success": function(oData) {
                            resolve(oData);
                        },
                        "error": function(oError) {
                            reject(oError);
                        }
                    });
                }
            );

        },

        //M0001 DTE - Begin of ins
        queryRequestBatchLogs: function(aFilters) {

            var oDataModel = _getODataModel.apply(this);

            return new Promise(
                function resolver(resolve, reject) {
                    oDataModel.read("/RequestBatchLogsCollection", {
                        "filters": aFilters,
                        "success": function(oData) {
                            resolve(oData);
                        },
                        "error": function(oError) {
                            reject(oError);
                        }
                    });
                }
            );

        },
        //M0001 DTE - End of ins        

        createRequest: function(oRequestData) {

            var oDataModel = _getODataModel.apply(this);

            return new Promise(
                function resolver(resolve, reject) {
                    oDataModel.create("/RequestCollection", oRequestData, {
                        "success": function(oData, oResponse) {
                            resolve(oData);
                        },
                        "error": function(oError) {
                            reject(oError);
                        }
                    });
                });

        },
        
        createDeepRequest : function(oRequestData) {
        	
            var oDataModel = _getODataModel.apply(this);
            oDataModel.setUseBatch(false);

            return new Promise(
                function resolver(resolve, reject) {
                    oDataModel.create("/RequestCollection", oRequestData, {
                        "success": function(oData, oResponse) {
                            oDataModel.setUseBatch(true);
                            resolve(oData);
                        },
                        "error": function(oError) {
                            oDataModel.setUseBatch(true);
                            reject(oError);
                        }
                    });
                });
        	
        },

        countRequests: function(oUrlParameters) {

            var oDataModel = _getODataModel.apply(this);

            return new Promise(
                function resolver(resolve, reject) {
                    oDataModel.callFunction("/CountRequests", {
                        "method": "GET",
                        "urlParameters": oUrlParameters,
                        "success": function(oData) {
                            resolve(oData);
                        },
                        "error": function(oError) {
                            reject(oError);
                        }
                    });
                }
            );

        },

        checkRequest: function(sActionId, aFilters) {

            var oDataModel = _getODataModel.apply(this);

            return new Promise(
                function resolver(resolve, reject) {
                    oDataModel.read("/RequestCheckCollection", {
                        "urlParameters": {
                            "$expand": "IssuingItems,ReceivingItems,Messages,WorkflowHistory,Attachments,IssuingWithholdingTax/WithholdingTaxCodes,ReceivingWithholdingTax/WithholdingTaxCodes",
                            "search": sActionId
                        },
                        "filters": aFilters,
                        "success": function(oData) {
                            resolve(oData);
                        },
                        "error": function(oError) {
                            reject(oError);
                        }
                    });
                }
            );

        },
        
        simulateRequest : function(oRequestData, aFilters){
        	
            var oDataModel = _getODataModel.apply(this);

            return new Promise(
                function resolver(resolve, reject) {
                    oDataModel.read("/RequestCheckCollection", {
                        "urlParameters": {
                            "$expand": "IssuingItems,ReceivingItems,Messages,WorkflowHistory,Attachments,IssuingWithholdingTax/WithholdingTaxCodes,ReceivingWithholdingTax/WithholdingTaxCodes",
                            "search": sActionId
                        },
                        "filters": aFilters,
                        "success": function(oData) {
                            resolve(oData);
                        },
                        "error": function(oError) {
                            reject(oError);
                        }
                    });
                }
            );
            
        },

        generateRequests: function(oUrlParameters) {

            var oDataModel = _getODataModel.apply(this);

            return new Promise(
                function resolver(resolve, reject) {
                    oDataModel.callFunction("/GeneratePostingFile", {
                        "method": "GET",
                        "urlParameters": {
                            "RequestsIdInline": oUrlParameters.RequestsIdInline,
                            "ApplicationType": oUrlParameters.ApplicationType,
                            "IntercoType": oUrlParameters.IntercoType
                        },
                        "success": function(oData) {
                            resolve(oData);
                        },
                        "error": function(oError) {
                            reject(oError);
                        }
                    });
                }
            );

        },

        applyRequestDecision: function(oUrlParameters) {

            var oDataModel = _getODataModel.apply(this);

            return new Promise(
                function resolver(resolve, reject) {

                    oDataModel.callFunction("/ApplyDecision", {
                        "method": "GET",
                        "urlParameters": {
                            "ApplicationType": oUrlParameters.ApplicationType,
                            "IntercoType" : oUrlParameters.IntercoType,
                            "RequestId": oUrlParameters.RequestId,
                            "ActionId": oUrlParameters.ActionId,
                            "Comments": oUrlParameters.Comments
                        },
                        "success": function(oData, oResponse) {
                            resolve(oData);
                        },
                        "error": function(oError) {
                            reject(oError);
                        }
                    });
                }
            );

        },

        requestFieldsAttributes: function(oUrlParameters) {

            var oDataModel = _getODataModel.apply(this);

            return new Promise(
                function resolver(resolve, reject) {

                    oDataModel.callFunction("/RequestFieldsAttributes", {
                        "method": "GET",
                        "urlParameters": {
                            "IntercoType": oUrlParameters.IntercoType,
                            "ApplicationType": oUrlParameters.ApplicationType,
                            "RequestId": oUrlParameters.RequestId
                        },
                        "success": function(oData, oResponse) {
                            resolve(oData);
                        },
                        "error": function(oError) {
                            reject(oError);
                        }
                    });
                }
            );

        },
        
        determineRequestItemDefaultValues : function(oUrlParameters){
        	
            var oDataModel = _getODataModel.apply(this);

            return new Promise(
                function resolver(resolve, reject) {

                    oDataModel.callFunction("/DetermineRequestItemDefaultValues", {
                        "method": "GET",
                        "urlParameters": {
                            "RequestId": oUrlParameters.RequestId,
                            "ItemType": oUrlParameters.ItemType,
                        },
                        "success": function(oData, oResponse) {
                            resolve(oData);
                        },
                        "error": function(oError) {
                            reject(oError);
                        }
                    });
                }
            );    
            
        },

        updatesForFieldsAttributes: function(oUrlParameters) {

            var oDataModel = _getODataModel.apply(this);

            return new Promise(
                function resolver(resolve, reject) {

                    oDataModel.callFunction("/UpdatesForRequestFieldsAttributes", {
                        "method": "GET",
                        "urlParameters": {
                            "IntercoType": oUrlParameters.IntercoType,
                            "ApplicationType": oUrlParameters.ApplicationType,
                            "FieldId": oUrlParameters.FieldId,
                            "FieldTable": oUrlParameters.FieldTable,
                            "FieldValue": oUrlParameters.FieldValue,
                            "RequestId": oUrlParameters.RequestId
                        },
                        "success": function(oData, oResponse) {
                            resolve(oData);
                        },
                        "error": function(oError) {
                            reject(oError);
                        }
                    });
                }
            );

        },

        getOverviewActionsVisibility: function(sIntercoType, sAppType) {

            var oDataModel = _getODataModel.apply(this);

            return new Promise(
                function resolver(resolve, reject) {
                    oDataModel.callFunction("/OverviewActionsVisibility", {
                        "method": "GET",
                        "urlParameters": {
                        	"IntercoType" : sIntercoType,
                        	"ApplicationType" : sAppType
                        },
                        "success": function(oData) {
                            resolve(oData);
                        },
                        "error": function(oError) {
                            reject(oError);
                        }
                    });
                }
            );

        },
        
        queryCompany: function(aFilters) {

            var oDataModel = _getODataModel.apply(this);

            return new Promise(
                function resolver(resolve, reject) {
                    oDataModel.read("/CompanyCollection", {
                        "filters": aFilters,
                        "success": function(oData) {
                            resolve(oData);
                        },
                        "error": function(oError) {
                            reject(oError);
                        }
                    });
                }
            );

        },

        queryCompanyRC: function(aFilters) {

            var oDataModel = _getODataModel.apply(this);

            return new Promise(
                function resolver(resolve, reject) {
                    oDataModel.read("/CompanyRCCollection", {
                        "filters": aFilters,
                        "success": function(oData) {
                            resolve(oData);
                        },
                        "error": function(oError) {
                            reject(oError);
                        }
                    });
                }
            );

        },

        queryUser: function(sSearch, aFilters) {

            var oDataModel = _getODataModel.apply(this);

            return new Promise(
                function resolver(resolve, reject) {
                    oDataModel.read("/UserCollection", {
                        "urlParameters": {
                            "search": sSearch
                        },
                        "filters": aFilters,
                        "success": function(oData) {
                            resolve(oData);
                        },
                        "error": function(oError) {
                            reject(oError);
                        }
                    });
                }
            );

        },

        queryTax: function(sSearch, aFilters) {

            var oDataModel = _getODataModel.apply(this);

            return new Promise(
                function resolver(resolve, reject) {
                    oDataModel.read("/TaxCollection", {
                        "urlParameters": {
                            "search": sSearch
                        },
                        "filters": aFilters,
                        "success": function(oData) {
                            resolve(oData);
                        },
                        "error": function(oError) {
                            reject(oError);
                        }
                    });
                }
            );

        },

        queryGMID: function(sSearch, aFilters) {

            var oDataModel = _getODataModel.apply(this);

            return new Promise(
                function resolver(resolve, reject) {
                    oDataModel.read("/GMIDCollection", {
                        "urlParameters": {
                            "search": sSearch
                        },
                        "filters": aFilters,
                        "success": function(oData) {
                            resolve(oData);
                        },
                        "error": function(oError) {
                            reject(oError);
                        }
                    });
                }
            );

        },

        readGMID: function(sGMID, aFilters) {

            var oDataModel = _getODataModel.apply(this);

            return new Promise(
                function resolver(resolve, reject) {
                    oDataModel.read("/GMIDCollection(GMIDCode='" + sGMID + "')", {
                        "filters": aFilters,
                        "success": function(oData) {
                            resolve(oData);
                        },
                        "error": function(oError) {
                            reject(oError);
                        }
                    });
                }
            );

        },

        queryCostCenter: function(sSearch, aFilters) {

            var oDataModel = _getODataModel.apply(this);

            return new Promise(
                function resolver(resolve, reject) {
                    oDataModel.read("/CostCenterCollection", {
                        "urlParameters": {
                            "search": sSearch
                        },
                        "filters": aFilters,
                        "success": function(oData) {
                            resolve(oData);
                        },
                        "error": function(oError) {
                            reject(oError);
                        }
                    });
                }
            );

        },

        readCostCenter: function(sCompanyCode, sCostCenter, aFilters) {

            var oDataModel = _getODataModel.apply(this);

            return new Promise(
                function resolver(resolve, reject) {
                    oDataModel.read("/CostCenterCollection(CompanyCode='" + sCompanyCode + "',CostCenterCode='" + sCostCenter + "')", {
                        "filters": aFilters,
                        "success": function(oData) {
                            resolve(oData);
                        },
                        "error": function(oError) {
                            reject(oError);
                        }
                    });
                }
            );

        },

        queryNature: function(sSearch, aFilters) {

            var oDataModel = _getODataModel.apply(this);

            return new Promise(
                function resolver(resolve, reject) {
                    oDataModel.read("/NatureCollection", {
                        "urlParameters": {
                            "search": sSearch
                        },
                        "filters": aFilters,
                        "success": function(oData) {
                            resolve(oData);
                        },
                        "error": function(oError) {
                            reject(oError);
                        }
                    });
                }
            );

        },

        readNature: function(sNature, aFilters) {

            var oDataModel = _getODataModel.apply(this);

            return new Promise(
                function resolver(resolve, reject) {
                    oDataModel.read("/NatureCollection('" + sNature + "')", {
                        "filters": aFilters,
                        "success": function(oData) {
                            resolve(oData);
                        },
                        "error": function(oError) {
                            reject(oError);
                        }
                    });
                }
            );

        },

        queryAccount: function(sSearch, aFilters) {

            var oDataModel = _getODataModel.apply(this);

            return new Promise(
                function resolver(resolve, reject) {
                    oDataModel.read("/AccountCollection", {
                        "urlParameters": {
                            "search": sSearch
                        },
                        "filters": aFilters,
                        "success": function(oData) {
                            resolve(oData);
                        },
                        "error": function(oError) {
                            reject(oError);
                        }
                    });
                }
            );

        },

        queryInternalOrder: function(sSearch, aFilters) {

            var oDataModel = _getODataModel.apply(this);

            return new Promise(
                function resolver(resolve, reject) {
                    oDataModel.read("/InternalOrderCollection", {
                        "urlParameters": {
                            "search": sSearch
                        },
                        "filters": aFilters,
                        "success": function(oData) {
                            resolve(oData);
                        },
                        "error": function(oError) {
                            reject(oError);
                        }
                    });
                }
            );

        },

        queryWBS: function(sSearch, aFilters) {

            var oDataModel = _getODataModel.apply(this);

            return new Promise(
                function resolver(resolve, reject) {
                    oDataModel.read("/WBSCollection", {
                        "urlParameters": {
                            "search": sSearch
                        },
                        "filters": aFilters,
                        "success": function(oData) {
                            resolve(oData);
                        },
                        "error": function(oError) {
                            reject(oError);
                        }
                    });
                }
            );

        },

        queryBusinessArea: function(sSearch, aFilters) {

            var oDataModel = _getODataModel.apply(this);

            return new Promise(
                function resolver(resolve, reject) {
                    oDataModel.read("/BusinessAreaCollection", {
                        "urlParameters": {
                            "search": sSearch
                        },
                        "filters": aFilters,
                        "success": function(oData) {
                            resolve(oData);
                        },
                        "error": function(oError) {
                            reject(oError);
                        }
                    });
                }
            );

        },

        queryHsnSac: function(sSearch, aFilters) {

            var oDataModel = _getODataModel.apply(this);

            return new Promise(
                function resolver(resolve, reject) {
                    oDataModel.read("/HsnSacCollection", {
                        "urlParameters": {
                            "search": sSearch
                        },
                        "filters": aFilters,
                        "success": function(oData) {
                            resolve(oData);
                        },
                        "error": function(oError) {
                            reject(oError);
                        }
                    });
                }
            );

        },

        queryBusinessPlace: function(sSearch, aFilters) {

            var oDataModel = _getODataModel.apply(this);

            return new Promise(
                function resolver(resolve, reject) {
                    oDataModel.read("/BusinessPlaceCollection", {
                        "urlParameters": {
                            "search": sSearch
                        },
                        "filters": aFilters,
                        "success": function(oData) {
                            resolve(oData);
                        },
                        "error": function(oError) {
                            reject(oError);
                        }
                    });
                }
            );

        },

        querySLGIndicatorIssuing: function(sSearch, aFilters) {

            var oDataModel = _getODataModel.apply(this);

            return new Promise(
                function resolver(resolve, reject) {
                    oDataModel.read("/SGLIndicatorIssuingCollection", {
                        "urlParameters": {
                            "search": sSearch
                        },
                        "filters": aFilters,
                        "success": function(oData) {
                            resolve(oData);
                        },
                        "error": function(oError) {
                            reject(oError);
                        }
                    });
                }
            );

        },

        querySLGIndicatorReceiving: function(sSearch, aFilters) {

            var oDataModel = _getODataModel.apply(this);

            return new Promise(
                function resolver(resolve, reject) {
                    oDataModel.read("/SGLIndicatorReceivingCollection", {
                        "urlParameters": {
                            "search": sSearch
                        },
                        "filters": aFilters,
                        "success": function(oData) {
                            resolve(oData);
                        },
                        "error": function(oError) {
                            reject(oError);
                        }
                    });
                }
            );

        },

        queryVendor: function(sSearch, aFilters) {

            var oDataModel = _getODataModel.apply(this);

            return new Promise(
                function resolver(resolve, reject) {
                    oDataModel.read("/VendorCollection", {
                        urlParameters: {
                            "search": sSearch
                        },
                        "filters": aFilters,
                        "success": function(oData) {
                            resolve(oData);
                        },
                        "error": function(oError) {
                            reject(oError);
                        }
                    });
                }
            );

        },

        queryCustomer: function(sSearch, aFilters) {

            var oDataModel = _getODataModel.apply(this);

            return new Promise(
                function resolver(resolve, reject) {
                    oDataModel.read("/CustomerCollection", {
                        urlParameters: {
                            "search": sSearch
                        },
                        "filters": aFilters,
                        "success": function(oData) {
                            resolve(oData);
                        },
                        "error": function(oError) {
                            reject(oError);
                        }
                    });
                }
            );

        },

        queryCurrency: function(sSearch, aFilters) {

            var oDataModel = _getODataModel.apply(this);

            return new Promise(
                function resolver(resolve, reject) {
                    oDataModel.read("/CurrencyCollection", {
                        urlParameters: {
                            "search": sSearch
                        },
                        "filters": aFilters,
                        "success": function(oData) {
                            resolve(oData);
                        },
                        "error": function(oError) {
                            reject(oError);
                        }
                    });
                }
            );

        },

        queryWithholdingTaxCode: function(sSearch, aFilters) {

            var oDataModel = _getODataModel.apply(this);

            return new Promise(
                function resolver(resolve, reject) {
                    oDataModel.read("/WithholdingTaxCodeCollection", {
                        urlParameters: {
                            "search": sSearch
                        },
                        "filters": aFilters,
                        "success": function(oData) {
                            resolve(oData);
                        },
                        "error": function(oError) {
                            reject(oError);
                        }
                    });
                }
            );

        },

        queryWithholdingTaxType: function(sSearch, aFilters) {

            var oDataModel = _getODataModel.apply(this);

            return new Promise(
                function resolver(resolve, reject) {
                    oDataModel.read("/WithholdingTaxTypeCollection", {
                        urlParameters: {
                            "search": sSearch
                        },
                        "filters": aFilters,
                        "success": function(oData) {
                            resolve(oData);
                        },
                        "error": function(oError) {
                            reject(oError);
                        }
                    });
                }
            );

        },

        queryReportingRequestHeader: function(aFilters) {

            var oDataModel = _getODataModel.apply(this);

            return new Promise(
                function resolver(resolve, reject) {
                    oDataModel.read("/ReportingRequestHeaderCollection", {
                    	urlParameters: {
                            "$expand": "BatchLogs"
                        },
                        "filters": aFilters,
                        "success": function(oData) {
                            resolve(oData);
                        },
                        "error": function(oError) {
                            reject(oError);
                        }
                    });
                }
            );

        },

        queryReportingRequestItem: function(aFilters) {

            var oDataModel = _getODataModel.apply(this);

            return new Promise(
                function resolver(resolve, reject) {
                    oDataModel.read("/ReportingRequestItemCollection", {
                        "filters": aFilters,
                        "success": function(oData) {
                            resolve(oData);
                        },
                        "error": function(oError) {
                            reject(oError);
                        }
                    });
                }
            );

        },

        queryUnit: function(sSearch, aFilters) {

            var oDataModel = _getODataModel.apply(this);

            return new Promise(
                function resolver(resolve, reject) {
                    oDataModel.read("/UnitCollection", {
                        "urlParameters": {
                            "search": sSearch
                        },
                        "filters": aFilters,
                        "success": function(oData) {
                            resolve(oData);
                        },
                        "error": function(oError) {
                            reject(oError);
                        }
                    });
                }
            );

        },

        checkUploadedFileData: function(sMajorTypeCode, sAttachmentId) {

            var oDataModel = _getODataModel.apply(this),
            	sAppType = this.getAppType(),
            	sIntercoType = this.getIntercoType();

            return new Promise(
                function resolver(resolve, reject) {
                    oDataModel.callFunction("/CheckUploadedFileData", {
                        "method": "GET",
                        "urlParameters": {
                        	"IntercoType" : sIntercoType,
                        	"ApplicationType" : sAppType,
                            "MajorTypeCode": sMajorTypeCode,
                            "AttachmentFolderId": sAttachmentId,
                            "$expand": "Requests/IssuingItems,Requests/ReceivingItems,Requests/Messages,Messages"
                        },
                        "success": function(oData) {
                            resolve(oData);
                        },
                        "error": function(oError) {
                            reject(oError);
                        }
                    });
                }
            );

        },
 
        applyUploadedFileDecision : function(sUploadId, sActionId){
        	
        	var oDataModel = _getODataModel.apply(this);
        	
            return new Promise(
                function resolver(resolve, reject) {
                    oDataModel.callFunction("/ApplyUploadedFileDecision", {
                        "method": "GET",
                        "urlParameters": {
                        	"UploadId" : sUploadId,
                        	"ActionId" : sActionId,
                        },
                        "success": function(oData) {
                            resolve(oData);
                        },
                        "error": function(oError) {
                            reject(oError);
                        }
                    });
                }
            );
            
        },
        
        getUploadTemplateData: function(aFilters, sEntityPath, aSelectionFields) {

            var oDataModel = _getODataModel.apply(this),
                sUrl = '',
                sSelectFields = aSelectionFields.join(","),
                sUrlFilterParams = ODataUtils.createFilterParams(aFilters, oDataModel.oMetadata, oDataModel.oMetadata._getEntityTypeByPath(sEntityPath));

            sUrl = oDataModel.sServiceUrl + sEntityPath + "?" + sUrlFilterParams + "&$select=" + sSelectFields + "&$format=xlsx";

            return sUrl;

        },
        
        determineTaxCode: function(sMajorTypeCode, sAttachmentId) {

            var oDataModel = _getODataModel.apply(this),
            	sAppType = this.getAppType(),
            	sIntercoType = this.getIntercoType();

            return new Promise(
                function resolver(resolve, reject) {
                    oDataModel.callFunction("/CheckUploadedFileData", {
                        "method": "GET",
                        "urlParameters": {
                        	"IntercoType" : sIntercoType,
                        	"ApplicationType" : sAppType,
                            "MajorTypeCode": sMajorTypeCode,
                            "AttachmentFolderId": sAttachmentId,
                            "$expand": "Requests/IssuingItems,Requests/ReceivingItems,Requests/Messages,Messages"
                        },
                        "success": function(oData) {
                            resolve(oData);
                        },
                        "error": function(oError) {
                            reject(oError);
                        }
                    });
                }
            );

        },  

        getMasterDataDocUrl: function(oUrlParameters) {

            var oDataModel = _getODataModel.apply(this);

            return new Promise(
                function resolver(resolve, reject) {
                    oDataModel.callFunction("/MasterDataDocUrl", {
                        "method": "GET",
                        "urlParameters": oUrlParameters,
                        "success": function(oData) {
                            resolve(oData);
                        },
                        "error": function(oError) {
                            reject(oError);
                        }
                    });
                }
            );

        },    
           
    };

    return oODataService;

}, true);