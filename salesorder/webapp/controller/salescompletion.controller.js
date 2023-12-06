sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/format/DateFormat",
    "sap/ui/model/Sorter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
  "sap/ui/core/UIComponent" 
], function (Controller, DateFormat, Sorter, JSONModel,History,UIComponent) {
    "use strict";

    return Controller.extend("com.luxasia.salesorder.controller.salescompletion", {
        onInit: function () {
            var oDateFormat = DateFormat.getDateTimeInstance({ pattern: "dd.MM.yyyy" });
            this.updateCurrentDate(oDateFormat);
            this.scheduleDailyUpdate(oDateFormat);

            var oData = {
                salesData: [
                    {
                        SaleId: "1",
                        Products: [
                            {
                                Name: "Product A",
                                ProductId: "A123",
                                Price: "50.00 USD",
                                Customer: "Customer 1",
                                Status: "Pending"
                            },
                            {
                                Name: "Product B",
                                ProductId: "B456",
                                Price: "80.00 USD",
                                Customer: "Customer 1",
                                Status: "Pending"
                            }
                        ]
                    },
                    {
                        SaleId: "2",
                        Products: [
                            {
                                Name: "Product C",
                                ProductId: "C789",
                                Price: "30.00 USD",
                                Customer: "Customer 3",
                                Status: "Completed"
                            },
                            {
                                Name: "Product D",
                                ProductId: "C790",
                                Price: "40.00 USD",
                                Customer: "Customer 3",
                                Status: "Completed"
                            }
                        ]
                    }
                ]
            };
            

            var yourModel = new JSONModel(oData);

           
            this.getView().setModel(yourModel, "SalesData");

            var oTable = this.getView().byId("salesTable");
            var oBinding = oTable.getBinding("items");
            oBinding.sort(new Sorter("SaleId", false));
        },

        updateCurrentDate: function (oDateFormat) {
            var currentDate = new Date();
            var formattedDate = oDateFormat.format(currentDate);
            var oModel = new JSONModel({ currentDate: formattedDate });
            this.getView().setModel(oModel, "CurrentDate");
        },

        scheduleDailyUpdate: function (oDateFormat) {
            var self = this;
            setInterval(function () {
                self.updateCurrentDate(oDateFormat);
            }, 24 * 60 * 60 * 1000); 
        },

        onPendingTransactions: function () {
            this.filterTransactions("Pending");
        },
        
        onCompletedTransactions: function () {
            this.filterTransactions("Completed");
        },
        
        filterTransactions: function (status) {
            var oTable = this.getView().byId("salesTable");
            var oBinding = oTable.getBinding("items");
        
            if (oBinding) {
                oBinding.filter(new sap.ui.model.Filter({
                    path: "Products",
                    test: function (products) {
                        return products.some(function (product) {
                            return product.Status === status;
                        });
                    }
                }));
            }
        },
        
        
               
        calculateTotalPrice: function (aProducts) {
            let total = 0;
            aProducts.forEach(function (product) {
                total += parseFloat(product.Price.replace(" USD", ""));
            });
            return total.toFixed(2) + " USD";
        },
         //Nav Back start//
    getRouter: function () {
        return UIComponent.getRouterFor(this);
      },
  
      onNavBack: function () {
        var oHistory, sPreviousHash;
  
        oHistory = History.getInstance();
        sPreviousHash = oHistory.getPreviousHash();
  
        if (sPreviousHash !== undefined) {
          window.history.go(-1);
        } else {
          this.getRouter().navTo("View1", {}, true);
        }
      },        
    });
});
