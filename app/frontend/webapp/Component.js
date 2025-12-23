sap.ui.define([
    "sap/ui/core/UIComponent",
    "com/taskflow/dev/frontend/model/models",
    "sap/ui/model/json/JSONModel",
], (UIComponent, models,JSONModel) => {
    "use strict";

    return UIComponent.extend("com.taskflow.dev.frontend.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // enable routing
            this.getRouter().initialize();
            // this._isNavExpanded = true;

            this._setCurrentUser()
            
        },

        async _setCurrentUser(){
            const response  = await fetch("/odata/v4/task/getcurrentUser");
            const currentUser = await response.json();
            console.log("data",currentUser)
            this.setModel(new JSONModel(currentUser),"currentUser");
        }
    });
});