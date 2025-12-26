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
                    visible:isManager

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
                    press: this.onPressAbout.bind(this),

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
               
                oDialog.open();
            })
        },
        onCloseSetting() {
            var oView = _oController.getView();
            oView.byId("settingDialog").close();
        },
        onPressAbout(){
            var oView = _oController.getView();
            console.log("about pressed");
            if(!_oController.oSystemAboutDialog){
                _oController.oSystemAboutDialog = Fragment.load({
                    id:oView.getId(),
                    name: "com.taskflow.dev.frontend.view.fragments.utils.systemAbout",
                    controller: this
                }).then(oDialog=>{
                    oView.addDependent(oDialog);
                    return oDialog;
                })
            }

            _oController.oSystemAboutDialog.then(oDialog=>{
                oDialog.open();
            })

        },
        onCloseSystemDialog(){
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
            var oMemberList = _oController.getView().byId("memberList");
            var aSelectedMembers = oMemberList.getSelectedItems();

            // important code
            aSelectedMembers.forEach(member => {
                var oContext = member.getBindingContext();
                oContext.setProperty("project_ID", data.ID);
                oContext.setProperty("freepool", false);
                
            })

            // _oController.getView().getModel("selectedProject").refresh(true);
            var oBinding = _oController.byId("memberList").getBinding("items");
            oBinding.refresh();
            _oController.onListItemPress();
            const bOnBoard = _oController.byId("onBoardButton")
            aOnboardMemberDraft = [];
            bOnBoard.setText(`Onboard`)
            bOnBoard.setEnabled(false);
            return;


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

            oUserBinding.filter([new sap.ui.model.Filter("ID", "EQ", oSelectedMember.ID)]);

            // oUserBinding.setProperty("freepool",true);
            // oUserBinding.setProperty("project_ID","bench");

            

            oUserBinding.requestContexts().then((aContext) => {
                
                aContext.forEach(item => {
                    item.setProperty("freepool", true);
                    item.setProperty("project_ID", "bench");
                    var oBinding = _oController.byId("memberList")?.getBinding("items");
                  
                    if(oBinding){

                        oBinding.refresh();
                    }
                    _oController.onListItemPress(); 
                    
                })
            })

        }
    }
});