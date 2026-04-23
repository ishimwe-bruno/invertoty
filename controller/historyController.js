import { ProductHistory, Product, User } from '../database/index.js';
import xlsx from 'xlsx';

// Get product history with pagination
export const getHistory = async (req, res) => {
  try {
    const { page = 1, limit = 50, productId } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (productId) where.productId = productId;

    const { rows, count } = await ProductHistory.findAndCountAll({
      where,
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name', 'sku'] },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
      offset,
      limit: parseInt(limit),
    });

    res.json({
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get preview of product history for display before export
export const getHistoryPreview = async (req, res) => {
  try {
    const { productId, format = 'detailed' } = req.query;
    const where = {};
    if (productId) where.productId = productId;

    const history = await ProductHistory.findAll({
      where,
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name', 'sku', 'price'] },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    const preview = history.map((record) => ({
      id: record.id,
      date: record.createdAt,
      action: record.action,
      product: record.product?.name || record.productName,
      sku: record.product?.sku || record.productSku,
      price: record.productPrice,
      previousQuantity: record.previousQuantity,
      newQuantity: record.newQuantity,
      user: record.user?.name || 'System',
      email: record.user?.email || 'N/A',
      description: record.description,
      changeDetails: record.changeDetails,
    }));

    res.json({
      totalRecords: preview.length,
      preview: format === 'summary' ? preview.slice(0, 20) : preview,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Export product history to Excel
export const exportHistoryToExcel = async (req, res) => {
  try {
    const { productId } = req.query;
    const where = {};
    if (productId) where.productId = productId;

    const history = await ProductHistory.findAll({
      where,
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name', 'sku', 'price'] },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    // Format data for Excel
    const excelData = history.map((record) => ({
      'Date': new Date(record.createdAt).toLocaleString(),
      'Action': record.action.toUpperCase(),
      'Product Name': record.product?.name || record.productName,
      'SKU': record.product?.sku || record.productSku,
      'Price': record.productPrice || 'N/A',
      'Previous Quantity': record.previousQuantity !== null ? record.previousQuantity : 'N/A',
      'New Quantity': record.newQuantity !== null ? record.newQuantity : 'N/A',
      'Quantity Change': record.previousQuantity !== null && record.newQuantity !== null ? record.newQuantity - record.previousQuantity : 'N/A',
      'User': record.user?.name || 'System',
      'Email': record.user?.email || 'N/A',
      'Description': record.description || 'N/A',
      'Additional Changes': record.changeDetails ? JSON.stringify(record.changeDetails) : 'N/A',
    }));

    // Create workbook and worksheet
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [20, 12, 20, 12, 12, 18, 15, 18, 15, 20, 20, 25];
    worksheet['!cols'] = columnWidths.map((width) => ({ wch: width }));

    xlsx.utils.book_append_sheet(workbook, worksheet, 'Stock History');

    // Generate buffer and send as file
    const buffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    res.setHeader('Content-Disposition', 'attachment; filename=product_history.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get history statistics
export const getHistoryStats = async (req, res) => {
  try {
    const stats = {
      totalActions: await ProductHistory.count(),
      actionBreakdown: await ProductHistory.findAll({
        attributes: ['action', [ProductHistory.sequelize.fn('COUNT', ProductHistory.sequelize.col('id')), 'count']],
        group: ['action'],
        raw: true,
      }),
      recentActions: await ProductHistory.findAll({
        include: [
          { model: Product, as: 'product', attributes: ['name'] },
          { model: User, as: 'user', attributes: ['name'] },
        ],
        order: [['createdAt', 'DESC']],
        limit: 10,
      }),
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
