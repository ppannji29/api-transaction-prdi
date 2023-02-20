import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import LabTestOrder from "./LabTestOrderModel.js";

const { DataTypes } = Sequelize;

const LabTest = db.define('LabTest', {
    id: {
        type: DataTypes.INTEGER(200),
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    order_id: {
        type: DataTypes.STRING(60),
        allowNull: false,
        unique: true
    },
    reg_no: {
        type: DataTypes.INTEGER(60),
        defaultValue: null
    },
    outlet: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    patient_id: {
        type: DataTypes.STRING(14),
        allowNull: false
    },
    status_payment: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    status_order: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    payment_by: {
        type: DataTypes.STRING(50)
    },
    omzet: {
        type: DataTypes.INTEGER(100)
    },
    omzet_ppn: {
        type: DataTypes.INTEGER(100)
    },
    omzet_ppn_free: {
        type: DataTypes.INTEGER(100)
    },
    omzet_ppn_livied: {
        type: DataTypes.INTEGER(100)
    },
    // tests: {
    //     type: DataTypes.TEXT,
    //     allowNull: false
    // },
    home_service: {
        type: DataTypes.STRING(10)
    },
    referral_type_id: {
        type: DataTypes.STRING(20)
    },
    doctor_name: {
        type: DataTypes.STRING(70)
    },
    order_date: {
        type: DataTypes.DATEONLY
    }
}, {
    freezeTableName: true
});

LabTest.hasMany(LabTestOrder, {foreignKey: "order_lab_test_id"});
LabTestOrder.belongsTo(LabTest);

export default LabTest; 