'use client';
import * as React from 'react';

export type Product = {
    id: string;
    name: string;
    brand: string | null;
    price: number | null;
    currency: string;
    image: string | null;
    category_id: number;
};

export type LineItem = {
    itemId: string; // = product.id
    product: Product;
    quantity: number; // unidades
};

export type Cart = {
    lineItems: LineItem[];
    updatedAt: number;
};

const CART_KEY = 'mm_cart';

function loadCart(): Cart {
    try {
        const raw = localStorage.getItem(CART_KEY);
        if (!raw) return { lineItems: [], updatedAt: Date.now() };
        const parsed = JSON.parse(raw) as Cart;
        if (!parsed || !Array.isArray(parsed.lineItems)) return { lineItems: [], updatedAt: Date.now() };
        return parsed;
    } catch {
        return { lineItems: [], updatedAt: Date.now() };
    }
}

function saveCart(cart: Cart) {
    localStorage.setItem(CART_KEY, JSON.stringify({ ...cart, updatedAt: Date.now() }));
    window.dispatchEvent(new CustomEvent('mm:cart'));
}

// Context shape
export type CartContextValue = {
    cart: Cart;
    totalItems: number;
    addItem: (product: Product, qty?: number) => void;
    setQuantity: (itemId: string, qty: number) => void;
    removeItem: (itemId: string) => void;
    clear: () => void;
};

const CartContext = React.createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = React.useState<Cart>({ lineItems: [], updatedAt: Date.now() });

    // Hydrate from localStorage
    React.useEffect(() => {
        setCart(loadCart());
        const onExternal = () => setCart(loadCart());
        window.addEventListener('storage', onExternal);
        window.addEventListener('mm:cart', onExternal);
        return () => {
            window.removeEventListener('storage', onExternal);
            window.removeEventListener('mm:cart', onExternal);
        };
    }, []);

    const persist = (next: Cart) => {
        setCart(next);
        saveCart(next);
    };

    const addItem = (product: Product, qty: number = 1) => {
        if (!product?.id || qty <= 0) return;
        const existing = cart.lineItems.find((li) => li.itemId === product.id);
        let next: Cart;
        if (existing) {
            next = {
                lineItems: cart.lineItems.map((li) =>
                    li.itemId === product.id ? { ...li, quantity: Math.min(li.quantity + qty, 999) } : li
                ),
                updatedAt: Date.now(),
            };
        } else {
            next = {
                lineItems: [...cart.lineItems, { itemId: product.id, product, quantity: Math.min(qty, 999) }],
                updatedAt: Date.now(),
            };
        }
        persist(next);
    };

    const setQuantity = (itemId: string, qty: number) => {
        const q = Math.max(0, Math.min(999, Math.floor(qty)));
        let next: Cart;
        if (q === 0) {
            next = { lineItems: cart.lineItems.filter((li) => li.itemId !== itemId), updatedAt: Date.now() };
        } else {
            next = {
                lineItems: cart.lineItems.map((li) => (li.itemId === itemId ? { ...li, quantity: q } : li)),
                updatedAt: Date.now(),
            };
        }
        persist(next);
    };

    const removeItem = (itemId: string) => {
        persist({ lineItems: cart.lineItems.filter((li) => li.itemId !== itemId), updatedAt: Date.now() });
    };

    const clear = () => persist({ lineItems: [], updatedAt: Date.now() });

    const totalItems = cart.lineItems.reduce((acc, li) => acc + li.quantity, 0);

    const value: CartContextValue = {
        cart,
        totalItems,
        addItem,
        setQuantity,
        removeItem,
        clear,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const ctx = React.useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within <CartProvider>');
    return ctx;
}
