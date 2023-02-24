import Users from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const getUsers = async(req, res) => {
    try {
        const users = await Users.findAll({
            attributes: ['id', 'name', 'email']   
        });
        res.json(users); 
    } catch (error) {
        console.log(error);
    }
}

const getAdminIdByJWT = async (token) => {
    let userId;
    let name;
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if(err) return res.sendStatus(403)
        userId = decoded.userId;
        name = decoded.name;
    });
    let role;
    let response;
    await Users.findOne({ 
        where: {
            id: userId 
        },
        where: {
            [Op.and]: [
                { id: userId }
            ]
        },
    }).then(function (result) {
        role = result.role;
    })
    if(role == 'admin') {
        response = userId;
        return response;
    } else {
        return false;
    }
}

export const RegisterByAdmin = async(req, res) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)
    let getUser = getAdminIdByJWT(token);
    let userId;
    await getUser.then(function(result) {
        userId = result;
    });
    if(userId == false) {
        console.log("FALSE : ", userId);
        res.status(403).send({message: "You are not allowed to get this action"}); 
    } else {
        const { name, email, password, confPassword, role } = req.body;
        if(password !== confPassword) {
            console.log("password : ", password);
            console.log("confpassword : ", confPassword);
            return res.status(400).json({msg: "Password doesn't match"})
        }
        let checkEmail = await Users.findOne({
            where: {
                email: email
            }
        })
        if(checkEmail) return res.status(400).json({msg: "Email Already Used"});
        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(password, salt);
        console.log("same : ", hashPassword);
        try {
            let roleLowerCase = role.toLowerCase();
            const userCreate = await Users.create({
                name: name,
                email: email,
                password: hashPassword,
                role: roleLowerCase
            });
            res.status(200).send({
                status: 200,
                message: "Registration Successfully",
                data: userCreate
            });
        } catch (error) {
            console.log(error);
        }
    }
}

export const Register = async(req, res) => {
    const { name, email, password, confPassword } = req.body;
    if(password !== confPassword) {
        console.log("password : ", password);
        console.log("confpassword : ", confPassword);
        return res.status(400).json({msg: "Password doesn't match"})
    }
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);
    console.log("same : ", hashPassword);
    try {
        const userCreate = await Users.create({
            name: name,
            email: email,
            password: hashPassword
        });
        res.status(200).send({
            status: 200,
            message: "Registration Successfully",
            data: userCreate
        });
    } catch (error) {
        console.log(error);
    }
}

export const Login = async(req, res) => {
    try {
        const user = await Users.findAll({
            where: {
                email: req.body.email
            }
        });
        const match = await bcrypt.compare(req.body.password, user[0].password);
        if(!match) return res.status(400).json({msg: "Wrong Password"});
        const userId = user[0].id;
        const name = user[0].name;
        const email = user[0].email;
        const role = user[0].role;
        const accessToken = jwt.sign({userId, name, email, role}, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '1h'
        });
        await Users.update({refresh_token: accessToken}, {
            where: {
                id: userId
            }
        });
        res.json({ accessToken });
    } catch (error) {
        res.status(404).json({
            msg: "Email not found"
        });
    }
}