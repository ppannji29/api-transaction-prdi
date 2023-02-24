import express from "express";
import { TestApi, ApiLabTest, GetTest, HealthShopTransaction, GetHealthShopTransaction } from "../controllers/Transaction.js";
import { Register, Login, RegisterByAdmin } from "../controllers/Users.js";
import { verifyToken, verfiyTokenDefault } from "../middleware/verifyToken.js";
// import { refreshToken, refreshTokenAdmin } from "../controllers/RefreshToken.js";

const router = express.Router();

// ----------------------------
// Start Of Transaction Routes
// ----------------------------
// router.get('/api/transaction/list', verifyTokenAdmin, ListOfTransaction);
// router.post('/api/transaction/generated', verifyTokenAdmin, GenerateTransaction);
router.get('/api/transaction/testapi', TestApi);
router.post('/api/transaction/labtest', ApiLabTest);
router.get('/api/transaction/listtest', verifyToken, GetTest);
router.post('/api/transaction/healthshop', HealthShopTransaction);
router.get('/api/transaction/fetch/healthshop', GetHealthShopTransaction);
// ----------------------------
// End Of Transaction Routes
// ----------------------------
router.post('/api/register/accout', verfiyTokenDefault, Register);
router.post('/api/login/accout', verfiyTokenDefault, Login);
router.post('/api/register/account/byadmin', verifyToken, RegisterByAdmin);



export default router;