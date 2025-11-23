sap.ui.define(["sap/ui/core/Fragment", "sap/m/MessageBox", "sap/ui/model/json/JSONModel",], function (Fragment, MessageBox, JSONModel) {
    "use strict";
    var _oController;
    return {
        init: function (oController) {
            _oController = oController;

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
        onCreateTaskSubmit() {
            var oInputTaskData = _oController.getView().getModel("createTaskModel").getData();

            var oModel = _oController.getView().getModel();
            var oBindingList = oModel.bindList("/Tasks");

            var sTaskCreateClientInputPriority = _oController.byId("taskCreateClientInputPriority").getSelectedItem().getKey();

            var sTaskCreateClientInputAssigne = _oController.byId("taskCreateClientInputAssigne").getSelectedItem().getKey();

            var sTaskCreateClientInputStatus = _oController.byId("taskCreateClientInputStatus").getSelectedItem().getKey();

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
        _closeCreateTaskDialog() {
            _oController.byId("createTaskDialog").close();
        },
        onCancelTaskProject() {
            this._closeCreateTaskDialog();
        }


    };
});
