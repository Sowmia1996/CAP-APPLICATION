sap.ui.define(["sap/m/MessageBox", "sap/ui/core/Fragment", "sap/ui/model/Filter", "sap/ui/model/json/JSONModel"], function (MessageBox, Fragment, Filter, JSONModel) {
    "use strict";

    return {
        onCancelOrderPress: function(oEvent) {
            this.getModel();
        }
    };
});