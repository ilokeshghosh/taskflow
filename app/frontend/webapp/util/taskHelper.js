sap.ui.define(["sap/ui/core/Fragment", "sap/m/MessageBox", "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/FilterType",
    "sap/ui/model/Sorter",
    'sap/m/MessageToast',
], function (Fragment, MessageBox, JSONModel, Filter, FilterOperator, FilterType, Sorter, MessageToast) {
    "use strict";
    var _sorOrderAsc;
    var _selectTasksSortOrderAsc;
    var _oController; //for access outside function scope
    return {
        init: function (oController) {
            _oController = oController;
            // setup local model for task creation
            var sNewID = "TASK" + Date.now().toString().slice(-6);
            var oDate = new Date();
            var sNow = oDate.toISOString().split('T')[0];

            var oCreateTaskModel = new JSONModel({
                ID: sNewID,
                title: "",
                description: "",
                priority: "low",
                dueDate: sNow,
                assignedTo_ID: "",
                status: "open",
                project_ID: ""
            });
            _sorOrderAsc = true;
            _selectTasksSortOrderAsc = true;
            _oController.getView().setModel(oCreateTaskModel, "createTaskModel")
        },
        // open create project dialog to handle task creation
        handleCreateTask() {
            var oView = _oController.getView();

            if (!this._pDialog) {
                this._pDialog = Fragment.load({
                    id: oView.getId(),
                    name: "com.taskflow.dev.frontend.view.fragments.projects.createTask",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                }.bind(this))
            }
            this._pDialog.then(function (oDialog) {
                oDialog.open();
            })
        },
        // function ot handle task creation after submitting the form
        onCreateTaskSubmit() {
            var oInputTaskData = _oController.getView().getModel("createTaskModel").getData();

            var oModel = _oController.getView().getModel();
            var oBindingList = oModel.bindList("/Tasks");

            // fetch task priorty
            var sTaskCreateClientInputPriority = _oController.byId("taskCreateClientInputPriority").getSelectedItem().getKey();

            // fetch task assigne
            var sTaskCreateClientInputAssigne = _oController.byId("taskCreateClientInputAssigne").getSelectedItem().getKey();

            // fetch task status
            var sTaskCreateClientInputStatus = _oController.byId("taskCreateClientInputStatus").getSelectedItem().getKey();

            // fetch selected project for task
            var sTaskCreateClientInputProject = _oController.byId("taskCreateClientInputProject").getSelectedItem().getKey();



            oBindingList.create({
                ID: oInputTaskData.ID,
                title: oInputTaskData.title,
                description: oInputTaskData.description,
                assignedTo_ID: sTaskCreateClientInputAssigne,
                project_ID: sTaskCreateClientInputProject,
                priority: sTaskCreateClientInputPriority,
                status: sTaskCreateClientInputStatus,
                dueDate: oInputTaskData.dueDate
            })

            var oDate = new Date();
            var sNow = oDate.toISOString().split('T')[0];

            oModel.submitBatch("$auto").then(function () {
                MessageBox.success("Task Created Successfully");
                // reset the model after task creation
                var oCreateTaskModel = new JSONModel({
                    ID: "",
                    title: "",
                    description: "",
                    priority: "low",
                    dueDate: "",
                    assignedTo_ID: "",
                    status: "open",
                    project_ID: ""
                });

                _oController.getView().setModel(oCreateTaskModel, "createTaskModel")
                _oController.byId("createTaskDialog").close();
                oModel.refresh();
            })
        },
        // function for closing create task dialog
        _closeCreateTaskDialog() {
            _oController.byId("createTaskDialog").close();
        },
        // function for closing create task dialog ( when pressed cancel button )
        onCancelTaskProject() {
            this._closeCreateTaskDialog();
        },
        handleSearchTask() {
            var aTasksCardContainer = [
                { control: _oController.byId("holdTasksCardsContainer"), status: "hold" },
                { control: _oController.byId("openTasksCardsContainer"), status: "open" },
                { control: _oController.byId("completedTasksCardsContainer"), status: "completed" },
                { control: _oController.byId("overdueTasksCardsContainer"), status: "overdue" },
                { control: _oController.byId("onReviewTasksCardsContainer"), status: "onReview" },

            ]
            var otasksSearchField = _oController.byId("tasksSearchField");
            aTasksCardContainer.forEach(item => item.control.setBusy(true));

            var staskSearchFieldValue = otasksSearchField.getValue().trim();

            if (staskSearchFieldValue) {

                aTasksCardContainer.forEach(item => {
                    var aFilter = [];
                    aFilter.push(new Filter("status", FilterOperator.EQ, item.status));
                    aFilter.push(new Filter({
                        filters: [
                            new Filter("title", FilterOperator.Contains, staskSearchFieldValue),
                            new Filter("description", FilterOperator.Contains, staskSearchFieldValue),
                            new Filter("priority", FilterOperator.EQ, staskSearchFieldValue)
                        ],
                        and: false
                    }))
                    item.control.getBinding("items").filter(aFilter, FilterType.Application);
                })
            }

            aTasksCardContainer.forEach(item => item.control.setBusy(false));
        },
        handleTasksSort() {
            console.log("must check")
            var oOpenTasksCardsContainer = _oController.byId("openTasksCardsContainer");
            var aTasksCardContainer = [
                _oController.byId("openTasksCardsContainer"),
                _oController.byId("completedTasksCardsContainer"),
                _oController.byId("onReviewTasksCardsContainer"),
                _oController.byId("holdTasksCardsContainer"),
                _oController.byId("overdueTasksCardsContainer"),

            ]
            var aSorter = [new Sorter("dueDate", this._sorOrderAsc)]
            this._sorOrderAsc = !this._sorOrderAsc;
            console.log(this._sorOrderAsc ? "Ascending Order" : "Descending Order")
            // MessageToast.show("" + this._sorOrderAsc ? );
            MessageToast.show(`Tasks Sorted in ${this._sorOrderAsc ? "Ascending Order" : "Descending Order"}`)
            // var oSorter = new Sorter("dueDate",!_sorOrderAsc);
            // console.log("_sorOrderAsc",this._sorOrderAsc)

            aTasksCardContainer.forEach(item => {
                item.getBinding("items").sort(aSorter);
            })

        },
        handleTasksFilter() {

            var oValueMap = {
                oPriorityMap: {
                    "A": "high",
                    "B": "medium",
                    "C": "low"
                }

            }

            var aTasksCardContainer = [
                { control: _oController.byId("holdTasksCardsContainer"), status: "hold" },
                { control: _oController.byId("openTasksCardsContainer"), status: "open" },
                { control: _oController.byId("completedTasksCardsContainer"), status: "completed" },
                { control: _oController.byId("overdueTasksCardsContainer"), status: "overdue" },
                { control: _oController.byId("onReviewTasksCardsContainer"), status: "onReview" },

            ]


            var oPrioritySelect = _oController.byId("taskPrioritySelect");
            var sPiority = oPrioritySelect.getSelectedKey();


            if (sPiority) {
                if (sPiority === "X") {
                    this._resetFilter(aTasksCardContainer)
                } else {
                    aTasksCardContainer.forEach(ele => {
                        var aFilter = [];
                        aFilter.push(new Filter('status', FilterOperator.EQ, ele.status));
                        aFilter.push(new Filter('priority', FilterOperator.EQ, oValueMap.oPriorityMap[sPiority]));
                        ele.control.getBinding("items").filter(aFilter);
                    })
                }
            }

            // var oProjectCardContainer = _oController.byId("openTasksCardsContainer");
            // var oProjectCardBinding = oProjectCardContainer.getBinding("items");
            // oProjectCardBinding.filter(aFilter);
        },
        _resetFilter(aTasksCardContainer) {
            aTasksCardContainer.forEach(ele => {
                var aFilter = [];
                aFilter.push(new Filter('status', FilterOperator.EQ, ele.status));
                ele.control.getBinding("items").filter(aFilter);
            })
        },
        handleSelectedSearchTask() {

            var aFilter = []
            var oView = _oController.getView();
            var aSelectedProjectTasks = _oController.getView().getModel("selectedProjectTasks").getData()


            // var sSearchValue = _oController.byId("selectedTasksSearchInputField").getValue().trim();
            // projectTasksDialog
            var sSearchValue = Fragment.byId("projectTasksDialog", "selectedTasksSearchInputField")
            console.log("selectedTasksSearchInputField", sSearchValue)


            var aProjectOpenTasks = [];
            var aProjectHoldTasks = [];
            var aProjectCompletedTasks = [];
            var aProjectOverdueTasks = [];
            var aProjectOnreviewTasks = [];


            aSelectedProjectTasks.forEach(item => {
                if (item.title.toLowerCase().includes(sSearchValue.toLowerCase()) || item.description.toLowerCase().includes(sSearchValue.toLowerCase()) || item.priority === sSearchValue.toLowerCase()) {

                    switch (item.status) {
                        case "hold":
                            aProjectHoldTasks.push(item);
                            break;
                        case "open" || "inProgress":
                            aProjectOpenTasks.push(item);
                            break;
                        case "completed":
                            aProjectCompletedTasks.push(item);
                            break;
                        case "overdue":
                            aProjectOverdueTasks.push(item);
                            break;
                        case "onReview":
                            aProjectOnreviewTasks.push(item);
                            break;
                        default:
                            break;
                    }

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

                }
            })


            oView.getModel("selectedProjectOpenTasks").refresh();
            oView.getModel("selectedProjectHoldTasks").refresh()
            oView.getModel("selectedProjectCompletedTasks").refresh()
            oView.getModel("selectedProjectOverdueTasks").refresh()
            oView.getModel("selectedProjectOnreviewTasks").refresh()


        },

        handleSelectedTaskSorter() {
            var aSelectedProjectTasks = _oController.getView().getModel("selectedProjectTasks").getData();
            var oView = _oController.getView()
            console.log("selectedProjectsTasks", aSelectedProjectTasks);

            // var aselectedProjectOpenTasks = oView.getModel("selectedProjectOpenTasks").getData();
            // var aselectedProjectHoldTasks = oView.getModel("selectedProjectHoldTasks").getData();
            // var aselectedProjectCompletedTasks = oView.getModel("selectedProjectCompletedTasks").getData();
            // var aselectedProjectOverdueTasks = oView.getModel("selectedProjectOverdueTasks").getData();
            // var aselectedProjectOnreviewTasks = oView.getModel("selectedProjectOnreviewTasks").getData();


            console.log('Hanlder Function called on 1st click')
            this._taskSorterHelper("selectedProjectOpenTasks", _selectTasksSortOrderAsc);
            this._taskSorterHelper("selectedProjectHoldTasks", _selectTasksSortOrderAsc);
            this._taskSorterHelper("selectedProjectCompletedTasks", _selectTasksSortOrderAsc);
            this._taskSorterHelper("selectedProjectOverdueTasks", _selectTasksSortOrderAsc);
            this._taskSorterHelper("selectedProjectOnreviewTasks", _selectTasksSortOrderAsc);
            _selectTasksSortOrderAsc = !_selectTasksSortOrderAsc;

            // console.log("data", aSortedSelectedProjectOpenTask);


        },

        _taskSorterHelper(modelName, order) {

            var oView = _oController.getView();
            console.log("Helper Function Invoked on 1st click", _selectTasksSortOrderAsc);
            if (modelName && order !== null && order !== undefined) {
                var aselectedProjectTasks = oView.getModel(modelName).getData();
                var aSortedSelectedProjectTasks = aselectedProjectTasks.sort((a, b) => {
                    var dateA = new Date(a.dueDate);
                    var dateB = new Date(b.dueDate);
                    if (order) {
                        // this._selectTasksSortOrderAsc = !this._selectTasksSortOrderAsc;
                        MessageToast.show("Tasks Sorted in Asceding Order")
                        return dateA - dateB;
                    } else {
                        // this._selectTasksSortOrderAsc = !this._selectTasksSortOrderAsc;
                        MessageToast.show("Tasks Sorted in Descending Order")
                        return dateB - dateA;
                    }
                });

                oView.setModel(new JSONModel(aSortedSelectedProjectTasks.length >= 1 ? aSortedSelectedProjectTasks : [{ title: "NO TASKS" }]), modelName);
                oView.getModel(modelName).refresh();
            }
        },

        handleSelectedTaskFilter() {
            var oView = _oController.getView();
            var sSelectTaskPriority = oView.byId("selectedTaskPrioritySelect").getSelectedKey();
            console.log("sSelectedTaskPriority", sSelectTaskPriority);
            if (sSelectTaskPriority) {
                // if (sSelectTaskPriority === "X") {
                //     var aSelectedProjectTasks = _oController.getView().getModel("selectedProjectTasks").getData();
                //     var aProjectOpenTasks = [];
                //     var aProjectHoldTasks = [];
                //     var aProjectCompletedTasks = [];
                //     var aProjectOverdueTasks = [];
                //     var aProjectOnreviewTasks = [];

                //     aSelectedProjectTasks.forEach(item => {
                //         switch (item.status) {
                //             case "hold":
                //                 aProjectHoldTasks.push(item);
                //                 break;
                //             case "open" || "inProgress":
                //                 aProjectOpenTasks.push(item);
                //                 break;
                //             case "completed":
                //                 aProjectCompletedTasks.push(item);
                //                 break;
                //             case "overdue":
                //                 aProjectOverdueTasks.push(item);
                //                 break;
                //             case "onReview":
                //                 aProjectOnreviewTasks.push(item);
                //                 break;
                //             default:
                //                 break;
                //         }
                //     })

                //     oView.setModel(new JSONModel(aProjectOpenTasks.length >= 1 ? aProjectOpenTasks : [{ title: "NO TASKS ARE OPEN" }]), "selectedProjectOpenTasks");

                //     // set model for hold tasks
                //     oView.setModel(new JSONModel(aProjectHoldTasks.length >= 1 ? aProjectHoldTasks : [{ title: "NO TASKS ON HOLD" }]), "selectedProjectHoldTasks");

                //     // set model for completed tasks
                //     oView.setModel(new JSONModel(aProjectCompletedTasks.length >= 1 ? aProjectCompletedTasks : [{ title: "NO TASKS MARKED AS COMPLETED" }]), "selectedProjectCompletedTasks");

                //     // set model for overdue tasks
                //     oView.setModel(new JSONModel(aProjectOverdueTasks.length >= 1 ? aProjectOverdueTasks : [{ title: "NO TASKS ARE OVERDUE" }]), "selectedProjectOverdueTasks");


                //     // set model for review tasks
                //     oView.setModel(new JSONModel(aProjectOnreviewTasks.length >= 1 ? aProjectOnreviewTasks : [{ title: "NO TASKS ON REVIEW" }]), "selectedProjectOnreviewTasks");

                //     oView.getModel("selectedProjectOpenTasks").refresh();
                //     console.log("i am invoked");
                // }

                // this._selectedTaskFilterHelper("selectedProjectOpenTasks", sSelectTaskPriority);

                this._selectedTaskFilterHelper("selectedProjectOpenTasks", sSelectTaskPriority, "open");
                this._selectedTaskFilterHelper("selectedProjectHoldTasks", sSelectTaskPriority, "hold");
                this._selectedTaskFilterHelper("selectedProjectCompletedTasks", sSelectTaskPriority, "completed");
                this._selectedTaskFilterHelper("selectedProjectOverdueTasks", sSelectTaskPriority, "overdue");
                this._selectedTaskFilterHelper("selectedProjectOnreviewTasks", sSelectTaskPriority, "onReview");
            }
        },

        _selectedTaskFilterHelper(modelName, priority, status) {
            var oView = _oController.getView();
            if (modelName && priority && status) {
                if (priority === "X") {
                    var aSelectedProjectTasks = _oController.getView().getModel("selectedProjectTasks").getData();

                    var aProjectOpenTasks = [];
                    var aProjectHoldTasks = [];
                    var aProjectCompletedTasks = [];
                    var aProjectOverdueTasks = [];
                    var aProjectOnreviewTasks = [];

                    aSelectedProjectTasks.forEach(item => {
                        switch (item.status) {
                            case "hold":
                                aProjectHoldTasks.push(item);
                                break;
                            case "open" || "inProgress":
                                aProjectOpenTasks.push(item);
                                break;
                            case "completed":
                                aProjectCompletedTasks.push(item);
                                break;
                            case "overdue":
                                aProjectOverdueTasks.push(item);
                                break;
                            case "onReview":
                                aProjectOnreviewTasks.push(item);
                                break;
                            default:
                                break;
                        }
                    })

                    oView.setModel(new JSONModel(aProjectOpenTasks.length >= 1 ? aProjectOpenTasks : [{ title: "NO TASKS ARE OPEN" }]), "selectedProjectOpenTasks");
                    oView.getModel("selectedProjectOpenTasks").refresh();

                    // set model for hold tasks
                    oView.setModel(new JSONModel(aProjectHoldTasks.length >= 1 ? aProjectHoldTasks : [{ title: "NO TASKS ON HOLD" }]), "selectedProjectHoldTasks");
                    oView.getModel("selectedProjectHoldTasks").refresh();

                    // set model for completed tasks
                    oView.setModel(new JSONModel(aProjectCompletedTasks.length >= 1 ? aProjectCompletedTasks : [{ title: "NO TASKS MARKED AS COMPLETED" }]), "selectedProjectCompletedTasks");
                    oView.getModel("selectedProjectCompletedTasks").refresh();

                    // set model for overdue tasks
                    oView.setModel(new JSONModel(aProjectOverdueTasks.length >= 1 ? aProjectOverdueTasks : [{ title: "NO TASKS ARE OVERDUE" }]), "selectedProjectOverdueTasks");
                    oView.getModel("selectedProjectOverdueTasks").refresh();

                    // set model for review tasks
                    oView.setModel(new JSONModel(aProjectOnreviewTasks.length >= 1 ? aProjectOnreviewTasks : [{ title: "NO TASKS ON REVIEW" }]), "selectedProjectOnreviewTasks");
                    oView.getModel("selectedProjectOnreviewTasks").refresh();
                } else {
                    var aselectedProjectTasks = oView.getModel("selectedProjectTasks").getData();
                    var aFilteredSelectedProjectTasks = aselectedProjectTasks.filter(item => item.priority === priority && item.status === status);
                    oView.setModel(new JSONModel(aFilteredSelectedProjectTasks.length >= 1 ? aFilteredSelectedProjectTasks : [{ title: "NO TASKS" }]), modelName);
                    oView.getModel(modelName).refresh();
                }

            }
        },
        handleTaskMarkedAsCompleted() {
            var oView = _oController.getView();
            // console.log("Task Helper Debugger",_oController._selectedTask);
            _oController._selectedTask.setProperty("status", "completed");

            oView.getModel().submitBatch("$auto").then(() => {
                MessageToast.show("Task Status Changed to " + "completed");
                oView.getModel().refresh();
                // if(this._dialogInstance){
                //     this._dialogInstance.close();
                // }

            })


        },
        handleTaskDueDate() {
            var oView = _oController.getView();
            var oModel = oView.getModel();
            this._selectedTaskContext = _oController._selectedTask;

            var oDueDateData = {
                "taskDueDate": `${_oController._selectedTask.getObject().dueDate}`
            }
            oView.setModel(new JSONModel(oDueDateData), "dueDateModel");
            if (!this.dDialog) {
                this.dDialog = Fragment.load({
                    id: oView.getId(),
                    name: "com.taskflow.dev.frontend.view.fragments.tasks.changeDueDate",
                    controller: this
                }).then(oDialog => {
                    oView.addDependent(oDialog);
                    return oDialog;
                })
            }

            this.dDialog.then(oDialog => {
                oDialog.open();
                this._dialogInstance = oDialog;
            })
        },
        onUpdateTaskDueDate() {
            var oView = _oController.getView();
            var oModel = oView.getModel();
            var oSelectedTaskContextBinding = this._selectedTaskContext;

            var dueDateModel = oView.getModel("dueDateModel");
            var sNewDueDate = dueDateModel.getData().taskDueDate;

            oSelectedTaskContextBinding.setProperty("dueDate", sNewDueDate);

            oModel.submitBatch("$auto").then(() => {
                MessageToast.show("Tasks Due Date Changed To " + sNewDueDate);
                oView.byId("changeTaskDueDateDialog").close();
                if (this._dialogInstance) {
                    this._dialogInstance.close();
                }


            })
        },
        handleTaskChangePriority() {
            var oView = _oController.getView();

            if (!this._pDialog) {
                this._pDialog = Fragment.load({
                    id: oView.getId(),
                    name: "com.taskflow.dev.frontend.view.fragments.tasks.changeTaskPriority",
                    controller: this
                }).then(oDialog => {
                    oView.addDependent(oDialog);
                    return oDialog;
                })
            }

            this._pDialog.then(oDialog => {
                oDialog.open();
            })



        },
        onUpdateTaskPriority() {
            console.log("onUpdateTaskPriority");
            var oView = _oController.getView();
            var oList = oView.byId("priorityChangeList");
            var sSelectedPriority = oList.getSelectedItem().getId().split("Home--")[1];
            this._changeTaskPriority(sSelectedPriority);
        },
        _changeTaskPriority(sPriority) {
            var oView = _oController.getView();
            var oSelectedTaskContextBinding = _oController._selectedTask;
            oSelectedTaskContextBinding.setProperty("priority", sPriority);
            var oModel = oView.getModel();

            oModel.submitBatch("$auto").then(() => {
                MessageToast.show(`Task Priority Changed to ${sPriority}`);
                oView.byId("changeTaskPriorityDialog").close();
            })
        },
        onCancelTaskPriority(){
            var oView = _oController.getView();
            oView.byId("changeTaskPriorityDialog").close();
        },
        handleTaskArchive(){
            console.log("handleTaskArchive");
            var oView = _oController.getView();

            if(!this._aDialog){
                this._aDialog = Fragment.load({
                    id:oView.getId(),
                    name:"com.taskflow.dev.frontend.view.fragments.tasks.archiveTask",
                    controller:this
                }).then(oDialog=>{
                    oView.addDependent(oDialog);
                    return oDialog;
                })
            }

            this._aDialog.then(oDialog=>{
                oDialog.open();
            })
        },
        onArchiveTask(){
            console.log("archive Task");
            var oView = _oController.getView();
            var oModel = oView.getModel();
            var oSelectedTaskContextBinding = _oController._selectedTask;
            oSelectedTaskContextBinding.setProperty("isArchived", true);

            oModel.submitBatch("$auto").then(()=>{
                MessageToast.show("Task is Archived");
                oView.byId("archiveTaskDialog").close();
            })
        },
        onArchiveCancel(){
            _oController.getView().byId("archiveTaskDialog").close();
        },
        handleTaskDelete(){
             var oSelectedTaskContextBinding = _oController._selectedTask;
            console.log("oSelectedTaskContextBinding",oSelectedTaskContextBinding)
            oSelectedTaskContextBinding.delete().then(
                function(){
                    MessageBox.success("Deleted Successfully");
                },
                function(oError){
                    MessageBox.error("Delete Failed "+oError.message);
                }
            )
        }

    };
});
