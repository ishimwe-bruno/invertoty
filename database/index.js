import sequelize from '../config/db.js';
import User from './models/User.js';
import Product from './models/Product.js';
import ProductHistory from './models/ProductHistory.js';

export { sequelize, User, Product, ProductHistory };
