sap.ui.define([], function () {
    "use strict";

    return {
        notEmpty: function(oEvent, oParams) {
            const { isInitial = false, oInput = oEvent.getSource() } = oParams || {};
            const isMandatory = oInput.getRequired();

            if (isMandatory) {
                const sValue = oInput.getValue();
                const sPreviousValue = oInput.getLastValue();
                if(!sValue) {
                    const sFieldLabel = oInput.getParent().getAggregation("label");
                    oInput.fireValidationError({
                        element: oInput,
                        property: isInitial ? null : "value",
                        message: isInitial ? null : `${sFieldLabel} is a mandatory field`
                    });
                    oInput.setLastValue("");
                } else if (sValue && !sPreviousValue) {
                    oInput.fireValidationSuccess({element: oInput, property: "value"})
                }
            }
        }
    }
})