sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "com/taskflow/dev/frontend/util/projectHelper",
    "com/taskflow/dev/frontend/util/taskHelper",
    "com/taskflow/dev/frontend/model/formatter",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], (Controller, Fragment, JSONModel, projectHelper, taskHelper, formatter, MessageBox, MessageToast) => {
    "use strict";


    return Controller.extend("com.taskflow.dev.frontend.controller.Home", {
        // initialize formatter
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
            if (this._userFormDialog) {
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
                    this.getSplitAppObj().toDetail(this.createId("projectObject"));

                    this.getView().setModel(new JSONModel(oProjectData), "selectedProject")

                    this._loadAllTasks();
                    this.getView().setBusy(false);

                } else {
                    MessageBox.error("No project found")
                }
            }.bind(this));
        },

        onFilterSelect() {
            // console.log("hey there");
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

                    aContexts.forEach(element => {
                        oProjectTasksData.push(element.getObject())
                    });

                    oView.setModel(new JSONModel(oProjectTasksData), "selectedProjectTasks");


                    this._setFilterSelectProjectTasks()

                } else {
                    MessageBox.error("No Tasks Found")
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
                        aProjectHoldTasks.push(element);
                        break;
                    case "open" || "inProgress":
                        aProjectOpenTasks.push(element);
                        break;
                    case "completed":
                        aProjectCompletedTasks.push(element);
                        break;
                    case "overdue":
                        aProjectOverdueTasks.push(element);
                        break;
                    case "onReview":
                        aProjectOnreviewTasks.push(element);
                        break;
                    default:
                        break;


                }
            })

            oView.setModel(new JSONModel(aProjectOpenTasks.length >= 1 ? aProjectOpenTasks : [{ title: "NO TASKS ARE OPEN" }]), "selectedProjectOpenTasks");
            oView.setModel(new JSONModel(aProjectHoldTasks.length >= 1 ? aProjectHoldTasks : [{ title: "NO TASKS ON HOLD" }]), "selectedProjectHoldTasks");

            oView.setModel(new JSONModel(aProjectCompletedTasks.length >= 1 ? aProjectCompletedTasks : [{ title: "NO TASKS MARKED AS COMPLETED" }]), "selectedProjectCompletedTasks");

            oView.setModel(new JSONModel(aProjectOverdueTasks.length >= 1 ? aProjectOverdueTasks : [{ title: "NO TASKS ARE OVERDUE" }]), "selectedProjectOverdueTasks");


            oView.setModel(new JSONModel(aProjectOnreviewTasks.length >= 1 ? aProjectOnreviewTasks : [{ title: "NO TASKS ON REVIEW" }]), "selectedProjectOnreviewTasks");

        },
        onQuickActionMenuPress(oEvent) {
            var oButton = oEvent.getSource();
            console.log("oButton", oButton.getBindingContext().getObject());

            var oSelectedProjectData = oButton.getBindingContext().getObject();
            this.getView().setModel(new JSONModel(oSelectedProjectData), "DialogSelectedProject")

            if (!this._oPopover) {

                var oList = new sap.m.List({
                    inset: false
                });

                var item1 = new sap.m.StandardListItem({
                    title: "Project Details",
                    type: sap.m.ListType.Active,
                    icon: "sap-icon://document-text",
                    press: this.onLoadProjectDetails.bind(this)
                })

                var item2 = new sap.m.StandardListItem({
                    title: "Change Status",
                    type: sap.m.ListType.Active,
                    icon: "sap-icon://future",
                    press: this.onChangeStatus
                })

                var item3 = new sap.m.StandardListItem({
                    title: "Marked as Completed",
                    type: sap.m.ListType.Active,
                    icon: "sap-icon://activity-2",
                    press: this.onMarkedAsCompleted
                })

                var item4 = new sap.m.StandardListItem({
                    title: "Put on Hold",
                    type: sap.m.ListType.Active,
                    icon: "sap-icon://pause",
                    press: this.onPutOnHold
                })

                oList.addItem(item1);
                oList.addItem(item2);
                oList.addItem(item3);
                oList.addItem(item4);

                this._oPopover = new sap.m.Popover({
                    title: "Project Action",
                    placement: sap.m.PlacementType.Left,
                    content: [oList]

                });
                this.getView().addDependent(this._oPopover);

            }

            this._oPopover.openBy(oButton);
        },
        onLoadProjectDetails(oEvent) {
            var oView = this.getView();
            console.log("oEvent", oView.getModel());;

            this.getView().setBusy(true);

            if (!this._pDialog) {
                this._pDialog = Fragment.load({
                    id: oView.getId(),
                    name: "com.taskflow.dev.frontend.view.fragments.projects.projectObject",
                    controller: this
                }).then((oDialog) => {
                    oView.addDependent(oDialog);
                    return oDialog;
                })
            }

            this._pDialog.then((oDialog) => {
                oDialog.setModel(this.getView().getModel("DialogSelectedProject"), "selectedProject");
                this.getView().setModel(this.getView().getModel("DialogSelectedProject"), "selectedProject")
                this._loadAllTasks();
                oDialog.open();
                this.getView().setBusy(false);
            })
        },
        onChangeStatus() {
            // console.log("onChangeStatus");

        },
        onMarkedAsCompleted() {
            // console.log("onMarkedAsCompleted");
        },
        onPutOnHold() {
            // console.log("onPutOnHold");
        },
        onCloseDialog() {
            this.byId("projectObjectDialog").close();
        },

        onPressTaskCard(oEvent) {
            var oButton = oEvent.getSource();
            this._selectedTask = oButton.getBindingContext();

            if (!this._oPopoverTask) {
                var oList = new sap.m.List({
                    inset: false
                })

                var item1 = new sap.m.StandardListItem({
                    title: "Edit Task",
                    type: sap.m.ListType.Active,
                    icon: "sap-icon://edit",
                    press: this.onEditTask.bind(this)
                })



                var item2 = new sap.m.StandardListItem({
                    title: "Marked as Completed",
                    type: sap.m.ListType.Active,
                    icon: "sap-icon://activity-2",
                    // press: this.onTaskMarkedAsCompleted
                })

                var item3 = new sap.m.StandardListItem({
                    title: "Change Due Date",
                    type: sap.m.ListType.Active,
                    icon: "sap-icon://future",
                    // press: this.onTaskChangeDueDate
                })

                var item4 = new sap.m.StandardListItem({
                    title: "Change Priority",
                    type: sap.m.ListType.Active,
                    icon: "sap-icon://high-priority",
                    // press: this.onTaskChangePriority
                })

                var item5 = new sap.m.StandardListItem({
                    title: "Archive Task",
                    type: sap.m.ListType.Active,
                    icon: "sap-icon://fallback",
                    // press: this.onTaskArchive
                })



                var item6 = new sap.m.StandardListItem({
                    title: "Delete Task",
                    type: sap.m.ListType.Active,
                    icon: "sap-icon://delete",
                    press: this.onPutOnHold
                })



                oList.addItem(item1);
                oList.addItem(item2);
                oList.addItem(item3);
                oList.addItem(item4);
                oList.addItem(item5);
                oList.addItem(item6);

                this._oPopoverTask = new sap.m.Popover({
                    title: "Task Quick Action",
                    placement: sap.m.PlacementType.Left,
                    content: [oList]
                });

                this.getView().addDependent(this._oPopoverTask);
            }
            this._oPopoverTask.openBy(oButton);
        },
        onEditTask() {
            var oView = this.getView();
            if (!this._pTaskEditDialog) {
                this._pTaskEditDialog = Fragment.load({
                    id: oView.getId(),
                    name: "com.taskflow.dev.frontend.view.fragments.projects.editTask",
                    controller: this
                }).then((oDialog) => {
                    oView.addDependent(oDialog);
                    return oDialog;
                })
            }

            this._pTaskEditDialog.then(oDialog => {
                var sID = this._selectedTask.getObject().ID;
                oDialog.setBusy(true);
                oDialog.bindElement({
                    path: this._selectedTask.getPath(),
                    parameters: { $expand: "assignedTo,project" }
                })

                var oElementBinding = oDialog.getElementBinding();
                oElementBinding.attachEventOnce("dataReceived", (oEvent) => {
                    oDialog.setBusy(false);
                    oDialog.open();

                    var oContext = oElementBinding.getBoundContext();
                    var oData = oContext && oContext.getObject();

                    var oEditModel = new JSONModel({
                        ID: oData.assignedTo.ID,
                        name: oData.assignedTo.name
                    });

                    this.getView().setModel(oEditModel, "editTaskLocal");

                })
            })
        },
        onCloseEditTaskDialog() {
            this.getView().byId("EditTaskDialog").close();
        },
        onSubmitEditTask() {
            this.getView().setBusy(true);

            var oDialog = this.byId("EditTaskDialog");
            var oContext = oDialog.getBindingContext();

            var sNewUserID = this.getView().byId("taskEditClientInputAssigne").getSelectedKey();
            var oModel = this.getView().getModel();


            // Update the managed foreign key property
            oContext.setProperty("assignedTo_ID", sNewUserID);



            this.getView().getModel().submitBatch("$auto").then(() => {
                MessageBox.success("Task Updated");
                this.getView().getModel().refresh();
                this.getView().setBusy(false);
                this.getView().byId("EditTaskDialog").close();
            }).catch((err) => {
                MessageBox.error("Update Failed");
            })

        }


    });
});