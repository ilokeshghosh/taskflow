

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

        onListItemPress(oEvent) {
            var oList = this.byId("navItems");
            var aItems = oList.getItems();
            var aSelected = oList.getSelectedItems();

            var oBinding = this.getView().getModel().bindList("/Projects", null, null, [
                new sap.ui.model.Filter("name", "EQ", aSelected[0].getTitle())
            ]);

            this.getView().setBusy(true);

            oBinding.requestContexts().then(function (aContexts) {
                if (aContexts.length > 0) {
                    var oProjectData = aContexts[0].getObject();

                    // console.log("Project:",typeof aContexts[0].getObject());

                    this.getSplitAppObj().toDetail(this.createId("projectObject"));

                    this.getView().setModel(new JSONModel(oProjectData), "selectedProject")

                    this._loadAllTasks();
                    // this._loadSelectProjectTasks();

                    // console.log("selectedProject",this.getView().getModel("selectedProject").getData())

                    // this.getView().byId("projectObject").setTitle(oProjectData.name)

                    this.getView().setBusy(false);

                } else {
                    console.log("No project found");
                }
            }.bind(this));
            // console.log("getContexts", oModel.getMetadata());
            // console.log("oMOdel", oModel.getBoundContext());

            // console.log("aSelected",aSelected[0].getMetadata());
            // console.log("aSelected",aSelected[0].getTitle());

        },

        onFilterSelect() {
            console.log("hey there");
        },
        _loadAllTasks() {
            var oView = this.getView();
            var oCurrentProjectData = oView.getModel("selectedProject").getData();
            console.log("oCurrentProjectData", oCurrentProjectData.ID)
            var oBinding = oView.getModel().bindList("/Tasks", null, null, [
                new sap.ui.model.Filter("project_ID", "EQ", `${oCurrentProjectData.ID}`)
            ])
            var oProjectTasksData = []
            oBinding.requestContexts().then(function (aContexts) {
                if (aContexts.length > 0) {
                    // var oProjectTasksData = aContexts[0].getObject();
                    aContexts.forEach(element => {
                        oProjectTasksData.push(element.getObject())
                    });
                    // console.log("oProjectTaskData",oProjectTasksData);
                    oView.setModel(new JSONModel(oProjectTasksData), "selectedProjectTasks");

                    console.log("model", oView.getModel("selectedProjectTasks"))
                    this._setFilterSelectProjectTasks()

                } else {
                    console.log("No Tasks Found");
                }
            }.bind(this));
        },
        _setFilterSelectProjectTasks() {
            var oView = this.getView();
            var aAllProjectTasks = oView.getModel("selectedProjectTasks").getData();
            var aProjectOpenTasks = [];
            var aProjectHoldTasks = [];
            var aProjectCompletedTasks = [];
            var aProjectOverdueTasks = [];
            var aProjectOnreviewTasks = [];

            aAllProjectTasks.forEach(element => {
                switch (element.status) {
                    case "hold":
                        console.log("hold task", element);
                        aProjectHoldTasks.push(element);
                        break;
                    case "open" || "inProgress":
                        console.log("open task", element);
                        aProjectOpenTasks.push(element);
                        break;
                    case "completed":
                        console.log("completed task", element);
                        aProjectCompletedTasks.push(element);
                        break;
                    case "overdue":
                        console.log("overdue task", element);
                        aProjectOverdueTasks.push(element);
                        break;
                    case "onReview":
                        console.log("onReview task", element);
                        aProjectOnreviewTasks.push(element);
                        break;
                    default:
                        break;


                }
            })


            // console.log("aProjectOnreviewTasks",aProjectOnreviewTasks.length);
            // oView.setModel(new JSONModel(aProjectOpenTasks), "selectedProjectOpenTasks");
            oView.setModel(new JSONModel(aProjectOpenTasks.length >= 1 ? aProjectOpenTasks : [{ title: "NO TASKS ARE OPEN" }]), "selectedProjectOpenTasks");
            oView.setModel(new JSONModel(aProjectHoldTasks.length >= 1 ? aProjectHoldTasks : [{ title: "NO TASKS ON HOLD" }]), "selectedProjectHoldTasks");

            // oView.setModel(new JSONModel(aProjectCompletedTasks), "selectedProjectCompletedTasks");
            oView.setModel(new JSONModel(aProjectCompletedTasks.length >= 1 ? aProjectCompletedTasks : [{ title: "NO TASKS MARKED AS COMPLETED" }]), "selectedProjectCompletedTasks");


            // oView.setModel(new JSONModel(aProjectOverdueTasks), "selectedProjectOverdueTasks");
            oView.setModel(new JSONModel(aProjectOverdueTasks.length >= 1 ? aProjectOverdueTasks : [{ title: "NO TASKS ARE OVERDUE" }]), "selectedProjectOverdueTasks");


            // oView.setModel(new JSONModel(aProjectOnreviewTasks), "selectedProjectOnreviewTasks");
            oView.setModel(new JSONModel(aProjectOnreviewTasks.length >= 1 ? aProjectOnreviewTasks : [{ title: "NO TASKS ON REVIEW" }]), "selectedProjectOnreviewTasks");


            // console.log("aProjectOpenTasks",aProjectCompletedTasks);

        }

        //https://port4004-workspaces-ws-8ti3t.us10.trial.applicationstudio.cloud.sap/odata/v4/task/Tasks?$filter=project_ID%20eq%20%27P001%27

    });
});