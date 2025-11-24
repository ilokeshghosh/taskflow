sap.ui.define(["sap/ui/core/Fragment", "sap/m/MessageBox", "sap/ui/model/json/JSONModel",], function (Fragment, MessageBox, JSONModel) {
    "use strict";
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
        }


    };
});
