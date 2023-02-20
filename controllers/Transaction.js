// import Transaction from "../models/TransactionModel.js";
import LabTest from "../models/LabTestModel.js";
import LabTestOrder from "../models/LabTestOrderModel.js";
import jwt from "jsonwebtoken";
import { Op, JSON, json } from "sequelize";
import Sequelize from "../config/Database.js";
import axios from "axios";
// import fs from "node:fs";

export const TestApi = async(req, res) => {
    let transaction;
    try {
        transaction = await Sequelize.transaction();        
        await axios.post('https://192.168.106.187:18065/api/prdi/get/notification/reg?ParamIn=0&ParamOut=1', 
            { 
                // rejectUnauthorized: false, 
                // key: fs.readFileSync('./certificates/key.pem'),
                // cert: fs.readFileSync('./certificates/certificate.pem')
            }, { transaction })
            .then(function (response) {
                const result = response.data.RESPONSE1;
                transaction.commit();
                res.json({ result });
            })
    } catch (error) {
        await transaction.rollback();
        console.log(error);
    }
}

export const ApiLabTest = async(req, res) => {
    let transaction;
    try {
        transaction = await Sequelize.transaction();
        const { max_record, date_from, date_to, service_type } = req.body;
        let order = [];
        let status;
        const getOrderAPI = process.env.GET_ORDER_LAB_TEST_TRANSACTION;
        // -----------------------------------------------------
        // Start Of : Get Order Transaction Lab Test PRDA + PRDI
        // ------------------------------------------------------
        let getOrder = await axios.post(getOrderAPI, 
        {
            "P1": "1",
            "P2": max_record,
            "P3": "",
            "P4": "",
            "P5": "",
            "P6": "",
            "P7": service_type,
            "P8": date_from,
            "P9": date_to
        }).then(function (res) {
            order.push(res.data.RESPONSE2);
            status = res.data.RESPONSE1[0].CEK_STATUS
        })
        // -----------------------------------------------------
        // End Of : Get Order Transaction Lab Test PRDA + PRDI
        // ------------------------------------------------------
        if(status == "SUCCESS") {
            // console.log("test");
            let orderList = order[0];
            // -----------------------------------------------------
            // Start Of : Filter Only PRDI Order Transaction
            // ------------------------------------------------------
            let filterOrder = orderList.filter(orderList => orderList.ORDER_NUMBER.includes('LTNW'));
            const cntData = filterOrder.length;
            const getOrderPrdiById = process.env.GET_ORDER_LAB_TEST_BY_ID_TRANSACTION;
            for (let i = 0; i < cntData; i++) {
                await axios.post(getOrderPrdiById, 
                {
                    "P1": filterOrder[i].ORDER_NUMBER
                }).then(function (orderById) {
                    if(orderById.data.RESPONSE3.length !== 0) {
                        filterOrder[i]['order_by_id'] = [
                            {
                                'omzet': orderById.data.RESPONSE3[0].PRICE_ACTUAL,
                                'omzet_ppn': orderById.data.RESPONSE2[0].AMOUNT_PPN,
                                'payment_by': orderById.data.RESPONSE2[0].PAYMENT_CHANNEL,
                                'omzet_ppn_free': orderById.data.RESPONSE2[0].AMOUNT_PPN_FREE,
                                'omzet_ppn_levied': orderById.data.RESPONSE2[0].AMOUNT_PPN_LEVIED,
                                'tests': orderById.data.RESPONSE3
                            }
                        ];
                    } else {
                        filterOrder[i]['order_by_id'] = [];
                    }
                })
            }
            let cntFilterOrder = await filterOrder.length;
            let insTrx = [];
            let tempStatusPayment = '';
            for (let j = 0; j < cntFilterOrder; j++) {
                if(filterOrder[j]['order_by_id'].length !== 0) {
                    if(filterOrder[j].CEK_STATUS == 'TOPAY') {
                        tempStatusPayment = 'PENDING';
                    }  
                    if(filterOrder[j].CEK_STATUS == 'CANCEL') {
                        tempStatusPayment = 'FAILED';
                    }  
                    if(filterOrder[j].CEK_STATUS == 'COMPLETE') {
                        tempStatusPayment = 'PAID';
                    }  
                    if(filterOrder[j].CEK_STATUS == 'PROCESS') {
                        tempStatusPayment = 'PAID';
                    }  
                    if(filterOrder[j].CEK_STATUS == 'PAID') {
                        tempStatusPayment = 'PAID';
                    }  
                    insTrx.push(
                        {
                            order_id: filterOrder[j].ORDER_NUMBER,
                            outlet: filterOrder[j].APPOINTMENT_OUTLET_NAME,
                            patient_id: parseInt(filterOrder[j].CUSTOMER_ID),
                            status_payment: tempStatusPayment,
                            status_order: filterOrder[j].CEK_STATUS,
                            payment_by: filterOrder[j].order_by_id[0].payment_by,
                            omzet: parseInt(filterOrder[j].order_by_id[0].omzet),
                            omzet_ppn: parseInt(filterOrder[j].order_by_id[0].omzet_ppn),
                            omzet_ppn_free: parseInt(filterOrder[j].order_by_id[0].omzet_ppn_free),
                            tests: filterOrder[j].order_by_id[0].tests,
                            home_service: filterOrder[j].SERVICE_TYPE,
                            referral_type_id: filterOrder[j].REFERRAL_DOCTOR_SPECIALITY,
                            doctor_name: filterOrder[j].REFERRAL_DOCTOR_NAME,
                            order_date: filterOrder[j].CREATED_AT,
                        },
                    );
                    tempStatusPayment = '';
                }
            }
            const countInsTrx = insTrx.length;
            let dataInsTrx = [];
            let dataInsTest = [];
            // -----------------------------------------------------
            // Start Of : Data Valid Transaction PRDI Will Be Store 
            // ------------------------------------------------------
            let tempTrxId = '';
            let tempOrderId = '';
            for (let k = 0; k < countInsTrx; k++) {
                dataInsTrx[k] = await LabTest.create({
                    order_id: insTrx[k].order_id,
                    outlet: insTrx[k].outlet,
                    patient_id: insTrx[k].patient_id,
                    status_payment: insTrx[k].status_payment,
                    status_order: insTrx[k].status_order,
                    payment_by: insTrx[k].payment_by,
                    omzet: insTrx[k].omzet,
                    omzet_ppn: insTrx[k].omzet_ppn,
                    omzet_ppn_free: insTrx[k].omzet_ppn_free,
                    home_service: insTrx[k].home_service,
                    referral_type_id: insTrx[k].referral_type_id,
                    doctor_name: insTrx[k].doctor_name,
                    order_date: insTrx[k].order_date
                }, { transaction });
                tempTrxId = dataInsTrx[k].id;
                tempOrderId = dataInsTrx[k].order_id;
                // ------------------------------
                // Start Of : Storing Data Test From Order 
                // -----------------------------
                for (let jk = 0; jk < insTrx[k].tests.length; jk++) {
                    await LabTestOrder.create({
                        order_id: tempOrderId,
                        test_id: insTrx[k].tests[jk].TYPE_ID,
                        test_name: insTrx[k].tests[jk].NAME,
                        price_actual: insTrx[k].tests[jk].PRICE_ACTUAL,
                        quantity: insTrx[k].tests[jk].QUANTITY,
                        type: insTrx[k].tests[jk].TYPE,
                        order_lab_test_id: tempTrxId
                    }, { transaction }).then(function (resData) {
                        dataInsTest.push(resData);
                    });
                }
                tempTrxId = '';
                tempOrderId = '';
            }
            let countDataTrxIns = dataInsTrx.length;
            let countDataOrderTest = dataInsTest.length;
            await transaction.commit();
            res.json(
                { 
                    cntData,
                    countDataTrxIns,
                    countDataOrderTest,
                    dataInsTrx,
                    dataInsTest
                }
            );
        } else {
            res.status(404).send({
                message: "Data Order Not Found"
            });
        }
    } catch (error) {
        await transaction.rollback();
        console.log(error);
    }
}

