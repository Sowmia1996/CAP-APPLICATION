sap.ui.define([
    "sap/ui/layout/form/FormContainer",
    "sap/ui/layout/form/FormElement",
    "sap/m/Input",
    "sap/m/RatingIndicator",
    "sap/m/TextArea",
    "./validators"
], 
function (FormContainer, FormElement, Input, RatingIndicator, TextArea, validators) {
    "use strict";

    const createTitleElement = function () {
        const oTitleElement = new FormElement({label: "Title"});
        const oTitleInput = new Input({
            value: "{title}",
            required: {
                path: "title##@com.sap.vocabularies.Common.v1.FieldControl/$EnumMember",
                formatter: (annotation) => annotation === "com.sap.vocabularies.Common.v1.FieldControlType/Mandatory"
            }
        });
        oTitleInput.attachLiveChange(validators.notEmpty);
        oTitleInput.attachChange(validators.notEmpty);
        oTitleInput.attachModelContextChange(attachInitialValidation);
        oTitleElement.addField(oTitleInput);
        return oTitleElement;
    }

    const createRatingElement = function () {
        const oRatingElement = new FormElement({label: "Rating"});
        const oRatingInput = new RatingIndicator({
            value: "{rating}",
            maxValue: 5
        });
        oRatingElement.addField(oRatingInput);
        return oRatingElement;
    }

    const createReviewCommentElement = function () {
        const oCommentElement = new FormElement({ label: "Comment"});
        const oCommentinput = new TextArea({
            value: "{text}",
            required: {
                path: "title##@com.sap.vocabularies.Common.v1.FieldControl/$EnumMember",
                formatter: (annotation) => annotation === "com.sap.vocabularies.Common.v1.FieldControlType/Mandatory"
            }
        });
        oCommentinput.attachLiveChange(validators.notEmpty);
        oCommentinput.attachChange(validators.notEmpty);
        oCommentinput.attachModelContextChange(attachInitialValidation);
        oCommentElement.addField(oCommentinput);
        return oCommentElement;
    }
     const attachInitialValidation = function (oEvent) {
        const oInput = oEvent.getSource();
        const requiredBinding = oInput.getBinding("required");
        if (requiredBinding) {
            requiredBinding.detachChange(validators.notEmpty);
            requiredBinding.attachChange({oInput, isInitial: true}, validators.notEmpty);
        }
     }

    return () => {
        const oContainerTemplate = new FormContainer();
        const oTitleElement = createTitleElement();
        const oRatingElement = createRatingElement();
        const oCommentElement = createReviewCommentElement();
        oContainerTemplate.addFormElement(oTitleElement);
        oContainerTemplate.addFormElement(oRatingElement);
        oContainerTemplate.addFormElement(oCommentElement);
        return oContainerTemplate;
    }
})
