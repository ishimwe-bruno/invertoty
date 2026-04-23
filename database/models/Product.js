import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const Product = sequelize.define('Product', {
  id:          { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name:        { type: DataTypes.STRING, allowNull: false },
  sku:         { type: DataTypes.STRING, allowNull: false, unique: true },
  description: { type: DataTypes.TEXT },
  price:       { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  quantity:    { type: DataTypes.INTEGER, defaultValue: 0 },
  minStock:    { type: DataTypes.INTEGER, defaultValue: 5 },
}, { timestamps: true });

export default Product;
