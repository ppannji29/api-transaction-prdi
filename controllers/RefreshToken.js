// import Users from "../models/UserModel.js";
// import Admin from "../models/AdminModel.js";
// import jwt  from "jsonwebtoken";

// export const refreshToken = async(req, res) => {
//     try {
//         const refreshToken = req.cookies.refreshToken;
//         if(!refreshToken) return res.sendStatus(401);
//         const user = await Users.findAll({
//             where: {
//                 refresh_token: refreshToken
//             }
//         });
//         if(!user[0]) return sendStatus(403);
//         jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
//             if(err) return res.sendStatus(403);
//             const userId = user[0].id;
//             const name = user[0].name;
//             const email = user[0].email;
//             const accessToken = jwt.sign({userId, name, email}, process.env.ACCESS_TOKEN_SECRET, {
//                 expiresIn: '15s'
//             });
//             res.json({ accessToken });
//         })
//     } catch (error) {
//         console.log(error);
//     }
// }

// export const refreshTokenAdmin = async(req, res) => {
//     try {
//         const refreshToken = req.cookies.refreshToken;
//         if(!refreshToken) return res.sendStatus(401);
//         const admin = await Admin.findAll({
//             where: {
//                 refresh_token: refreshToken
//             }
//         });
//         if(!admin[0]) return sendStatus(403);
//         jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
//             if(err) return res.sendStatus(403);
//             const adminId = admin[0].id;
//             const username = admin[0].username;
//             const accessToken = jwt.sign({adminId, username}, process.env.ACCESS_TOKEN_SECRET, {
//                 expiresIn: '15s'
//             });
//             res.json({ accessToken });
//         })
//     } catch (error) {
//         console.log(error);
//     }
// }