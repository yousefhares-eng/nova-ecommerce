/**
 * Cart – localStorage, add/remove/update, totals
 */

const CART_KEY = 'nova_cart';

function getCart() {
  try {
    const s = localStorage.getItem(CART_KEY);
    return s ? JSON.parse(s) : [];
  } catch (_) {
    return [];
  }
}

function setCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

function addToCart(item) {
  const cart = getCart();
  const { productId, name, image, price, quantity = 1, size = '', color = '' } = item;
  const existing = cart.find(
    (x) => x.productId === productId && x.size === size && x.color === color
  );
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ productId, name, image, price, quantity, size, color });
  }
  setCart(cart);
  return cart;
}

function removeFromCart(productId, size, color) {
  let cart = getCart();
  cart = cart.filter(
    (x) => !(x.productId === productId && x.size === (size || '') && x.color === (color || ''))
  );
  setCart(cart);
  return cart;
}

function updateQuantity(productId, size, color, delta) {
  const cart = getCart();
  const item = cart.find(
    (x) => x.productId === productId && x.size === (size || '') && x.color === (color || '')
  );
  if (!item) return cart;
  item.quantity = Math.max(1, item.quantity + delta);
  setCart(cart);
  return cart;
}

function setQuantity(productId, size, color, qty) {
  const cart = getCart();
  const item = cart.find(
    (x) => x.productId === productId && x.size === (size || '') && x.color === (color || '')
  );
  if (!item) return cart;
  item.quantity = Math.max(1, parseInt(qty, 10) || 1);
  setCart(cart);
  return cart;
}

function clearCart() {
  setCart([]);
}

function cartCount() {
  return getCart().reduce((acc, x) => acc + x.quantity, 0);
}

function cartSubtotal() {
  return getCart().reduce((acc, x) => acc + x.price * x.quantity, 0);
}

function cartItemsForOrder() {
  return getCart().map((x) => ({
    productId: x.productId,
    quantity: x.quantity,
    size: x.size,
    color: x.color,
  }));
}
