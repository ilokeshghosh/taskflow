srv.post("/Users", async (req) => {
        // const currentUser = req.user;
        // const scope = currentUser.scopes || [];

        // if (!scope.some(s => s.includes("admin"))) {
        //     return req.error(403, "Only Admins can create Users");
        // }
        console.log("i am here ");
        const { email, firstname, lastname, phone, password, retypePassword, role, type } = req.data;

        
        if (!role || !type) {
            return req.error(400, "Role and Type are required");
        }

        if (!email || !firstname || !lastname || !password) {
            return req.error(400, 'Email, firstName, lastName and password are required');
        }

        

        const hashedPassword = await hashPassword(password);

        const newUser = {
            ID: "USER" + Date.now().toString().slice(-6),
            email,
            firstname,
            lastname,
            password: hashedPassword,
            phone,
            isActive: true,
            role,
            type
        }


        try {
            const result = await cds.run(INSERT.into("User").entries([newUser]));

            await logAuditEvent(newUser.ID,
                'user.created',
                `user created with email   ${newUser.email}`,
            )

            return {
                success: true,
                userId: newUser.ID,
                email: newUser.email,
                message: 'User Created',
                password
            }
        } catch (error) {
            console.error("Error creating user", error?.message ?? error);
            return req.error(500, "Failed to Create User");
        }


    });