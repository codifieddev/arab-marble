import currencyReducer from './currency/currencySlice';
import { combineReducers } from '@reduxjs/toolkit';
import blueprintReducer from './blueprint/blueprintSlice';
import pagesReducer from './pages/pagesSlice';
import cartReducer from './cart/cartSlice';
import wishlistReducer from './wishlist/wishlistSlice';
import authReducer from './auth/authSlice';
import productsReducer from './products/productsSlices';
import categoriesReducer from './categories/categoriesSlices';
import ordersReducer from './orders/ordersSlice';
import usersReducer from './users/userSlice';
import menusReducer from './menus/menusSlice';
import formsReducer from './forms/formsSlice';
import brandingReducer from './branding/brandingSlice';
import websiteDetailReducer from './websiteDetail/websiteDetailSlice';
import commentsReducer from './comments/commentSlice';
import attributesReducer from './attributes/attributeSlices';
import adminOrdersReducer from './features/adminOrdersSlice';
import adminVariantsReducer from './features/adminVariantsSlice';
import adminAttributesReducer from './features/adminAttributesSlice';
import adminCategoriesReducer from './features/adminCategoriesSlice';

const rootReducer = combineReducers({
  blueprint: blueprintReducer,
  pages: pagesReducer,
  cart: cartReducer,
  wishlist: wishlistReducer,
  auth: authReducer,
  products: productsReducer,
  categories: categoriesReducer,
  orders: ordersReducer,
  users: usersReducer,
  menus: menusReducer,
  forms: formsReducer,
  branding: brandingReducer,
  websiteDetail: websiteDetailReducer,
  comments: commentsReducer,
  attributes: attributesReducer,
  adminOrders: adminOrdersReducer,
  adminVariants: adminVariantsReducer,
  adminAttributes: adminAttributesReducer,
  adminCategories: adminCategoriesReducer,
  currency: currencyReducer,
});

export default rootReducer;
