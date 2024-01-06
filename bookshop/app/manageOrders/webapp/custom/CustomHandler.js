sap.ui.define(["sap/m/MessageBox", "sap/ui/core/Fragment", "sap/ui/model/Filter", "sap/ui/model/json/JSONModel"], function (MessageBox, Fragment, Filter, JSONModel) {
    "use strict";

    const beforeOpenDialog = (oEvent, oParams) => {
        const {sRowBindingPath, oBindingContext, sConfirmDialogId, oTemplate} = oParams;
        const oOrdersList = Fragment.byId(sConfirmDialogId, "orderItemsList");
        oOrdersList.bindAggregation("items", {
            path: `${sRowBindingPath}/orderItems`,
            template: oTemplate
        });
        const oStatusText = Fragment.byId(sConfirmDialogId, "statusField");
        oStatusText.setBindingContext(oBindingContext)
        const oTotalText = Fragment.byId(sConfirmDialogId, "total");
        oTotalText.setBindingContext(oBindingContext)
        const oCurrencyText = Fragment.byId(sConfirmDialogId, "currency");
        oCurrencyText.setBindingContext(oBindingContext)
        const ocancelOrderBtn = Fragment.byId(sConfirmDialogId, "cancelOrderBtn");
        ocancelOrderBtn.setBindingContext(oBindingContext)
    }

    return {
        onCancelOrderPress: async function(oEvent) {
            const oOrdersListPage = sap.ui.getCore().byId("manageOrders::OrdersList");
            const oBindingContext = oEvent.getSource().getParent().getParent().getBindingContext();
            const sRowBindingPath = oEvent.getSource().getParent().getParent().getBindingContextPath();
            if (!this.confirmationDialog) {
                this.confirmationDialogId = `${oOrdersListPage.getId()}-ConfirmDialog`;
                this.confirmationDialog = await Fragment.load({
                    id: this.confirmationDialogId,
                    name: "manageOrders.custom.CancelOrderConfirmDialog"
                });
                this.oTemplate = Fragment.byId(this.confirmationDialogId, "orderItemsList").removeItem(0);
                oOrdersListPage.addDependent(this.confirmationDialog);
            }
            const oParams = {
                sRowBindingPath,
                oBindingContext,
                sConfirmDialogId: this.confirmationDialogId,
                oTemplate: this.oTemplate
            }
            this.confirmationDialog.attachBeforeOpen(oParams ,beforeOpenDialog);
            this.confirmationDialog.open();
            this.confirmationDialog.detachBeforeOpen(beforeOpenDialog);
        },

        submit: async function (oEvent) {
            // Call the bound action
            const oModel = oEvent.getSource().getParent().getParent().getModel()
            const orderId = oEvent.getSource().getBindingContext().getObject().ID;
            const spath = `/Orders(${orderId})/ManageOrders.cancelOrder(...)`;
            const oActionODataContextBinding = oModel.bindContext(spath);
            await oActionODataContextBinding.execute();
            const {acknowledge, message} = oActionODataContextBinding.getBoundContext().getObject();
            MessageBox.show(
                acknowledge, {
                    icon: MessageBox.Icon.SUCCESS,
                    title: message
                }
            );
            oEvent.getSource().getParent().close();
            oEvent.getSource().getParent().getModel().refresh();
        },
         
        cancel: function (oEvent) {
            oEvent.getSource().getParent().close();
        }
    };
});