sap.ui.define(["sap/ui/core/Fragment","sap/m/MessageBox","sap/ui/model/json/JSONModel",], function (Fragment,MessageBox,JSONModel) {
    "use strict";
    var _oController;
    return {
        init: function(oController) {
            _oController = oController;

            // console.log("binding data", _oController.getView().getModel().bindList("/Projects"));
            var sNewID = "PROJ" + Date.now().toString().slice(-6);
            var oDate = new Date();
            var sNow = oDate.toISOString().split('T')[0];
            var oCreateProjectModel = new JSONModel({
                ID:sNewID,
                name:"",
                description:"",
                members:null,
                deadline:sNow,
                startDate:sNow,
                clientName:"",
                budget:0,
                progress:0,
                priority:"low",
                status:"open"

            });

            // console.log("oCreateProjectModel",oCreateProjectModel);
            
            _oController.getView().setModel(oCreateProjectModel,"createProjectModel")

        },
        _getText: function () {
            console.log('hey there from utils');
            // Add your actual getText logic here
            return "some text"; // Return the actual text you need
        },

        handleCreateProject() {
            
            console.log("hey There",this);

            var oView = _oController.getView();

            if(!this._pDialog){
                this._pDialog = Fragment.load({
                    id:oView.getId(),
                    name: "com.taskflow.dev.frontend.view.fragments.projects.createProject",
                    controller:this
                }).then(function(oDialog){
                    // oDialog.attachAfterOpen(this.onDialogAfterOpen,this);
                    oView.addDependent(oDialog);
                    return oDialog;
                }.bind(this))
            }

            this._pDialog.then(function(oDialog){
               
                // console.log("binding data", _oController.getView().getModel().bindList("/Projects"));


                
                oDialog.open();
            })

            // console.log('testing', projectHelper)
            
        },
        // onDialogAfterOpen(){

        // },
        onCreateProjectSubmit(){
            console.log('Submitted')
            var oModel=  _oController.getView().getModel();
            var oBindingList = oModel.bindList("/Projects");
            var oInputProjectData = _oController.getView().getModel("createProjectModel").getData();

            var sProjectCreateClientInput = _oController.byId("projectCreateClientInput")

           
            oBindingList.create({...oInputProjectData,clientName:sProjectCreateClientInput.getSelectedItem().getKey()});

            oModel.submitBatch("$auto").then(function(){
                MessageBox.success("Project Created Successfully")
                this._closeCreatProjectDialog();
            })

          
            



        },
        _closeCreatProjectDialog(){
            console.log("project dialog",_oController.byId("createProjectDialog"))
            _oController.byId("createProjectDialog").close();
        },
        onCancelCreateProject(){
            this._closeCreatProjectDialog();
        }
        
    };
});
