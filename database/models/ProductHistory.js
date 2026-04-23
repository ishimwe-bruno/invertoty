import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';
import Product from './Product.js';
import User from './User.js';

const ProductHistory = sequelize.define('ProductHistory', {
  id:                { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  productId:         { type: DataTypes.INTEGER, allowNull: false, references: { model: Product, key: 'id', onDelete: 'CASCADE' } },
  userId:            { type: DataTypes.INTEGER, allowNull: true, references: { model: User, key: 'id', onDelete: 'SET NULL' } },
  action:            { type: DataTypes.ENUM('create', 'update', 'delete'), allowNull: false },
  previousQuantity:  { type: DataTypes.INTEGER },
  newQuantity:       { type: DataTypes.INTEGER },
  productName:       { type: DataTypes.STRING },
  productSku:        { type: DataTypes.STRING },
  productPrice:      { type: DataTypes.DECIMAL(10, 2) },
  description:       { type: DataTypes.TEXT },
  changeDetails:     { type: DataTypes.JSON }, // For storing other field changes
}, { timestamps: true, updatedAt: false }); // Only createdAt timestamp

ProductHistory.belongsTo(Product, { foreignKey: 'productId', as: 'product', onDelete: 'CASCADE' });
ProductHistory.belongsTo(User, { foreignKey: 'userId', as: 'user', onDelete: 'SET NULL' });

export default ProductHistory;
