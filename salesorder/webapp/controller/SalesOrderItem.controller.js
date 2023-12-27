 sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator"
    ],
    function(BaseController ,Filter, FilterOperator,) {
      "use strict";
  
      return BaseController.extend("com.luxasia.salesorder.controller.SalesOrderItem", {
        onInit: function() {
          var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

          oRouter.getRoute("SalesOrderItem").attachMatched(this._onRouteMatched, this);
          
      var oModel = this.getOwnerComponent().getModel("SelectedCustomerModel");
      this.getView().setModel(oModel, "SelectedCustomerModel");

        },
        _onRouteMatched: function (oEvent) {
          var that = this;
          var oArgs = oEvent.getParameter("arguments");
          var sSalesOrderNo = oArgs.SSalesno;
          this.sSalesOrderNo = sSalesOrderNo;
          var oModel = this.getOwnerComponent().getModel("mainModel");
          var oJsonModel = this.getView().getModel("SelectedCustomerModel");
          var oFilter = new sap.ui.model.Filter("SalesorderNo", sap.ui.model.FilterOperator.EQ, sSalesOrderNo);
      
          // Read data from the model using the provided URL
          oModel.read("/SalesOrderItemSet", {
              filters: [oFilter],
              success: function (oData) {
                  console.log(oData);
                
                 
                  oData.results.forEach(function (item) {
                    item.Discount = parseFloat(item.Discount).toFixed(2);
                    item.NetPrice = parseFloat(item.NetPrice).toFixed(2);
                    item.RetailPrice = parseFloat(item.RetailPrice).toFixed(2);
                    item.TargetQty = parseFloat(item.TargetQty).toFixed(0);
                    item.TaxAmount = parseFloat(item.TaxAmount).toFixed(2);
                  });// Assuming results contains the array of data
                  oJsonModel.setData(oData.results); 
                  that.getView().setModel(oJsonModel, "SelectedCustomerModel");
              
                  console.log(oJsonModel)
                  // You can process the data here
              },
              error: function (error) {
                  // Handle errors during the fetch
                  console.error("Error fetching data:", error);
              }
          });
     
        },
        onGoSalesCompletion: function(){
          var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
           oRouter.navTo("salescompletion");
       }
      });
    }
  );
  