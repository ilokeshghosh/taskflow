const cds = require("@sap/cds");
const { v4: uuid } = require("uuid");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { SELECT, INSERT } = require("@sap/cds/lib/ql/cds-ql");
const crypto = require("crypto");




const provisioning = async (userSchema, user) => {
    try {
        const existingUser = await cds.run(
            SELECT.one.from(userSchema).where({ email: user.id }),
        );

        if (!existingUser) {
            throw Error("User Does Not Exists in DB");
        }

        const userProfile = {
            ID: existingUser.ID,
            email: existingUser.email,
            firstname: existingUser.firstname,
            lastname: existingUser.lastname,
            phone: existingUser.phone,
            avatarUrl: existingUser.avatarUrl,
            isActive: existingUser.isActive,
            designation: existingUser.role,
            roles: Object.keys(user?.roles),
            attributes: user.attributes,
        };

        // console.log("userProfile",userProfile);
        return userProfile;
    } catch (error) {
        console.error(400, error?.message);
    }
};

module.exports = cds.service.impl(async function () {
    const {
        Users,
        AuditLog,
        UserSettings,
        Projects,
        User_Project,
        Notifications,
        Tasks,
    } = this.entities;
    this.before("*", async (req) => {
        const userProfile = await provisioning(Users, req?.user);

        req.user = userProfile;
    });

    this.before("CREATE", "Users", async (req) => {
        const { Users } = this.entities;
        const { email, firstname, lastname, phone, password, role, type } =
            req.data;
        if (!role || !type) {
            return req.error(400, "Role and Type are required");
        }

        if (!email || !firstname || !lastname || !password) {
            return req.error(
                400,
                "Email, firstName, lastName and password are required",
            );
        }

        const existingUser = await cds.run(SELECT.one.from(Users).where({ email }));

        if (existingUser) {
            return req.error(409, `User with ${email} is already exists`);
        }
    });

    this.on("CREATE", "Users", async (req) => {
        const newUser = {
            ID: "USER" + Date.now().toString().slice(-2),
            email: req.data.email,
            firstname: req.data.firstname,
            lastname: req.data.lastname,
            password: req.data.hashedPassword,
            phone: req.data.phone,
            isActive: true,
            role: req.data.role,
            type: req.data.type,
        };
        const userData = req.data;

        try {
            await INSERT.into(Users).entries({
                ID: userData.ID,
                email: userData.email,
                firstname: userData.firstname,
                lastname: userData.lastname,
                password: userData.hashedPassword,
                phone: userData.phone,
                isActive: true,
                role: userData.role,
                type: userData.type,
                createdBy: userData.ID,
                modifiedBy: userData.ID,
            });

            await logAuditEvent(
                userData.ID,
                "user.created",
                `user created with email ${userData.email}`,
            );

            return {
                status: 200,
                success: true,
                userId: newUser.ID,
                email: newUser.email,
                message: "User Created",
                password: req.data.password,
            };
        } catch (error) {
            console.error("Error creating user", error?.message ?? error);
            return req.error(500, "Failed to Create User");
        }
    });

    this.before("READ", "Projects", async (req) => {
        const userInfo = await this.getcurrentUser();
        const userId = userInfo?.ID;
        req.query.where({
            ID: {
                in: SELECT.from(User_Project)
                    .columns("project_ID")
                    .where({ user_ID: userId }),
            },
        });
    });

    this.before("READ", "Tasks", async (req) => {

        const userInfo = await this.getcurrentUser();
        const userId = userInfo?.ID;

        if (!userId) {
            req.error(400, "Invalid User");
        }

        req.query.where({
            project_ID: {
                in: SELECT.from(User_Project)
                    .columns("project_ID")
                    .where({ user_ID: userId }),
            },
        });

    });



    this.after("CREATE", "Tasks", async (req, res) => {

        const userInfo = await this.getcurrentUser();
        const userName = `${userInfo?.firstname} ${userInfo?.lastname}`;
        const taskData = res.results;

        const projectId = taskData.project_ID;
        const project = await SELECT.one.from(Projects).where({ ID: projectId });

        // admin info
        const adminId = project?.manager_ID;
        const adminData = await SELECT.one.from(Users).where({ ID: adminId });
        const adminName = `${adminData?.firstname} ${adminData?.lastname}`;


        // assigned to info
        const assignedToId = taskData.assignedTo_ID;
        const assignedToData = await SELECT.one
            .from(Users)
            .where({ ID: assignedToId });
        const assignedToName = `${assignedToData?.firstname} ${assignedToData?.lastname}`;

        const data = {
            action: "TASK.CREATE",
            userId_ID: userInfo.ID,
            taskId_ID: taskData.ID,
            projectId_ID: projectId,
            adminId_ID: adminId,
            details: `'${taskData.title}' task is created by '${userName}' in '${project.name}' project, which is managed by '${adminName}' and the task assigned to '${assignedToName}'`,
            logType: "Information",
        };

        await logAuditEvent(data);

        // Notification Logic can be added here
        const notificationMessage = `Hello ${assignedToName}, A new task '${taskData.title}' has been assigned to you in the project '${project.name}'. Please check your task list for more details.`;
        const notificationData = {
            recipient_ID: assignedToId,
            title: "New Task Assigned",
            message: notificationMessage,
            priority: taskData.priority.toUpperCase(),
            project_ID: projectId,
            task_ID: taskData.ID,
            actor_ID: userInfo.ID,
            createdBy: userInfo.ID,
            modifiedBy: userInfo.ID,
        };


        // console.log("data", notificationHandler);

        await notificationHandler(Notifications, notificationData);
    });


    // audit log and notification on project creation can be added here
    this.after("CREATE", "Projects", async (req, res) => {

        const userInfo = await this.getcurrentUser();
        const userName = `${userInfo?.firstname} ${userInfo?.lastname}`;
        const projectData = res.results;
        const assignedToId = projectData.manager_ID;
        const assignedToData = await SELECT.one
            .from(Users)
            .where({ ID: assignedToId });
        const assignedToName = `${userInfo?.firstname} ${userInfo?.lastname}`;

        const data = {
            action: "PROJECT.CREATE",
            userId_ID: userInfo.ID,
            projectId_ID: projectData.ID,
            details: `Project '${projectData.name}' is created by '${userName}'`,
            logType: "Information",
        };

        await logAuditEvent(data);

        // Notification Logic can be added here
        const notificationMessage = `Hello ${assignedToName}, A new project '${projectData.name}' has been created by '${userName}'. Please check your project list for more details.`;
        // const notificationData = {
        //     recipient_ID: userInfo.ID, // can be added to notify specific users
        //     title: "New Project Created",
        //     message: notificationMessage,
        //     priority: projectData.priority,
        //     project_ID: projectData.ID,
        //     actor_ID: userInfo.ID,
        //     createdBy: userInfo.ID,
        //     modifiedBy: userInfo.ID,
        // };
        // console.log("Notification Message:", notificationData);

        // console.log("data", notificationHandler);

        // await notificationHandler(Notifications, notificationData);
    });

    this.after("CREATE", "User_Project", async (req, res) => {
        const actorInfo = await this.getcurrentUser();
        const userResponseInfo = res.results;
        const userData = await SELECT.one.from(Users).where({ ID: userResponseInfo.user_ID });
        const userName = `${userData?.firstname} ${userData?.lastname}`;
        const actorName = `${actorInfo?.firstname} ${actorInfo?.lastname}`;
        const projectData = await SELECT.one.from(Projects).where({ ID: userResponseInfo.project_ID });

        const data = {
            action: "PROJECT.ASSIGNED",
            adminId_ID: actorInfo.ID,
            userId_ID: userResponseInfo.user_ID,
            projectId_ID: userResponseInfo.project_ID,
            details: `User '${userName}'(${userData?.ID}) is assigned to project '${projectData.name}'(${projectData.ID}) by '${actorName}'(${actorInfo?.ID})`,
            logType: "warning",
        }
        await logAuditEvent(data);

        const notificationMessage = `Hi ${userName}, You have been assigned to a new project '${projectData.name}' by '${actorName}'. Please connect with '${actorName}' for more details`;


        const notificationData = {
            recipient_ID: userResponseInfo.user_ID,
            title: "New Project Assignment",
            message: notificationMessage,
            priority: projectData.priority.toUpperCase(),
            project_ID: userResponseInfo.project_ID,
            actor_ID: actorInfo.ID,
            createdBy: actorInfo.ID,
            modifiedBy: actorInfo.ID,
        };

        await notificationHandler(Notifications, notificationData);
    })

    this.on("getcurrentUser", async (req) => {
        try {
            return req?.user;
        } catch (error) {
            console.error(400, error?.message);
        }
    });

    this.on("getcurrentUserSettings", async (req) => {
        try {
            const userSettings = await SELECT.one
                .from(UserSettings)
                .where({ user_ID: req.user.ID });


            return userSettings;
        } catch (error) {
            console.error(400, error?.message);
        }
    });

});

async function logAuditEvent(data) {
    const { AuditLog } = cds.entities;

    await INSERT.into(AuditLog).entries({
        ID: randomString(10),
        ...data,
        createdBy: data.userId,
        modifiedBy: data.userId,
    });
}

async function notificationHandler(Notifications, notificationData) {


    try {
        await INSERT.into(Notifications).entries({
            ID: randomString(10),
            ...notificationData,
        });


    } catch (error) {
        console.error("Notification Error:", error?.message ?? error);
    }
}

function randomString(length = 10) {
    return crypto
        .randomBytes(length)
        .toString("base64url")
        .slice(0, length);
}
