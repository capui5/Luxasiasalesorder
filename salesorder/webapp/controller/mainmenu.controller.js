sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ndc/BarcodeScanner"
], function (Controller, JSONModel) {
    "use strict";
 
    return Controller.extend("com.luxasia.salesorder.controller.mainmenu", {
        onInit: function () {
            var oModel = this.getOwnerComponent().getModel("SelectedItems");
            if (oModel) {
                this.getView().setModel(oModel, "SelectedItems");
            } else {
                console.error("Model 'SelectedItems' not found in the owner component.");
            }
             var aModel =this.getOwnerComponent().getModel("CustomerNoModel");
             this.getView().setModel(aModel, "CustomerNoModel");
            
        },            
       
      
        searchcustomer: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("customersearch");
         
        },
        transaction: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("salescompletion");
        },
        contact: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("calllist");
        },
        onCustPress: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("brandselection");
        },
 
        onOpenDialog: function () {
            this.pDialog ??= this.loadFragment({
                name: "com.luxasia.salesorder.view.newprofile"
            });
            this.pDialog.then(function (dialog) {
                dialog.open();
            });
        },
       
        onCloseDialog: function () {
            if (this.pDialog) {
                this.pDialog.then(function (dialog) {
                    dialog.close();
                    dialog.destroy();
                });
                this.pDialog = null;
            }
        },
       
 
        onOpenFrag: function () {
            this.pDialog ??= this.loadFragment({
                name: "com.luxasia.salesorder.view.cashcarry"
            });
            this.pDialog.then(function (dialog) {
                dialog.open();
            });
        },
 
        onCloseFrag: function () {
            if (this.pDialog) {
                this.pDialog.then(function (dialog) {
                    dialog.close();
                    dialog.destroy();
                });
                this.pDialog = null;
            }
        },
 
        onSearchProduct: function () {

            var oBrandModel = this.getOwnerComponent().getModel("SelectedBrandName");
 
            if (oBrandModel) {
              var oBrandData = oBrandModel.getProperty("/selectedBrandNames");
           
              if (Array.isArray(oBrandData) && oBrandData.length > 0) {
                var aBrandIds = oBrandData.map(function(brand) {
                  return brand.Brand_Id;
                });
           
                var aBrandFilters = aBrandIds.map(function(brandId) {
                  return new sap.ui.model.Filter("Brand_Id", sap.ui.model.FilterOperator.EQ, brandId);
                });
                
           
                var oCombinedBrandFilters = new sap.ui.model.Filter({
                  filters: aBrandFilters,
                  and: false // Change this based on your logic, whether it's 'AND' or 'OR'
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
                      success: function(response) {
                        oBusyDialog.close();
                        oJsonModel.setData(response.results);
                        oJsonModel.setSizeLimit(10000000000000);
                        that.getView().setModel(oJsonModel, "ProductSetModel");
           
                        // Code to load and open the dialog
                        that.aDialog ??= that.loadFragment({ name: "com.luxasia.salesorder.view.searchproduct" });
                        that.aDialog.then(function(dialog) {
                          dialog.open();
                        });
                      },
                      error: function(error) {
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
       
 
        // Function to handle selection change
        onItemSelect: function(oEvent) {
            var aListItems = oEvent.getParameter("listItems");
            var oModel = this.getView().getModel("mainModel");
             var aSelectedItems = [];
       
            aListItems.forEach(function(oListItem) {
                var oBindingContext = oListItem.getBindingContext("mainModel");
                var oSelectedItem = oBindingContext.getObject();
                var sPath = oBindingContext.getPath();
       
           
                if (oListItem.getSelected()) {
                   
                    aSelectedItems.push(oSelectedItem);
                } else {
                    aSelectedItems = aSelectedItems.filter(function(item) {
                        return item !== oSelectedItem;
                    });
                }
            });
       
           
        },
 
// Function to handle 'ADD TO SALE' button press
onAddToSale: function() {
    var oModel = this.getOwnerComponent().getModel("CustomerNoModel");
    oModel.setData({ modelData: {} });
    oModel.updateBindings(true);
    var oCustomerNoModel = this.getView().getModel("CustomerNoModel");
    if (!oCustomerNoModel) {
        oCustomerNoModel = new sap.ui.model.json.JSONModel();
        this.getView().setModel(oCustomerNoModel, "CustomerNoModel");
    }
    
    var selectedText = this.byId("CASHCARRY").getSelectedItem();
    
    if (!selectedText) {
        sap.m.MessageBox.error("Please select the Cash and Carry customer type");
    } else {
        var selectedTextValue = selectedText.getText();
    
        var aCustomerFirstnames = oCustomerNoModel.getProperty("/Firstnames") || [];
        aCustomerFirstnames.push(selectedTextValue);
        oCustomerNoModel.setProperty("/Firstnames", aCustomerFirstnames);
    }
    

    var aSelectedItems = [];
    var oStepInput = this.getView().byId("CurrentValue");
    var selectedQuantity = oStepInput.getValue();
    var oTable = this.getView().byId("myDialog");
    var aListItems = oTable.getSelectedItems();
    
    aListItems.forEach(function(oListItem) {
        var oBindingContext = oListItem.getBindingContext("ProductSetModel");
        if (oBindingContext) {
            var oSelectedItem = oBindingContext.getObject();
            var itemQuantity = oSelectedItem.quantity;
            if (itemQuantity > 0) {
                aSelectedItems.push(oSelectedItem);
            } else {
                console.error("Selected item quantity should be greater than 0.");
            }
        } else {
            console.error("BindingContext is undefined for the selected item.");
        }
    });
    
    // Access the existing "SelectedItems" model and update the selected items
    var oModel = this.getView().getModel("SelectedItems");
    if (oModel) {
        var oData = oModel.getData();
    
        // Assign incremental ItmNumber to each item in selectedItems array
        aSelectedItems.forEach(function(item, index) {
            // Incremental padding for ItemNumber (e.g., 0010, 0020, etc.)
            var paddedIndex = (index + 1) * 10; // Increase by 10 for every index
    
            // Format the paddedIndex to a 4-digit string (e.g., 0010, 0020)
            var formattedIndex = ('000000' + paddedIndex).slice(-6);
    
            // Assign the formatted ItmNumber to each item
            item.ItmNumber = formattedIndex;
        });
    
        // Add the modified selected items back to the model data
        oData.selectedItems = aSelectedItems;
    
        // Update the model with the modified data
        oModel.setData(oData);
    } else {
        console.error("Model 'SelectedItems' not found.");
    }
    
    // Optionally, you can navigate to the next page here
    // ...
    
    // Navigate to cart view and pass selected items
    this.getOwnerComponent().getRouter().navTo("transaction", {
        selectedItems: encodeURIComponent(JSON.stringify(aSelectedItems)),
        selectedQuantity: selectedQuantity,
    });
    
    if (this.pDialog) {
        this.pDialog.then(function(dialog) {
            dialog.close();
            dialog.destroy();
        });
        this.pDialog = null;
    }
    
},    
 
onScanBarcodecash: function () {
    var that = this;

       
    if (sap.ndc && sap.ndc.BarcodeScanner) {
        sap.ndc.BarcodeScanner.scan(
            function (mResult) {
                var sText = mResult.text;

                if (isValidBarcode(sText)) {
                    // Access the ProductSetModel from the view
                    var oModel = that.getView().getModel("ProductSetModel");

                    if (!oModel) {
                        console.error("ProductSetModel not found.");
                        return;
                    }

                    // Retrieve the array of objects from the model
                    var oModelData = oModel.getData();

                    // Check if oModelData is an array
                    if (Array.isArray(oModelData)) {
                        // Use Array.find() to search for the object with the matching Barcode
                        var oFoundItem = oModelData.find(function (item) {
                            return item.Barcode === sText;
                        });

                        // 'oFoundItem' will contain the object with the matching Barcode if found
                        if (oFoundItem) {
                            console.log("Found Item:", oFoundItem);

                            // Access the SelectedItems model from the view
                            var oJsonModel = that.getView().getModel("SelectedItems");

                            // Ensure that the selectedItems property exists in the model
                            if (!oJsonModel.getProperty("/selectedItems")) {
                                oJsonModel.setProperty("/selectedItems", []);
                            }

                            // Get the array of selected items from the model
                            var aSelectedItems = oJsonModel.getProperty("/selectedItems");

                            // Push the found item into the array
                            aSelectedItems.push(oFoundItem);

                            // Set the updated array back to the model
                            oJsonModel.setProperty("/selectedItems", aSelectedItems);
                           
                            if (oModel) {
                                var oData = oModel.getData();
                            
                                // Assign incremental ItmNumber to each item in selectedItems array
                                aSelectedItems.forEach(function(item, index) {
                                    // Incremental padding for ItemNumber (e.g., 0010, 0020, etc.)
                                    var paddedIndex = (index + 1) * 10; // Increase by 10 for every index
                            
                                    // Format the paddedIndex to a 6-digit string (e.g., 000010, 000020)
                                    var formattedIndex = ('000000' + paddedIndex).slice(-6);
                            
                                    // Assign the formatted ItmNumber to each item
                                    item.ItmNumber = formattedIndex;
                                });
                            
                                // Add the modified selected items back to the model data
                                oData.selectedItems = aSelectedItems;
                            
                                // Update the model with the modified data
                                oModel.setData(oData);
                            } else {
                                console.error("Model 'SelectedItems' not found.");
                            }
                           
                            var oModel = that.getOwnerComponent().getModel("CustomerNoModel");
                            oModel.setData({ modelData: {} });
                            oModel.updateBindings(true);
                            var oCustomerNoModel = that.getView().getModel("CustomerNoModel");
                            if (!oCustomerNoModel) {
                                oCustomerNoModel = new sap.ui.model.json.JSONModel();
                                that.getView().setModel(oCustomerNoModel, "CustomerNoModel");
                            }
                            
                            var selectedText = that.byId("CASHCARRY").getSelectedItem();
                            
                            if (!selectedText) {
                                sap.m.MessageBox.error("Please select the Cash and Carry customer type");
                            } else {
                                var selectedTextValue = selectedText.getText();
                            
                                var aCustomerFirstnames = oCustomerNoModel.getProperty("/Firstnames") || [];
                                aCustomerFirstnames.push(selectedTextValue);
                                oCustomerNoModel.setProperty("/Firstnames", aCustomerFirstnames);
                            }

                            // Navigate to the transaction page and pass the selected items
                            that.getOwnerComponent().getRouter().navTo("transaction", {
                                selectedItems: encodeURIComponent(JSON.stringify(aSelectedItems)),
                            });
                        } else {
                            // Show an error message if barcode is not found
                            sap.m.MessageBox.error("Barcode not found: " + sText);
                        }
                    }
                } else {
                    sap.m.MessageBox.error("Invalid barcode: " + sText);
                }
            },
            function (Error) {
                // Handle errors when scanning fails
                sap.m.MessageBox.error("Scanning failed: " + Error);
            }
        );
    } else {
        console.error("BarcodeScanner is not defined in sap.ndc");
    }

    function isValidBarcode(barcode) {
        return barcode.trim().length > 0;
    }
},
        handleClose : function(){
            if (this.pDialog) {
                this.pDialog.then(function (dialog) {
                    dialog.close();
                    dialog.destroy();
                });
                this.pDialog = null;
            }
        },
   
        // onOpenFragment: function () {
        //     // Load the plain fragment and open it as a dialog
        //     if (!this._oPlainDialog) {
        //        this._oPlainDialog = new sap.m.Dialog({
        //           content: sap.ui.xmlfragment("luxasiasingapore.view.test", this),
               
        //        });
        //     }
   
        //     this.getView().addDependent(this._oPlainDialog);
   
        //     this._oPlainDialog.open();
        //  },
         onQrPress: function () {
            this.oDialog ??= this.loadFragment({
                name: "com.luxasia.salesorder.view.qr"
            });
            this.oDialog.then(function (dialog) {
                dialog.open();
            });
            // var baseUrl = "http://chart.apis.google.com/chart?cht=qr&chs=250x250&chl=";
            // var urlToRedirect = "https://luxasia-otc-npr-cf-ap11-5vubrgfy.launchpad.cfapps.ap11.hana.ondemand.com/ac4bc299-aae2-4ffc-bcab-943146543edd.salesorder.comnewcustqrnewcustqr-0.0.1/index.html"; // Replace this with your desired URL
            // var text = encodeURIComponent(urlToRedirect);
            
            // var url = baseUrl + text;
            // this.getView().byId("qrcode").setSrc(url);
        },
 
        createprofile: function () {
            var oModel = this.getOwnerComponent().getModel("CustomerNoModel");
            oModel.setData({ modelData: {} });
            oModel.updateBindings(true);
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("newcustomer");
            if (this.pDialog) {
                this.pDialog.then(function (dialog) {
                    dialog.close();
                    dialog.destroy();
                });
                this.pDialog = null;
            }
   
        },
        closeSearchProd : function() {
            var oDialog = this.getView().byId("searchprod");
            oDialog.close();
        },
        onCloseFrag1: function () {
            var oDialog = this.getView().byId("qrfrag");
            oDialog.close();
             }
       
    });
});
