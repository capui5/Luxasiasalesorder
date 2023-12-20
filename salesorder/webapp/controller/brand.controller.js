sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/BusyDialog"
], function (Controller, JSONModel, Filter, FilterOperator, BusyDialog) {
  "use strict";

  return Controller.extend("com.luxasia.salesorder.controller.brand", {
    onInit: function () {
      var oStoreModel = this.getOwnerComponent().getModel("StoreModel");
    
      var SModel = this.getOwnerComponent().getModel("SalesEmployeeModel");
      this.getView().setModel(sModel, "SalesEmployeeModel" )
      var sModel = this.getOwnerComponent().getModel("mainModel");
      var sStoreId = oStoreModel.getProperty("/selectedStoreId");
      var oModel = this.getOwnerComponent().getModel("LoginUserModel");
      this.getView().setModel(oModel, "LoginUserModel" ) // Replace "userDataModel" with your actual model name
if (oModel) {
    var email = oModel.getProperty("/email");
    console.log("Email:", email);
} else {
    console.error("User Data Model not found.");
}
      
      // var sEmail = 'christintan@luxasia.com';

      // sModel.read("/SalesEmployees", {
      //   urlParameters: {
      //     StoreId: "'" + sStoreId + "'",
      //     Email: "'" + email + "'"
      //   },
      //   success: function (odata) {
      //     SModel.setData(odata);
         
      //   },
      //   error: function (error) {
      //     // Handle errors here
      //     console.error("Error:", error);
      //   }
      // });
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

      oRouter.getRoute("brand").attachMatched(this._onRouteMatched, this);



      var oModel = this.getOwnerComponent().getModel("BrandStoreModel");
      this.getView().setModel(oModel, "BrandStoreModel");

      var aModel = this.getOwnerComponent().getModel("SelectedBrandName");
      this.getView().setModel(aModel, "SelectedBrandName");
    },
    _onRouteMatched: function (oEvent) {
      var that =this;
      var oArgs = oEvent.getParameter("arguments");
      var sStoreId = oArgs.SStoreId;
      this.sStoreId = sStoreId;
      if (sStoreId) {
        var oModel = this.getOwnerComponent().getModel("mainModel");
        // var oJsonModel = new sap.ui.model.json.JSONModel();
        var oJsonModel = this.getView().getModel("BrandStoreModel");
        var oBusyDialog = new BusyDialog({
          title: "Loading Brands",
          text: "Please wait...."
        });
        oBusyDialog.open();
        var oFilter = new Filter("StoreId", FilterOperator.EQ, sStoreId);
        var that = this;
        oModel.read("/BrandSet", {
          filters: [oFilter],
          success: function (response) {
          
            oBusyDialog.close();
            oJsonModel.setData(response.results);
            that.getView().setModel(oJsonModel, "BrandStoreModel");
           


          },
          error: function (error) {
            oBusyDialog.close();
          }
        });
        var filter1 = new sap.ui.model.Filter("storeID","EQ",this.sStoreId);
        var filter2 = new sap.ui.model.Filter("email","EQ",this.getOwnerComponent().getModel("SalesEmployeeModel").oData.results[0].Email);
        var filters = new sap.ui.model.Filter([filter1,filter2],true);
        var oModel = new sap.ui.model.odata.ODataModel("/odata/v4/data-model/", true);  
        var url = "/BRANDS?$filter=storeID eq '"  + this.sStoreId + "' and email eq '"  +  this.getOwnerComponent().getModel("SalesEmployeeModel").oData.results[0].Email + "'"; 
        oModel.read(url,{
          //filters:[filters],
          success:function(oData,oResponse){
            var brandsData = JSON.parse(oResponse.body).value;
            var brandsDataArr = [];
            for(var m = 0; m <brandsData.length;m++){
              brandsDataArr.push({
                email : brandsData[m].email,
                Brand_Id : brandsData[m].BRANDID,
                value : brandsData[m].BrandDESC
                
              });
            }
           var oModel = that.getView().getModel("SelectedBrandName");
           var aSelectedBrands = oModel.getProperty("/selectedBrandNames");
           oModel.setProperty("/selectedBrandNames", brandsDataArr);
          },
          error:function(oData){
            console.log(oData);
          }
        });

      } else {
        console.error("Store ID is not available.");
      }
    },

    onAddButtonPress: function (oEvent) {
      var oModel = this.getView().getModel("SelectedBrandName");
      var oSelectedBrand = oEvent.getSource().getBindingContext("BrandStoreModel").getObject();
      var sBrandId = oSelectedBrand.BrandId;
      var sBrandName = oSelectedBrand.BrandDesc;

      var aSelectedBrands = oModel.getProperty("/selectedBrandNames") || [];

      var exists = aSelectedBrands.some(function (brand) {
        return brand.Brand_Id === sBrandId; // Check based on Brand_Id
      });

      if (exists) {
        // Show error message as the item is already selected
        sap.m.MessageToast.show("Brand already selected.");
      } else {
        // Add the item to selected brands if it doesn't exist
        aSelectedBrands.push({ Brand_Id: sBrandId, value: sBrandName });
        oModel.setProperty("/selectedBrandNames", aSelectedBrands);

        // Save the updated selected brands to local storage
        localStorage.setItem("selectedBrands", JSON.stringify(aSelectedBrands));
        //this.onAddServiceCall();
      }
    },
    onAddServiceCall : function(evt){
      var that = this;
      var oModel = new sap.ui.model.odata.ODataModel("/odata/v4/data-model/", true);  
      var url = "/USERS(Email='" + this.getOwnerComponent().getModel("SalesEmployeeModel").oData.results[0].Email + "',sID='" + this.sStoreId + "')"; 
      var selectedBrandNames = this.getView().getModel("SelectedBrandName").getData().selectedBrandNames;
      var brandsArr=[];
      for(var m=0;m<selectedBrandNames.length;m++){
        brandsArr.push({
          "email": selectedBrandNames[m].email,
          "BRANDID": selectedBrandNames[m].Brand_Id,
          "BrandDESC": selectedBrandNames[m].value

        });
      }
      var payload = {
        "brands": brandsArr
      };
      oModel.update(url, payload,{
        //filters:[filters],
        success:function(oData,oResponse){
          var brandsData = JSON.parse(oResponse.body).value;
        },
        error:function(oData){
          console.log(oData);
        }
      });
    },


    // Login: function () {
    //   var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
    //   var oModel = this.getView().getModel("myData");

    //   // Ensure the model and the property containing selected brands are defined
    //   if (oModel && oModel.getProperty("/selectedBrandNames")) {
    //     var aSelectedBrands = oModel.getProperty("/selectedBrandNames");

    //     if (Array.isArray(aSelectedBrands) && aSelectedBrands.length > 0) {
    //       var aBrandIds = aSelectedBrands.map(function (brand) {
    //         return brand.id;
    //       });

    //       oRouter.navTo("mainmenu", { brandIds: aBrandIds });
    //     } else {
    //       console.error("No brands selected.");

    //     }
    //   } else {
    //     console.error("Model or selected brands property not found.");

    //   }
    // }
    Login: function () {
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      var oModel = this.getView().getModel("SelectedBrandName");
      var aSelectedBrands = oModel.getProperty("/selectedBrandNames");

      if (!aSelectedBrands || aSelectedBrands.length === 0) {
        // Show an error message if no brands are selected
        sap.m.MessageToast.show("Please select brands.");
      } else {
        // Navigate to "mainmenu" route and pass the selected brands as parameters
        oRouter.navTo("mainmenu", {
          selectedBrands: aSelectedBrands
        });
        this.onAddServiceCall();
      }
    },
    onDeletePress: function (oEvent) {
      var oButton = oEvent.getSource();
      var oListItem = oButton.getParent().getParent(); // Adjust the level according to your structure
      var oBindingContext = oListItem.getBindingContext("SelectedBrandName");
      var sPath = oBindingContext.getPath();
      var iIndex = parseInt(sPath.split("/")[sPath.split("/").length - 1]);

      var oModel = this.getView().getModel("SelectedBrandName");
      var aSelectedBrands = oModel.getProperty("/selectedBrandNames");

      aSelectedBrands.splice(iIndex, 1); // Remove the item from the array

      oModel.setProperty("/selectedBrandNames", aSelectedBrands);
      localStorage.setItem("selectedBrands", JSON.stringify(aSelectedBrands)); // Update local storage
    }
  });
});
