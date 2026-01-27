const cds = require('@sap/cds');
const { v4: uuid } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { exists } = require('@sap/cds/lib/utils/cds-utils');
const { SELECT } = require('@sap/cds/lib/ql/cds-ql');

const provisioning = async (userSchema, user) => {
    try {
        const existingUser = await cds.run(
            SELECT.one.from(userSchema).where({ email: user.id })
        )

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
            attributes: user.attributes
        }

        // console.log("userProfile",userProfile);
        return userProfile;
    } catch (error) {
        console.error(400, error?.message);
    }


}

module.exports = cds.service.impl(async function () {
    const { Users, AuditLog, UserSettings,Projects,User_Project } = this.entities;
    this.before("*", async (req) => {
        const userProfile = await provisioning(Users, req?.user);

        req.user = userProfile;

    })

    this.before('CREATE', 'Users', async (req) => {
        const { Users } = this.entities;
        const { email, firstname, lastname, phone, password, role, type } = req.data;
        if (!role || !type) {
            return req.error(400, "Role and Type are required");
        }

        if (!email || !firstname || !lastname || !password) {
            return req.error(400, 'Email, firstName, lastName and password are required');
        }
       
        const existingUser = await cds.run(
            SELECT.one.from(Users).where({ email })
        )

        if (existingUser) {
            return req.error(409, `User with ${email} is already exists`);

        }

        // const hashedPassword = await hashPassword(password);
        // req.data.hashedPassword = hashedPassword;
        // req.data.ID = "USER" + Date.now().toString().slice(-4);
    });

    this.on('CREATE', 'Users', async (req) => {
        const newUser = {
            ID: "USER" + Date.now().toString().slice(-2),
            email: req.data.email,
            firstname: req.data.firstname,
            lastname: req.data.lastname,
            password: req.data.hashedPassword,
            phone: req.data.phone,
            isActive: true,
            role: req.data.role,
            type: req.data.type
        }
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
                modifiedBy: userData.ID
            });


            await logAuditEvent(userData.ID,
                "user.created",
                `user created with email ${userData.email}`
            )

            return {
                status: 200,
                success: true,
                userId: newUser.ID,
                email: newUser.email,
                message: "User Created",
                password: req.data.password,
            }

        } catch (error) {
            console.error("Error creating user", error?.message ?? error);
            return req.error(500, "Failed to Create User");
        }
    })

    this.before('READ', 'Projects', async (req) => {
        const userInfo = await this.getcurrentUser();
        const userId = userInfo?.ID;
        // console.log("user",await this.getcurrentUser());
        
        // next();
        req.query.where(
            {ID:{in : 
                SELECT.from(User_Project).columns('project_ID').where({user_ID:userId})
            }}
        )
    })

    // this.on('READ', 'Projects', async (req,next) => {
    //     console.log("final query", req.user);
    //     const currentUserId = req.user.ID;

    //     if(!currentUserId){
    //         req.Error("User Not Found");
    //     }


        
        // const data = await SELECT.from(Projects).where(`'members.user.ID'= ${currentUserId}`).columns('ID','name','members.ID','members.user.email','members.user.ID');
        // console.log("data", data);
        // return await cds.run(req.query);
        // return next();
    // });

    // this.after("READ",'Projects',async(res,data)=>{
    //     console.log('res',data.results);
    // })


    this.before('READ','Tasks',async(req)=>{
        // console.log("req",req)
        const userInfo = await this.getcurrentUser();
        const userId = userInfo?.ID
        // console.log('curret',await this.getcurrentUser().ID);
        if(!userId){
            req.error(400,"Invalid User");
        }
        
        req.query.where({
            project_ID:{
                in: SELECT.from(User_Project).columns("project_ID").where({user_ID:userId})
            }}
        )
        //task = current user is member of x project, all tasks of x projects
    })


    // this.after('READ','Tasks',async(req,res)=>{
    //     console.log("ress",res)
    // })
    // Authentication Logics
    // this.on("login", async (req, res) => {
    //     const { email, password } = req.data;

    //     if (!email || !password) {
    //         return req.error("Email & Password are required");
    //     }

    //     try {
    //         const user = await SELECT.one.from(Users).where({ email });
    //         console.log("Debug",user);


    //         if (!user) {
    //             return req.error("User Not Found");
    //         }

    //         const isPasswordValid = await verifyPassword(password, user.password);

    //         if (!isPasswordValid) {
    //             return req.error(402, "Password not Matched");
    //         }

    //         // console.log("is password valid", isPasswordValid);
    //         const token = await generateJWT({
    //             userId: user.ID,
    //             email: user.email,
    //             firstname: user.firstname,
    //             lastname: user.lastname,
    //             role: user.role,
    //             type: user.type
    //         });

    //         await logAuditEvent(user.ID, "user.login", `${user.email} logged in`);
    //         return {
    //             status: 200,
    //             success: true,
    //             token: token,
    //             user: {
    //                 ID: user.ID,
    //                 email: user.email,
    //                 firstname: user.firstname,
    //                 lastname: user.lastname,
    //                 role: user.role,
    //                 type: user.type
    //             },
    //             expiresIn: 86400  // 24 hours in seconds
    //         }
    //     } catch (error) {
    //         console.error("Failed to Login ", error?.message);
    //         return req.error("Failed to login");
    //     }


    // })

    // verifyToken / login without credential
    // this.on('verifyToken', async (req) => {
    //     const secret = process.env.JWT_SECRET;
    //     const token = req.headers.authorization.split("Bearer ")[1];
    //     if (!token) {
    //         return req.error(400, "Token is required");
    //     }
    //     try {
    //         const decoded = jwt.verify(token, secret);

    //         return {
    //             valid: true,
    //             user: decoded
    //         }
    //     } catch (error) {
    //         console.error(error?.message ?? "Invalid or expired Token, Relogin")
    //         return req.error(401, error?.message ?? "Invalid or expired Token, Relogin");
    //     }
    // })


    // this.on("READ","Tasks",(req,next)=>{
    //     console.log("user data on read",req?.user);
    //     // next();
    //     return next();
    // })



    async function logAuditEvent(userId, action, details) {



        await INSERT.into(AuditLog).entries({
            ID: "LOG" + Date.now().toString().slice(-6),
            userId_ID: userId,
            action,
            details,
            createdBy: userId,
            modifiedBy: userId
        })
    };

    this.on("getcurrentUser", async (req) => {
        try {
            return req?.user;
        } catch (error) {
            console.error(400, error?.message);
        }
    })

    this.on("getcurrentUserSettings", async (req) => {
        // console.log("req", req.user);
        try {
            const userSettings = await SELECT.one.from(UserSettings).where({ user_ID: req.user.ID });

            // console.log("userSettings", userSettings);
            return userSettings;
        } catch (error) {
            console.error(400, error?.message);
        }
    })



})

