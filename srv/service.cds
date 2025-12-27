using {db.taskflow as db} from '../db/schema.cds';


service TaskService {

    @restrict: [
        {
            grant: [
                'READ',
                'CREATE',
                'UPDATE',
                'DELETE'
            ],
            to   : 'manager'
        },
        {
            grant: [
                'READ',
                'CREATE',
                'UPDATE',
                'DELETE'
            ],
            to   : 'member'
        },
        {
            grant: ['READ'],
            to   : 'clientUser'
        }
    ]
    entity Tasks    as projection on db.Task;


    @restrict: [
        {
            grant: [
                'READ',
                'CREATE',
                'UPDATE',
                'DELETE'
            ],
            to   : 'manager'
        },
        {
            grant: ['READ'],
            to   : 'member'
        },
        {
            grant: ['READ'],
            to   : 'clientUser'
        }

    ]
    entity Projects as projection on db.Project;


    @restrict: [
        {
            grant: [
                'READ',
                'UPDATE',
                'DELETE'],
            to   : 'manager'
        },
        {
            grant: ['READ'],
            to   : 'member'
        },
        {
            grant: ['READ'],
            to   : 'clientUser'
        }

    ]
    entity Users    as projection on db.User;


    // @restrict: [{
    //     grant: ['READ'],
    //     to   : 'manager'
    // }]
    entity AuditLog as projection on db.AuditLog;

    entity Notifications as projection on db.Notification;


    entity SystemInfo as projection on db.SystemInfo;

    entity UserSettings as projection on db.UserSettings;

    action   login(email: String, password: String) returns String;
    action   verifyToken(token: String)             returns String;


    function getcurrentUser(ID: String)             returns String;


    function getcurrentUserSettings()returns String;


}
