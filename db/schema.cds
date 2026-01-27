namespace db.taskflow;

using {managed} from '@sap/cds/common';


type userType             : String enum {
    clientUser;
    manager;
    member;
};

type priority             : String enum {
    high;
    medium;
    low;
}

type projectStatus        : String enum {
    planning;
    hold;
    inProgress;
    completed;
}


type taskStatus           : String enum {
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
        isArchived  : Boolean default false;

}


entity User : managed {
    key ID        : String(10);
        email     : String;
        firstname : String;
        lastname  : String;
        password  : String;
        phone     : String;
        isActive  : Boolean default true;
        type      : userType;
        role      : String;
        tasks     : Association to many Task
                        on tasks.assignedTo = $self;
        projects   : Association to many User_Project on projects.user = $self;
        freepool  : Boolean default true;
        avatarUrl : LargeString;

}

entity Project : managed {
    key ID          : String(10);
        name        : String;
        description : String;
        members     : Association to many User_Project on members.project = $self;
        manager     : Association to User;
        deadline    : Date;
        startDate   : Date;
        client      : Association to User;
        budget      : Decimal(10, 2) default 0;
        progress    : Integer @assert.range: [
            0,
            100
        ] default 0;
        tasks       : Association to many Task
                          on tasks.project = $self;
        priority    : priority;
        status      : projectStatus;


}

entity User_Project  {
    key ID: Integer;
    user : Association to User;
    project : Association to Project;
}

entity AuditLog : managed {
    key ID        : String(10);
        action    : String;
        adminId   : Association to User;
        userId    : Association to User;
        taskId    : Association to Task;
        projectId : Association to Project;
        details   : String;
        logType   : String enum {
            Information;
            Warning;
            Error;
        } default 'Information';
}

// notification
type NotificationType     : String enum {
    INFO;
    SUCCESS;
    WARNING;
    ERROR;
};


type NotificationPriority : String enum {
    LOW;
    NORMAL;
    HIGH;
};


entity Notification : managed {
    key ID          : String(10);

        recipient   : Association to User;


        title       : String(120);
        message     : String(500);


        type        : NotificationType default 'INFO';
        priority    : NotificationPriority default 'NORMAL';


        isRead      : Boolean default false;
        readAt      : Timestamp;
        isArchived  : Boolean default false;
        archivedAt  : Timestamp;

        isDismissed : Boolean default false;
        dismissedAt : Timestamp;


        project     : Association to Project;
        task        : Association to Task;
        actor       : Association to User;
}



entity UserSettings : managed {
    key ID      : String(10);
    user        : Association to User;
    

    // Appearance Settings
    theme          : String(20) default 'light';  // light, dark, auto
    language       : String(10) default 'en';

    // Notification Preferences
    digestFrequency        : String(20) default 'daily';  // none, daily, weekly

}

entity SystemInfo {
    key ID                  : String(10) default 'SYSTEM';
    
    // App Info Section
    applicationName         : String(100);
    tagline                : String(200);
    version                : String(20);
    cloudFoundrySpace      : String(50);
    lastUpdate             : Date;
    
    // App Info Details
    applicationID          : String(100);
    uiVersion             : String(50);
    btpSubaccount         : String(100);
    region                : String(50);
    
    // System Status Section
    apiGatewayStatus      : String(20);  // Operational, Degraded, Down
    capServiceStatus      : String(20);
    databaseStatus        : String(20);
    authStatus            : String(20);
    fileStorageStatus     : String(20);
    
    // Support Section
    documentationUrl      : String(500);
    releaseNotesUrl       : String(500);
    contactSupportUrl     : String(500);
    
    // Footer
    copyrightText         : String(100);
}
