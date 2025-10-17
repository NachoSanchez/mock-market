// hooks/useCart.tsx
'use client';
import * as React from 'react';

/** === Types (mantenemos tu shape) === **/
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
    itemId: string;           // = product.id
    product: Product;
    quantity: number;         // unidades
};

export type Cart = {
    lineItems: LineItem[];
    updatedAt: number;
};

const CART_KEY = 'mm_cart';

/** === Storage helpers (fix del guardado) === **/
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

/** === SDK helpers === **/
function siReady() {
    const SI = (window as any).SalesforceInteractions;
    return SI && SI.sendEvent ? SI : null;
}

type SDKLineItem = {
    catalogObjectId: string;      // product.id
    catalogObjectType: string;    // "Product"
    quantity: number;
    price?: number | null;
    currency?: string;
    attributes?: Record<string, any>;
};

function toSDKLineItem(li: LineItem, qtyOverride?: number): SDKLineItem {
    return {
        catalogObjectId: li.product.id,
        catalogObjectType: 'Product',
        quantity: typeof qtyOverride === 'number' ? qtyOverride : li.quantity,
        price: li.product.price ?? undefined,
        currency: li.product.currency ?? undefined,
        attributes: {
            name: li.product.name,
            brand: li.product.brand ?? undefined,
            imageUrl: li.product.image ?? undefined,
            categoryId: li.product.category_id ?? undefined,
        },
    };
}

function sendCartSingle(name: any, li: LineItem, qty?: number) {
    const SI = siReady();
    if (!SI) return;
    SI.sendEvent({
        interaction: {
            name,
            lineItem: toSDKLineItem(li, qty),
        },
    });
}

function sendCartReplace(lineItems: LineItem[]) {
    const SI = siReady();
    if (!SI) return;
    SI.sendEvent({
        interaction: {
            name: (SI.CartInteractionName?.ReplaceCart ?? 'Replace Cart'),
            lineItems: lineItems.map((li) => toSDKLineItem(li)),
        },
    });
}

/** === Context === **/
export type CartContextValue = {
    cart: Cart;
    totalItems: number;
    addItem: (product: Product, qty?: number) => void;
    setQuantity: (itemId: string, qty: number) => void;
    removeItem: (itemId: string) => void;
    clear: () => void;
    replaceCart?: (lines: LineItem[]) => void; // opcional para sync masivo
};

const CartContext = React.createContext<CartContextValue | null>(null);

/** === Provider === **/
export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = React.useState<Cart>({ lineItems: [], updatedAt: Date.now() });

    // Hydrate from localStorage + sync entre tabs
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

    /** Add To Cart */
    const addItem = (product: Product, qty: number = 1) => {
        if (!product?.id || qty <= 0) return;

        const existing = cart.lineItems.find((li) => li.itemId === product.id);
        let next: Cart;
        let delta = qty;

        if (existing) {
            const newQty = Math.min(existing.quantity + qty, 999);
            delta = newQty - existing.quantity; // cuánto realmente sumó
            next = {
                lineItems: cart.lineItems.map((li) =>
                    li.itemId === product.id ? { ...li, quantity: newQty } : li
                ),
                updatedAt: Date.now(),
            };
        } else {
            const initialQty = Math.min(qty, 999);
            next = {
                lineItems: [...cart.lineItems, { itemId: product.id, product, quantity: initialQty }],
                updatedAt: Date.now(),
            };
        }

        // Evento Add To Cart (si realmente se agregó algo)
        if (delta > 0) {
            const SI = siReady();
            const name = SI?.CartInteractionName?.AddToCart ?? 'Add To Cart';
            const li: LineItem =
                existing
                    ? { itemId: existing.itemId, product: existing.product, quantity: existing.quantity + delta }
                    : { itemId: product.id, product, quantity: delta };
            sendCartSingle(name, li, delta);
        }

        persist(next);
    };

    /** Cambiar cantidad (delta ±) => Add/Remove; si llega a 0 => Remove total */
    const setQuantity = (itemId: string, qty: number) => {
        const existing = cart.lineItems.find((li) => li.itemId === itemId);
        const q = Math.max(0, Math.min(999, Math.floor(qty)));

        if (!existing) {
            // No existe: ignoramos o podrías tratarlo como add si tenés catálogo a mano
            return;
        }

        const prev = existing.quantity;
        const delta = q - prev;
        let next: Cart;

        if (q === 0) {
            // Remove total por cantidad previa
            if (prev > 0) {
                const SI = siReady();
                const name = SI?.CartInteractionName?.RemoveFromCart ?? 'Remove From Cart';
                sendCartSingle(name, existing, prev);
            }
            next = { lineItems: cart.lineItems.filter((li) => li.itemId !== itemId), updatedAt: Date.now() };
        } else {
            // Ajuste parcial
            if (delta !== 0) {
                const SI = siReady();
                if (delta > 0) {
                    const name = SI?.CartInteractionName?.AddToCart ?? 'Add To Cart';
                    sendCartSingle(name, existing, delta);
                } else {
                    const name = SI?.CartInteractionName?.RemoveFromCart ?? 'Remove From Cart';
                    sendCartSingle(name, existing, Math.abs(delta));
                }
            }
            next = {
                lineItems: cart.lineItems.map((li) => (li.itemId === itemId ? { ...li, quantity: q } : li)),
                updatedAt: Date.now(),
            };
        }

        persist(next);
    };

    /** Remove item (todo) */
    const removeItem = (itemId: string) => {
        const existing = cart.lineItems.find((li) => li.itemId === itemId);
        if (existing && existing.quantity > 0) {
            const SI = siReady();
            const name = SI?.CartInteractionName?.RemoveFromCart ?? 'Remove From Cart';
            sendCartSingle(name, existing, existing.quantity);
        }
        persist({ lineItems: cart.lineItems.filter((li) => li.itemId !== itemId), updatedAt: Date.now() });
    };

    /** Clear → Replace Cart vacío */
    const clear = () => {
        sendCartReplace([]);
        persist({ lineItems: [], updatedAt: Date.now() });
    };

    /** Replace Cart explícito (opcional, útil para sync post-login) */
    const replaceCart = (lines: LineItem[]) => {
        sendCartReplace(lines);
        persist({ lineItems: lines, updatedAt: Date.now() });
    };

    const totalItems = cart.lineItems.reduce((acc, li) => acc + li.quantity, 0);

    const value: CartContextValue = {
        cart,
        totalItems,
        addItem,
        setQuantity,
        removeItem,
        clear,
        replaceCart,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/** Hook */
export function useCart() {
    const ctx = React.useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within <CartProvider>');
    return ctx;
}
