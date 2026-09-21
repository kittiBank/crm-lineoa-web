import { CartItem } from "../types";

const CART_STORAGE_KEY = "liff-shop:cart";
const CART_UPDATED_EVENT = "liff-shop-cart-updated";

function readCart(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export function onCartUpdated(handler: () => void): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  window.addEventListener(CART_UPDATED_EVENT, handler);
  return () => window.removeEventListener(CART_UPDATED_EVENT, handler);
}

export function getCart(): CartItem[] {
  return readCart();
}

export function addToCart(
  item: Omit<CartItem, "qty">,
  qty: number = 1,
): CartItem[] {
  const items = readCart();
  const existing = items.find((i) => i.productId === item.productId);

  const next = existing
    ? items.map((i) =>
        i.productId === item.productId ? { ...i, qty: i.qty + qty } : i,
      )
    : [...items, { ...item, qty }];

  writeCart(next);
  return next;
}

export function updateQty(productId: string, qty: number): CartItem[] {
  const items = readCart();

  const next =
    qty <= 0
      ? items.filter((i) => i.productId !== productId)
      : items.map((i) => (i.productId === productId ? { ...i, qty } : i));

  writeCart(next);
  return next;
}

export function removeFromCart(productId: string): CartItem[] {
  const next = readCart().filter((i) => i.productId !== productId);
  writeCart(next);
  return next;
}

export function clearCart(): void {
  writeCart([]);
}

export function getCartCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.qty, 0);
}

export function getCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}
