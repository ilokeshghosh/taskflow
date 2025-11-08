using { db.taskflow as db } from '../db/schema.cds';


service TaskService {

    entity Task as projection on db.Task;
    

}
