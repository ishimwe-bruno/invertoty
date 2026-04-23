import { Product, ProductHistory, User } from '../database/index.js';
import { Op } from 'sequelize';

// Get dashboard data based on user role
export const getDashboard = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    let dashboardData = {};

    // Common data for all authenticated users
    dashboardData.user = {
      id: req.user.id,
      name: req.user.name,
      role: req.user.role,
      email: req.user.email
    };

    // Product statistics
    const totalProducts = await Product.count();
    const lowStockProducts = await Product.count({
      where: { quantity: { [Op.lte]: Product.sequelize.col('minStock') } }
    });

    dashboardData.products = {
      total: totalProducts,
      lowStock: lowStockProducts
    };

    // Role-specific data
    if (role === 'admin') {
      // Admin gets full access
      const totalUsers = await User.count();
      const totalHistory = await ProductHistory.count();
      const recentHistory = await ProductHistory.findAll({
        include: [
          { model: Product, as: 'product', attributes: ['name', 'sku'] },
          { model: User, as: 'user', attributes: ['name'] }
        ],
        order: [['createdAt', 'DESC']],
        limit: 10
      });

      dashboardData.admin = {
        totalUsers,
        totalHistory,
        recentHistory,
        permissions: [
          'Create products',
          'Update products',
          'Delete products',
          'Manage users',
          'View history',
          'Export data'
        ]
      };
    } else if (role === 'staff') {
      // Staff gets limited access
      dashboardData.staff = {
        permissions: [
          'View products',
          'Check low stock alerts',
          'View basic product info'
        ]
      };
    } else if (role === 'customer') {
      // Customer gets minimal access
      dashboardData.customer = {
        permissions: [
          'View products',
          'View basic product info'
        ]
      };
    }

    res.json(dashboardData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
