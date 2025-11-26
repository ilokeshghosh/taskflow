sap.ui.define([
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/FilterType",
    'sap/m/MessageToast',
    "sap/ui/model/Sorter"
], function (Fragment, MessageBox, JSONModel, Filter, FilterOperator, FilterType, MessageToast, Sorter) {
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



            this._oCurrentP13nData = null;
            // _oController.getView().setModel(new JSONModel({
            //     sortDialogMode: true,
            //     sortListLayout: true
            // }))
            this._bIsOpen = false;

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
        },
        searchProject(sValue) {
            var oFilter = new Filter("name", FilterOperator.Contains, sValue);
            var aFilters = [];

            if (sValue && sValue.length > 0) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("name", FilterOperator.Contains, sValue),
                        new Filter("description", FilterOperator.Contains, sValue),
                        new Filter("clientName", FilterOperator.Contains, sValue),
                        new Filter("priority", FilterOperator.EQ, sValue),
                        new Filter("status", FilterOperator.EQ, sValue)
                    ],
                    and: false
                }))
                console.log("aFilter", aFilters)
            }

            _oController.byId("projectCardContainer").getBinding("items").filter(aFilters, FilterType.Application);
            _oController.byId("projectCardContainer").setBusy(false)

        },
        _initialData: {
            sort: [{
                sorted: false,
                name: "deadline",
                label: "deadline",
                descending: false
            },
            {
                sorted: false,
                name: "startDate",
                label: "startDate",
                descending: false
            },
            {
                sorted: false,
                name: "budget",
                label: "budget",
                descending: false,
            },
                // {
                //     sorted: false,
                //     name: "progress",
                //     label: "progress",
                //     descending: false
                // },
                // {
                //     sorted: false,
                //     name: "priority",
                //     label: "priority",
                //     descending: false
                // },
                // {
                //     sorted: false,
                //     name: "status",
                //     label: "status",
                //     descending: false
                // }
            ]
        },
        _priorityOrder: {
            "high": 1,
            "medium": 2,
            "low": 3,

        },
        _statusOrder: {
            "planning": 1,
            "inProgress": 2,
            "hold": 3,
            "completed": 4
        },

        _setInitialData() {
            const oView = _oController.getView();
            const oSortPanel = oView.byId("sortPanel");
            oSortPanel.setP13nData(this._initialData.sort);
        },


        handleSorterContainerOpen(oEvt) {
            const oView = _oController.getView();
            const oPopup = oView.byId("p13nPopup");
            if (!this._bIsOpen) {
                this._setInitialData();
                this._bIsOpen = true;
                // oPopup.open()
            }

            oPopup.open(oEvt.getSource());
        },
        onClose: function (oEvt) {
            const sReason = oEvt.getParameter("reason");
            MessageToast.show("Dialog close reason: " + sReason);
        },
        onReset: function (oEvt) {
            this._setInitialData();
            this.parseP13nState();
        },
        parseP13nState(oEvt) {
            // if (oEvt) {
            //     MessageToast.show("P13n panel change reason:" + oEvt.getParameter("reason"));
            // }
            const oView = _oController.getView();

            const oP13nState = {
                sort: oView.byId("sortPanel").getP13nData()
            };
            const projectCardContainer = oView.byId("projectCardContainer");
            const oBinding = projectCardContainer.getBinding("items");

            if (oBinding) {
                const aItems = oBinding.getContexts();
                console.log("📊 Total items in binding:", aItems.length);

                if (aItems.length < 2) {
                    console.warn("⚠️ Only", aItems.length, "item(s) - comparator won't be called (need 2+ to compare)");
                }
            }
            var aSorters = [];
            oP13nState.sort.forEach(function (oSortItem) {
                if (oSortItem.sorted) {
                    var oSorter;

                    // Use custom comparator for enum fields

                    oSorter = new Sorter(oSortItem.name, oSortItem.descending);


                    aSorters.push(oSorter);
                }

            }.bind(this));

            // Apply sorting
            console.log("aSorter", aSorters)
            oBinding.sort(aSorters);

            if (aSorters.length > 0) {
                MessageToast.show("Sorting applied");
            }

            console.log("oPnaleState", oP13nState);
        },
        // Custom comparator for priority
        _priorityComparator: function (a, b) {
            // console.log("a : ",a," b : ",b);
            // var orderA = this._priorityOrder[a] || 999;
            // var orderB = this._priorityOrder[b] || 999;

            // if (orderA < orderB) return -1;
            // if (orderA > orderB) return 1;
            // return 0;
            console.log("who i am ");
        },

        // Custom comparator for status
        _statusComparator: function (a, b) {
            var orderA = this._statusOrder[a] || 999;
            var orderB = this._statusOrder[b] || 999;

            if (orderA < orderB) return -1;
            if (orderA > orderB) return 1;
            return 0;
        },

        // Filter Project
        handleProjectFilter() {
            var aFilter = [];
            var oValueMap = {
                oStatusMap: {
                    "A": "planning",
                    "B": "hold",
                    "C": "inProgress",
                    "D": "completed"
                },
                oPriorityMap: {
                    "A": "high",
                    "B": "medium",
                    "C": "low"
                }

            }
            var oStatusSelect = _oController.byId("statusSelect");
            var oPrioritySelect = _oController.byId("prioritySelect");
            var sPiority = oPrioritySelect.getSelectedKey();
            var sStatus = oStatusSelect.getSelectedKey();
            if (sStatus) {
                if (sStatus === "X") {
                    this._resetFilter();
                } else {

                    aFilter.push(new Filter('status', FilterOperator.EQ, oValueMap.oStatusMap[sStatus]));
                }

            }
            if (sPiority) {
                if (sPiority === "X") {
                    this._resetFilter()
                } else {
                    aFilter.push(new Filter('priority', FilterOperator.EQ, oValueMap.oPriorityMap[sPiority]));
                }
            }

            var oProjectCardContainer = _oController.byId("projectCardContainer");
            var oProjectCardBinding = oProjectCardContainer.getBinding("items");
            oProjectCardBinding.filter(aFilter);
            // console.log("aFilter", aFilter);
        },
        _resetFilter() {
            var oProjectCardContainer = _oController.byId("projectCardContainer");
            oProjectCardContainer.getBinding("items").filter([]);
        }
    };
});
