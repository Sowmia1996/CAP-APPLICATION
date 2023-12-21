sap.ui.define(["sap/m/MessageBox", "sap/ui/model/json/JSONModel"], function (MessageBox, JSONModel) {
    "use strict";

    return {
        onChange: function (oEvent) {
            const sBookId = oEvent.getSource().getParent().getParent().getBindingContext().getProperty('ID')
            const iQuantity = oEvent.getParameters().value
            MessageBox.show(`Book id: ${sBookId} and quantity: ${iQuantity}}`)
            if (!this.oCartModel) {
                sap.ui.getCore().setModel(new JSONModel(), 'cart')
                this.oCartModel = sap.ui.getCore().getModel('cart')
                this.oCartModel.setData({orders: []})
            }
        }
    };
});