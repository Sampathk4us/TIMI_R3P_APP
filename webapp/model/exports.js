/************************************************************************
 * Project            : TIMI                                 			*
 * Process            : FI                                              *
 * Task code          : FI062                                           *
 * Functional document:                                					*
 * Technical document :                                    				*
 *----------------------------------------------------------------------*
 * File       	 : model/exports.js   	        						*
 * Author        : David TEA                                            *
 * Company       : Resp                                               	*
 * Creation Date : 08/06/2016                                           *
 *----------------------------------------------------------------------*
 * Description   : Provides exports functions   						*		
 *                                                                      *
 ************************************************************************
 * Modification n° ...........	: M001									*
 * Project ...................	: TIMI									*
 * Author .................... 	: Marion Alberny                        *
 *----------------------------------------------------------------------*
 * Modification date ......... 	: 04/11/2016 							*
 * Transport order ........... 	:  										*
 * Change Request ............ 	: CR2016-273225  						*
 * Description ............... 	: Include new fields				 	*
 ************************************************************************
 * Modification n° ..........	: M002									*
 * Project ...................	: TIMI									*
 * Author .................... 	: Marion Alberny                        *
 *----------------------------------------------------------------------*
 * Modification date ......... 	: 01/02/2017 							*
 * Transport order ........... 	:  										*
 * Change Request ............ 	:   									*
 * Description ............... 	: Add export for Reporting			 	*
 *************************************************************************/
/**
 * @fileOverview Exports functions
 * @author David Tea 
 * @version 1.0
 */
