import express from "express";
import { TestApi, ApiLabTest } from "../controllers/Transaction.js";
// import { verifyToken, verifyTokenAdmin } from "../middleware/verifyToken.js";
// import { refreshToken, refreshTokenAdmin } from "../controllers/RefreshToken.js";

const router = express.Router();

// ----------------------------
// Start Of Transaction Routes
// ----------------------------
// router.get('/api/transaction/list', verifyTokenAdmin, ListOfTransaction);
// router.post('/api/transaction/generated', verifyTokenAdmin, GenerateTransaction);
router.get('/api/transaction/testapi', TestApi);
router.post('/api/transaction/labtest', ApiLabTest);
// ----------------------------
// End Of Transaction Routes
// ----------------------------



export default router;