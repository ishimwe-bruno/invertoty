import { Product } from '../../database/index.js';

export const up = async () => {
  const existingProducts = await Product.findAll();
  if (existingProducts.length > 0) {
    console.log('⏭️  Products already seeded, skipping...');
    return;
  }

  await Product.bulkCreate([
    {
      name: 'Laptop',
      sku: 'LAPTOP-001',
      description: 'High-performance laptop with 16GB RAM',
      price: 1000000,
      quantity: 15,
      minStock: 5,
    },
    {
      name: 'Wireless Mouse',
      sku: 'MOUSE-001',
      description: 'Ergonomic wireless mouse with USB receiver',
      price: 20000,
      quantity: 2,
      minStock: 10,
    },
    {
      name: 'USB-C Cable',
      sku: 'CABLE-001',
      description: '2-meter USB-C charging and data cable',
      price: 10000,
      quantity: 50,
      minStock: 20,
    },
    {
      name: 'Mechanical Keyboard',
      sku: 'KEYBOARD-001',
      description: 'RGB Mechanical Keyboard with Cherry MX switches',
      price: 100000,
      quantity: 8,
      minStock: 5,
    },
    {
      name: 'USB Hub',
      sku: 'HUB-001',
      description: '7-port USB 3.0 hub with power adapter',
      price: 300000,
      quantity: 3,
      minStock: 5,
    },
    {
      name: 'Monitor',
      sku: 'MONITOR-001',
      description: '27-inch 4K UHD Monitor',
      price: 300000,
      quantity: 6,
      minStock: 3,
    },
  ]);

  console.log('✅ Products seeded successfully');
};

export const down = async () => {
  await Product.destroy({ where: {} });
  console.log('✅ Products seed rolled back');
};
