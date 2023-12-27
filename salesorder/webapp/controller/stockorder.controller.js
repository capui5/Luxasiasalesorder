sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ndc/BarcodeScanner"

], function (Controller, JSONModel, MessageBox) {
    "use strict";

    return Controller.extend("com.luxasia.salesorder.controller.stockorder", {
        onInit: function (oArgs) {
            var oCartPurchaseModel = new JSONModel();
            this.getView().setModel(oCartPurchaseModel, "cartpurchaseModel");

            var oQuantityModel = new JSONModel();
            this.getView().setModel(oQuantityModel, "quantityModel");

          
            var oModel = this.getOwnerComponent().getModel("mainModel");
            this.getView().setModel(oModel);

           
            if (oArgs) {
                var selectedItemsParam = oArgs.selectedItems;
                if (selectedItemsParam) {
                    var selectedItems = JSON.parse(decodeURIComponent(selectedItemsParam));

                    var oCartpurchaseModel = this.getView().getModel("cartpurchaseModel");
                    oCartpurchaseModel.setProperty("/selectedItems", selectedItems);
                }
            }
            var oRouter = this.getOwnerComponent().getRouter();
      //oRouter.getRoute("stockorder").attachPatternMatched(this._onRouteMatched, this);
        },
        onAfterRendering:function(){
            var that = this;
            //this.getView().getModel("StoreModel").setProperty("/selectedStoreType","B");
            var storeType = this.getView().getModel("StoreModel").getProperty("/selectedStoreType");
            var oStoreModel = this.getOwnerComponent().getModel("StoreModel");
            var sStoreId = oStoreModel.getProperty("/selectedStoreId");
            var oModel = this.getOwnerComponent().getModel("mainModel");
            var oBusyDialog = new sap.m.BusyDialog({
                title: "Please wait....",
                //text: "Please wait...."
              });
              //this.getView().setBusy(true);
           var  oUrlParams = {
                StoreId : "'" + sStoreId + "'",
                Type : "'STORAGE_LOC'"
                };
                oBusyDialog.open();
            oModel.read("/PODetails", {
                urlParameters: oUrlParams,
                success: function (response) {
                    oBusyDialog.close();
                  var model = new sap.ui.model.json.JSONModel(response.results);
                  model.setSizeLimit(100000000);
                  that.getView().setModel(model,"storageLocModel");
                  that.getView().byId("storageLocation").setSelectedKey("0001");
                },
                error: function (error) {
                    oBusyDialog.close();
                    //that.getView().setBusy(false);
                }
              });
              var  oUrlParamsPlant = {
                StoreId : "'" + sStoreId + "'",
                Type : "'SUPP_SITE'"
                };
                oModel.read("/PODetails", {
                urlParameters: oUrlParamsPlant,
                success: function (response) {
                  var model = new sap.ui.model.json.JSONModel(response.results);
                  model.setSizeLimit(100000000);
                  that.getView().setModel(model,"supplyPlantModel");
                },
                error: function (error) {
                  //oBusyDialog.close();
                }
              });
              var  oUrlParamsVendor = {
                StoreId : "'" + sStoreId + "'",
                Type : "'SUPP_VEND'"
                };
                oModel.read("/PODetails", {
                urlParameters: oUrlParamsVendor,
                success: function (response) {
                  var model = new sap.ui.model.json.JSONModel(response.results);
                  model.setSizeLimit(100000000);
                  that.getView().setModel(model,"supplyVendorModel");
                },
                error: function (error) {
                  //oBusyDialog.close();
                }
              });
        },
        loadProducts: function () {
            var oModel = this.getOwnerComponent().getModel("mainModel");

            if (oModel) {
                var oStoreModel = this.getOwnerComponent().getModel("StoreModel");
                var sStoreId = oStoreModel.getProperty("/selectedStoreId");
                oModel.read("/ProductSet", {
                    filters: [],
                    success: function (response) {
                        var oJsonModel = new sap.ui.model.json.JSONModel();
                        oJsonModel.setData(response.results);
                        oJsonModel.setSizeLimit(10000000000000);
                        this.getView().setModel(oJsonModel, "ProductSetModel");
                    }.bind(this),
                    error: function (error) {
                        console.error("Error loading products:", error);
                    }
                });
            } else {
                console.error("mainModel not found.");
            }
        },

        onAddProduct: function () {
            this.PDialog ??= this.loadFragment({
                name: "com.luxasia.salesorder.view.purchase"
            });
            this.PDialog.then(function (dialog) {
                dialog.open();
            });
        },
        onDecline: function () {
            if (this.PDialog) {
                this.PDialog.then(function (dialog) {
                    dialog.close();
                    dialog.destroy();
                });
                this.PDialog = null;
            }
        },

        onScanBar: function () {
            var that = this;
            if (sap.ndc && sap.ndc.BarcodeScanner) {
                sap.ndc.BarcodeScanner.scan(
                    function (mResult) {
                        var sText = mResult.text;
                        if (isValidBarcode(sText)) {
                            var oModel = that.getView().getModel("ProductSetModel");
                            if (!oModel) {
                                console.error("ProductSetModel not found.");
                                return;
                            }
                            var oModelData = oModel.getData();
                            if (Array.isArray(oModelData)) {
                                var oFoundItem = oModelData.find(function (item) {
                                    return item.Barcode === sText;
                                });
                                if (oFoundItem) {
                                    console.log("Found Item:", oFoundItem);
                                    var oJsonModel = that.getView().getModel("cartpurchaseModel");
                                    if (!oJsonModel.getProperty("/selectedItems")) {
                                        oJsonModel.setProperty("/selectedItems", []);
                                    }
                                    var aSelectedItems = oJsonModel.getProperty("/selectedItems");
                                    var existingItem = aSelectedItems.find(function (item) {
                                        return item.ArticleNo === oFoundItem.ArticleNo;
                                    });

                                    if (existingItem) {
                                        existingItem.quantity += 1;
                                        console.log("Quantity incremented for existing item:", existingItem);
                                    } else {
                                        aSelectedItems.push(oFoundItem);
                                        console.log("New item added to selectedItems:", oFoundItem);
                                        aSelectedItems[aSelectedItems.length - 1].quantity = 1;
                                    }

                                    aSelectedItems.forEach(function (item, index) {
                                        var paddedIndex = (index + 1) * 10; 
                                        var formattedIndex = ('000000' + paddedIndex).slice(-6);
                                        item.ItmNumber = formattedIndex;
                                    });
                                    oJsonModel.setProperty("/selectedItems", aSelectedItems);
                                    that.getOwnerComponent().getRouter().navTo("stockorder", {
                                        selectedItems: encodeURIComponent(JSON.stringify(aSelectedItems)),
                                    });
                                    that.onDecline();


                                } else {
                                    sap.m.MessageBox.error("Barcode not found: " + sText);
                                    that.onDecline();
                                }
                            }
                        } else {
                            sap.m.MessageBox.error("Invalid barcode: " + sText);
                            that.onDecline();
                        }
                    },
                    function (Error) {
                        sap.m.MessageBox.error("Scanning failed: " + Error);
                        that.onDecline();
                    }
                );
            } else {
                console.error("BarcodeScanner is not defined in sap.ndc");
            }

            function isValidBarcode(barcode) {
                return barcode.trim().length > 0;
            }
        },

        onSearch: function () {
        
            var OBrandModel = this.getOwnerComponent().getModel("SelectedBrandName");

            if (OBrandModel) {
                var oBrandData = OBrandModel.getProperty("/selectedBrandNames");

                if (Array.isArray(oBrandData) && oBrandData.length > 0) {
                    var aBrandIds = oBrandData.map(function (brand) {
                        return brand.Brand_Id;
                    });

                    var aBrandFilters = aBrandIds.map(function (brandId) {
                        return new sap.ui.model.Filter("Brand_Id", sap.ui.model.FilterOperator.EQ, brandId);
                    });

                    var oCombinedBrandFilters = new sap.ui.model.Filter({
                        filters: aBrandFilters,
                        and: false 
                    });

                    var oStoreModel = this.getOwnerComponent().getModel("StoreModel");
                    if (oStoreModel) {
                        var sStoreId = oStoreModel.getProperty("/selectedStoreId");

                        var oStoreFilter = new sap.ui.model.Filter("StoreId", sap.ui.model.FilterOperator.EQ, sStoreId);

                        var oModel = this.getOwnerComponent().getModel("mainModel");

                        var oFinalFilter = new sap.ui.model.Filter({
                            filters: [oCombinedBrandFilters, oStoreFilter],
                            and: true
                        });

                        if (oModel) {
                            var oJsonModel = new sap.ui.model.json.JSONModel();
                            var oBusyDialog = new sap.m.BusyDialog({
                                title: "Loading Products",
                                text: "Please wait...."
                            });
                            oBusyDialog.open();

                            var that = this;
                            oModel.read("/ProductSet", {
                                filters: [oFinalFilter],
                                success: function (response) {
                                    oBusyDialog.close();
                                    oJsonModel.setData(response.results);
                                    oJsonModel.setSizeLimit(10000000000000);
                                    response.results.forEach(function(obj){obj.quantity = 1});
                                    that.getView().setModel(oJsonModel, "ProductSetModel");

                                  
                                    if (that.ADialog) {
                                        that.ADialog.then(function (dialog) {
                                            dialog.close();
                                            dialog.destroy();
                                        });
                                        that.ADialog = null;
                                    }

                                   
                                    that.ADialog ??= that.loadFragment({ name: "com.luxasia.salesorder.view.purchaseorder" });
                                    that.ADialog.then(function (dialog) {
                                        dialog.getContent()[0].removeSelections(true);
                                        dialog.open();
                                    });
                                },
                                error: function (error) {
                                    oBusyDialog.close();
                                }
                            });
                        } else {
                            console.error("mainModel not found.");
                        }
                    } else {
                        console.error("StoreModel not found.");
                    }
                } else {
                    console.error("SelectedBrandName model's selectedBrandNames property is empty or not an array.");
                }
            } else {
                console.error("SelectedBrandName model not found or undefined.");
            }
        },
        closeSearchProd: function () {
          
            var dialog = this.getView().byId("purchaseprod1");

           
            if (dialog) {
                dialog.close();
                dialog.destroy();
            } else {
                MessageBox.error("Dialog not found!");
            }
        },
        onAddToPurchase: function () {
            var aSelectedItems = [];
           // var oStepInput = this.getView().byId("quanvalue");
           // var selectedQuantity = oStepInput.getValue();
            var oCartPurchaseModel = this.getView().getModel("cartpurchaseModel");

            if (oCartPurchaseModel) {
                var oTable = this.getView().byId("mypurchaseDialog1");
                var aListItems = oTable.getSelectedItems();

                aListItems.forEach(function (oListItem) {
                    var oBindingContext = oListItem.getBindingContext("ProductSetModel");
                    if (oBindingContext) {
                        var oSelectedItem = oBindingContext.getObject();
                        var itemQuantity = oSelectedItem.quantity;

                        if (itemQuantity > 0) {
                            aSelectedItems.push(oSelectedItem);
                        }
                    } else {
                        console.error("BindingContext is undefined for the selected item.");
                    }
                });
                var aExistingItems = oCartPurchaseModel.getProperty("/selectedItems") || [];
                //to add quantities if material is same
                for(var m= aSelectedItems.length-1 ;m>=0;m--){
                    for(var b=0;b<aExistingItems.length;b++){
                        if(aSelectedItems[m].ArticleNo == aExistingItems[b].ArticleNo){
                            aExistingItems[b].quantity += aSelectedItems[m].quantity;
                            aSelectedItems.splice(m,1);
                            break;
                        }
                    }
                }
                //////////////
                
                oCartPurchaseModel.setProperty("/selectedItems", aExistingItems.concat(aSelectedItems));
                if (this.ADialog) {
                    this.ADialog.then(function (dialog) {
                        dialog.close();
                        dialog.destroy();
                    });
                    this.ADialog = null;
                }
                if (this.PDialog) {
                    this.PDialog.then(function (dialog) {
                        dialog.close();
                        dialog.destroy();
                    });
                    this.PDialog = null;
                }

                console.log("After adding items:", oCartPurchaseModel.getData());
            } else {
                console.error("cartpurchaseModel not found or undefined.");
            }
            this.closeFragments();
        },
        onCancelPress: function () {
            var oModel = this.getView().getModel("cartpurchaseModel");
            oModel.setData({ selectedItems: {}});
            this.onClearFields();
            oModel.updateBindings(true);
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("mainmenu");
        },
        onPoPress:function(evt){
                var that = this;
                var errorText=this.validateFlag();
                if(errorText.length > 0){
                    sap.m.MessageBox.error(errorText);
                }else{
                var oStoreModel = this.getOwnerComponent().getModel("StoreModel");
                var sStoreId = oStoreModel.getProperty("/selectedStoreId");
                var storeType = this.getView().getModel("StoreModel").getProperty("/selectedStoreType");
                //var deliveryDate = this.getView().byId("deliveryDate").getValue();
                var deliveryDate = this.getView().byId("deliveryDate").getValue();
                //var selectedDate = datePicker.getDateValue();
                //var milliseconds = selectedDate.getTime();
                //var formattedDate = '/Date(' + milliseconds + ')/';
                var payload = {
                    "PoNumber": "",
                    "Vendor": "",
                    "DlvDate": deliveryDate,
                    "Action":"",
                    "StoreId" : sStoreId,
                    "to_po_items": []
                }
                if(storeType == "B"){
                    var storeLoc = this.getView().byId("storageLocation").getSelectedKey();
                    payload.Action = this.getView().byId("documentType").getSelectedKey();
                    //payload.StgeLoc = this.getView().byId("storageLocation").getSelectedKey();
                }else{
                    payload.Action = this.getView().byId("documentTypeConsigment").getSelectedKey();
                    payload.Vendor = this.getView().byId("supplyVendor").getSelectedKey();
                }
                if(payload.Action == "STO" || payload.Action == "STO_RET"){
                    payload.SupplPlnt = this.getView().byId("supplyPlant").getSelectedKey();
                }
                var selectedItems = this.getView().getModel("cartpurchaseModel").oData.selectedItems;
                for(var m =0;m<selectedItems.length;m++){
                    var itemNo = 10 * (m+1);
                    var itemObj = {
                        "PoNumber": "",
                        "PoItem": itemNo + "",
                        "Material": selectedItems[m].ArticleNo,
                        "Plant": sStoreId,
                        "Quantity": selectedItems[m].quantity + "",
                        "PoUnit": selectedItems[m].UOM,
                        //"PoUnit": "PC"
                    };
                    if(storeType == "B"){
                        itemObj.StgeLoc = this.getView().byId("storageLocation").getSelectedKey();
                    }
                    payload.to_po_items.push(itemObj);
                }
                var oBusyDialog = new sap.m.BusyDialog({
                    title: "Creating Purchase order",
                    text: "Please wait...."
                  });
                this.getOwnerComponent().getModel("mainModel").create("/PurchaseHeadSet",payload,{
                    success:function(oData,oResponse){
                        oBusyDialog.close();  
                        sap.m.MessageBox.success("Purchase Order created successfully. Purchase Order No: " + oData.PoNumber, {
                            onClose: function () {
                                var oModel = that.getView().getModel("cartpurchaseModel");
                        oModel.setData({ selectedItems: []});
                        that.onClearFields();
                        oModel.updateBindings(true);
                        var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
                        oRouter.navTo("purchasedata");
                            }
                          });
                    },
                    error:function(error,oResponse){
                        oBusyDialog.close();
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
                }
                
        },
        validateFlag:function(){
            //var poItems = this.getView().getModel("cartpurchaseModel").oData.selectedItems;
            var errorText = "";
            var storeType = this.getView().getModel("StoreModel").getProperty("/selectedStoreType");
            var poItems = this.getView().byId("stockordertable").getItems();

            
            if(storeType == "B"){
                if(this.getView().byId("storageLocation").getSelectedKey().length == 0){
                    errorText += "Please select the storage location\n";
                }
                if(this.getView().byId("deliveryDate").getValue().length == 0){
                    errorText += "Please select the Delivery Date\n";
                }
                if(this.getView().byId("documentType").getSelectedKey().length == 0){
                    errorText += "Please select the Document Type\n";
                }
                if(this.getView().byId("supplyPlant").getSelectedKey().length == 0){
                    errorText += "Please select the Supply Plant\n";
                }
            }else{
                if(this.getView().byId("deliveryDate").getValue().length == 0){
                    errorText += "Please select the Delivery Date\n";
                }
                if(this.getView().byId("documentTypeConsigment").getSelectedKey().length == 0){
                    errorText += "Please select the Document Type\n";
                }
                if(this.getView().byId("supplyVendor").getSelectedKey().length == 0){
                    errorText += "Please select the Supply Plant\n";
                }
            }
            if(poItems.length == 0){
                errorText += "Please add atleast an item to create the PO";
            }
            return errorText;
        },
        onClearFields:function(){
            //this.getView().byId("storageLocation").setSelectedKey(null);
            this.getView().byId("deliveryDate").setValue();
            this.getView().byId("documentType").setSelectedKey(null);
            this.getView().byId("documentTypeConsigment").setSelectedKey(null);
            this.getView().byId("supplyPlant").setSelectedKey(null);
            this.getView().byId("supplyVendor").setSelectedKey(null);
        }
    });
});