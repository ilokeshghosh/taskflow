sap.ui.define(["sap/ui/core/Fragment", "sap/m/MessageBox", "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/FilterType",
    "sap/ui/model/Sorter",
    'sap/m/MessageToast',
], function (Fragment, MessageBox, JSONModel, Filter, FilterOperator, FilterType, Sorter, MessageToast) {
    "use strict";
    var _oController; //for access outside function scope
    var aOnboardMemberDraft = []
    return {
        init: function (oController) {
            _oController = oController;
        },
        handleAvatar(oEvent) {
            var oButton = oEvent.getSource();
            var getcurrentUser = _oController.getView().getModel("currentUser").getData();
            var isManager = getcurrentUser.roles[0] === "manager";


            if (!_oController._uPopoverUser) {
                var oList = new sap.m.List({
                    inset: false
                })

                var item1 = new sap.m.StandardListItem({
                    title: `${getcurrentUser.firstname} ${getcurrentUser.lastname}`,
                    type: sap.m.ListType.Inactive,
                    icon: "sap-icon://person-placeholder",
                })


                var item2 = new sap.m.StandardListItem({
                    title: `${getcurrentUser.email}`,
                    type: sap.m.ListType.Inactive,
                    icon: "sap-icon://email"
                })

                var item3 = new sap.m.StandardListItem({
                    title: `${getcurrentUser.designation}`,
                    type: sap.m.ListType.Inactive,
                    icon: "sap-icon://role",

                })


                var item4 = new sap.m.StandardListItem({
                    title: "System Log",
                    type: sap.m.ListType.Active,
                    icon: "sap-icon://legend",
                    press: this.onPressSystemLog.bind(this),
                    visible: isManager

                })


                var item5 = new sap.m.StandardListItem({
                    title: "Settings",
                    type: sap.m.ListType.Active,
                    icon: "sap-icon://user-settings",
                    press: this.onPressSettings.bind(this),

                })

                var item6 = new sap.m.StandardListItem({
                    title: "About",
                    type: sap.m.ListType.Active,
                    icon: "sap-icon://hint",
                    press: this.onOpenSystemDialog.bind(this),

                })


                // oList.addItem(item1);
                // oList.addItem(item2);
                // oList.addItem(item3);
                oList.addItem(item4);
                oList.addItem(item5);
                oList.addItem(item6);


                _oController._uPopoverUser = new sap.m.Popover({
                    title: "User Quick Actions",
                    placement: sap.m.PlacementType.Right,
                    content: [oList]
                });

                _oController.getView().addDependent(_oController._uPopoverUser)

            }
            _oController._uPopoverUser.openBy(oButton);

        },

        onPressSystemLog() {
            var oView = _oController.getView();
            if (!_oController._sDialog) {
                _oController._sDialog = Fragment.load({
                    id: oView.getId(),
                    name: "com.taskflow.dev.frontend.view.fragments.users.systemLog",
                    controller: this
                }).then(oDialog => {
                    oView.addDependent(oDialog);
                    return oDialog;
                })
            }

            _oController._sDialog.then(oDialog => {

                oDialog.open();
            })
        },
        onCloseSystemLog() {
            var oView = _oController.getView();
            oView.byId("systemLog").close();
        },
        onPressSettings() {

            var oView = _oController.getView();
            if (!_oController._xDialog) {
                _oController._xDialog = Fragment.load({
                    id: oView.getId(),
                    name: "com.taskflow.dev.frontend.view.fragments.users.settings",
                    controller: this
                }).then(oDialog => {
                    oView.addDependent(oDialog);
                    return oDialog;
                })
            }

            _oController._xDialog.then(oDialog => {
                this._loadUserSettings();
                oDialog.open();
            })
        },
        // onCloseSetting() {
        //     console.log("something something")
        //     var oView = _oController.getView();
        //     oView.byId("settingDialog").close();
        // },
        _loadUserSettings: function () {
            const sUserId = _oController.getView().getModel("currentUser").getProperty("/ID");

            const oModel = _oController.getView().getModel();
            const oBinding = oModel.bindList("/UserSettings", null, null, [
                new sap.ui.model.Filter("user_ID", "EQ", sUserId)
            ]);

            oBinding.requestContexts().then((aContexts) => {
                if (aContexts.length > 0) {
                    const oUserSettings = aContexts[0].getObject();

                    // Create JSON model for UserSettings
                    const oUserSettingsModel = new JSONModel(oUserSettings);
                    _oController.getView().setModel(oUserSettingsModel, "userSettings");

                    // Store context for later updates
                    _oController._userSettingsContext = aContexts[0];
                } else {
                    // Create default settings if none exist
                    _oController._createDefaultUserSettings(sUserId);
                }
            }).catch((error) => {
                console.error("Error loading user settings:", error);
                MessageBox.error("Failed to load user settings");
            });
        }, _createDefaultUserSettings: function (sUserId) {
            const oModel = _oController.getView().getModel();
            const oListBinding = oModel.bindList("/UserSettings");

            const oContext = oListBinding.create({
                user_ID: sUserId,
                theme: "light",
                language: "en",
                digestFrequency: "daily"
            });

            oModel.submitBatch("$auto").then(() => {
                MessageToast.show("Default settings created");
                this._loadUserSettings();
            }).catch((error) => {
                console.error("Error creating settings:", error);
                MessageBox.error("Failed to create default settings");
            });
        },
        onSaveUserSettings: function () {
            const oModel = _oController.getView().getModel();
            const oUserModel = _oController.getView().getModel("currentUser");
            const oUserSettingsModel = _oController.getView().getModel("userSettings");

            // Get current user ID
            const sUserId = oUserModel.getProperty("/ID");

            // Update User entity (Profile data)
            const oUserBinding = oModel.bindList("/Users", null, null, [
                new sap.ui.model.Filter("ID", "EQ", sUserId)
            ]);

            oUserBinding.requestContexts().then((aUserContexts) => {
                if (aUserContexts.length > 0) {
                    const oUserContext = aUserContexts[0];

                    // Update user profile fields
                    oUserContext.setProperty("firstname", oUserModel.getProperty("/firstname"));
                    oUserContext.setProperty("lastname", oUserModel.getProperty("/lastname"));
                    oUserContext.setProperty("phone", oUserModel.getProperty("/phone"));
                }

                // Update UserSettings entity
                if (_oController._userSettingsContext) {
                    const oSettingsData = oUserSettingsModel.getData();

                    _oController._userSettingsContext.setProperty("theme", oSettingsData.theme);
                    _oController._userSettingsContext.setProperty("language", oSettingsData.language);
                    _oController._userSettingsContext.setProperty("digestFrequency", oSettingsData.digestFrequency);
                }

                // Submit all changes
                return oModel.submitBatch("$auto");
            }).then(() => {
                MessageToast.show("Settings saved successfully");

                // Refresh current user model
                _oController.getOwnerComponent().setCurrentUser();
                _oController.getOwnerComponent().setcurrentUserSettings();

                _oController.getView().byId("settingDialog").close();
            }).catch((error) => {
                MessageBox.error("Failed to save settings");
                console.error("Save error:", error);
            });
        },

        onCloseSetting: function () {
            
            if (_oController._xDialog) {
                // Reset changes
                _oController.getView().getModel().resetChanges();

                // Reload original data
                this._loadUserSettings();

                _oController.getView().byId("settingDialog").close();
            }
        },

        onOpenSystemDialog: function () {
            // Your existing system dialog code
           var oView = _oController.getView();
            
            if (!_oController.oSystemAboutDialog) {
                _oController.oSystemAboutDialog = Fragment.load({
                    id: oView.getId(),
                    name: "com.taskflow.dev.frontend.view.fragments.utils.systemAbout",
                    controller: this
                }).then(oDialog => {
                    oView.addDependent(oDialog);
                    return oDialog;
                })
            }

            _oController.oSystemAboutDialog.then(oDialog => {
                oDialog.open();
            })
        },




        // end: user settings code
        onCloseSystemDialog() {
            _oController.getView().byId("systemAboutDialog").close();
        }
        ,
        handleOnboardMember() {


            var oView = _oController.getView();

            if (!_oController.oOnboardDialog) {
                _oController.oOnboardDialog = Fragment.load({
                    id: oView.getId(),
                    name: "com.taskflow.dev.frontend.view.fragments.users.onboard",
                    controller: this
                }).then(oDialog => {
                    oView.addDependent(oDialog);
                    return oDialog;
                })
            }

            _oController.oOnboardDialog.then(oDialog => {
                oDialog.open();

                var oMemberBinding = _oController.getView().byId("memberList").getBinding("items");



                oMemberBinding.filter(
                    [
                        new sap.ui.model.Filter("freepool", "EQ", true),
                        new sap.ui.model.Filter("type", "EQ", "member")
                    ]
                )
            })

        },
        onHandleOnboardSelection(oEvent) {
            const bOnBoard = _oController.byId("onBoardButton")
            const oView = _oController.getView();
            const oItem = oEvent.getParameter("listItem");
            const bSelected = oEvent.getParameter("selected");
            const oCtx = oItem.getBindingContext();
            const oData = oCtx.getObject();
            if (bSelected) {

                aOnboardMemberDraft.push(oData);
            } else {
                aOnboardMemberDraft = aOnboardMemberDraft.filter((member) => member.ID !== oData.ID);
            }

            const oSelecteMember = {
                count: aOnboardMemberDraft.length,
                members: aOnboardMemberDraft
            }
            if (oSelecteMember.count) {

                bOnBoard.setText(`Onboard (${oSelecteMember.count})`)
                bOnBoard.setEnabled(true);
            } else {
                bOnBoard.setText(`Onboard`)
                bOnBoard.setEnabled(false);
            }


            oView.setModel(new JSONModel(oSelecteMember), "onboardmember");


        },
        onOnBoardClose() {
            _oController.byId("onBoardMember").close();
        },
        onHandleOnBoard() {

            this._setOnboardingBusy(true);
            var oView = _oController.getView();
            oView.byId("onBoardMember").close();

        },
        _setOnboardingBusy(bOnBoard) {
            var oView = _oController.getView();
            if (bOnBoard) {
                if (!_oController._oOnboardLoadDialog) {
                    _oController._oOnboardLoadDialog = Fragment.load({
                        id: oView.getId(),
                        name: "com.taskflow.dev.frontend.view.fragments.utils.onboardLoading",
                        controller: this
                    }).then(oDialog => {
                        oView.addDependent(oDialog);
                        return oDialog;
                    })
                }

                _oController._oOnboardLoadDialog.then(oDialog => {
                    oDialog.open();

                    const oProgressBar = oView.byId("onboardMemberProgressIndicator");

                    let progress = 0;
                    let index = 0;
                    var oInterval = setInterval(() => {

                        var sDisplayText;

                        if (progress > 85 && progress <= 100) {
                            sDisplayText = "Done ✅ Finalizing onboarding & Preparing workspace……";

                        } else {
                            sDisplayText = this._getDisplayText(index);
                        }
                        index++;

                        if (progress === 90) {
                            this._onBoardMember();

                        }

                        oProgressBar.setPercentValue(progress);
                        oProgressBar.setDisplayValue(sDisplayText);
                        progress = progress + 2;

                        if (progress > 100) {
                            clearInterval(oInterval);
                            // oProgressBar.setPercentValue(0);
                            oDialog.close();
                        }
                    }, 500);

                })
            } else {
                if (!_oController._oOnboardLoadDialog) {
                    _oController._oOnboardLoadDialog = Fragment.load({
                        id: oView.getId(),
                        name: "com.taskflow.dev.frontend.view.fragments.utils.onboardLoading",
                        controller: this
                    }).then(oDialog => {
                        oView.addDependent(oDialog);
                        return oDialog;
                    })
                }

                _oController._oOnboardLoadDialog.then((oDialog) => {
                    oDialog.open();
                    const oProgressBar = oView.byId("onboardMemberProgressIndicator");
                    let progress = 0;
                    let index = 0;
                    // this._offBoardMember();
                    var oInterval = setInterval(() => {

                        var sDisplayText = "some thing";

                        if (progress > 85 && progress <= 100) {
                            sDisplayText = "All set ✅. Member successfully offboarded.";


                        } else {
                            sDisplayText = this._getOffBoardingText(index);
                        }
                        index++;

                        if (progress === 90) {
                            this._offBoardMember();

                        }

                        oProgressBar.setPercentValue(progress);
                        oProgressBar.setDisplayValue(sDisplayText);
                        progress = progress + 2;

                        if (progress > 100) {
                            clearInterval(oInterval);
                            // oProgressBar.setPercentValue(0);
                            oDialog.close();
                        }
                    }, 500);
                })
            }

        },

        _getDisplayText(index) {
            const aMessages = [
                "Validating member details…",
                "Checking project access and role…",
                "Linking member to Task Flow workspace…",
                "Assigning project permissions…",
                "Syncing tasks and notifications…",
                "Finalizing onboarding…",
                "Almost there… preparing workspace…"
            ];
            return aMessages[Math.floor(index / 4) % aMessages.length];
        },

        _getOffBoardingText(index) {
            const aOffboardingMessages = [
                "Reviewing member access…",
                "Detaching member from Task Flow project…",
                "Revoking project permissions…",
                "Cleaning up assigned tasks and roles…",
                "Archiving member activity for audit…",
                "Updating team roster…",
                "Finalizing offboarding…",
            ];
            // 
            return aOffboardingMessages[Math.floor(index / 4) % aOffboardingMessages.length];
        },

        _onBoardMember() {
            const data = _oController.getView().getModel("selectedProject").getData();
            var oModel2 = _oController.getView().getModel();
            var oMemberList = _oController.getView().byId("memberList");
            const oUserProject = _oController.getView().getModel().bindList("/User_Project");
            var aSelectedMembers = oMemberList.getSelectedItems();
            // var oUserBinding = oView.getModel().bindList("/Users");

            // important code
            aSelectedMembers.forEach(member => {
                var oContext = member.getBindingContext();
                // oContext.setProperty("project_ID", data.ID);
                oContext.setProperty("freepool", false);
                // console.log("member project context",oContext.getProperty("project_ID"));
                oUserProject.create({
                    ID: "UP" + Date.now().toString().slice(-6),
                    user_ID: member.getBindingContext().getObject().ID,
                    project_ID: data.ID
                    
                })

                // oUserProject.submitBatch("$auto").then(() => {    
                //     console.log("user project model updated after onboarding");
                // });

            })
            var oModel = aSelectedMembers[0].getBindingContext().getBinding().getModel();


            console.log("user project model", oUserProject);
            oModel2.submitBatch("$auto").then(() => {
                console.log("user model updated after onboarding");
                this._fetchUpdatedProjectData(data.name);
            })
        },
        handleDeleteMember(oEvent) {
            var oButton = oEvent.getSource();
            var oItem = oButton.getParent();
            oItem = oItem.getParent();

            var oCtx = oItem.getBindingContext("selectedProject");
            var oSelectedMember = oCtx.getObject();
            _oController.getView().setModel(new JSONModel(oSelectedMember), 'selectedMember');

            const message = `
                    Offboarding this member will have the following effects:

                    • Their access to this project will be revoked.
                    • They will no longer receive project notifications.
                    • Any future tasks assigned to them may need reassignment.
                    • The member will be moved to bench and marked as part of the free pool for future allocation.

                    Are you sure you want to offboard this member? 
                    `;


            sap.m.MessageBox.confirm(message, {
                title: "Do You Want Offboard this Member ?",
                actions: [sap.m.MessageBox.Action.OK,
                sap.m.MessageBox.Action.CANCEL],
                onClose: function (oAction) {
                    if (oAction === "OK") {
                        this._setOnboardingBusy(false);
                    }
                }.bind(this),

                emphasizedAction: sap.m.MessageBox.Action.OK,
            })


        }, _offBoardMember() {
            var oView = _oController.getView();
            var oUserBinding = oView.getModel().bindList("/Users");
            var oSelectedMember = oView.getModel("selectedMember").getData();
            const data = _oController.getView().getModel("selectedProject").getData();

            oUserBinding.filter([new sap.ui.model.Filter("ID", "EQ", oSelectedMember.ID)]);

            oUserBinding.requestContexts().then((aContext) => {

                aContext.forEach(item => {
                    item.setProperty("freepool", true);
                    item.setProperty("project_ID", "bench");
                })

                var oBinding = _oController.byId("memberList")?.getBinding("items");

                if (oBinding) {

                    oBinding.refresh();
                }

            })

            oUserBinding.getModel().submitBatch("$auto").then(() => {

                console.log("user model updated after offboarding");
                this._fetchUpdatedProjectData(data.name);
            })
        },

        _fetchUpdatedProjectData(sProjectName) {
            var oBinding = _oController.getView().getModel().bindList(
                "/Projects",
                null,
                null,
                [new sap.ui.model.Filter("name", "EQ", sProjectName)],
                {
                    $expand: "members($count=true;$expand=user),client,tasks($count=true),manager"
                }
            );

            oBinding.requestContexts().then(function (aContexts) {
                if (aContexts.length > 0) {
                    var oProjectData = aContexts[0].getObject();
                    console.log("updated project data", oProjectData);
                    _oController.getView().setModel(new JSONModel(oProjectData), "selectedProject");
                    _oController.getView().setModel(new JSONModel(oProjectData), "DialogSelectedProject");

                    if (_oController._pDialog) {
                        _oController._pDialog.then((oDialog) => {
                            oDialog.setModel(_oController.getView().getModel("DialogSelectedProject"), "selectedProject");
                            _oController.getView().byId("projectCardContainer").getBinding("items").refresh();

                        });
                    }

                    // Loading all project specific tasks
                    _oController._loadAllTasks();
                    _oController.getView().setBusy(false);
                } else {
                    MessageBox.error("No project found");
                }
            });
        }
    }
});