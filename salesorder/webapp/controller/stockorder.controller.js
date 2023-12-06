sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/core/format/DateFormat"

], function (Controller, JSONModel, MessageBox, DateFormat) {
    "use strict";



    return Controller.extend("com.luxasia.salesorder.controller.stockorder", {
        onInit: function (oArgs) {
            var oCartPurchaseModel = new JSONModel();
            this.getView().setModel(oCartPurchaseModel, "cartpurchaseModel");

            var oQuantityModel = new JSONModel();
            this.getView().setModel(oQuantityModel, "quantityModel");

            // Assuming you have a model named "mainModel", adjust the name accordingly
            var oModel = this.getOwnerComponent().getModel("mainModel");
            this.getView().setModel(oModel);

            this.getView().setModel(oModel);

            var oCSRFModel = new JSONModel({
                csrfToken: ""
            });
            this.getView().setModel(oCSRFModel, "csrfModel");

            this.fetchCsrfToken();

            // Check if oArgs is defined before using it
            if (oArgs) {
                var selectedItemsParam = oArgs.selectedItems;
                if (selectedItemsParam) {
                    var selectedItems = JSON.parse(decodeURIComponent(selectedItemsParam));

                    var oCartpurchaseModel = this.getView().getModel("cartpurchaseModel");
                    oCartpurchaseModel.setProperty("/selectedItems", selectedItems);
                }
            }
        },


        onAddProduct: function () {
            this.PDialog ??= this.loadFragment({
                name: "luxasiasingapore.view.purchase"
            });
            this.PDialog.then(function (dialog) {
                dialog.open();
            });
        },

        onClose: function () {
            if (this.PDialog) {
                this.PDialog.then(function (dialog) {
                    dialog.close();
                    dialog.destroy();
                });
                this.PDialog = null;
            }
        },
        onSearch : function () {
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
                                success: function (response) {
                                    oBusyDialog.close();
                                    oJsonModel.setData(response.results);
                                    oJsonModel.setSizeLimit(10000000000000);
                                    that.getView().setModel(oJsonModel, "ProductSetModel");

                                    // Close the existing purchase order dialog if open
                                    if (that.ADialog) {
                                        that.ADialog.then(function (dialog) {
                                            dialog.close();
                                            dialog.destroy();
                                        });
                                        that.ADialog = null;
                                    }

                                    // Code to load and open the dialog
                                    that.ADialog ??= that.loadFragment({ name: "com.luxasia.salesorder.view.purchaseorder" });
                                    that.ADialog.then(function (dialog) {
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
        onAddToPurchase: function () {
            var aSelectedItems = [];
            var oStepInput = this.getView().byId("CurrentValue");
            var selectedQuantity = oStepInput.getValue();

            var oCartPurchaseModel = this.getView().getModel("cartpurchaseModel");

            if (oCartPurchaseModel) {
                var oTable = this.getView().byId("mypurchaseDialog");
                var aListItems = oTable.getSelectedItems();

                aListItems.forEach(function (oListItem) {
                    var oBindingContext = oListItem.getBindingContext("ProductSetModel");
                    if (oBindingContext) {
                        var oSelectedItem = oBindingContext.getObject();
                        var itemQuantity = oSelectedItem.quantity; // Replace with the correct property name

                        if (itemQuantity > 0) {
                            aSelectedItems.push(oSelectedItem);
                        }
                    } else {
                        console.error("BindingContext is undefined for the selected item.");
                    }
                });

                // Add the selected items to the model
                var aExistingItems = oCartPurchaseModel.getProperty("/selectedItems") || [];
                oCartPurchaseModel.setProperty("/selectedItems", aExistingItems.concat(aSelectedItems));

                // Recalculate total price
                this.onTableUpdateFinished();

                // Close the purchase order dialog
                if (this.ADialog) {
                    this.ADialog.then(function (dialog) {
                        dialog.close();
                        dialog.destroy();
                    });
                    this.ADialog = null;
                }

                // Close the purchase dialog (if it is open)
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
        },


        onTableUpdateFinished: function () {
            // Calculate total price and update the model
            var oModel = this.getView().getModel("cartpurchaseModel");
            var aItems = oModel.getProperty("/selectedItems");
            var total = aItems.reduce(function (sum, item) {
                return sum + (item.RetailPrice * item.quantity);
            }, 0);

            oModel.setProperty("/totalPrice", total);
        },
        onQuantityChange: function (oEvent) {
            var newQuantity = oEvent.getParameter("value");
            var oQuantityModel = this.getView().getModel("quantityModel");

            // Update the selectedQuantity property in the model
            oQuantityModel.setProperty("/selectedQuantity", newQuantity);

            // Recalculate total price
            this.onTableUpdateFinished();
        },

        fetchCsrfToken: function () {
            var that = this;
            $.ajax({
                type: "GET",
                url: "./sap/opu/odata/sap/ZSDGW_CE_APP_SRV/",
                headers: {
                    "X-CSRF-Token": "fetch"
                },
                success: function (data, textStatus, request) {
                    var csrfToken = request.getResponseHeader("X-CSRF-Token");
                    that.getView().getModel("csrfModel").setProperty("/csrfToken", csrfToken);
                },
                error: function (error) {
                    console.error("Error fetching CSRF token:", error);
                }
            });
        },
        onPoPress: function () {
            console.log("PO Sale button clicked");

            var oStoreModel = this.getOwnerComponent().getModel("StoreModel");
            var sStoreId = oStoreModel.getProperty("/selectedStoreId");
            var ocartpurchaseModel = this.getView().getModel("cartpurchaseModel");
            var selectedItems = ocartpurchaseModel.getProperty("/selectedItems");
            console.log("Selected Items:", selectedItems);
            var hasZeroQuantity = selectedItems.some(function (item) {
                return item.quantity === 0;
            });

            if (hasZeroQuantity) {

                MessageBox.error("Please select a quantity greater than 0 for each item.");
                return;
            }
           

            var oDatePicker = this.getView().byId("DP2");


            var oSelectedDate = oDatePicker.getDateValue();


            var sFormattedDate = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "dd.MM.yyyy" }).format(oSelectedDate);

            var oVendorComboBox = this.getView().byId("vendor");
            var oVendorItem = oVendorComboBox.getSelectedItem();
            if (!oVendorItem) {
                console.error("No vendor selected.");
                return;
            }
            
            // Assuming that the VendorName is the key, adjust this based on your model structure
            var sSelectedVendorKey = this.getView().getModel("mainModel").getProperty(oVendorItem.getBindingContext("mainModel").getPath() + "/VendorNo");
            
            // Limit the length of the string to a maximum of 10 characters
            var maxLength = 10;
            sSelectedVendorKey = sSelectedVendorKey.substring(0, maxLength);

    //         var oVendorComboBox = this.getView().byId("vendor");
    // var oVendorItem = oVendorComboBox.getSelectedItem();
    // if (!oVendorItem) {
    //     console.error("No vendor selected.");
    //     return;
    // }

    // // Assuming that the VendorNo is a property of the Vendor item, adjust this based on your model structure
    // var sSelectedVendorNo = this.getView().getModel("mainModel").getProperty(oVendorItem.getBindingContext("mainModel").getPath() + "/VendorNo");

    // // Limit the length of the string to a maximum of 10 characters
    // var maxLength = 10;
    // sSelectedVendorNo = sSelectedVendorNo.substring(0, maxLength);
            

            var purchaseOrderItems = [];

            selectedItems.forEach(function (item, index) {
                var purchaseOrderItem = {
                    "PoNumber": "",

                    "PoItem": (index + 1).toString(),

                    "Material": item.ArticleNo.toString(),

                    "Plant":  sStoreId,

                    "Quantity": item.quantity.toString(),

                    "PoUnit": "PC"
                };

                purchaseOrderItems.push(purchaseOrderItem);
            });

            var PurchaseOrderPayload = {
                "PoNumber": "",

                "Vendor": sSelectedVendorKey,

                "DlvDate": sFormattedDate,

                "Action": "NORMAL",

                "StoreId": sStoreId,
                "to_po_items": purchaseOrderItems

            };
            
            console.log("Request Payload:", JSON.stringify(PurchaseOrderPayload));

            var csrfToken = this.getView().getModel("csrfModel").getProperty("/csrfToken");

            $.ajax({
                type: "POST",
                url: "./sap/opu/odata/sap/ZSDGW_CE_APP_SRV/PurchaseHeadSet",
                data: JSON.stringify(PurchaseOrderPayload),
                contentType: "application/json",
                headers: {
                    "X-CSRF-Token": csrfToken,
                },
                success: function (data) {
                    console.log("Success Callback Executed");
                    console.log("Success Response:", data);
                    // Optionally, handle success actions here
                },
                error: function (xhr, status, error) {
                    console.log("XHR Status:", xhr.status);
                    console.log("XHR Response Text:", xhr.responseText);

                    var sapGatewayError = xhr.getResponseHeader("sap-message");
                    if (sapGatewayError) {
                        console.error("SAP Gateway Error:", sapGatewayError);
                        // Log or display additional details from sapGatewayError
                    } else {
                        console.error("Generic Error:", error);
                    }
                },
                complete: function (xhr) {
                    console.log("AJAX Request Complete. Status:", xhr.status);
                }
            });
        },




    });
});