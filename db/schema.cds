namespace db.taskflow;

using {managed} from '@sap/cds/common';


type userType      : String enum {
    clientUser;
    manager;
    member;
};

type priority      : String enum {
    high;
    medium;
    low;
}

type projectStatus : String enum {
    planning;
    hold;
    inProgress;
    completed;
}


type taskStatus    : String enum {
    hold;
    open;
    completed;
    overdue;
    onReview;
}

entity Task : managed {
    key ID          : String(10);
        title       : String;
        description : String;
        priority    : priority default 'low';
        dueDate     : Date;
        assignedTo  : Association to User;
        status      : taskStatus default 'open';
        project     : Association to Project;

}



entity User : managed{
    key ID   : String(10);
        name : String;
        type : userType;
        role : String;
        tasks:Association to many Task on tasks.assignedTo = $self;
        project: Association to Project;

}

entity Project : managed {
    key ID          : String(10);
        name        : String;
        description : String;
        members     : Association to many User on members.project = $self;
        manager     : Association to User;
        deadline    : Date;
        startDate   : Date;
        clientName  : String;
        budget      : Decimal(10, 2) default 0;
        progress    : Integer @assert.range: [
            0,
            100
        ] default 0;
        tasks       : Association to many Task
                          on tasks.project = $self;
        priority    : priority;
        status      : projectStatus


}
