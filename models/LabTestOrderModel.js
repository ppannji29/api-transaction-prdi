import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const LabTestOrder = db.define('LabTestOrder', {
    id: {
        type: DataTypes.INTEGER(200),
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    order_id: {
        type: DataTypes.STRING(60),
        allowNull: false
    },
    test_id: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    test_name: {
        type: DataTypes.TEXT
    },
    price_actual: {
        type: DataTypes.INTEGER(100)
    },
    quantity: {
        type: DataTypes.INTEGER
    },
    type: {
        type: DataTypes.STRING(15)
    },
    orderLabTestId: {
        type: DataTypes.INTEGER(200),
        allowNull: false
    }
}, {
    freezeTableName: true
});

export default LabTestOrder;