sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/base/Log",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/routing/History",
    "sap/ui/core/UIComponent",
    "com/luxasia/salesorder/util/formatter"
], function (Controller, JSONModel, MessageBox, Log, Filter, FilterOperator,History,UIComponent,formatter) {
    "use strict";
 
    return Controller.extend("luxasia.controller.purchasedata", {
        formatter: formatter,
        onInit: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
 
            oRouter.getRoute("purchasedata").attachMatched(this._onRouteMatched, this);
            var oEditableModel = new JSONModel({
                editable: false
            });
            this.getView().setModel(oEditableModel, "editmode");
 
            var oStoreModel = this.getOwnerComponent().getModel("StoreModel");
            this.sStoreId = oStoreModel.getProperty("/selectedStoreId");
 
            var oPoModel = new JSONModel();
            this.getView().setModel(oPoModel, "poModel");
 
            var oFiltersModel = new JSONModel({
                filters: {
                    poNumber: "",
                    startDate: null,
                    endDate: null
                },
                goButtonVisible: false
            });
            this.getView().setModel(oFiltersModel, "poModelFilters");
 
            var oSelectedPurchaseOrderModel = new sap.ui.model.json.JSONModel();
            this.getView().setModel(oSelectedPurchaseOrderModel, "selectedPurchaseOrder");
 
            var oPurchaseOrderDetailsModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZSDGW_CE_APP_SRV/");
            this.getView().setModel(oPurchaseOrderDetailsModel, "purchaseOrderDetails");
        },
 
        _onRouteMatched: function (oEvent) {
            var oArgs = oEvent.getParameter("arguments");
            var SelectedPurchaseorder = this.getView().getModel("purchaseOrderDetails");
            SelectedPurchaseorder.setData({ modelData: {} });
            SelectedPurchaseorder.updateBindings(true);
            this.onAfterRendering();
        },
        onAfterRendering: function () {
            var oStoreModel = this.getOwnerComponent().getModel("StoreModel");
            this.sStoreId = oStoreModel.getProperty("/selectedStoreId");
            var plant = new sap.ui.model.Filter("StoreId", "EQ", this.sStoreId);
            this.handlePurchaseData(plant);
            console.log(this.sStoreId);
             
        },
 
        handlePurchaseData: function (filter1) {
            var oList = this.getView().byId("purchaseOrderList");
            var filters = filter1 ? [filter1] : [];
            oList.getBinding("items").filter(filters);
        },
        getRouter: function () {
            return UIComponent.getRouterFor(this);
        },
 
        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();
 
            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getRouter().navTo("mainmenu", {}, true);
            }
        },
      
        onListItemPress: function (oEvent) {
          
            var oSelectedItem = oEvent.getParameter("listItem");
       
            if (oSelectedItem) {
                var oBindingContext = oSelectedItem.getBindingContext("mainModel");
       
                if (oBindingContext) {
                    var oPurchaseOrder = oBindingContext.getObject();
                    var sPoNumber = oPurchaseOrder.PoNumber;
       
                    console.log("Selected Purchase Order Object: ", oPurchaseOrder);
       
                    if (sPoNumber) {
                        this._selectedPurchaseOrder = oPurchaseOrder;
                       
                        var oSelectedPurchaseOrderModel = this.getView().getModel("selectedPurchaseOrder");
       
                        this.loadPurchaseOrderDetails(sPoNumber, function (selectedPoNumber) {
                            if (selectedPoNumber) {
                             
                                var oDetailPage = this.getView().byId("detail");
                                oDetailPage.setTitle("Details of: " + selectedPoNumber);
                            } else {
                                console.error("Failed to load Purchase Order details.");
                            }
                        }.bind(this));
                    } else {
                        console.error("Purchase Order number is undefined");
                    }
                } else {
                    console.error("Binding context is undefined");
                }
            } else {
                console.error("Selected item is undefined");
            }
           
        },
     
        loadPurchaseOrderDetails: function (sPoNumber, callback) {
            var sServiceUrl = "/583e70a0-3890-46a1-a850-6b12595b3c78.SalesUI.comluxasiasalesorder/~141223081936+0000~/sap/opu/odata/sap/ZSDGW_CE_APP_SRV";
            var sDetailsUrl = sServiceUrl + "/PurchaseItemSet?$filter=PoNumber eq '" + sPoNumber + "'";
            var oSelectedPurchaseOrderModel = this.getView().getModel("selectedPurchaseOrder");
       
            var that = this;
       
            oSelectedPurchaseOrderModel.loadData(sDetailsUrl, null, true, "GET");
       
            oSelectedPurchaseOrderModel.attachRequestCompleted(function () {
                var oData = oSelectedPurchaseOrderModel.getData();
                console.log("Purchase Order Details Data: ", oData);
       
                var aResults = oData.d.results;
                var oModel = new sap.ui.model.json.JSONModel();
                oModel.setData(aResults);
                that.getView().setModel(oModel, "purchaseOrderDetails");
       
                if (callback && typeof callback === "function") {
                    callback(sPoNumber);
                }
            });
       
            oSelectedPurchaseOrderModel.attachRequestFailed(function (oError) {
                console.error("Error loading Purchase Order Details: ", oError);
       
                if (callback && typeof callback === "function") {
                    callback(null);  
                }
            });
        },
       
        // handleEditPress: function () {
        //     var oList = this.byId("detailitem");
        //     var aItems = oList.getItems();
        //     var oModel = this.getView().getModel("purchaseOrderDetails");
        //     var oEditableModel = this.getView().getModel("editmode");
           
         
        //     if (aItems.length > 0) {
             
        //         var allowEdit = aItems.every(function (oItem) {
        //             var sPath = oItem.getBindingContext("purchaseOrderDetails").getPath();
        //             var oSelectedPurchaseItem = oModel.getProperty(sPath);
       
                 
        //             return oSelectedPurchaseItem.DlvStatus === false;
        //         });
       
        //         if (allowEdit) {
                   
        //             aItems.forEach(function (oItem) {
        //                 var sPath = oItem.getBindingContext("purchaseOrderDetails").getPath();
        //                 oModel.setProperty(sPath + "/isItemEditing", true);
        //                 this.updateItemEditability(oItem, true);
        //             }, this);
       
        //             oEditableModel.setProperty("/editable", true);
       
        //             this.byId("edit").setVisible(false);
        //             this.byId("gr").setVisible(false);
        //             this.byId("save").setVisible(true);
        //             this.byId("cancel").setVisible(true);
        //         } else {
        //             MessageBox.error("Goods receipt is done. Editing not allowed.");
        //         }
        //     }
        // },
        handleEditPress: function () {
            var oList = this.byId("detailitem");
            var aItems = oList.getItems();
            var oModel = this.getView().getModel("purchaseOrderDetails");
            var oEditableModel = this.getView().getModel("editmode");
       
            if (aItems.length > 0) {
                var allowEdit = aItems.every(function (oItem) {
                    var sPath = oItem.getBindingContext("purchaseOrderDetails").getPath();
                    var oSelectedPurchaseItem = oModel.getProperty(sPath);
       
                    return oSelectedPurchaseItem.DlvStatus === false;
                });
       
                if (allowEdit) {
                    aItems.forEach(function (oItem) {
                        var sPath = oItem.getBindingContext("purchaseOrderDetails").getPath();
                        oModel.setProperty(sPath + "/isItemEditing", true);
                        this.updateItemEditability(oItem, true);
                    }, this);
       
                    oEditableModel.setProperty("/editable", true);
       
                    this.byId("edit").setVisible(false);
                    // this.byId("gr").setVisible(false);
                    this.byId("save").setVisible(true);
                    this.byId("cancel").setVisible(true);
                } else {
                    MessageBox.error("Goods receipt is done. Editing not allowed.");
                }
            }
        },
       
       
       
     updateItemEditability: function (oItem, bEditable) {
       
        },
       
       
        handleCancelPress: function () {
            var oList = this.byId("detailitem");
            var oModel = this.getView().getModel("purchaseOrderDetails");
            var oEditableModel = this.getView().getModel("editmode");
       
            var sSelectedPath = oList.getItems()[0].getBindingContext("purchaseOrderDetails").getPath();
            oModel.setProperty(sSelectedPath + "/isItemEditing", false);
            this.updateItemEditability(oList.getItems(), false);
       
            var oOriginalData = oList.getItems()[0].getBindingContext("purchaseOrderDetails").getObject();
            oModel.setProperty(sSelectedPath, oOriginalData);
       
            oEditableModel.setProperty("/editable", false);
            this.updateButtonsVisibility(true);
            console.log("Edit mode canceled");
        },
       
        handleSavePress: function () {
            var oStoreModel = this.getOwnerComponent().getModel("StoreModel");
            this.sStoreId = oStoreModel.getProperty("/selectedStoreId");
            var oModel = this.getView().getModel("purchaseOrderDetails");
            var oTable = this.getView().byId("detailitem");
            var aItems = oTable.getItems();
            var aUpdatedItems = [];
       
            aItems.forEach(function (oItem) {
                var oBindingContext = oItem.getBindingContext("purchaseOrderDetails");
                var sPath = oBindingContext.getPath();
                var oUpdatedItem = oModel.getProperty(sPath);
               
                // Assuming the cell at index 3 contains a Text control
                // var sQuantity = oItem.getCells()[2].getValue();
 
                var oPayloadItem = {
                    "PoNumber": this._selectedPurchaseOrder.PoNumber,
                    "PoItem": oUpdatedItem.PoItem,
                    "Material": oUpdatedItem.Material,
                    "Plant": this.sStoreId,
                    // "Quantity": sQuantity.toString(),
                    "Quantity":oUpdatedItem.Quantity.toString(),
                    "PoUnit": oUpdatedItem.PoUnit
                };
       
                aUpdatedItems.push(oPayloadItem);
            }, this);
            if (this._selectedPurchaseOrder.PoNumber) {
                var oPayload = {
                    PoNumber: this._selectedPurchaseOrder.PoNumber,
                    Action: "UPDATE",
                    to_po_items: aUpdatedItems
                };
       
                this._updateBackend(oPayload, oModel);
            } else {
                console.error("Purchase Order number is undefined");
            }
       
            // Add the following code after the backend update logic
            this.exitEditMode();
            this.updateButtonsVisibility(true);
        },
       
        _updateBackend: function (oPayload, oModel) {
            var sEntitySet = "PurchaseHeadSet";
            var sUrl = "/" + sEntitySet;
       
            var oOwnerComponent = this.getOwnerComponent();
            var oMainModel = oOwnerComponent.getModel("mainModel");
       
            oMainModel.create(sUrl, oPayload, {
                success: function (response) {
                 
                    var poNumber = response.PoNumber;
                    MessageBox.success("Quantity updated successfully for PO " + poNumber, {
                        onClose: function () {
                            // Refresh the table after a successful update
                            oModel.refresh(true);
       
                            // Exit edit mode
                            this.exitEditMode();
       
                            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                            oRouter.navTo("storeselection");
                        }.bind(this)
                    });
                }.bind(this),
                error: function (oError) {
                    MessageBox.error("Error updating data: " + oError.message);
                },
                refreshAfterChange: true
            });
        },
       
        updateButtonsVisibility: function (bVisible) {
            this.byId("edit").setVisible(bVisible);
            this.byId("gr").setVisible(bVisible);
            this.byId("save").setVisible(!bVisible);
            this.byId("cancel").setVisible(!bVisible);
        },
       
        exitEditMode: function () {
            var oEditableModel = this.getView().getModel("editmode");
            oEditableModel.setProperty("/editable", false);
        },
       
           
        getSplitContObj: function () {
            var result = this.byId("SplitContDemo");
            if (!result) {
                Log.error("SplitApp object can't be found");
            }
            return result;
        },
 
        onPressDetailBack: function () {
            this.updateButtonsVisibility(true);
            this.getSplitContObj().backDetail();
        },
        onShowFilters: function () {
            var oFiltersModel = this.getView().getModel("poModelFilters");
            oFiltersModel.setProperty("/filters/poNumber", "");
            oFiltersModel.setProperty("/filters/startDate", null);
            oFiltersModel.setProperty("/filters/endDate", null);
 
            var oFiltersContainer = this.getView().byId("filtersContainer");
            oFiltersContainer.setVisible(!oFiltersContainer.getVisible());
        },
        onPressMasterBack: function () {
            this.updateButtonsVisibility(true);
            this.getSplitContObj().backMaster();
        },
 
        
       
        onGoButtonPress: function (evt) {
            var filter1 = new sap.ui.model.Filter("StoreId", "EQ", this.sStoreId);
            var beginDate = this.getView().byId("startDatePicker").getValue();
            var endDate = this.getView().byId("endDatePicker").getValue();
            var poNumber = this.getView().byId("poNumberInput").getValue();
       
            if (beginDate.length > 0 && endDate.length > 0) {
                var formattedBeginDate = new Date(new Date(beginDate).toString().split("GMT ")[0] + " UTC ").toISOString();
                var formattedEndDate = new Date(new Date(endDate).toString().split("GMT ")[0] + " UTC ").toISOString();
                var filter2 = new sap.ui.model.Filter("DocDate", "BT", formattedBeginDate, formattedEndDate);
            } else if (poNumber.length > 0) {
               
                var filter2 = new sap.ui.model.Filter("PoNumber", "EQ", poNumber);
            } else if (beginDate.length == 0) {
                sap.m.MessageToast.show("Please enter the Begin date");
                return;
            } else if (endDate.length == 0) {
                sap.m.MessageToast.show("Please enter the End date");
                return;
            }
       
            var filters = new sap.ui.model.Filter([filter2, filter1].filter(Boolean), true);
            this.getView().byId("purchaseOrderList").getBinding("items").filter(filters);
        },
       
        onCreatePOPress: function() {
             var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
             oRouter.navTo("stockorder");
        },
        dateFormatter: function (date) {
            var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
                pattern: "yyyy/MM/dd",
                UTC: true
            });
            return oDateFormat.format(new Date(date));
        },
       
        onCreateGRPress: function () {
            if (this._selectedPurchaseOrder) {
                var docType = this._selectedPurchaseOrder.DocType;
                var dlvStatus = this._selectedPurchaseOrder.DlvStatus;
       
                // if the DocType is ZDSP
                // if (docType === "ZDSP") {
                //     MessageBox.error("Cannot create Goods Receipt for ZDSP orders.");
                //     return;
                // }
                if (docType === "ZDSP") {
                    if (dlvStatus) {
                        MessageBox.error("Goods Receipt already created for this purchase order");
                    } else {
                        this.openSalesOrderInputDialog();
                    }
                    return;
                }
       
                // if DlvStatus is true
                if (dlvStatus) {
                    MessageBox.error("Goods Receipt already created for this purchase order");
                    return;
                }
       
                var oModel = this.getView().getModel("purchaseOrderDetails");
                var aItems = oModel.getData();
                var aUpdatedItems = [];
       
                aItems.forEach(function (oItem) {
                    var oPayloadItem = {
                        "PoNumber": this._selectedPurchaseOrder.PoNumber,
                        "PoItem": oItem.PoItem,
                        "Material": oItem.Material,
                        "Plant": this.sStoreId,
                        "Quantity": oItem.Quantity.toString(),
                        "PoUnit": oItem.PoUnit
                    };
       
                    aUpdatedItems.push(oPayloadItem);
                }, this);
       
                if (this._selectedPurchaseOrder.PoNumber) {
                    var oPayload = {
                        PoNumber: this._selectedPurchaseOrder.PoNumber,
                        Action: "GR-MIGO",
                        to_po_items: aUpdatedItems
                    };
       
                    this.updatePurchaseOrder(oPayload, oModel);
                } else {
                    console.error("Purchase Order number is undefined");
                }
            } else {
                console.error("No selected purchase order.");
            }
        },
        openSalesOrderInputDialog: function () {
            var that = this;
       
            // Generate a unique suffix for the input field ID
            var uniqueSuffix = new Date().getTime();
            // Combine the view ID with the unique suffix
            var inputId = this.getView().getId() + "--salesOrderInput-" + uniqueSuffix;
       
            var salesOrderInputDialog = new sap.m.Dialog({
                title: "Enter Sales Order Number",
                content: [
                    new sap.m.Input(inputId, {
                        placeholder: "Enter Sales Order Number"
                    })
                ],
                beginButton: new sap.m.Button({
                    text: "OK",
                    press: function () {
                        var salesOrderNumber = sap.ui.getCore().byId(inputId).getValue();
                        salesOrderInputDialog.close();
                        that.createGoodsReceiptForZDSP(salesOrderNumber);
                    }
                }),
                endButton: new sap.m.Button({
                    text: "Cancel",
                    press: function () {
                        salesOrderInputDialog.close();
                    }
                })
            });
       
            salesOrderInputDialog.open();
        },
       
       
        createGoodsReceiptForZDSP: function (salesOrderNumber) {
            if (this._selectedPurchaseOrder.DlvStatus) {
                MessageBox.error("Goods Receipt already created for this purchase order");
                return;
            }
       
            var oModel = this.getView().getModel("purchaseOrderDetails");
            var zItems = oModel.getData();
            var zUpdatedItems = [];
       
            zItems.forEach(function (oItem) {
                var oPayloadItem = {
                    "PoNumber": this._selectedPurchaseOrder.PoNumber,
                    "PoItem": oItem.PoItem,
                    "Material": oItem.Material,
                    "Plant": this.sStoreId,
                    "Quantity": oItem.Quantity.toString(),
                    "PoUnit": oItem.PoUnit
                };
       
                zUpdatedItems.push(oPayloadItem);
            }, this);
       
            if (this._selectedPurchaseOrder.PoNumber) {
                var oPayload = {
                    PoNumber: this._selectedPurchaseOrder.PoNumber,
                    SalesOrderNo: salesOrderNumber,
                    Action: "GR-AUTO",
                    to_po_items: zUpdatedItems
                };
       
                this.updatePurchaseOrder(oPayload, oModel);
            } else {
                console.error("Purchase Order number is undefined");
            }
        },
       
       
        updatePurchaseOrder: function (oPayload, oModel) {
            var sEntitySet = "PurchaseHeadSet";
            var sUrl = "/" + sEntitySet;
       
            var oOwnerComponent = this.getOwnerComponent();
            var oMainModel = oOwnerComponent.getModel("mainModel");
       
            oMainModel.create(sUrl, oPayload, {
                success: function (response) {
                    var poNumber = response.PoNumber;
                    MessageBox.success("Goods Receipt created successfully for PO " + poNumber, {
                        onClose: function () {
                            // Set DlvStatus to false in the model
                            this._selectedPurchaseOrder.DlvStatus = true;
               
                            // Refresh the table after a successful update
                            if (oModel) {
                                oModel.refresh(true);
                            }
               
                            // Exit edit mode
                            this.exitEditMode();
               
                            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                            oRouter.navTo("storeselection");
                        }.bind(this)
                    });
                }.bind(this),
               
                error: function (error) {
                    var errorDetails = error.responseText ? JSON.parse(error.responseText).error.innererror.errordetails : [];
                    var errorMessage = "An error occurred. Details:\n";
                    errorDetails.forEach(function (detail) {
                      errorMessage += "- " + detail.message + "\n";
                    });
                    // Show the error message in a message box or dialog
                    sap.m.MessageBox.error(errorMessage, {
                      title: "Error"
                    });
                  }
            });
        },
       
       
    });
});