sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/format/DateFormat",
    "sap/ui/model/Sorter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "sap/ui/core/UIComponent"
], function (Controller, DateFormat, Sorter, JSONModel, History, UIComponent) {
    "use strict";

    return Controller.extend("com.luxasia.salesorder.controller.salescompletion", {
        onInit: function () {
            var that = this;
            var oModel = that.getOwnerComponent().getModel("SalesEmployeeModel")
       
            var oData = oModel.getProperty("/");
            if (oData && oData.results && oData.results.length > 0) {
                var yourProperty = oModel.getProperty("/results/0/Pernr");
                // Use the value of 'yourProperty' as needed
                console.log("Value of yourProperty:", yourProperty);
            } else {
                console.log("No data available in the model or at the specified index.");
            }
            var oStoreModel = this.getOwnerComponent().getModel("StoreModel");
            this.sStoreId = oStoreModel.getProperty("/selectedStoreId");
            var oDateFormat = DateFormat.getDateTimeInstance({ pattern: "dd.MM.yyyy" });
            this.updateCurrentDate(oDateFormat);
            this.scheduleDailyUpdate(oDateFormat);

            var oModel = that.getOwnerComponent().getModel("SalesEmployeeModel");
            this.SalesEmpId = oModel.getProperty("/results/0/Pernr");
            console.log(this.SalesEmpId)
            var oRouter = this.getOwnerComponent().getRouter();
      oRouter.getRoute("salescompletion").attachPatternMatched(this._onRouteMatched, this);
        },
        _onRouteMatched:function(evt){
            this.getView().byId("salesOrderBeginDate").setValue(this.dateFormatter(new Date()));
            this.getView().byId("salesOrderEndDate").setValue(this.dateFormatter(new Date()));
            this.onGoPress();
          },
        onAfterRendering:function(){
           // var plant = new sap.ui.model.Filter("Plant","EQ",this.sStoreId);
            //var salesemp = new sap.ui.model.Filter("SalesEmp","EQ",this.SalesEmpId);
            // var plant = new sap.ui.model.Filter("Plant","EQ", "7018");
            // var salesemp = new sap.ui.model.Filter("SalesEmp","EQ","50000302");
            //this.handleTransactionSalesData(plant,salesemp);
        },
        handleTransactionSalesData:function(filter1, filter2){
            var filters = new sap.ui.model.Filter([filter1,filter2],true);
            this.getView().byId("salesTable").getBinding("items").filter(filters);
        },
        onMyTransactions:function(){
            var plant = new sap.ui.model.Filter("Plant","EQ",this.sStoreId);
            var salesemp = new sap.ui.model.Filter("SalesEmp","EQ",this.SalesEmpId);
            this.handleTransactionSalesData(plant,salesemp);
        },
        onSearch : function(evt){
                var searchString = evt.getParameter("value");
                var filter1 = new sap.ui.model.Filter("Plant","EQ",this.sStoreId);
            var filter2 = new sap.ui.model.Filter("SalesEmp","EQ",this.SalesEmpId);
                if(searchString.length > 1){
                    var filter3 = new sap.ui.model.Filter("SalesorderNo","EQ",searchString);
                    var filters = new sap.ui.model.Filter([filter1,filter2,filter3],true);
                }else{
                    var filters = new sap.ui.model.Filter([filter1,filter2],true);
                }
                this.getView().byId("salesTable").getBinding("items").filter(filters);
        },
        onGoPress:function(evt){
            var filter1 = new sap.ui.model.Filter("Plant","EQ",this.sStoreId);
            var filter2 = new sap.ui.model.Filter("SalesEmp","EQ",this.SalesEmpId);
            var beginDate = this.getView().byId("salesOrderBeginDate").getValue();
            var endDate = this.getView().byId("salesOrderEndDate").getValue();
            if(beginDate.length > 0 && endDate.length > 0){
                var formattedBeginDate = new Date(new Date(beginDate).toString().split("GMT ")[0] + " UTC ").toISOString();
                var formattedEndDate = new Date(new Date(endDate).toString().split("GMT ")[0] + " UTC ").toISOString();
                var filter3 = new sap.ui.model.Filter("DocDate","BT",formattedBeginDate,formattedEndDate);
            }else if(beginDate.length == 0){
                sap.m.MessageToast.show("Please enter the Begin date");
            }else if(endDate.length == 0){
                sap.m.MessageToast.show("Please enter the End date");
            }
            var filters = new sap.ui.model.Filter([filter1,filter2,filter3],true);
            this.getView().byId("salesTable").getBinding("items").filter(filters);
        },
        dateFormatter: function (date) {
			var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "MM/dd/yyyy"
			});
			return oDateFormat.format(new Date(date));
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
