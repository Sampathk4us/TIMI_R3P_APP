/************************************************************************
 * Project            : TIMI                                 			*
 * Process            : FI                                              *
 * Task code          : FI062                                           *
 * Functional document:                                					*
 * Technical document :                                    				*
 *----------------------------------------------------------------------*
 * File       		: model/attachments.js   	        				*
 * Author        	: David TEA                                         *
 * Company       	: Resp                                             	*
 * Creation Date 	: 11/10/2018                                        *
 *----------------------------------------------------------------------*
 * Description   	: Provides attachments functions   					*		
 *                                                                      *
 ************************************************************************
 * Modification nÂ°........... : 										*
 * Project ................... : 										*
 * Author .................... : 										*
 *----------------------------------------------------------------------*
 * Modification date ......... : 										*
 * Transport order ........... :										*
 * Change Request ............ :										*
 * Description ............... :										*
 ************************************************************************/
/**
 * @fileOverview Provides attachments functions
 * @author David Tea 
 * @version 1.0
 */
sap.ui.define([
    "sap/ui/unified/FileUploaderParameter",
    "sap/m/UploadCollectionParameter",
    "cus/fi/timi/rel/assets/js/helpers/utilities",
    "cus/fi/timi/rel/model/odataService",
    "cus/fi/timi/rel/model/parameters"
], function(FileUploaderParameter, UploadCollectionParameter, utilities, odataService, parameters) {
    'use strict';

    /**
     * Map attachment data from the service response to the Attachment entity properties
     * @param {string} sResponseRaw the service raw response
     * @private
     * @returns {object} the attachment entity object mapped
     */
    function _mapAttachmentData(sResponseRaw) {

        var oAttachment = odataService.createODataEntityObject(this.oDataModel, "Attachment", []),
            oXMLData = $.parseXML(sResponseRaw),
            oChildrenProperties = {},
            oChildNodesProperties = {};

        if (oXMLData.children !== undefined) {

            if ($(oXMLData).find("FolderId").text() !== "") {

                oAttachment.FolderId = $(oXMLData).find("FolderId").text();
                oAttachment.GuidId = $(oXMLData).find("GuidId").text();
                oAttachment.Description = $(oXMLData).find("Description").text();
                oAttachment.FileName = $(oXMLData).find("FileName").text();
                oAttachment.MimeType = $(oXMLData).find("MimeType").text();
                oAttachment.FileSize = parseFloat($(oXMLData).find("GuidId").text());
                oAttachment.UserCreation = $(oXMLData).find("UserCreation").text();
                oAttachment.UserCreationName = $(oXMLData).find("UserCreationName").text();
                oAttachment.TimestampCreation = new Date($(oXMLData).find("TimestampCreation").text());
                oAttachment.Mode = $(oXMLData).find("Mode").text();
                oAttachment.Url = $(oXMLData).find("id").text() + '/$value';

            } else {

                oChildrenProperties = utilities.findFirstItem(oXMLData.children[0].children, "localName", "properties");

                if (oChildrenProperties !== null) {
                    oAttachment.FolderId = utilities.findFirstItem(oChildrenProperties.children, "localName", "FolderId").textContent;
                    oAttachment.GuidId = utilities.findFirstItem(oChildrenProperties.children, "localName", "GuidId").textContent;
                    oAttachment.Description = utilities.findFirstItem(oChildrenProperties.children, "localName", "Description").textContent;
                    oAttachment.FileName = utilities.findFirstItem(oChildrenProperties.children, "localName", "FileName").textContent;
                    oAttachment.MimeType = utilities.findFirstItem(oChildrenProperties.children, "localName", "MimeType").textContent;
                    oAttachment.FileSize = parseFloat(utilities.findFirstItem(oChildrenProperties.children, "localName", "FileSize").textContent);
                    oAttachment.UserCreation = utilities.findFirstItem(oChildrenProperties.children, "localName", "UserCreation").textContent;
                    oAttachment.UserCreationName = utilities.findFirstItem(oChildrenProperties.children, "localName", "UserCreationName").textContent;
                    oAttachment.TimestampCreation = new Date(utilities.findFirstItem(oChildrenProperties.children, "localName", "TimestampCreation").textContent);
                    oAttachment.Mode = utilities.findFirstItem(oChildrenProperties.children, "localName", "Mode").textContent;
                    oAttachment.Url = utilities.findFirstItem(oXMLData.children[0].children, "localName", "id").textContent + '/$value';
                }

            }

        } else {

            oChildNodesProperties = utilities.findFirstItem(oXMLData.childNodes[0].childNodes, "localName", "properties");

            if (oChildNodesProperties !== null) {
                oAttachment.FolderId = utilities.findFirstItem(oChildNodesProperties.childNodes, "localName", "FolderId").textContent;
                oAttachment.GuidId = utilities.findFirstItem(oChildNodesProperties.childNodes, "localName", "GuidId").textContent;
                oAttachment.Description = utilities.findFirstItem(oChildNodesProperties.childNodes, "localName", "Description").textContent;
                oAttachment.FileName = utilities.findFirstItem(oChildNodesProperties.childNodes, "localName", "FileName").textContent;
                oAttachment.MimeType = utilities.findFirstItem(oChildNodesProperties.childNodes, "localName", "MimeType").textContent;
                oAttachment.FileSize = parseFloat(utilities.findFirstItem(oChildNodesProperties.childNodes, "localName", "FileSize").textContent);
                oAttachment.UserCreation = utilities.findFirstItem(oChildNodesProperties.childNodes, "localName", "UserCreation").textContent;
                oAttachment.UserCreationName = utilities.findFirstItem(oChildNodesProperties.childNodes, "localName", "UserCreationName").textContent;
                oAttachment.TimestampCreation = new Date(utilities.findFirstItem(oChildNodesProperties.childNodes, "localName", "TimestampCreation").textContent);
                oAttachment.Mode = utilities.findFirstItem(oChildNodesProperties.childNodes, "localName", "Mode").textContent;
                oAttachment.Url = utilities.findFirstItem(oXMLData.childNodes[0].childNodes, "localName", "id").textContent + '/$value';
            }

        }

        return oAttachment;

    }

    var oAttachment = {

        /**
         * Get upload url
         * @param {function} fnCallBack the callback function
         * @public
         * @returns {object} resolved promise
         */
        getUploadUrl: function() {

            // Initialize personalizer 
            var sUploadUrl = this.oDataModel.sServiceUrl + "/AttachmentCollection";
            return Promise.resolve(sUploadUrl);

        },

        /**
         * Get customer header token
         * @param {string} sControlType the control type
         * @param {function} fnCallBack the callback function
         * @public
         * @returns {object} callback function
         */
        getCustomerHeaderTokenParameter: function(sControlType, fnCallBack) {

            var oCustomerHeaderParameter = {};

            switch (sControlType) {
                case parameters.getUploadControlTypeList().FileUploader:
                    oCustomerHeaderParameter = new FileUploaderParameter({
                        name: "x-csrf-token",
                        value: this.oDataModel.getHeaders()['x-csrf-token']
                    });
                    break;
                case parameters.getUploadControlTypeList().UploadCollection:
                    oCustomerHeaderParameter = new UploadCollectionParameter({
                        name: "x-csrf-token",
                        value: this.oDataModel.getHeaders()['x-csrf-token']
                    });
                    break;
                default:
            }

            return fnCallBack(oCustomerHeaderParameter);

        },

        /**
         * Get slug parameter
         * @param {string} sControlType the control type
         * @param {string} sSlugValue the slug value
         * @param {function} fnCallBack the callback function
         * @public
         * @returns {object} callback function
         */
        getSlugParameter: function(sControlType, sSlugValue, fnCallBack) {

            var oSlugParameter = {};

            switch (sControlType) {
                case parameters.getUploadControlTypeList().FileUploader:
                    oSlugParameter = new FileUploaderParameter({
                        name: "slug",
                        value: encodeURIComponent(sSlugValue)
                    });
                    break;
                case parameters.getUploadControlTypeList().UploadCollection:
                    oSlugParameter = new UploadCollectionParameter({
                        name: "slug",
                        value: encodeURIComponent(sSlugValue)
                    });
                    break;
                default:
                    break;
            }

            return fnCallBack(oSlugParameter);

        },

        /**
         * On upload complete
         * @param {string} sControlType the control type
         * @param {eventParameter} oEvent the event parameter
         * @param {function} fnSuccess the success callback function
         * @param {function} fnError the error callback function
         * @public
         * @returns {object} promise
         */
        onUploadComplete: function(sControlType, oEvent) {

            var sResponseRaw,
                fnMapAttachmentData = _mapAttachmentData;

            switch (sControlType) {
                case parameters.getUploadControlTypeList().FileUploader:
                    if (oEvent.getParameter("status") && oEvent.getParameter("status") === 201) {
                        sResponseRaw = oEvent.getParameter("responseRaw");
                        return Promise.resolve(fnMapAttachmentData.call(this, sResponseRaw));
                    } else {
                        return Promise.reject(oEvent.getParameter("response"));
                    }
                    break;
                case parameters.getUploadControlTypeList().UploadCollection:
                    if (oEvent.getParameters().getParameter("status") && oEvent.getParameters().getParameter("status") === 201) {
                        sResponseRaw = oEvent.getParameter("files")[0].responseRaw;
                        return Promise.resolve(fnMapAttachmentData.call(this, sResponseRaw));
                    } else {
                        return Promise.reject(oEvent.getParameter("response"));
                    }
                    break;
                default:
                    return Promise.reject();
                    break;
            }

        },

        /**
         * On upload complete
         * @param {string} sControlType the control type
         * @param {eventParameter} oEvent the event parameter
         * @param {function} fnSuccess the success callback function
         * @param {function} fnError the error callback function
         * @public
         * @returns {object} promise
         */
        onFileDeleted: function(sControlType, oEvent) {

            var sDocumentId = oEvent.getParameter("documentId");

            switch (sControlType) {
                case parameters.getUploadControlTypeList().FileUploader:
                    if (sDocumentId !== undefined || sDocumentId !== "") {
                        return Promise.resolve(sDocumentId);
                    } else {
                        return Promise.reject(oEvent.getParameter("response"));
                    }
                    break;
                case parameters.getUploadControlTypeList().UploadCollection:
                    if (sDocumentId !== undefined || sDocumentId !== "") {
                        return Promise.resolve(sDocumentId);
                    } else {
                        return Promise.reject(oEvent.getParameter("response"));
                    }
                    break;
                default:
                    return Promise.reject();
                    break;
            }

        },

    };

    return oAttachment;

}, true);