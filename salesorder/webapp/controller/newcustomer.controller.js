sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageBox",
  "sap/ui/core/routing/History",
], function (Controller, MessageToast, JSONModel, History, MessageBox) {
  "use strict";


  return Controller.extend("com.luxasia.salesorder.controller.newcustomer", {
    onInit: function () {
      var aModel = this.getOwnerComponent().getModel("CustomerNoModel")
      this.getView().setModel(aModel, "CustomerNoModel");
      var oDatePicker = this.byId("datePickerId");
      var oOwnerComponent = this.getOwnerComponent();
      if (oOwnerComponent) {
        // Your logic using the component reference goes here
      } else {
        console.error("Owner component not found.");
      }
      // Create a model for the date value and set the format options
      var oModel = new sap.ui.model.json.JSONModel({
        dateValue: new Date() // Initialize with current date or your desired initial date
      });
      oDatePicker.setModel(oModel);

      // Define the binding path for the DatePicker value property
      oDatePicker.bindProperty("value", {
        path: "/dateValue",
        type: new sap.ui.model.type.Date({
          pattern: "yyyy-MM-dd"
        })
      });
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

      // var oModel = this.getOwnerComponent().getModel("BrandStoreModel");
      // console.log(oModel);

      this.oRouter = this.getOwnerComponent().getRouter();
      var oOwnerComponent = this.getOwnerComponent();
      var oStoreModel = oOwnerComponent.getModel("StoreModel");

      if (oStoreModel) {
        var selectedStoreId = oStoreModel.getProperty("/selectedStoreId");

        if (selectedStoreId) {
          console.log("Selected Store ID found:", selectedStoreId);
        } else {
          console.log("Selected Store ID not found.");
        }
      } else {
        console.error("StoreModel not found.");
      }
      // Initialize the JSON model for CSRF token

    
    
    },
    getRouter: function () {
      return UIComponent.getRouterFor(this);
    },
    Onroutetotranspage: function () {
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      var oCustomerNoModel = this.getView().getModel("CustomerNoModel");

      if (!oCustomerNoModel || !oCustomerNoModel.getProperty("/Firstnames") || oCustomerNoModel.getProperty("/Firstnames").length === 0) {
        // CustomerNo not found or empty array, display a message or take necessary action
        // For example, show a message and prevent navigation
        sap.m.MessageBox.error("Customer No not found. Please create a new customer and try again.", {
          onClose: function () {
            // Handle the action when the message box is closed
            // For example, stay on the current page or navigate elsewhere
          }
        });
      } else {
        // CustomerNo found in the model, proceed with navigation
        oRouter.navTo("transaction");
      }
    },

    onCreateProfile: function () {
      var that = this;

      var datePicker = this.getView().byId("datePickerId");
      var selectedDate = datePicker.getDateValue();
      var milliseconds = selectedDate.getTime();
      var formattedDat = '/Date(' + milliseconds + ')/';
      var postalCode = this.getView().byId("pcode").getValue();
      var oModel = that.getOwnerComponent().getModel("SalesEmployeeModel")

      var oData = oModel.getProperty("/");
      if (oData && oData.results && oData.results.length > 0) {
        var EmployeeId = oModel.getProperty("/results/0/Pernr");
        // Use the value of 'yourProperty' as needed

      } else {
        console.error("No data available in the model or at the specified index.");
      }
      var oStoreModel = this.getOwnerComponent().getModel("StoreModel");
      var sStoreId = oStoreModel.getProperty("/selectedStoreId");

      var selectedCountryKey = this.getView().byId("country").getSelectedKey();
      var selectedCountryCodeText = this.getView().byId("countrycode").getSelectedItem().getText();
      var payload = {
        "Gender": "1",
        "SalesOrg": "",
        "TitleP": this.getView().byId("title").getSelectedKey() ? this.getView().byId("title").getSelectedItem().getText() : "",
        "Firstname": this.getView().byId("fname").getValue(),
        "Lastname": this.getView().byId("lname").getValue(),
        "Middlename": "",  // Assuming Middle Name is same as Last Name
        "Secondname": "Second name",
        "City": this.getView().byId("city").getValue(),
        "District": "",
        "PostlCod1": postalCode,
        "PostlCod2": "",
        "PoBox": "",
        "PoBoxCit": "",
        "Street": this.getView().byId("street1").getValue(),
        "HouseNo": "10",
        "Building": "12A",
        "Floor": "1",
        "RoomNo": "",
        "Country": selectedCountryKey,
        "Countryiso": "",
        "Region": "",
        "Tel1Numbr": this.getView().byId("phoneno").getValue(),
        "Tel1Ext": selectedCountryCodeText,
        "FaxNumber": "",
        "FaxExtens": "",
        "EMail": this.getView().byId("email").getValue(),
        "LanguP": "EN",
        "LangupIso": "",
        "Currency": "SGD",
        "CurrencyIso": "",
        "TitleKey": "",
        "OnlyChangeComaddress": true,
        "Katr1": "",
        "Katr2": "",
        "Katr3": "",
        "Katr4": "",
        "Katr5": "",
        "Katr6": "",
        "Katr7": "",
        "Katr8": "Y",
        "CustomerNo": "",
        "Dob": formattedDat,
        "SalesEmp": EmployeeId,
        "StoreId": sStoreId,
      };
      var oBusyDialog = new sap.m.BusyDialog({
        title: "Creating New Customer",
        text: "Please wait...."
    });
    oBusyDialog.open();
      this.getOwnerComponent().getModel("mainModel").create("/CustomerSet", payload, {

        success: function (data) {
               var custno = data.CustomerNo;

                var oCustomerNoModel = that.getView().getModel("CustomerNoModel");

                // Check if the model exists; if not, create a new JSON model and set it to the view
                if (!oCustomerNoModel) {
                  oCustomerNoModel = new sap.ui.model.json.JSONModel();
                  that.getView().setModel(oCustomerNoModel, "CustomerNoModel");
                }

                // Get existing array or initialize it if it doesn't exist
                var aCustomerFirstnames = oCustomerNoModel.getProperty("/Firstnames") || [];

                // Add the retrieved customerNo directly to the Firstnames array
                if (custno) {
                  aCustomerFirstnames.push(custno); // Pushing CustomerNo into the array
                }

                // Set the modified array back to the model under /Firstnames property
                oCustomerNoModel.setProperty("/Firstnames", aCustomerFirstnames);


                // Set the modified array back to the model under /Firstnames property
                oCustomerNoModel.setProperty("/Firstnames", aCustomerFirstnames);
                // Show a MessageBox with customer number
                sap.m.MessageBox.success("Record successfully created\nCustomer No: " + custno, {
                  onClose: function () {
                    oBusyDialog.close();
                    if (oCustomerNoModel) {
                      oCustomerNoModel.setProperty(pathToSet, customerNumber); // Set the property at the specified path
                    } else {
                      console.error("CustomerNoModel not found.");
                    }
                  }

                });
              } ,




        error: function (error) {
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
  });
});
