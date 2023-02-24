// import Transaction from "../models/TransactionModel.js";
import Users from "../models/UserModel.js";
import LabTest from "../models/LabTestModel.js";
import LabTestOrder from "../models/LabTestOrderModel.js";
import jwt from "jsonwebtoken";
import { Op, JSON } from "sequelize";
import Sequelize from "../config/Database.js";
import axios from "axios";
import HealthShop from "../models/HealthShopModel.js";
import HealthShopOrder from "../models/HealthShopOrderModel.js";
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
                                'omzet': orderById.data.RESPONSE2[0].AMOUNT_ACTUAL,
                                'omzet_ppn': orderById.data.RESPONSE2[0].AMOUNT_PPN,
                                'payment_by': orderById.data.RESPONSE2[0].PAYMENT_CHANNEL,
                                'omzet_ppn_free': orderById.data.RESPONSE2[0].AMOUNT_PPN_FREE,
                                'omzet_ppn_levied': orderById.data.RESPONSE2[0].AMOUNT_PPN_LEVIED,
                                // 'tests': orderById.data.RESPONSE3[0].NAME
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
                            row_id: filterOrder[j].ROW_ID,
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
                    row_id: insTrx[k].row_id,
                    order_date: insTrx[k].order_date
                }, { transaction });
                tempTrxId = dataInsTrx[k].id;
                tempOrderId = dataInsTrx[k].order_id;
                for (let jk = 0; jk < insTrx[k].tests.length; jk++) {
                    await LabTestOrder.create({
                        order_id: tempOrderId,
                        test_id: insTrx[k].tests[jk].TYPE_ID,
                        test_name: insTrx[k].tests[jk].NAME,
                        price_actual: insTrx[k].tests[jk].PRICE_ACTUAL,
                        quantity: insTrx[k].tests[jk].QUANTITY,
                        type: insTrx[k].tests[jk].TYPE,
                        orderLabTestId: tempTrxId
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

export const HealthShopTransaction = async(req, res) => {
    let transaction;
    const { dateFrom, dateTo } = req.body;
    try {
        transaction = await Sequelize.transaction();
        let orders = [];
        let orderLength;
        await axios.get(process.env.GET_ORDER_HEALTH_SHOP, {
            params: {
                fromDate: dateFrom,
                toDate: dateTo
            }
        }).then(function (res) {
            orderLength = res.data.length;
            const drug = 'Drug';
            if(orderLength > 0) {
                for (let i = 0; i < orderLength; i++) {
                    if(res.data[i].orderType == drug) {
                        orders.push(res.data[i]);
                    }
                }
            } else {
                orders = [];
            }
        });
        const ordersLength = orders.length;
        if(orderLength > 0) {
            let insOrders = [];
            let insOrderDetail = [];
            let paymentMethod = '';
            let taxAmount = '';
            let vendorOrderReference = '';
            let trackingUrl = '';
            let rejectCode;
            let rejectReason = '';
            let tempTrxId;
            let tempOrderId;
            for (let i = 0; i < ordersLength; i++) {
                if(orders[i].paymentMethod == '') {
                    paymentMethod = '';
                } else {
                    paymentMethod = orders[i].paymentMethod;
                }
                if(orders[i].channel == '') {
                    paymentMethod = '';
                } else {
                    paymentMethod = orders[i].channel;
                }
                if(orders[i].taxAmount == '') {
                    taxAmount = '';
                } else {
                    taxAmount = orders[i].taxAmount;
                }
                if(orders[i].vendorOrderReference == '') {
                    vendorOrderReference = '';
                } else {
                    vendorOrderReference = orders[i].vendorOrderReference;
                }
                if(orders[i].trackingUrl == '') {
                    trackingUrl = '';
                } else {
                    trackingUrl = orders[i].trackingUrl;
                }
                if(orders[i].rejectCode == '') {
                    rejectCode = '';
                } else {
                    rejectCode = orders[i].rejectCode;
                }
                if(orders[i].rejectReason == '') {
                    rejectReason = '';
                } else {
                    rejectReason = orders[i].rejectReason;
                }
                insOrders[i] = await HealthShop.create({
                    order_id: orders[i].orderId,
                    patient_id: orders[i].patientId,
                    patient_name: orders[i].patientName,
                    patient_mobile: orders[i].patientMobile,
                    patient_email: orders[i].patientEmail,
                    order_status: orders[i].orderStatus,
                    order_type: orders[i].orderType,
                    payment_method: paymentMethod,
                    vendor_id: orders[i].vendorId,
                    order_amount: orders[i].orderAmount,
                    tax_amount: taxAmount,
                    order_date: orders[i].orderDate,
                    order_time: orders[i].orderTime,
                    update_time: orders[i].updateTime,
                    vendor_order_reference: vendorOrderReference,
                    total_price: orders[i].totalPrice,
                    latitude: orders[i].geolocation['latitude'],
                    longitude: orders[i].geolocation['longitude'],
                    address_note: orders[i].addressNote,
                    store_id: orders[i].storeId,
                    shipping_fee: orders[i].shippingFee,
                    delivery_status: orders[i].deliveryStatus,
                    tracking_url: trackingUrl,
                    reject_code: rejectCode,
                    reject_reason: rejectReason
                }, { transaction });
                tempTrxId = insOrders[i].id;
                tempOrderId = insOrders[i].order_id;
                for (let j = 0; j < orders[i].drugOrderItems.length; j++) {
                    await HealthShopOrder.create({  
                        item_id: orders[i].drugOrderItems[j].id,
                        order_id: tempOrderId,
                        item_name: orders[i].drugOrderItems[j].name,
                        image: orders[i].drugOrderItems[j].image,
                        qty: orders[i].drugOrderItems[j].qty,
                        price: orders[i].drugOrderItems[j].price,
                        orderHealthShopId: tempTrxId
                    }, { transaction }).then(function (resData) { 
                        insOrderDetail.push(resData);
                    }); 
                }
                tempTrxId = '';
                tempOrderId = '';
            }
            let insertHealthShopCount = insOrders.length;
            let insertHealthShopDetailCount = insOrderDetail.length;
            await transaction.commit();
            res.json({
                orderFetchCount: orderLength, 
                insertHealthShopCount,
                insertHealthShopDetailCount,
                dataHealthShop: insOrders,
                dataHealthShopDetail: insOrderDetail
            });
        } else {
            res.status(404).send({
                message: "Health Shop Order Not Found in date : "+dateFrom+" - "+dateTo
            });
        }
    } catch (error) {
        await transaction.rollback();
        console.log(error);
    }
}

export const GetTest = async(req, res) => {
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
        res.status(403).send({message: "You are not allowed to access this API"}); 
    } else {
        const { page, totalRow } = req.query;
        let currentPage = parseInt(page);
        let totalData = parseInt(totalRow);
        let curPage;
        if(currentPage > 1) {
            curPage = currentPage * totalData - totalData;
        } else {
            curPage = 0;
        }
        const labTest = await LabTest.findAll({
            include: [{
                model: LabTestOrder,
                as: 'labtestorders',
                order: [['LabTest.updatedAt','DESC']]
            }],
            limit: totalData,
            offset: curPage
        });
        try {
            let countData = labTest.length;
            res.json({
                totalData: countData,
                page: currentPage,
                data: labTest
            });
        } catch (error) {
           console.log(error); 
        }
    }
}

export const GetHealthShopTransaction = async (req, res) => { 
    const { page, totalRow } = req.query;
    let currentPage = parseInt(page);
    let totalData = parseInt(totalRow);
    let curPage;
    if(currentPage > 1) {
        curPage = currentPage * totalData - totalData;
    } else {
        curPage = 0;
    }
    const healthShopDetail = await HealthShop.findAll({
        include: [{
            model: HealthShopOrder,
            as: 'healthshoporders',
            order: [['HealthShopOrder.id','ASC']]
        }],
        limit: totalData,
        offset: curPage
    });
    try {
        let countData = healthShopDetail.length;
        res.json({
            page: currentPage,
            totalData: countData,
            healthShopDetail
        });
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