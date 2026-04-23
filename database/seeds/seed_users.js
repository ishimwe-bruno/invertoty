import bcrypt from 'bcrypt';
import { User } from '../../database/index.js';

export const up = async () => {
  const existingUsers = await User.findAll();
  if (existingUsers.length > 0) {
    console.log('⏭️  Users already seeded, skipping...');
    return;
  }

  const hash1 = await bcrypt.hash('admin123', 10);
  const hash2 = await bcrypt.hash('staff123', 10);

  await User.bulkCreate([
    {
      name: 'Admin User',
      email: 'admin@invertory.com',
      password: hash1,
      role: 'admin',
    },
    {
      name: 'Staff User 1',
      email: 'staff1@invertory.com',
      password: hash2,
      role: 'staff',
    },
    {
      name: 'Staff User 2',
      email: 'staff2@invertory.com',
      password: hash2,
      role: 'staff',
    },
  ]);

  console.log('✅ Users seeded successfully');
};

export const down = async () => {
  await User.destroy({ where: {} });
  console.log('✅ Users seed rolled back');
};
