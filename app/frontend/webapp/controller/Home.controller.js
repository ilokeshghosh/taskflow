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

            // this.oFragmentModel = new JSONModel({
            //     key: "home"
            // })
            // this.getView().setModel(this.oFragmentModel, "fragmentModel");
            // this._openHomeFragment({ key: "home" });


            this._setSplitAppMode();



        },

        // Loading up Project & Task Helper Utils
        onAfterRendering() {
            projectHelper.init(this);
            taskHelper.init(this);
        },

        // Return the SplitApp object
        getSplitAppObj: function () {
            var result = this.byId("taskflowLadingPage");
            if (!result) {
                Log.info("SplitApp object can't be found");
            }
            return result;
        },

        // Open Create Project Dialog
        handleOpenCreateProjectDialog() {
            projectHelper.handleCreateProject();
        },

        // Open Task Dialog
        handleOpenCreateTaskDialog() {
            taskHelper.handleCreateTask();
        },

        // split app navigation method
        onNavItemPress(oEvent) {
            var sToPageId = oEvent.getParameter("listItem").getCustomData()[0].getValue();
            // create Detailed Page ID dynamically and go to detail page (using custom:to)
            this.getSplitAppObj().toDetail(this.createId(sToPageId));
        },
        onPressGoToProjectsMaster() {
            // create Master Page ID dynamically and go to master page using
            this.getSplitAppObj().toMaster(this.createId("projects"));
        },
        // Back to Master Navigation Page from Projects Master Page
        onPressMasterBack() {
            this.getSplitAppObj().backMaster();
        },
        // split app mode
        _setSplitAppMode() {
            this.getSplitAppObj().setMode("ShowHideMode");
        },
        // onHamburgerPress: function () {
        //     var oSplitApp = this.getSplitAppObj();
        //     // Toggle between showing and hiding the master pane
        //     var isMasterVisible = oSplitApp.getMode() !== "HideMode";
        //     if (isMasterVisible) {
        //         oSplitApp.setMode("HideMode");
        //     } else {
        //         oSplitApp.setMode("ShowHideMode");
        //     }

        // },

        // Project Master Page Navigation
        onListItemPress(oEvent) {
            var oList = this.byId("navItems");
            var aItems = oList.getItems();
            var aSelected = oList.getSelectedItems();

            var oBinding = this.getView().getModel().bindList("/Projects", null, null, [
                new sap.ui.model.Filter("name", "EQ", aSelected[0].getTitle())
            ],
                {
                    $expand: "members,client"
                }

            );

            // this.getView().setBusy(true);


            oBinding.requestContexts().then(function (aContexts) {
                if (aContexts.length > 0) {
                    var oProjectData = aContexts[0].getObject();
                    // Navigate to Project Detailed Page
                    this.getSplitAppObj().toDetail(this.createId("projectObject"));

                    this.getView().setModel(new JSONModel(oProjectData), "selectedProject")
                    // Loading all project Specific Task
                    this._loadAllTasks();
                    this.getView().setBusy(false);

                } else {
                    MessageBox.error("No project found")
                }
            }.bind(this));
        },
        // Load Task for Selected Project
        _loadAllTasks() {
            var oView = this.getView();
            // Fetch Data of Selected Project
            var oCurrentProjectData = oView.getModel("selectedProject").getData();

            // Get all Task Related to the selected project
            var oBinding = oView.getModel().bindList("/Tasks", null, null, [
                new sap.ui.model.Filter("project_ID", "EQ", `${oCurrentProjectData.ID}`)
            ])
            var oProjectTasksData = []
            oBinding.requestContexts().then(function (aContexts) {
                if (aContexts.length > 0) {

                    aContexts.forEach(element => {
                        oProjectTasksData.push(element.getObject())
                    });
                    // set local model for selected project tasks
                    oView.setModel(new JSONModel(oProjectTasksData), "selectedProjectTasks");

                    // Call function that filter all project according to the status
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

            // set model for open tasks
            oView.setModel(new JSONModel(aProjectOpenTasks.length >= 1 ? aProjectOpenTasks : [{ title: "NO TASKS ARE OPEN" }]), "selectedProjectOpenTasks");

            // set model for hold tasks
            oView.setModel(new JSONModel(aProjectHoldTasks.length >= 1 ? aProjectHoldTasks : [{ title: "NO TASKS ON HOLD" }]), "selectedProjectHoldTasks");

            // set model for completed tasks
            oView.setModel(new JSONModel(aProjectCompletedTasks.length >= 1 ? aProjectCompletedTasks : [{ title: "NO TASKS MARKED AS COMPLETED" }]), "selectedProjectCompletedTasks");

            // set model for overdue tasks
            oView.setModel(new JSONModel(aProjectOverdueTasks.length >= 1 ? aProjectOverdueTasks : [{ title: "NO TASKS ARE OVERDUE" }]), "selectedProjectOverdueTasks");


            // set model for review tasks
            oView.setModel(new JSONModel(aProjectOnreviewTasks.length >= 1 ? aProjectOnreviewTasks : [{ title: "NO TASKS ON REVIEW" }]), "selectedProjectOnreviewTasks");

        },
        // open quick action menu in projects page 
        onQuickActionMenuPress(oEvent) {
            var oButton = oEvent.getSource();
            var oSelectedProjectData = oButton.getBindingContext().getObject();
            console.log("0. Debug", oSelectedProjectData);
            this.getView().setModel(new JSONModel(oSelectedProjectData), "DialogSelectedProject")

            if (!this._oPopover) {

                var oList = new sap.m.List({
                    inset: false
                });

                // project Details action item
                var item1 = new sap.m.StandardListItem({
                    title: "Project Details",
                    type: sap.m.ListType.Active,
                    icon: "sap-icon://document-text",
                    press: this.onLoadProjectDetails.bind(this)
                })

                // TO BE IMPLEMENTED || change status action item
                var item2 = new sap.m.StandardListItem({
                    title: "Change Status",
                    type: sap.m.ListType.Active,
                    icon: "sap-icon://future",
                    press: this.onChangeStatus.bind(this)
                })

                // TO BE IMPLEMENTED || marked as completed action item
                var item3 = new sap.m.StandardListItem({
                    title: "Marked as Completed",
                    type: sap.m.ListType.Active,
                    icon: "sap-icon://activity-2",
                    press: this.onMarkedAsCompleted.bind(this)
                })

                // TO BE IMPLEMENTED || put on hold action item
                var item4 = new sap.m.StandardListItem({
                    title: "Put on Hold",
                    type: sap.m.ListType.Active,
                    icon: "sap-icon://pause",
                    press: this.onPutOnHold.bind(this)
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
        // open project object page dialog
        onLoadProjectDetails(oEvent) {
            var oView = this.getView();

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
                // set dialog model for selected project data
                oDialog.setModel(this.getView().getModel("DialogSelectedProject"), "selectedProject");
                this.getView().setModel(this.getView().getModel("DialogSelectedProject"), "selectedProject")
                // load all project specific task
                this._loadAllTasks();
                oDialog.open();
                this.getView().setBusy(false);
            })
        },
        onChangeStatus() {
            projectHelper.handleChangeStatus();
            // console.log("onChangeStatus");

        },
        onMarkedAsCompleted() {
            projectHelper.handleProjectMarkedAsCompleted();
        },
        onPutOnHold() {
            projectHelper.handleProjectPutonHold()
        },
        // close dialog
        onCloseDialog() {
            this.byId("projectObjectDialog").close();
        },
        // Task quick action button (on all task page)
        onPressTaskCard(oEvent) {
            var oButton = oEvent.getSource();
            // set the context for the selected task for later use
            this._selectedTask = oButton.getBindingContext();

            if (!this._oPopoverTask) {
                var oList = new sap.m.List({
                    inset: false
                })

                // TO BE IMPLEMENTED || edit task quick action item
                var item1 = new sap.m.StandardListItem({
                    title: "Edit Task",
                    type: sap.m.ListType.Active,
                    icon: "sap-icon://edit",
                    press: this.onEditTask.bind(this)
                })


                // TO BE IMPLEMENTED || marked as completed quick action item
                var item2 = new sap.m.StandardListItem({
                    title: "Marked as Completed",
                    type: sap.m.ListType.Active,
                    icon: "sap-icon://activity-2",
                    press: this.onTaskMarkedAsCompleted.bind(this)
                })

                // TO BE IMPLEMENTED || change due date quick action item
                var item3 = new sap.m.StandardListItem({
                    title: "Change Due Date",
                    type: sap.m.ListType.Active,
                    icon: "sap-icon://future",
                    press: this.onTaskChangeDueDate.bind(this)
                })

                // TO BE IMPLEMENTED || change priority quick action item
                var item4 = new sap.m.StandardListItem({
                    title: "Change Priority",
                    type: sap.m.ListType.Active,
                    icon: "sap-icon://high-priority",
                    press: this.onTaskChangePriority.bind(this)
                })

                // TO BE IMPLEMENTED || archive task quick action item
                var item5 = new sap.m.StandardListItem({
                    title: "Archive Task",
                    type: sap.m.ListType.Active,
                    icon: "sap-icon://fallback",
                    press: this.onTaskArchive.bind(this)
                })


                // TO BE IMPLEMENTED ||  delete task quick action item
                var item6 = new sap.m.StandardListItem({
                    title: "Delete Task",
                    type: sap.m.ListType.Active,
                    icon: "sap-icon://delete",
                    press: this.onDeleteTask.bind(this)
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
        // edit task quick action item's function
        onEditTask() {
            var oView = this.getView();
            // open edit task Fragment (dialog)
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
                // bind(element binding) the select task details 
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
                    // creating a local edit model for editing 'assigned to' as we can't directly update data in Odata V4 from select option.
                    var oEditModel = new JSONModel({
                        ID: oData.assignedTo.ID,
                        name: oData.assignedTo.name
                    });

                    this.getView().setModel(oEditModel, "editTaskLocal");

                })
            })
        },
        onTaskMarkedAsCompleted() {
            taskHelper.handleTaskMarkedAsCompleted();
        },
        onTaskChangeDueDate() {
            taskHelper.handleTaskDueDate();
        },
        onTaskChangePriority() {
            taskHelper.handleTaskChangePriority();
        },
        onTaskArchive() {
            taskHelper.handleTaskArchive();
        },
        onDeleteTask() {
            taskHelper.handleTaskDelete();
        },
        // close edit task function
        onCloseEditTaskDialog() {
            this.getView().byId("EditTaskDialog").close();
        },
        // submit edited task function
        onSubmitEditTask() {
            this.getView().setBusy(true);

            var oDialog = this.byId("EditTaskDialog");
            var oContext = oDialog.getBindingContext();
            // fetching user selected data of 'assign to field'
            var sNewUserID = this.getView().byId("taskEditClientInputAssigne").getSelectedKey();
            // Update the managed foreign key property
            oContext.setProperty("assignedTo_ID", sNewUserID);


            // submit the batch for save all changes
            this.getView().getModel().submitBatch("$auto").then(() => {
                MessageBox.success("Task Updated");
                this.getView().getModel().refresh(); // refresh the model to reload all the data after changes
                this.getView().setBusy(false);
                this.getView().byId("EditTaskDialog").close(); //close the dialog after saving the updated task data
            }).catch((err) => {
                MessageBox.error("Update Failed", err);
            })

        },

        onSearchProjects() {
            this.getView().byId("projectCardContainer").setBusy(true);
            var sValue = this.getView().byId("projectSearchField").getValue().trim();
            console.log("sValue", sValue);
            projectHelper.searchProject(sValue);

        },
        onSorterContainerOpen(oEvt) {
            projectHelper.handleSorterContainerOpen(oEvt);
        },
        onParseP13nState(oEvt) {
            projectHelper.parseP13nState(oEvt);
        },
        onSearch() {
            projectHelper.handleProjectFilter();

        },
        onSearchTasks() {
            // taskHelper.handleLoadState(true);
            taskHelper.handleSearchTask();
            // taskHelper.handleSearchCompletedTask();
        },
        onTasksSorter() {
            taskHelper.handleTasksSort();
        },
        onTasksFilter() {

            taskHelper.handleTasksFilter();
        },
        onSelectedSearchTasks() {

            taskHelper.handleSelectedSearchTask();
        },
        onSelectedTasksSorter() {
            console.log('Task Sorter Invoked')
            taskHelper.handleSelectedTaskSorter();
        },
        onSelectedTasksFilter() {
            taskHelper.handleSelectedTaskFilter();
        },
        getModelData(modelName) {
            console.log("1. Debug");
            if (modelName) {
                return this.getView().getModel(modelName);
            }
        }


    });
});