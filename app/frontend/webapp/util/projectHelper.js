sap.ui.define([
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
], function (Fragment, MessageBox, JSONModel) {
    "use strict";
    var _oController; //for access outside function scope
    return {
        init: function (oController) {
            _oController = oController;
            // setup local model for project creation
            var sNewID = "PROJ" + Date.now().toString().slice(-6);
            var oDate = new Date();
            var sNow = oDate.toISOString().split('T')[0];
            var oCreateProjectModel = new JSONModel({
                ID: sNewID,
                name: "",
                description: "",
                members: null,
                deadline: sNow,
                startDate: sNow,
                clientName: "",
                budget: 0,
                progress: 0,
                priority: "low",
                status: "open"

            });

            _oController.getView().setModel(oCreateProjectModel, "createProjectModel")
            // update task count for populating data in KPI Tiles
            this._updateTaskCounts();
        },
        // open create project dialog to handle project creation
        handleCreateProject() {
            var oView = _oController.getView();
            if (!this._pDialog) {
                this._pDialog = Fragment.load({
                    id: oView.getId(),
                    name: "com.taskflow.dev.frontend.view.fragments.projects.createProject",
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
        // function to handle project creation after submitting the form
        onCreateProjectSubmit() {
            var oModel = _oController.getView().getModel();
            var oBindingList = oModel.bindList("/Projects");
            var oInputProjectData = _oController.getView().getModel("createProjectModel").getData();

            var sProjectCreateClientInput = _oController.byId("projectCreateClientInput")
            // create project (Odata V4 syntax)
            oBindingList.create({ ...oInputProjectData, clientName: sProjectCreateClientInput.getSelectedItem().getKey() });
            // submit all changes (batch update)
            oModel.submitBatch("$auto").then(function () {
                MessageBox.success("Project Created Successfully")
                this._closeCreatProjectDialog();
            })
        },
        // function for closing create project dialog
        _closeCreatProjectDialog() {
            _oController.byId("createProjectDialog").close();
        },
        // function for closing create project dialog ( when pressed cancel button )
        onCancelCreateProject() {
            this._closeCreatProjectDialog();
        },
        // task count function of open, completed, overdue tasks
        _updateTaskCounts: function () {
            this._updateStatusCount("open", "openCount");
            this._updateStatusCount("completed", "completedCount");
            this._updateStatusCount("overdue", "overdueCount");
        },
        // funtion to fetch with count and apply filter 
        _updateStatusCount: function (sStatus, sControlId) {
            var oModel = _oController.getView().getModel();

            var oListBinding = oModel.bindList("/Tasks", null, null, null, {
                $count: true
            });

            oListBinding.filter(
                new sap.ui.model.Filter("status", sap.ui.model.FilterOperator.EQ, sStatus)
            );

            oListBinding.requestContexts(0, 0).then(function () {
                var iCount = oListBinding.getLength();
                // directly set data(count) to controller 
                _oController.byId(sControlId).setValue(iCount);
            }).catch(function (oError) {
                console.error("Error fetching count for " + sStatus + ":", oError);
            });
        }
    };
});
