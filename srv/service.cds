using { db.taskflow as db } from '../db/schema.cds';


service TaskService {

    entity Tasks as projection on db.Task;
    entity Projects as projection on db.Project;
    entity Users as projection on db.User;

}