// --------------------
// JWT Check User
// ------------------- 
// function getAdminByIdFromJwt(token) {
//     let adminId;
//     let usernameAdmin;
//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//         if(err) return res.sendStatus(403)
//         adminId = decoded.adminId;
//         usernameAdmin = decoded.username;
//     })
//     const checkAdmin = Admin.findOne({ 
//         where: {
//             [Op.and]: [
//                 { id: adminId },
//                 { username: usernameAdmin }
//             ]
//         },
//     });
//     console.log("ID ADMIN : ", adminId);
//     if(checkAdmin) {
//         return adminId;
//     } else {
//         res.status(403).send({
//             message: "You are not allowed to get this action"
//         }); 
//     }
// }

// export const ListOfTransaction = async(req, res) => {
//     try {
//         const transaction = await Transaction.findAll({
//             include: [
//             {
//                 model: Merchant,
//                 as: 'merchant',
//                 order: [['Transaction.updateAt','DESC']]
//             },
//             {
//                 model: Admin,
//                 as: 'admin',
//                 order: [['Transaction.updateAt','DESC']]
//             }]
//         });
//         if(transaction) {
//             res.json({ data: transaction });
//         } else {
//             res.status(404).send({
//                 message: "Transaction Not Found"
//             });
//         }
//     } catch (error) {
//         console.log(error);
//     }
// }

// export const GenerateTransaction = async(req, res) => {
//     try {
//         const authHeader = req.headers['authorization']
//         const token = authHeader && authHeader.split(' ')[1]
//         if (token == null) return res.sendStatus(401)
//         let getAdminID = getAdminByIdFromJwt(token);
//         // console.log("ADMIN ID UPD >> : ", getAdminID);
//         if(getAdminID) {
//             const { transaction } = req.body;
//             const trxLength = transaction.length;
//             let insTrx = [];
//             for (let i = 0; i < trxLength; i++) {
//                 insTrx[i] = await Transaction.create({
//                     amount: transaction[i].amount,
//                     content: transaction[i].content,
//                     paymentType: transaction[i].paymentType,
//                     merchantId: transaction[i].merchantId,
//                     adminId: getAdminID
//                 });
//             }
//             res.status(200).send({
//                 message: "Success To Generate Transaction",
//                 data: insTrx
//             });
//         }
//     } catch (error) {
//         console.log(error)
//     }
// }