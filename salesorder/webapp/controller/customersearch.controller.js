sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, History, UIComponent, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("com.luxasia.salesorder.controller.customersearch", {
        onInit: function () {
            var oModel = new JSONModel();
            this.getView().setModel(oModel, "mainModel");
            var aModel = this.getOwnerComponent().getModel("CustomerNoModel");
            this.getView().setModel(aModel, "CustomerNoModel")
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
                this.getRouter().navTo("storeselection", {}, true);
            }
        },

        onNextPage: function () {
            var oModel = this.getOwnerComponent().getModel("CustomerNoModel");
            oModel.setData({ modelData: {} });
            oModel.updateBindings(true);
            this.getRouter().navTo("newcustomer");
        },

        onSearch: function () {
            var Tel1Numbr = this.getView().byId("mobileInput").getValue();
            var EMail = this.getView().byId("emailInput").getValue();
            var Firstname = this.getView().byId("nameInput").getValue();
            var Lastname = this.getView().byId("surnameInput").getValue();
            var Customerno = this.getView().byId("customerno").getValue();

            var filterString = "";
            if (Customerno) {
                filterString = [new sap.ui.model.Filter("Firstname", "EQ" , Customerno)];
            }

            if (Firstname) {
                filterString =  [new sap.ui.model.Filter("Firstname", "EQ" , Firstname)];;
            }
            if (EMail) {
                filterString =  [new sap.ui.model.Filter("EMail", "EQ" , EMail)];;
            }
            if (Lastname) {
                filterString =  [new sap.ui.model.Filter("Lastname", "EQ" , Lastname)];;
            }
            if (Tel1Numbr) {
                filterString =  [new sap.ui.model.Filter("Tel1Numbr", "EQ" , Tel1Numbr)];;
            }

            if (!filterString) {
                MessageToast.show("No search criteria provided. Displaying all results.");
                return;
            }

            var oDataUrl = "/CustomerSet";

            this.getOwnerComponent().getModel("mainModel").read(oDataUrl, {
                filters: filterString,
                success: function (data) {
                    var searchResults = data ? data.results : (data.value || []);
                    if (searchResults.length === 0) {
                        // Show a message indicating that the customer was not found
                        sap.m.MessageBox.information("Customer not found.", {
                            title: "Info"
                        });
                        return;
                    }
                    // var oMainModel = this.getView().getModel("mainModel");
                    // oMainModel.setData({
                    //     d: {
                    //         results: searchResults
                    //     }
                    // });
                    var customerModel = new sap.ui.model.json.JSONModel(data.results);
                    this.getView().setModel(customerModel,"customerModel");
                    // var oTable = this.getView().byId("customerTable");
                    // oTable.setModel(oMainModel);
                    // oTable.bindAggregation("items", {
                    //     path: "/d/results/",
                    //     template: new sap.m.ColumnListItem({
                    //         cells: [
                    //             new sap.m.Text({ text: "{CustomerNo}" }),
                    //             new sap.m.Text({ text: "{Tel1Numbr}" }),
                    //             new sap.m.Text({ text: "{EMail}" }),
                    //             new sap.m.Text({ text: "{Firstname}" }),
                    //             new sap.m.Text({ text: "{Lastname}" }),
                    //             new sap.m.Button({
                    //                 icon : "sap-icon://arrow-right",
                    //                 press: function(evt) {
                        //                     var oModel = this.getOwnerComponent().getModel("CustomerNoModel");
                        //                     oModel.setData({ modelData: {} });
                        //                     oModel.updateBindings(true);
                    //                     var oButton = evt.getSource();
                    //                     var oBindingContext = oButton.getBindingContext();
                    //                     var sCustomerFirstname = oBindingContext.getProperty("CustomerNo");
                                    
                    //                     // Store Firstname in the model
                    //                     var oCustomerNoModel = this.getView().getModel("CustomerNoModel");
                    //                     if (!oCustomerNoModel) {
                    //                         oCustomerNoModel = new sap.ui.model.json.JSONModel();
                    //                         this.getView().setModel(oCustomerNoModel, "CustomerNoModel");
                    //                     }
                                    
                    //                     var aCustomerFirstnames = oCustomerNoModel.getProperty("/Firstnames") || [];
                    //                     aCustomerFirstnames.push(sCustomerFirstname);
                    //                     oCustomerNoModel.setProperty("/Firstnames", aCustomerFirstnames);
                                    
                    //                     // Perform navigation or other actions here
                    //                     var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                    //                     oRouter.navTo("transaction");
                    //                 }.bind(this)
                    //             })
                    //         ]
                    //     })
                    // });

                    this.getView().byId("customerTable").setVisible(true);
                  
                }.bind(this),
                

                error: function () {
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
        onCustomerPress:function(evt){
            var oTable = this.getView().byId("customerTable");
            var oModel = this.getOwnerComponent().getModel("CustomerNoModel");
                                        oModel.setData({ modelData: {} });
                                        oModel.updateBindings(true);
                                        var oButton = evt.getSource();
                                        var oRow = oButton.getParent().getParent(); // Adjust this based on your table structure

                                        // Get the binding context of the row
                                        var oBindingContext = oButton.getParent().getBindingContext("customerModel");
                                    
                                        var sCustomerFirstname = oBindingContext.getProperty("CustomerNo");
                                    
                                        // Store Firstname in the model
                                        var oCustomerNoModel = this.getView().getModel("CustomerNoModel");
                                        if (!oCustomerNoModel) {
                                            oCustomerNoModel = new sap.ui.model.json.JSONModel();
                                            this.getView().setModel(oCustomerNoModel, "CustomerNoModel");
                                        }
                                    
                                        var aCustomerFirstnames = oCustomerNoModel.getProperty("/Firstnames") || [];
                                        aCustomerFirstnames.push(sCustomerFirstname);
                                        oCustomerNoModel.setProperty("/Firstnames", aCustomerFirstnames);
                                    
                                        // Perform navigation or other actions here
                                        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                                        oRouter.navTo("transaction");
        },
        onNavigateToCustomerSearchTable: function () {
            var oTable = this.getView().byId("customerTable");
            var aSelectedItems = oTable.getSelectedItems();
        
            if (aSelectedItems.length > 0) {
                var oModel = this.getView().getModel("mainModel");
                var aResults = oModel.getProperty("/d/results");
                var oSelectedItem = aSelectedItems[0]; // Assuming you only allow single selection
        
                // Find the selected item's index in the table
                var iIndex = oTable.indexOfItem(oSelectedItem);
        
                if (iIndex !== -1) {
                    var oSelectedItemData = aResults[iIndex];
        
                    if (oSelectedItemData) {
                        var sTel1Numbr = oSelectedItemData.Tel1Numbr;
                        this.getRouter().navTo("customersearchtable", {
                            sTel1Numbr: sTel1Numbr
                        });
                    } else {
                        console.error("Selected item data is not available.");
                    }
                } else {
                    console.error("Selected item index not found.");
                }
            } else {
                console.warn("No item selected in the table. Navigating to customersearchtable without specific item.");
                this.getRouter().navTo("customersearchtable");
            }
        }, 
    });
});
