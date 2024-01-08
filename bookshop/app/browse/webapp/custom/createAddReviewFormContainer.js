sap.ui.define([
    "sap/ui/layout/form/FormContainer",
    "sap/ui/layout/form/FormElement",
    "sap/m/Input",
    "sap/m/RatingIndicator",
    "sap/m/TextArea"
], 
function (FormContainer, FormElement, Input, RatingIndicator, TextArea) {
    "use strict";

    const createTitleElement = function () {
        const oTitleElement = new FormElement({label: "Title"});
        const oTitleInput = new Input({value: "{title}"});
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
        const oCommentinput = new TextArea({ value: "{text}" });
        oCommentElement.addField(oCommentinput);
        return oCommentElement;
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
