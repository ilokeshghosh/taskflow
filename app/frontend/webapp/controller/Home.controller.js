sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "com/taskflow/dev/frontend/util/projectHelper",
    "com/taskflow/dev/frontend/util/taskHelper",
    "com/taskflow/dev/frontend/model/formatter",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "com/taskflow/dev/frontend/util/userHelper"
], (Controller, Fragment, JSONModel, projectHelper, taskHelper, formatter, MessageBox, MessageToast, userHelper) => {
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
            this._setSplitAppMode();

            
        },

        // Loading up Project & Task Helper Utils
        onAfterRendering() {
            projectHelper.init(this);
            taskHelper.init(this);
            userHelper.init(this);
            this._tester();
            this.getOwnerComponent().setCurrentUser();

           
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
        // Project Master Page Navigation
        onListItemPress(oEvent) {
            
            var oList = this.byId("navItems");
            var aItems = oList.getItems();
            var aSelected = oList.getSelectedItems();

            var oBinding = this.getView().getModel().bindList("/Projects", null, null, [
                new sap.ui.model.Filter("name", "EQ", aSelected[0].getTitle())
            ],
                {
                    $expand: {
                        members: {
                            $count: true,

                        },
                        client: true,
                        tasks: {
                            $count: true
                        },
                        manager: true

                    }
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
            ],
            {
                $expand:'assignedTo'
            }
            )
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
                    press: this.onChangeStatus.bind(this),
                    visible: "{= ${currentUser>/roles/0}==='manager'}"
                })

                // TO BE IMPLEMENTED || marked as completed action item
                var item3 = new sap.m.StandardListItem({
                    title: "Marked as Completed",
                    type: sap.m.ListType.Active,
                    icon: "sap-icon://activity-2",
                    press: this.onMarkedAsCompleted.bind(this),
                    visible: "{= ${currentUser>/roles/0}==='manager'}"
                })

                // TO BE IMPLEMENTED || put on hold action item
                var item4 = new sap.m.StandardListItem({
                    title: "Put on Hold",
                    type: sap.m.ListType.Active,
                    icon: "sap-icon://pause",
                    press: this.onPutOnHold.bind(this),
                    visible: "{= ${currentUser>/roles/0}==='manager'}"
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
            // this._pDialog=undefined;
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
                    press: this.onEditTask.bind(this),


                })


                // TO BE IMPLEMENTED || marked as completed quick action item
                var item2 = new sap.m.StandardListItem({
                    title: "Marked as Completed",
                    type: sap.m.ListType.Active,
                    icon: "sap-icon://activity-2",
                    press: this.onTaskMarkedAsCompleted.bind(this),

                })

                // TO BE IMPLEMENTED || change due date quick action item
                var item3 = new sap.m.StandardListItem({
                    title: "Change Due Date",
                    type: sap.m.ListType.Active,
                    icon: "sap-icon://future",
                    press: this.onTaskChangeDueDate.bind(this),

                })

                // TO BE IMPLEMENTED || change priority quick action item
                var item4 = new sap.m.StandardListItem({
                    title: "Change Priority",
                    type: sap.m.ListType.Active,
                    icon: "sap-icon://high-priority",
                    press: this.onTaskChangePriority.bind(this),

                })

                // TO BE IMPLEMENTED || archive task quick action item
                var item5 = new sap.m.StandardListItem({
                    title: "Archive Task",
                    type: sap.m.ListType.Active,
                    icon: "sap-icon://fallback",
                    press: this.onTaskArchive.bind(this),

                })


                // TO BE IMPLEMENTED ||  delete task quick action item
                var item6 = new sap.m.StandardListItem({
                    title: "Delete Task",
                    type: sap.m.ListType.Active,
                    icon: "sap-icon://delete",
                    press: this.onDeleteTask.bind(this),

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

            taskHelper.handleSelectedTaskSorter();
        },
        onSelectedTasksFilter() {
            taskHelper.handleSelectedTaskFilter();
        },
        getModelData(modelName) {

            if (modelName) {
                return this.getView().getModel(modelName);
            }
        },

        // user event handlers

        onAvatarPress(oEvent) {
            userHelper.handleAvatar(oEvent);
        },
        onHandleNotification(oEvent) {
            var oPressedItem = oEvent.getSource();

            var oView = this.getView();

            if (!this._oPopoverNotification) {
                // var oList = new sap.m.List({
                //     inset:false
                // })


                // var item1 = new sap.m.ObjectListItem({
                //     title:"something is here"
                // });


                // oList.addItem(item1);


                // this._oPopoverNotification = new sap.m.Popover({
                //     title:"Notification Box",
                //     placement:sap.m.PlacementType.Right,
                //     content:[oList]
                // })

                // this.getView().addDependent(this._oPopoverNotification);

                var oNotificationData = []

                const sUserId = this.getView()
                    .getModel("currentUser")
                    .getProperty("/ID");

                var oBinding = oView.getModel().bindList("/AuditLog", null, null, [
                    new sap.ui.model.Filter("adminId_ID", "EQ", `${sUserId}`),

                ],
                    {
                        $expand: {
                            projectId: {
                                $select: ["ID", "name"]
                            },
                            userId: {
                                $select: ["ID", "email"]
                            },
                            taskId: {
                                $select: ["ID", "title"]
                            }
                        }
                    }
                )

                oBinding.requestContexts().then((aContexts) => {
                    if (aContexts.length > 0) {

                        aContexts.forEach(async (element) => {
                            const oNotification = element.getObject();
                            // let sProjectName;
                            this._getProjectName(element.getObject().projectId_ID).then(names => {
                                oNotification.projectName = names[0];

                            })
                            // oNotification.projectName=sProjectName[0];
                            // const sChangedBy = 

                            oNotificationData.push(element.getObject())
                        });

                        // set local model for selected project tasks
                        oView.setModel(new JSONModel(oNotificationData), "notifications");

                        // Call function that filter all project according to the status
                        // this._setFilterSelectProjectTasks()

                    } else {
                        MessageToast.show("No New Notification Found")
                    }
                })

                this._oPopoverNotification = Fragment.load({
                    id: oView.getId(),
                    name: "com.taskflow.dev.frontend.view.fragments.notification",
                    controller: this
                }).then(function (oPopover) {

                    oView.addDependent(oPopover);
                    return oPopover;
                })
            }

            this._oPopoverNotification.then((oPopover) => {
                // oPopover.openBy(oPressedItem)
                oPopover.open()

                // recipient_ID
                // var oBindingAllNotification = this.getView().byId("allNotificationsList").getBinding("items");

                // var ID = this.getView()
                //     .getModel("currentUser")
                //     .getProperty("/ID")

                // oBindingAllNotification.filter([new sap.ui.model.Filter("recipient_ID", "EQ", ID)]);
                
                this._applyFilterNotification();

                // this._updateNotificationCount();

                this.getView().setModel(new JSONModel({
                    all: 0,
                    unread: 0,
                    highPriority: 0,
                    archived: 0
                }), "notificationCount");

                // Then load actual counts
                this._updateNotificationCount();

               

            });
        },
        onCloseNotification() {
            this.getView().byId("notificationPopover").close();
        },
        _getProjectName(projectID) {
            let sProjectName = [];
            var oView = this.getView();
            var oBinding = oView.getModel().bindList("/Projects", null, null, [
                new sap.ui.model.Filter("ID", "EQ", `${projectID}`)
            ])

            return oBinding.requestContexts().then((aContexts) => {
                if (aContexts.length > 0) {
                    return aContexts.map(element => {

                        // sProjectName.push();
                        return element.getObject().name;

                    });


                    // set local model for selected project tasks
                    // oView.setModel(new JSONModel(oNotificationData), "notifications");

                    // Call function that filter all project according to the status
                    // this._setFilterSelectProjectTasks()

                } else {
                    // MessageBox.error("No New Notification Found")
                }
            })


        },

        onHandleOnboardMember() {
            userHelper.handleOnboardMember();
        },
        onHandleDeleteMember(oEvent) {
            userHelper.handleDeleteMember(oEvent);
        },
        _tester() {

            // userHelper._setOnboardingBusy(true);

        },

        onListUpdateFinished: function (oEvent) {
            var oList = oEvent.getSource();
            var aItems = oList.getItems();

            aItems.forEach(function (oItem) {
                var oContext = oItem.getBindingContext();

                if (!oContext) return;

                var isRead = oContext.getProperty("isRead");
                var oText = oItem.findElements(true).find(function (oControl) {
                    return oControl.isA("sap.m.Text");
                });

                if (oText) {
                    oText.addStyleClass("genericStyle");
                    if (isRead) {

                        oText.addStyleClass("notifRead");
                        oText.removeStyleClass("notifUnRead");
                    } else {
                        oText.addStyleClass("notifUnRead");
                        oText.removeStyleClass("notifRead");

                    }

                }
            });
        },
        onSelectSortButton(oEvent) {
            this.byId("allNotificationsList").setBusy(true)

            const sSorterKey = this.byId("notificationSorter").getSelectedKey();
            const oListBinding = this.byId("allNotificationsList").getBinding("items");


            if (sSorterKey === "priority") {
                oListBinding.sort([
                    new sap.ui.model.Sorter('priority', false)
                ])


                MessageToast.show("Notification Sorted by Priority", {
                    animationTimingFunction: "linear"
                })
            } else if (sSorterKey === "date") {
                oListBinding.sort([
                    new sap.ui.model.Sorter('createdAt', true)
                ])

                MessageToast.show("Notification Sorted by Date", {
                    animationTimingFunction: "linear"
                })
            } else if (sSorterKey === "type") {
                oListBinding.sort([
                    new sap.ui.model.Sorter('type', true)
                ])

                MessageToast.show("Notification Sorted by Type", {
                    animationTimingFunction: "linear"
                })
            }

            this.byId("allNotificationsList").setBusy(false);
            // allNotificationsList
        },

        //set read/unread
        onHandleChangeStatus(oEvent) {
            const oBindingData = oEvent.getSource().getParent().getParent().getParent().getBindingContext();

            // oBindingData.setProperty()
            const bPreviousIsRead = oBindingData.getProperty("isRead");
            var sSetStatus;

            if (bPreviousIsRead) {
                oBindingData.setProperty("isRead", false);
                oBindingData.setProperty("readAt", null);
                sSetStatus = "Marked as Unread"
            } else {
                oBindingData.setProperty("isRead", true);
                oBindingData.setProperty("readAt", new Date().toISOString());
                sSetStatus = "Marked as Read"
            }


            // var oModel = this.getView().getModel("Notifications");

            // oBindingData.refresh();

            oBindingData.getBinding().getModel().submitBatch("$auto").then(() => {
                // const oList = this.byId("allNotificationsList");
                // oList.getBinding("items").refresh();
                this._refreshAllNotifications();
                this._updateNotificationCount();


                MessageToast.show(sSetStatus);
            })




        },

        onHandleArchiveNotification(oEvent) {
            const oBindingData = oEvent.getSource().getParent().getParent().getParent().getBindingContext();

            var sSetStatus;

            const bIsArchived = oBindingData.getProperty("isArchived");

            if (bIsArchived) {
                MessageToast.show("Already Archived");
                return;
            } else {
                oBindingData.setProperty("isArchived", true);
                oBindingData.setProperty("archivedAt", new Date().toISOString());
                sSetStatus = "Archived";

            }


            oBindingData.getBinding().getModel().submitBatch("$auto").then(() => {

                // const oList = this.byId("allNotificationsList");
                // oList.getBinding("items").refresh();

                this._refreshAllNotifications();
                this._updateNotificationCount();


                MessageToast.show(sSetStatus);
            })
        },
        onHandleDismissNotification(oEvent) {
            const oBindingData = oEvent.getSource().getParent().getParent().getParent().getBindingContext();

            const bIsDismissed = oBindingData.getProperty("isDismissed");


            var sSetStatus;


            if (bIsDismissed) {
                MessageToast.show("Already Dismissed");
                return;
            } else {
                oBindingData.setProperty("isDismissed", true);
                oBindingData.setProperty("dismissedAt", new Date().toISOString());
                sSetStatus = "Dismissed";

            }


            oBindingData.getBinding().getModel().submitBatch("$auto").then(() => {
                // const oList = this.byId("allNotificationsList");
                // oList.getBinding("items").refresh();

                this._refreshAllNotifications();
                this._updateNotificationCount();

                MessageToast.show(sSetStatus);
            })

        },

        onMarkAllRead(oEvent) {

            const aBindingData = oEvent.getSource().getParent().getParent().getItems();


            // const bPreviousIsRead = oBindingData.getProperty("isRead");
            var sSetStatus;


            aBindingData.forEach((item) => {
                const oItemBindingContext = item.getBindingContext();
                oItemBindingContext.setProperty("isRead", true)
                oItemBindingContext.setProperty("readAt", new Date().toISOString());

            })
            sSetStatus = "All Notification are Marked as Read"
            const oList = this.byId("unreadNotificationsList");
            // oList.getBinding("items").refresh();
            // MessageToast.show(sSetStatus);


            oList.getBinding("items").getModel().submitBatch("$auto").then(() => {
                // const oList = this.byId("unreadNotificationsList");
                // oList.getBinding("items").refresh();

                this._refreshAllNotifications();
                this._updateNotificationCount();


                MessageToast.show(sSetStatus);
            })



        },
        _refreshAllNotifications() {
            const aNotificationTables = ["allNotificationsList", "unreadNotificationsList", "highPriorityNotificationsList", "archivedNotificationsList"];

            aNotificationTables.forEach(item => {
                const oList = this.byId(item);
                oList.getBinding("items").refresh();
            })
        },

        _applyFilterNotification() {
            var sUserID = this.getView()
                .getModel("currentUser")
                .getProperty("/ID")
            const aNotificationTables = ["allNotificationsList", "unreadNotificationsList", "highPriorityNotificationsList", "archivedNotificationsList"];

            aNotificationTables.forEach(item => {
                var oBindingAllNotification = this.getView().byId(item).getBinding("items");
                oBindingAllNotification.filter([new sap.ui.model.Filter("recipient_ID", "EQ", sUserID)]);

            })


        },
        onClearAllArchived(oEvent) {
            const aBindingData = oEvent.getSource().getParent().getParent().getItems();
            var sSetStatus;


            aBindingData.forEach((item) => {
                const oItemBindingContext = item.getBindingContext();
                oItemBindingContext.setProperty("isArchived", false)
                oItemBindingContext.setProperty("archivedAt", null);

            })

            sSetStatus = "All Notification are Moved from Archive";

            const oList = this.byId("archivedNotificationsList");

            oList.getBinding("items").getModel().submitBatch("$auto").then(() => {
                // const oList = this.byId("unreadNotificationsList");
                // oList.getBinding("items").refresh();

                this._refreshAllNotifications();
                this._updateNotificationCount();


                MessageToast.show(sSetStatus);
            })
        },

        onRestoreNotification(oEvent) {
            const oBindingData = oEvent.getSource().getParent().getParent().getParent().getBindingContext();

            const bIsArchived = oBindingData.getProperty("isArchived");

            var sSetStatus;
            
            if (bIsArchived) {
                oBindingData.setProperty("isArchived", false);
                oBindingData.setProperty("archivedAt", null);
                sSetStatus = "Restored";
                
            } else {
                MessageToast.show("Notification already Restored");
                return;
            }
            

            
            oBindingData.getBinding().getModel().submitBatch("$auto").then(() => {
                this._refreshAllNotifications();
                this._updateNotificationCount();
                this.byId("archivedNotificationsList").getBinding("items").refresh();
                
                MessageToast.show(sSetStatus);
            }).catch((oError) => {
            MessageToast.show("Failed to restore notification");
           
        });


        },
        _updateNotificationCount() {

            var sUserID = this.getView()
                .getModel("currentUser")
                .getProperty("/ID")

            var oNotificationList = this.getView().getModel().bindList("/Notifications")

            oNotificationList.filter([
                new sap.ui.model.Filter("recipient_ID", "EQ", sUserID)
            ]);

            oNotificationList.requestContexts().then((aContexts) => {

                if (aContexts.length > 0) {
                    var oNotificationCount = {
                        all: 0,
                        unread: 0,
                        highPriority: 0,
                        archived: 0
                    }


                    var aAllNotification = aContexts.filter((context) => context.getObject().isArchived === false && context.getObject().isDismissed === false);

                    var aUnread = aContexts.filter((context) => context.getObject().isRead === false && context.getObject().isArchived === false && context.getObject().isDismissed === false);


                    var aHighPriority = aContexts.filter((context) => context.getObject().priority === "HIGH" && context.getObject().isArchived === false && context.getObject().isDismissed === false);

                    var aArchived = aContexts.filter((context) => context.getObject().isArchived === true && context.getObject().isDismissed === false)


                    oNotificationCount.all = aAllNotification.length;
                    oNotificationCount.unread = aUnread.length;
                    oNotificationCount.highPriority = aHighPriority.length;
                    oNotificationCount.archived = aArchived.length;

                   


                    this.getView().setModel(new JSONModel(oNotificationCount), "notificationCount");



                }
            })



        },

        onNotificationPress(oEvent) {


            var oItem = oEvent.getSource();
            var oContext = oItem.getBindingContext();


            // Load fragment if not loaded
            if (!this._notificationDetailDialog) {
                this._notificationDetailDialog = Fragment.load({
                    id: this.getView().getId(),
                    name: "com.taskflow.dev.frontend.view.fragments.NotificationDetail",
                    controller: this
                }).then(function (oDialog) {

                    this.getView().addDependent(oDialog);

                    return oDialog;



                }.bind(this));
            }


            this._notificationDetailDialog.then(oDialog => {
                oDialog.open();
                oDialog.bindElement(oContext.getPath());
                this._loadNotificationDetail(oContext);
                this._oContextBinding = oContext;
                oContext.setProperty("isRead", true);
                oContext.setProperty("readAt", new Date().toISOString());

                oEvent.getSource().getBindingContext().getBinding().getModel().submitBatch("$auto").then(() => {
                    // const oList = this.byId("allNotificationsList");
                    // oList.getBinding("items").refresh();

                    this._refreshAllNotifications();
                    this._updateNotificationCount();


                    MessageToast.show("Marked as Read");
                })
            })
            // else {
            //     this._notificationDetailDialog.bindElement({
            //         path: oContext.getPath(),
            //         parameters: {
            //             $expand: "recipient,actor,project,task"
            //         }
            //     });
            //     this._notificationDetailDialog.open();


            // }


            // Mark as read
            // oContext.setProperty("isRead", true);
            // oContext.setProperty("readAt", new Date().toISOString());
            // this.onHandleChangeStatus(oEvent);



            // this._refreshAllNotifications();
            // this._updateNotificationCount();
        },
        onBackToNotificationList: function () {
            var oDialog = this.getView().byId("notificationDetailDialog");
            if (oDialog) {
                oDialog.close();
                oDialog.unbindElement();  // Clear the binding context
            }

        },

        onCloseNotificationDetail: function () {
            var oDialog = this.getView().byId("notificationDetailDialog");
            if (oDialog) {
                oDialog.close();
                oDialog.unbindElement();  // Clear the binding context
            }

        },

        onToggleReadStatus: function (oEvent) {
            var oContext = this._notificationDetailDialog.getBindingContext();
            var bIsRead = oContext.getProperty("isRead");

            oContext.setProperty("isRead", !bIsRead);
            oContext.setProperty("readAt", !bIsRead ? new Date().toISOString() : null);

            this._refreshAllNotifications();
            this._updateNotificationCount();

            MessageToast.show(bIsRead ? "Marked as Unread" : "Marked as Read");
        },

        onArchiveNotification: function () {
            var oContext = this._oContextBinding;

            oContext.setProperty("isArchived", true);
            oContext.setProperty("archivedAt", new Date().toISOString());

            oContext.getBinding().getModel().submitBatch("$auto").then(() => {
                this._refreshAllNotifications();
                this._updateNotificationCount();

                MessageToast.show("Notification archived");

            })

            // this._updateNotificationCount();
            // this._refreshAllNotifications();
            this.onCloseNotificationDetail();

        },


        onDismissNotification: function () {
            var oContext = this._oContextBinding;

            oContext.setProperty("isDismissed", true);
            oContext.setProperty("dismissedAt", new Date().toISOString());

            oContext.getBinding().getModel().submitBatch("$auto").then(() => {
                this._refreshAllNotifications();
                this._updateNotificationCount();

                MessageToast.show("Notification Dismissed");

            })


            this.onCloseNotificationDetail();


        },

        _loadNotificationDetail(oContext) {
            var oNotificationData = oContext.getObject()
            var isProjectAvailable = oNotificationData.project;
            var isTaskAvailable = oNotificationData.task


            var projectLabel = this.getView().byId("projectLabel");
            var projectNameLink = this.getView().byId("projectNameLink");

            if (isProjectAvailable) {
                projectLabel.setProperty("visible", true);
                projectNameLink.setProperty("visible", true);
            }


            var taskLabel = this.getView().byId("taskLabel");
            var taskNameLink = this.getView().byId("taskNameLink");

            if (isTaskAvailable) {
                taskLabel.setProperty("visible", true);
                taskNameLink.setProperty("visible", true);
            } else {
                taskLabel.setProperty("visible", false);
                taskNameLink.setProperty("visible", false);
            }


            var readAtLabel = this.getView().byId("readAtLabel");
            var readAtText = this.getView().byId("readAtText");
            if (oNotificationData.readAt) {
                readAtLabel.setProperty("visible", true);
                readAtText.setProperty("visible", true);
            } else {
                readAtLabel.setProperty("visible", false);
                readAtText.setProperty("visible", false);
            }


            var archiveLabel = this.getView().byId("archiveLabel");
            var archiveText = this.getView().byId("archiveText");
            if (oNotificationData.archivedAt) {
                archiveLabel.setProperty("visible", true);
                archiveText.setProperty("visible", true);
            } else {
                archiveLabel.setProperty("visible", false);
                archiveText.setProperty("visible", false);
            }


        }




    });
});