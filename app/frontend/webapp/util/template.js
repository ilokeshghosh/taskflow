sap.ui.define(["sap/ui/core/Fragment", "sap/m/MessageBox", "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/FilterType",
    "sap/ui/model/Sorter",
    'sap/m/MessageToast',
], function (Fragment, MessageBox, JSONModel, Filter, FilterOperator, FilterType, Sorter, MessageToast) {
    "use strict";
    var _oController; //for access outside function scope
    return {
        init: function (oController) {
            _oController = oController;
        }
    }
});