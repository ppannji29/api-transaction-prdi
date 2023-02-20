import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import db from "./config/Database.js";
// --------------------------------------------
// Open Comment If You Need To Migrate Table DB
// --------------------------------------------
// import Users from "./models/UserModel.js";
// import HealthShop from "./models/HealthShopModel.js";
// import HealthShopOrder from "./models/HealthShopOrderModel.js";
import LabTest from "./models/LabTestModel.js";
import LabTestOrder from "./models/LabTestOrderModel.js";
// ----------------------------------------------------------
import cors from "cors";
import router from "./routes/index.js";
import BodyParser from "body-parser";
dotenv.config();
const app = express();

try {
    await db.authenticate();
    console.log("Database connected..");
    // --------------------------------------
    // Start Of : Migrate Table DB with Sync
    // ---------------------------------------
    // await Users.sync();
    await LabTest.sync();
    await LabTestOrder.sync();
    // await HealthShop.sync();
    // await HealthShopOrder.sync();
    // --------------------------------------
    // End Of : Migrate Table DB with Sync
    // ---------------------------------------
} catch (error) {
    console.log(error);
}

// Allow Request From Origin Properties Cors
app.use(cors({ credentials:true, origin: 'http://localhost:3000' }));
// app.use(cors({ credentials:true }));
app.use(cookieParser());
app.use(express.json());
app.use(BodyParser.json())
app.use(BodyParser.urlencoded({ extended: true }))


app.use(router);

app.listen(5001, () => console.log("Server running at port 5001"));