sap.ui.define([
    "sap/ui/core/util/Export",
    "sap/ui/core/util/ExportTypeCSV",
	"sap/ui/export/Spreadsheet",
    "cus/fi/timi/rel/model/formatterFormat",
    "cus/fi/timi/rel/model/formatterText",
    "cus/fi/timi/rel/model/odataService"
], function(Export, ExportTypeCSV, Spreadsheet, formatterFormat, formatterText, odataService) {
    "use strict";

    var oExport = {

        /** 
         * Export requests data to CSV
         * @event 
         * @param {Object[]} aData the requests data to be extracted
         * @private
         */
        exportPostingFileCSV: function(aData) {

            var oModel = new sap.ui.model.json.JSONModel(aData);
            var sFilename = this.oBundle.getText("postingfile.filename", formatterFormat.formatDatetoSAPDateTime(new Date()))

            var oExport = new Export({
                // Type that will be used to generate the content.
                "exportType": new ExportTypeCSV({
                    "separatorChar": ";"
                }),
                // Pass in the model created above
                "models": oModel,
                "rows": {
                    "path": "/"
                },
                "columns": [{
                    name: this.oBundle.getText("export.column.title.documentreferencenumber"),
                    template: {
                        content: {
                            path: "DocumentId"
                        }
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.documentdate"),
                    template: {
                        content: {
                            path: "DocumentDate"
                        }
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.postingdate"),
                    template: {
                        content: {
                            path: "PostingDate"
                        }
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.period"),
                    template: {
                        content: {
                            path: "Period"
                        }
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.reference"),
                    template: {
                        content: {
                            path: "Reference"
                        }
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.headertext"),
                    template: {
                        content: {
                            path: "HeaderText"
                        }
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.documenttype"),
                    template: {
                        content: {
                            path: "DocumentType"
                        }
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.company"),
                    template: {
                        content: {
                            path: "Company"
                        }
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.currency"),
                    template: {
                        content: {
                            path: "Currency"
                        }
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.postingkey"),
                    template: {
                        content: {
                            path: "PostingKey"
                        }
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.account"),
                    template: {
                        content: {
                            path: "Account"
                        }
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.amountlc"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.amountdc"),
                    template: {
                        content: {
                            path: "Amount"
                        }
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.vatcode"),
                    template: {
                        content: {
                            path: "TaxCode"
                        }
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.taxcalculation"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.vatamount"),
                    template: {
                        content: {
                            path: "TaxAmount"
                        }
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.itemtext"),
                    template: {
                        content: {
                            path: "ItemText"
                        }
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.valuedate"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.duedate"),
                    template: {
                        content: {
                            path: "DueDate"
                        }
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.transactiontype"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.partnerslcompany"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.costcenter"),
                    template: {
                        content: {
                            path: "CostCenter"
                        }
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.wbs"),
                    template: {
                        content: {
                            path: "Wbs"
                        }
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.internalorder"),
                    template: {
                        content: {
                            path: "InternalOrder"
                        }
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.profitcenter"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.material"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.quantity"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.unitquantity"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.division"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.glaccountspecialindicator"),
                    template: {
                        content: {
                            path: "GLSIndicator"
                        }
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.personalnumber"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.affectationnumber"),
                    template: {
                        content: {
                            path: "Affectation"
                        }
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.reference1"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.reference2"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.reference3"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.termsofpayment"),
                    template: {
                        content: {
                            path: "PaymentTerm"
                        }
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.paymentmethod"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.paymentsblocking"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.discountdays1"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.discountpercentage1"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.discountdays2"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.discountpercentage2"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.netconditiondeadlinedate"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.discountamountdc"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.invoicenumber"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.invoicefiscalyear"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.invoiceitem"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.subjectedamountdc"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.salesordertype"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.salesorderitemtype"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.customer"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.customergroup"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.destinationcountry"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.orderreason"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.synthetickey"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.newcompanycode"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.businessarea"),
                    template: {
                        content: {
                            path: "BusinessArea"
                        }
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.fundcenter"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.withholdingtaxtype"),
                    template: {
                        content: {
                            path: "WithholdingTaxType"
                        }
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.withholdingtaxcode"),
                    template: {
                        content: {
                            path: "WithholdingTaxCode"
                        }
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.honorarybaseamountdc"),
                    template: {
                        content: {
                            path: "HonoraryAmount"
                        }
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.partnerbanktype"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.purchaseordernumber"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.purchaseorderitemnumber"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.taxreportingdate"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.determinetaxbase"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.tradingpartnerbusinessarea"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.onetimevendorname1"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.onetimevendorname2"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.onetimevendorstreet"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.onetimevendorcity"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.onetimevendorcountry"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.onetimevendorpostalcode"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.onetimevendorbankkey"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.onetimevendorbankaccount"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.onetimevendorbankcountry"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.onetimevendorcontrolkey"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.onetimevendorvatregno"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.onetimevendortaxnumber1"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.onetimevendortaxtype"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.onetimevendortaxnumber3"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.fund"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.baseamount"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.paymentreference"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.longtext"),
                    template: {
                        content: ""
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.language"),
                    template: {
                        content: {
                            path: "Language"
                        }
                    }
                }, {
                    name: this.oBundle.getText("export.column.title.correspondence"),
                    template: {
                        content: {
                            path: "Correspondence"
                        }
                    }
                }, ],
            });

            // Download exported file 
            oExport.saveFile(sFilename).always(function() {
                // Destroy control when finished
                this.destroy();
            });

        },

        /** 
         * Export reporting data to CSV
         * @event 
         * @param {Object[]} aData the reporting data to be extracted
         * @param {string} sTableId the table id
         * @private
         */
        exportReportingFileCSV: function(aData, sTableId) {

            var aColumns = [];
            var aColumnExport = [];
            var oTable = this.getView().byId(sTableId);
            var sIdCol = "";
            var sFilename = this.oBundle.getText("reporting.export.filename", formatterFormat.formatDatetoSAPDateTime(new Date()))
            var sAppType = this.getView().getModel("AppData").getProperty("/appType");
            var sIntercoType = this.getIntercoType();
            
            // Format data for output
            for (var j = 0; j < aData.length; j++) {
                // Format Status
                if (aData[j].hasOwnProperty("StatusId")) {
                    aData[j].StatusIdFormatted = formatterText.getStatusText.call(this, sIntercoType, sAppType, aData[j].StatusId);
                }
                // Format Date
                if (aData[j].hasOwnProperty("DateCreation")) {
                    aData[j].DateCreationFormatted = formatterFormat.formatDate(aData[j].DateCreation);
                }

                // Format Companies
                if (aData[j].hasOwnProperty("IsCompanyCode")) {
                    aData[j].IsCompanyCodeFormatted = formatterText.getCompanyCodeNameFromCompanyCode.call(this, aData[j].IsCompanyCode);
                }

                if (aData[j].hasOwnProperty("RcCompanyCode")) {
                    aData[j].RcCompanyCodeFormatted = formatterText.getCompanyCodeNameFromCompanyCode.call(this, aData[j].RcCompanyCode);
                }

                // Format Legal Entities
                if (aData[j].hasOwnProperty("IsLegalEntityCode")) {
                    aData[j].IsLegalEntityCodeFormatted = formatterText.getLegalEntityCodeNameFromLegalEntityCode.call(this, aData[j].IsLegalEntityCode);
                }

                if (aData[j].hasOwnProperty("RcLegalEntityCode")) {
                    aData[j].RcLegalEntityCodeFormatted = formatterText.getLegalEntityCodeNameFromLegalEntityCode.call(this, aData[j].RcLegalEntityCode);
                }

                // Format Amount (header / item)
                if (aData[j].hasOwnProperty("Amount")) {
                    aData[j].AmountFormatted = formatterFormat.formatAmountForCSV(aData[j].Amount);
                }
                if (aData[j].hasOwnProperty("TotalAmount")) {
                    aData[j].TotalAmountFormatted = formatterFormat.formatAmountForCSV(aData[j].TotalAmount);
                }

                // Format Item Type
                if (aData[j].hasOwnProperty("ItemType")) {
                    aData[j].ItemTypeFormatted = formatterText.getItemTypeText.call(this, aData[j].ItemType);
                }

                // Format Debit Credit
                if (aData[j].hasOwnProperty("DCIndicator")) {
                    aData[j].DCIndicatorFormatted = formatterText.getDCIndicatorText.call(this, aData[j].DCIndicator);
                }

                // Format Issuing Fiscal Year
                if (aData[j].hasOwnProperty("IsFiscalYear")) {
                    aData[j].IsFiscalYearFormatted = formatterText.getPostingFiscalYearText.call(this, aData[j].IsDocumentNumber, aData[j].IsFiscalYear);
                }

                // Format Receiving Fiscal Year
                if (aData[j].hasOwnProperty("RcFiscalYear")) {
                    aData[j].RcFiscalYearFormatted = formatterText.getPostingFiscalYearText.call(this, aData[j].RcDocumentNumber, aData[j].RcFiscalYear);
                }
                
                // Format Interco Type
                if (aData[j].hasOwnProperty("IntercoTypeCode")) {
                    aData[j].IntercoTypeCodeFormatted = formatterText.getIntercoTypeText.call(this, aData[j].IntercoTypeCode);
                }      

                // Format Issuing Country
                if (aData[j].hasOwnProperty("IsCountry")) {
                    aData[j].IsCountryFormatted = formatterText.getCountryNameFromCountryCode.call(this, aData[j].IsCountry);
                }   
                
                // Format Receiving Country
                if (aData[j].hasOwnProperty("RcCountry")) {
                    aData[j].RcCountryFormatted = formatterText.getCountryNameFromCountryCode.call(this, aData[j].RcCountry);
                }   
                
                // 
            }

            var oModel = new sap.ui.model.json.JSONModel(aData);

            // Prepare Export Columns
            var oExportTemplate = {
                "ReqidCol": {
                    name: this.oBundle.getText("request.table.column.request"),
                    template: {
                        content: {
                            path: "RequestId"
                        }
                    }
                },
                "StatusCol": {
                    name: this.oBundle.getText("request.table.column.status"),
                    template: {
                        content: {
                            path: 'StatusIdFormatted'
                        }
                    }
                },
                "DateCreationCol": {
                    name: this.oBundle.getText("request.table.column.datecreation"),
                    template: {
                        content: {
                            path: 'DateCreationFormatted'
                        }
                    }
                },
                "IntercoTypeCol": {
                    name: this.oBundle.getText("request.table.column.intercotype"),
                    template: {
                        content: {
                            path: 'IntercoTypeCodeFormatted'
                        }
                    }
                },
                "HeadertextCol": {
                    name: this.oBundle.getText("request.table.column.headertext"),
                    template: {
                        content: {
                            path: "HeaderText"
                        }
                    }
                },
                "IssuingCountryCol": {
                    name: this.oBundle.getText("request.table.column.issuingcountry"),
                    template: {
                        content: {
                            path: "IsCountryFormatted"
                        }
                    }
                },                
                "IssuingLegalEntityCol": {
                    name: this.oBundle.getText("request.table.column.issuinglegalentity"),
                    template: {
                        content: {
                            path: "IsLegalEntityCodeFormatted"
                        }
                    }
                },
                "IssuingCompanyCol": {
                    name: this.oBundle.getText("request.table.column.issuingcompany.long"),
                    template: {
                        content: {
                            path: "IsCompanyCodeFormatted"
                        }
                    }
                },
                "IssuingControllerCol": {
                    name: this.oBundle.getText("request.table.column.issuingcontroller.long"),
                    template: {
                        content: {
                            path: "Descriptions/IsControllerName"
                        }
                    }
                },
                "ReceivingCountryCol": {
                    name: this.oBundle.getText("request.table.column.receivingcountry"),
                    template: {
                        content: {
                            path: "RcCountryFormatted"
                        }
                    }
                },                    
                "ReceivingLegalEntityCol": {
                    name: this.oBundle.getText("request.table.column.receivinglegalentity"),
                    template: {
                        content: {
                            path: "RcLegalEntityCodeFormatted"
                        }
                    }
                },
                "ReceivingCompanyCol": {
                    name: this.oBundle.getText("request.table.column.receivingcompany.long"),
                    template: {
                        content: {
                            path: "RcCompanyCodeFormatted"
                        }
                    }
                },
                "ReceivingControllerCol": {
                    name: this.oBundle.getText("request.table.column.receivingcontroller.long"),
                    template: {
                        content: {
                            path: "Descriptions/RcControllerName"
                        }
                    }
                },
                "AmountCol": {
                    name: this.oBundle.getText("request.table.column.amount"),
                    template: {
                        content: {
                            path: "AmountFormatted"
                        }
                    }
                },
                "CurrencyCol": {
                    name: this.oBundle.getText("request.table.column.currency"),
                    template: {
                        content: {
                            path: "CurrencyCode"
                        }
                    }
                },
                "IssuingPostingDocCol": {
                    name: this.oBundle.getText("request.table.column.issuingdocumentnumber"),
                    template: {
                        content: {
                            path: "IsDocumentNumber"
                        }
                    }
                },
                "IssuingFiscalYearCol": {
                    name: this.oBundle.getText("request.table.column.issuingfiscalyear"),
                    template: {
                        content: {
                            path: "IsFiscalYearFormatted"
                        }
                    }
                },
                "ReceivingPostingDocCol": {
                    name: this.oBundle.getText("request.table.column.receivingdocumentnumber"),
                    template: {
                        content: {
                            path: "RcDocumentNumber"
                        }
                    }
                },
                "ReceivingFiscalYearCol": {
                    name: this.oBundle.getText("request.table.column.receivingfiscalyear"),
                    template: {
                        content: {
                            path: "RcFiscalYearFormatted"
                        }
                    }
                },
                "ItmReqidCol": {
                    name: this.oBundle.getText("request.table.column.request"),
                    template: {
                        content: {
                            path: "RequestId"
                        }
                    }
                },
                "ItmStatusCol": {
                    name: this.oBundle.getText("request.table.column.status"),
                    template: {
                        content: {
                            path: "StatusIdFormatted"
                        }
                    }
                },
                "ItmIssuingReceivingCol": {
                    name: this.oBundle.getText("request.table.column.itemtype"),
                    template: {
                        content: {
                            path: "ItemTypeFormatted"
                        }
                    }
                },
                "ItmDebitCreditCol": {
                    name: this.oBundle.getText("request.table.column.debitcredit"),
                    template: {
                        content: {
                            path: "DCIndicatorFormatted"
                        }
                    }
                },
                "ItmItemtextCol": {
                    name: this.oBundle.getText("request.table.column.itemtext"),
                    template: {
                        content: {
                            path: "ItemText"
                        }
                    }
                },
                "ItmGlAccountCol": {
                    name: this.oBundle.getText("request.table.column.glaccount"),
                    template: {
                        content: {
                            path: "GLAccount"
                        }
                    }
                },
                "ItmLCOACol": {
                    name: this.oBundle.getText("request.table.column.lcoaaccount"),
                    template: {
                        content: {
                            path: "LCOAAccount"
                        }
                    }
                },
                "ItmAmountCol": {
                    name: this.oBundle.getText("request.table.column.totalamount"),
                    template: {
                        content: {
                            path: "TotalAmountFormatted"
                        }
                    }
                },
                "ItmCurrencyCol": {
                    name: this.oBundle.getText("request.table.column.currency"),
                    template: {
                        content: {
                            path: "CurrencyCode"
                        }
                    }
                },
            };

            // Get Export Columns only for Visible Columns
            aColumns = oTable.getColumns();
            for (var i = 0; i < aColumns.length; i++) {
                // Retrieve Column
                if (aColumns[i].getVisible()) {
                    // For each visible Column					
                    sIdCol = aColumns[i].getId().split("-").pop();
                    // -- Append column and template to column list		
                    aColumnExport.push(oExportTemplate[sIdCol]);
                }
            }
            // If there is at least one Column

            var oExport = new Export({
                // Type that will be used to generate the content.
                "exportType": new ExportTypeCSV({
                    "separatorChar": ";"
                }),
                // Pass in the model created above
                "models": oModel,
                "rows": {
                    "path": "/"
                },
                "columns": aColumnExport
            });

            // Download exported file 
            oExport.saveFile(sFilename).always(function() {
                // Destroy control when finished
                this.destroy();
            });

        },
        
        /** 
         * Export reporting data to XLSX
         * @event 
         * @param {Object[]} aData the reporting data to be extracted
         * @param {string} sTableId the table id
         * @private
         */
        exportReportingFileXLSX: function(aData, sTableId) {

            var aColumns = [];
            var aColumnExport = [];
            var oTable = this.getView().byId(sTableId);
            var sIdCol = "";
            var sFilename = this.oBundle.getText("reporting.export.filename", formatterFormat.formatDatetoSAPDateTime(new Date()))
            var sAppType = this.getView().getModel("AppData").getProperty("/appType");
            var sIntercoType = this.getIntercoType();
            
            // Format data for output
            for (var j = 0; j < aData.length; j++) {
                // Format Status
                if (aData[j].hasOwnProperty("StatusId")) {
                    aData[j].StatusIdFormatted = formatterText.getStatusText.call(this, sIntercoType, sAppType, aData[j].StatusId);
                }
                // Format Date
                if (aData[j].hasOwnProperty("DateCreation")) {
                    aData[j].DateCreationFormatted = formatterFormat.formatDate(aData[j].DateCreation);
                }

                // Format Companies
                if (aData[j].hasOwnProperty("IsCompanyCode")) {
                    aData[j].IsCompanyCodeFormatted = formatterText.getCompanyCodeNameFromCompanyCode.call(this, aData[j].IsCompanyCode);
                }

                if (aData[j].hasOwnProperty("RcCompanyCode")) {
                    aData[j].RcCompanyCodeFormatted = formatterText.getCompanyCodeNameFromCompanyCode.call(this, aData[j].RcCompanyCode);
                }

                // Format Legal Entities
                if (aData[j].hasOwnProperty("IsLegalEntityCode")) {
                    aData[j].IsLegalEntityCodeFormatted = formatterText.getLegalEntityCodeNameFromLegalEntityCode.call(this, aData[j].IsLegalEntityCode);
                }

                if (aData[j].hasOwnProperty("RcLegalEntityCode")) {
                    aData[j].RcLegalEntityCodeFormatted = formatterText.getLegalEntityCodeNameFromLegalEntityCode.call(this, aData[j].RcLegalEntityCode);
                }

                // Format Amount (header / item)
                if (aData[j].hasOwnProperty("Amount")) {
                    aData[j].AmountFormatted = formatterFormat.formatAmountForCSV(aData[j].Amount);
                }
                if (aData[j].hasOwnProperty("TotalAmount")) {
                    aData[j].TotalAmountFormatted = formatterFormat.formatAmountForCSV(aData[j].TotalAmount);
                }

                // Format Item Type
                if (aData[j].hasOwnProperty("ItemType")) {
                    aData[j].ItemTypeFormatted = formatterText.getItemTypeText.call(this, aData[j].ItemType);
                }

                // Format Debit Credit
                if (aData[j].hasOwnProperty("DCIndicator")) {
                    aData[j].DCIndicatorFormatted = formatterText.getDCIndicatorText.call(this, aData[j].DCIndicator);
                }

                // Format Issuing Fiscal Year
                if (aData[j].hasOwnProperty("IsFiscalYear")) {
                    aData[j].IsFiscalYearFormatted = formatterText.getPostingFiscalYearText.call(this, aData[j].IsDocumentNumber, aData[j].IsFiscalYear);
                }

                // Format Receiving Fiscal Year
                if (aData[j].hasOwnProperty("RcFiscalYear")) {
                    aData[j].RcFiscalYearFormatted = formatterText.getPostingFiscalYearText.call(this, aData[j].RcDocumentNumber, aData[j].RcFiscalYear);
                }
                
                // Format Interco Type
                if (aData[j].hasOwnProperty("IntercoTypeCode")) {
                    aData[j].IntercoTypeCodeFormatted = formatterText.getIntercoTypeText.call(this, aData[j].IntercoTypeCode);
                }      

                // Format Issuing Country
                if (aData[j].hasOwnProperty("IsCountry")) {
                    aData[j].IsCountryFormatted = formatterText.getCountryNameFromCountryCode.call(this, aData[j].IsCountry);
                }   
                
                // Format Receiving Country
                if (aData[j].hasOwnProperty("RcCountry")) {
                    aData[j].RcCountryFormatted = formatterText.getCountryNameFromCountryCode.call(this, aData[j].RcCountry);
                }                  
            }

            // Prepare Export Columns
            var oExportTemplate = {
                "ReqidCol": {
                	label: this.oBundle.getText("request.table.column.request"),
                	property: "RequestId",
					type: "string",
					width: "10"
                },
                "StatusCol": {
                	label: this.oBundle.getText("request.table.column.status"),
                	property: "StatusIdFormatted",
					type: "string",
					width: "10"
                },
                "DateCreationCol": {
                    label: this.oBundle.getText("request.table.column.datecreation"),
                    property: "DateCreationFormatted",
					type: "string",
					width: "10"
                },
                "HeadertextCol": {
                    label: this.oBundle.getText("request.table.column.headertext"),
                    property: "HeaderText",
					type: "string",
					width: "10"
                },
                "IssuingCountryCol": {
                    label: this.oBundle.getText("request.table.column.issuingcountry"),
                    property: "IsCountryFormatted",
					type: "string",
					width: "10"
                },                
                "IssuingLegalEntityCol": {
                    label: this.oBundle.getText("request.table.column.issuinglegalentity"),
                    property: "IsLegalEntityCodeFormatted",
					type: "string",
					width: "10"
                },
                "IssuingCompanyCol": {
                    label: this.oBundle.getText("request.table.column.issuingcompany.long"),
                    property: "IsCompanyCodeFormatted",
					type: "string",
					width: "10"
                },
                "IssuingControllerCol": {
                    label: this.oBundle.getText("request.table.column.issuingcontroller.long"),
                    property: "IsControllerName",
					type: "string",
					width: "20"
                },
                "ReceivingCountryCol": {
                    label: this.oBundle.getText("request.table.column.receivingcountry"),
                    property: "RcCountryFormatted",
					type: "string",
					width: "10"
                },                    
                "ReceivingLegalEntityCol": {
                    label: this.oBundle.getText("request.table.column.receivinglegalentity"),
                    property: "RcLegalEntityCodeFormatted",
					type: "string",
					width: "10"
                },
                "ReceivingCompanyCol": {
                    label: this.oBundle.getText("request.table.column.receivingcompany.long"),
                    property: "RcCompanyCodeFormatted",
					type: "string",
					width: "10"
                },
                "ReceivingControllerCol": {
                    label: this.oBundle.getText("request.table.column.receivingcontroller.long"),
                    property: "RcControllerName",
					type: "string",
					width: "20"
                },
                "AmountCol": {
                    label: this.oBundle.getText("request.table.column.amount"),
                    property: "AmountFormatted",
					type: "string",
					width: "10"
                },
                "CurrencyCol": {
                    label: this.oBundle.getText("request.table.column.currency"),
                    property: "CurrencyCode",
					type: "string",
					width: "10"
                },
                "IssuingPostingDocCol": {
                    label: this.oBundle.getText("request.table.column.issuingdocumentnumber"),
                    property: "IsDocumentNumber",
					type: "string",
					width: "10"
                },
                "IssuingFiscalYearCol": {
                    label: this.oBundle.getText("request.table.column.issuingfiscalyear"),
                    property: "IsFiscalYearFormatted",
					type: "string",
					width: "10"
                },
                "ReceivingPostingDocCol": {
                    label: this.oBundle.getText("request.table.column.receivingdocumentnumber"),
                    property: "RcDocumentNumber",
					type: "string",
					width: "10"
                },
                "ReceivingFiscalYearCol": {
                    label: this.oBundle.getText("request.table.column.receivingfiscalyear"),
                    property: "RcFiscalYearFormatted",
					type: "string",
					width: "10"
                },
                "ItmReqidCol": {
                    label: this.oBundle.getText("request.table.column.request"),
                    property: "RequestId",
					type: "string",
					width: "10"
                },
                "ItmStatusCol": {
                    label: this.oBundle.getText("request.table.column.status"),
                    property: "StatusIdFormatted",
					type: "string",
					width: "10"
                },
                "ItmIssuingReceivingCol": {
                    label: this.oBundle.getText("request.table.column.itemtype"),
                    property: "ItemTypeFormatted",
					type: "string",
					width: "10"
                },
                "ItmDebitCreditCol": {
                    label: this.oBundle.getText("request.table.column.debitcredit"),
                    property: "DCIndicatorFormatted",
					type: "string",
					width: "10"
                },
                "ItmItemtextCol": {
                    label: this.oBundle.getText("request.table.column.itemtext"),
                    property: "ItemText",
					type: "string",
					width: "10"
                },
                "ItmGlAccountCol": {
                    label: this.oBundle.getText("request.table.column.glaccount"),
                    property: "GLAccount",
					type: "string",
					width: "10"
                },
                "ItmLCOACol": {
                    label: this.oBundle.getText("request.table.column.lcoaaccount"),
                    property: "LCOAAccount",
					type: "string",
					width: "10"
                },
                "ItmAmountCol": {
                    label: this.oBundle.getText("request.table.column.totalamount"),
                    property: "TotalAmountFormatted",
					type: "string",
					width: "10"
                },
                "ItmCurrencyCol": {
                    label: this.oBundle.getText("request.table.column.currency"),
                    property: "CurrencyCode",
					type: "string",
					width: "10"
                },
            };

            // Get Export Columns only for Visible Columns
            if(sTableId === "tReportingRequestHeader"){
                aColumns = oTable.getColumns();
                for (var i = 0; i < aColumns.length; i++) {
                    // Retrieve Column
                    if (aColumns[i].getVisible()) {
                        // For each visible Column					
                        sIdCol = aColumns[i].getId().split("-").pop();
                        // -- Append column and template to column list		
                        if(!!oExportTemplate[sIdCol]){			
                            aColumnExport.push(oExportTemplate[sIdCol]);
                        }
                    }
                }
            }else{
                var aIDItemsColumns = [
                    "ReqidCol",
                    "StatusCol",
                    "DateCreationCol",
                    "HeadertextCol",
                    "IssuingCountryCol",                
                    "IssuingLegalEntityCol",
                    "IssuingCompanyCol",
                    "IssuingControllerCol",
                    "ReceivingCountryCol",                    
                    "ReceivingLegalEntityCol",
                    "ReceivingCompanyCol",
                    "ReceivingControllerCol",
                    "AmountCol",
                    "CurrencyCol",
                    "IssuingPostingDocCol",
                    "IssuingFiscalYearCol",
                    "ReceivingPostingDocCol",
                    "ReceivingFiscalYearCol",
                    "ItmReqidCol",
                    "ItmStatusCol",
                    "ItmIssuingReceivingCol",
                    "ItmDebitCreditCol",
                    "ItmItemtextCol",
                    "ItmGlAccountCol",
                    "ItmLCOACol",
                    "ItmAmountCol",
                    "ItmCurrencyCol"
                ]; 
                aIDItemsColumns.forEach(function(sIdCol){
                    if(!!oExportTemplate[sIdCol]){			
                        aColumnExport.push(oExportTemplate[sIdCol]);
                    }
                });
            }


			var oSettings = {
				workbook: { 
					columns: aColumnExport
				},
				dataSource: aData,
				fileName : sFilename
			};

			new Spreadsheet(oSettings)
				.build()
				.then( function() {
					sap.m.MessageToast.show("Spreadsheet export has finished");
				});
            
        },        
        
        /** 
         * Export importation data to CSV
         * @event 
         * @param {string} sDocumentType the document type
         * @param {Object[]} aData the data to be extracted
         * @public
         */
        exportUploadTemplateData: function(aData) {
			
            var oModel = {},
                sFilename, oExport = {},
                aColumns = [],
                i = 0,
                iCount = aData.length,
                aHeader = [],
                iCountHeader, j = 0,
                aLineContent = [],
                aContent = [],
                oContent = {};


            sFilename = this.oBundle.getText("text.uploadfilecreation.template.major", formatterFormat.formatDatetoSAPDateTime(new Date()));

            // Build Header & Content to fit export column template
            for (i = 0; i < iCount; i++) {
                if (i === 0) {
                    //Header Line
                    aHeader = aData[i]["Data"].split(";");
                    iCountHeader = aHeader.length;
                } else {
                    //Content Line
                    oContent = {};
                    aLineContent = aData[i]["Data"].split(";");

                    for (j = 0; j < iCountHeader; j++) {
                        oContent[aHeader[j]] = aLineContent[j];
                    }
                    aContent.push(oContent);
                }
            }

            oModel = new sap.ui.model.json.JSONModel(aContent);
            // Build Export Columns 
            for (j = 0; j < iCountHeader; j++) {
                aColumns.push({
                    name: aHeader[j],
                    template: {
                        content: {
                            path: aHeader[j]
                        }
                    }
                })
            }

            oExport = new Export({
                // Type that will be used to generate the content.
                "exportType": new ExportTypeCSV({
                	fileExtension: "xls",
                    separatorChar: "\t",
                    charset: "utf-8",
                    mimeType: "application/vnd.ms-excel"
//                    "separatorChar": ";",
//                    "charset": "UTF8"
                }),
                // Pass in the model created above
                "models": oModel,
                "rows": {
                    "path": "/"
                },
                "columns": aColumns
            });

            // Download exported file 
            oExport.saveFile(sFilename).always(function() {
                // Destroy control when finished
                this.destroy();
            });

        },

    };

    return oExport;

}, true);