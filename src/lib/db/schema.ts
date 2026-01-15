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

// Categories table
export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  storeId: uuid('store_id').references(() => stores.id),
  createdAt: timestamp('created_at').defaultNow(),
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
  isActive: integer('is_active').default(1), // 1 = active, 0 = inactive
  createdAt: timestamp('created_at').defaultNow(),
});

// User profiles table
export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  fullName: text('full_name'),
  phone: text('phone'),
  address: text('address'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Transactions table
export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').references(() => users.id),
  storeId: uuid('store_id').references(() => stores.id),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  status: text('status').notNull().default('pending'), // 'pending', 'completed', 'cancelled'
  paymentMethod: text('payment_method'), // 'qris', 'card', etc.
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