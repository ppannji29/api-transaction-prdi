import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const Transaction = db.define('transaction', {
    amount: {
        type: DataTypes.DOUBLE
    },
    content: {
        type: DataTypes.STRING
    },
    paymentType: {
        type: DataTypes.STRING(50) // CC, VA, Bank Transafer, E_Wallet
    },
    merchantId: {
        type: DataTypes.INTEGER
    },
    adminId: {
        type: DataTypes.INTEGER
    }
}, {
    freezeTableName: true
});

export default Transaction; 