sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    // "com/taskflow/dev/frontend/util/projectHelper.js",
    "com/taskflow/dev/frontend/util/projectHelper",
    "com/taskflow/dev/frontend/util/taskHelper",
    "com/taskflow/dev/frontend/model/formatter"
], (Controller, Fragment, JSONModel, projectHelper, taskHelper, formatter) => {
    "use strict";


    return Controller.extend("com.taskflow.dev.frontend.controller.Home", {
        formatter: formatter,
        onInit() {

            this.getSplitAppObj().setHomeIcon({
                'phone': 'phone-icon.png',
                'tablet': 'tablet-icon.png',
                'icon': 'desktop.ico'
            });

            this.oFragmentModel = new JSONModel({
                key: "home"
            })
            this.getView().setModel(this.oFragmentModel, "fragmentModel");
            this._openHomeFragment({ key: "home" });


            this._setSplitAppMode();



        },

        onAfterRendering() {
            projectHelper.init(this);
            taskHelper.init(this);



            // console.log("model data",this.getView().getModel().bindList("/Projects"));
        },

        getSplitAppObj: function () {
            var result = this.byId("taskflowLadingPage");
            if (!result) {
                Log.info("SplitApp object can't be found");
            }
            return result;
        },
        onNavSelect(oEvent) {
            var sNavItemKey = oEvent.getParameters("items")['item'].getKey()

            this.getView().byId("heroLoadArea").setBusy(true);
            this._openHomeFragment({ key: sNavItemKey });

        },
        _openHomeFragment(oData) {
            var oView = this.getView();
            this.oFragmentModel.setData(oData);
            var sNavItemKey = oData.key;
            // console.log("htye",sNavItemKey);

            if (this._userFormDialog) {
                console.log("item already exists");

                oView.byId("heroLoadArea").destroyItems();

            }

            if (!this._userFormDialog) {
                this._loadFragment(sNavItemKey);
            } else {
                oView.byId("heroLoadArea").destroyItems();

                this._loadFragment(sNavItemKey);
            }

            this._userFormDialog.then((oFragment) => {

                oView.byId("heroLoadArea").addItem(oFragment);
                this.getView().byId("heroLoadArea").setBusy(false);
            })
        },

        _loadFragment(sNavItemKey) {
            var oView = this.getView();
            this._userFormDialog = Fragment.load({
                id: oView.getId(),
                name: `com.taskflow.dev.frontend.view.fragments.${sNavItemKey}`,
                controller: this
            }).then(function (oFragment) {
                oView.addDependent(oFragment);
                return oFragment;
            })
        },
        handleOpenCreateProjectDialog() {

            projectHelper.handleCreateProject();
        },

        handleOpenCreateTaskDialog() {
            taskHelper.handleCreateTask();
        },

        // split app

        onNavItemPress(oEvent) {
            var sToPageId = oEvent.getParameter("listItem").getCustomData()[0].getValue();

            this.getSplitAppObj().toDetail(this.createId(sToPageId));
        },
        onPressGoToProjectsMaster() {
            this.getSplitAppObj().toMaster(this.createId("projects"));
        },
        onPressMasterBack() {
            this.getSplitAppObj().backMaster();
        },
        _setSplitAppMode() {
            this.getSplitAppObj().setMode("ShowHideMode");
        },
        onHamburgerPress: function () {
            var oSplitApp = this.getSplitAppObj();
    // Toggle between showing and hiding the master pane
    var isMasterVisible = oSplitApp.getMode() !== "HideMode";
    
    if (isMasterVisible) {
        oSplitApp.setMode("HideMode");
    } else {
        oSplitApp.setMode("ShowHideMode");
    }

        },



    });
});