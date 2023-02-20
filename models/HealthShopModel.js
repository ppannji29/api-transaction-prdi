import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import HealthShopOrder from "./HealthShopOrderModel.js";

const { DataTypes } = Sequelize;

const HealthShop = db.define('HealthShop', {
    order_id: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false
    },
    patient_id: {
        type: DataTypes.STRING(14),
        // allowNull: false
    },
    patient_name: {
        type: DataTypes.STRING(150),
        // allowNull: false
    },
    patient_mobile: {
        type: DataTypes.INTEGER,
        // allowNull: false
    },
    patient_email: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    order_status: {
        type: DataTypes.STRING(15)
    },
    order_type: {
        type: DataTypes.STRING(10)
    },
    payment_method: {
        type: DataTypes.STRING(40)
    },
    pay_at_branch: {
        type: DataTypes.STRING(10)
    },
    vendor_id: {
        type: DataTypes.STRING(10)
    },
    order_amount: {
        type: DataTypes.INTEGER(50)
    },
    tax_amount: {
        type: DataTypes.INTEGER(20)
    },
    order_date: {
        type: DataTypes.DATEONLY
    },
    order_time: {
        type: DataTypes.DATETIME
    },
    update_time: {
        type: DataTypes.DATETIME
    },
    outlet_id: {
        type: DataTypes.INTEGER
    },
    lab_registration_number: {
        type: DataTypes.INTEGER
    },
    offline_payment_completed: {
        type: DataTypes.STRING(20)
    },
    offline_payment_time: {
        type: DataTypes.DATETIME
    },
    bill_number: {
        type: DataTypes.INTEGER
    },
    lab_result_available: {
        type: DataTypes.STRING(10)
    },
    vendor_order_reference: {
        type: DataTypes.STRING(20)
    },
    total_price: {
        type: DataTypes.INTEGER
    },
    latitude: {
        type: DataTypes.FLOAT(10, 6) 
    },
    longitude: {
        type: DataTypes.FLOAT(10, 6) 
    },
    address_note: {
        type: DataTypes.TEXT
    },
    store_id: {
        type: DataTypes.INTEGER
    },
    shipping_fee: {
        type: DataTypes.INTEGER
    },
    delivery_status: {
        type: DataTypes.STRING(15)
    },
    delivery_reference: {
        type: DataTypes.STRING(100)
    },
    tracking_url: {
        type: DataTypes.STRING
    },
    reject_code: {
        type: DataTypes.INTEGER
    },
    reject_reason: {
        type: DataTypes.TEXT
    },
    refund_reference: {
        type: DataTypes.STRING
    }
}, {
    freezeTableName: true
});

HealthShop.hasMany(HealthShopOrder, {foreignKey: "order_id"});
HealthShopOrder.belongsTo(HealthShop);

export default HealthShop; 