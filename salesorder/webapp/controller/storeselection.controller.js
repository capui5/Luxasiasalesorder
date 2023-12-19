sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
  "use strict";

  return Controller.extend("com.luxasia.salesorder.controller.storeselection", {
    onInit: function () {
      // To Get the Login User data  from Btp
      var lModel = this.getOwnerComponent().getModel("LoginUserModel");
      this.getView().setModel(lModel , "LoginUserModel")
      var mModel = this.getOwnerComponent().getModel("mainModel");
      var SModel = this.getOwnerComponent().getModel("SalesEmployeeModel");
      this.getView().setModel(SModel , "SalesEmployeeModel")
      var that = this;
      const url = that.getBaseURL() + "/user-api/currentUser";

      $.ajax({
        url: url,
        type: "GET",
        success: function (data) {
          console.log(data);
          lModel.setData(data);
          console.log("Model data :", lModel);
          // Handle data here
        },
        error: function (xhr, status, error) {
        }

      });
      // To get the Login user data from Luxasia odata service
      if (lModel) {
          var email = lModel.getProperty("/email");
          console.log("Email:", email);
      } else {
          console.error("User Data Model not found.");
      }
            
            var sEmail = 'christintan@luxasia.com';
      
            mModel.read("/SalesEmployees", {
              urlParameters: {
                StoreId: "''",
                Email: "'" + sEmail + "'"
              },
              success: function (odata) {
                SModel.setData(odata);
                console.log(SModel);
                that.onhandleemployeedata(SModel);
              
              },
              error: function (error) {
                // Handle errors here
                console.error("Error:", error);
              }
            });

          
       


      var storedStoreId = localStorage.getItem("selectedStoreId");
      // Function to load all stores on view initialization
      const oComponent = this.getOwnerComponent();
      const oModel = oComponent.getModel("mainModel");


      // If the model is already available, proceed to load stores


      var oStoreModel = new JSONModel({ selectedStoreId: storedStoreId });
      this.getOwnerComponent().setModel(oStoreModel, "StoreModel");

      // Ensure StoreModel always updates localStorage
      oStoreModel.attachPropertyChange(function (oEvent) {
        if (oEvent.getParameter("path") === "/selectedStoreId") {
          var sNewStoreId = oEvent.getParameter("value");
          localStorage.setItem("selectedStoreId", sNewStoreId);
        }
      });
    },

      onhandleemployeedata:function(SModel){
        // var SModel = this.getOwnerComponent().getModel("SalesEmployeeModel");
      var Country = SModel.getProperty("/results/0/Land")
      console.log(Country)
      var country = new sap.ui.model.Filter("Country","EQ", Country);
      this.handleTransactionSalesData(country);
    },
  handleTransactionSalesData:function(filter1){
      var filters = new sap.ui.model.Filter([filter1],true);
      this.getView().byId("storeSelect").getBinding("items").filter(filters);
  },
    getBaseURL: function () {
      var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
      var appPath = appId.replaceAll(".", "/");
      var appModulePath = jQuery.sap.getModulePath(appPath);
      return appModulePath;
    },

    onNextPagePress: function () {

      var oModel = this.getOwnerComponent().getModel("SelectedBrandName");
      oModel.setData({ modelData: {} });
      oModel.updateBindings(true);
      var oComboBox = this.byId("storeSelect");

      if (!oComboBox) {
        console.error("ComboBox is not available.");
        return;
      }

      var oSelectedItem = oComboBox.getSelectedItem();

      if (!oSelectedItem) {
        sap.m.MessageToast.show("Please select a store.");
        return;
      }

      var oContext = oSelectedItem.getBindingContext("mainModel");

      if (oContext) {
        var sStoreId = oContext.getProperty("StoreId");
        var sStoreType = oContext.getProperty("StoreType");
        var oJsonModel = this.getView().getModel("StoreModel");
        if (oJsonModel) {
          oJsonModel.setProperty("/selectedStoreId", sStoreId);
          oJsonModel.setProperty("/selectedStoreType", sStoreType);
          // Save selectedStoreId to localStorage
          localStorage.setItem("selectedStoreId", sStoreId);

          var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter.navTo("brand", { SStoreId: sStoreId });
        } else {
          console.error("Store model not found.");
        }
      } else {
        console.error("Binding context is not available.");
      }
    }
  });
});
