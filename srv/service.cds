using { db.taskflow as db } from '../db/schema.cds';


service TaskService {

    entity Tasks as projection on db.Task;
    entity Projects as projection on db.Project;
    entity Users as projection on db.User;
    entity AuditLog as projection on db.AuditLog;

    action login(email:String,password:String)returns String;
    action verifyToken(token:String) returns String;
    

}


