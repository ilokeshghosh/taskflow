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

            this.setCurrentUser();
            this.setcurrentUserSettings();
            
        },

        async setCurrentUser(){
            const response  = await fetch("/odata/v4/task/getcurrentUser");
            const currentUser = await response.json();
            
            this.setModel(new JSONModel(currentUser),"currentUser");
        },

        async setcurrentUserSettings(){
            const response  = await fetch("/odata/v4/task/getcurrentUserSettings");
            const currentUserSettings = await response.json();
            
            var sCurrentTheme = sap.ui.getCore().getConfiguration().getTheme();
            if(currentUserSettings.theme === "dark"){
                if(sCurrentTheme==="sap_horizon"){
                    sap.ui.getCore().applyTheme("sap_horizon_dark");
                }
            }else{
                if(sCurrentTheme==="sap_horizon_dark"){
                    sap.ui.getCore().applyTheme("sap_horizon");
                }
            }

            this.setModel(new JSONModel(currentUserSettings),"currentUserSettings");
        }

        
    });
});