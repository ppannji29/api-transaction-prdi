import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const HealthShopOrder = db.define('HealthShopOrder', {
    item_id: {
        type: DataTypes.INTEGER(100)
    },
    order_id: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    item_name: {
        type: DataTypes.STRING(150)
    },
    image: {
        type: DataTypes.TEXT
    },
    qty: {
        type: DataTypes.INTEGER
    },
    price: {
        type: DataTypes.INTEGER
    },
    orderHealthShopId: {
        type: DataTypes.INTEGER(200),
        allowNull: false
    }
}, {
    freezeTableName: true
});

export default HealthShopOrder; 