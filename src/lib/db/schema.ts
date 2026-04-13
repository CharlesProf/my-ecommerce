import { pgTable, text, timestamp, integer, decimal, uuid } from 'drizzle-orm/pg-core';

// Users table (extends Clerk user data)
export const users = pgTable('users', {
  id: text('id').primaryKey(), // Clerk user ID
  email: text('email').notNull().unique(),
  role: text('role').notNull().default('user'), // 'admin' or 'user'
  createdAt: timestamp('created_at').defaultNow(),
});

// Stores table (for admin)
export const stores = pgTable('stores', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  address: text('address'),
  adminId: text('admin_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

// Staff table (relationship between staff and stores/admin)
export const staff = pgTable('staff', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),    // siapa staffnya
  ownerId: text('owner_id').references(() => users.id).notNull(),  // owner mana yang assign dia
  createdAt: timestamp('created_at').defaultNow(),
});

// Categories table
export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  storeId: uuid('store_id').references(() => stores.id),
  createdAt: timestamp('created_at').defaultNow(),
  categoryListId: uuid('categorylist_id').references(() => categoryLists.id)
});

// Subcategories table
export const subcategories = pgTable('subcategories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  categoryId: uuid('category_id').references(() => categories.id),
  createdAt: timestamp('created_at').defaultNow(),
});

// Products table
export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  description: text('description'),
  productionCost: decimal('production_cost', { precision: 10, scale: 2 }),
  subcategoryId: uuid('subcategory_id').references(() => subcategories.id),
  storeId: uuid('store_id').references(() => stores.id),
  stock: integer('stock').default(0),
  imageUrl: text('image_url'), // Main product image URL
  imageUrls: text('image_urls'), // JSON array of multiple image URLs
  sku: text('sku'), // Stock Keeping Unit
  isSales: integer('is_sales').default(0), // 0 = not on sale, 1 = on sale
  priceSales: decimal('price_sales', { precision: 10, scale: 2 }).default("0"),
  isActive: integer('is_active').default(1), // 1 = active, 0 = inactive
  createdAt: timestamp('created_at').defaultNow(),
});

// User profiles table
export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').references(() => users.id),
  storeId: uuid('store_id').references(() => stores.id),
  fullName: text('full_name').notNull(),
  phone: text('phone').notNull(),
  address: text('address'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Transactions table
export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').references(() => users.id),
  storeId: uuid('store_id').references(() => stores.id),
  userProfileId: uuid('user_profile_id').references(() => userProfiles.id),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  status: text('status').notNull().default('pending'), // 'pending', 'completed', 'cancelled'
  paymentMethod: text('payment_method').notNull().default('QRIS'), // QRIS, Bank Transfer, Card
  createdAt: timestamp('created_at').defaultNow(),
});

// Transaction items table
export const transactionItems = pgTable('transaction_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  transactionId: uuid('transaction_id').references(() => transactions.id),
  productId: uuid('product_id').references(() => products.id),
  quantity: integer('quantity').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
});

// categoryLists table 
export const categoryLists = pgTable('category_lists',{
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  imageUrl: text('image_url'), // Main product image URL
});