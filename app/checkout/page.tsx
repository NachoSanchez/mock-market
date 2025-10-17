// app/checkout/page.tsx
'use client';
import * as React from 'react';
import Grid from '@mui/material/GridLegacy';
import {
    Box, Stack, Typography, TextField, Button, Stepper, Step, StepLabel, Paper,
} from '@mui/material';
import CartSummary from '@/components/CartSummary';
import { useUser } from '@/hooks/useUser';
import { useCart } from '@/hooks/useCart';
import { useRouter } from 'next/navigation';
import CheckoutGuard from '@/components/CheckoutGuard';

// === ⬇️ Helpers SDK (añadir) ===============================
function siReady() {
    const SI = (window as any).SalesforceInteractions;
    return SI && SI.sendEvent ? SI : null;
}

type SDKOrderLineItem = {
    catalogObjectType: 'Product';
    catalogObjectId: string;
    quantity: number;
    price?: number;
    currency?: string;
    attributes?: Record<string, any>;
};

function mapToOrderLineItems(cart: import('@/hooks/useCart').Cart): SDKOrderLineItem[] {
    return cart.lineItems.map(li => ({
        catalogObjectType: 'Product',
        catalogObjectId: li.product.id,
        quantity: li.quantity,
        price: li.product.price ?? undefined,
        currency: li.product.currency ?? undefined,
        attributes: {
            name: li.product.name,
            brand: li.product.brand ?? undefined,
            imageUrl: li.product.image ?? undefined,
            categoryId: li.product.category_id ?? undefined,
        }
    }));
}

function calcTotalValue(lines: SDKOrderLineItem[]) {
    return lines.reduce((sum, li) => sum + ((li.price ?? 0) * li.quantity), 0);
}

function sendReplaceCart(cart: import('@/hooks/useCart').Cart) {
    const SI = siReady();
    if (!SI) return;
    SI.sendEvent({
        interaction: {
            name: (SI.CartInteractionName?.ReplaceCart ?? 'Replace Cart'),
            lineItems: cart.lineItems.map(li => ({
                catalogObjectId: li.product.id,
                catalogObjectType: 'Product',
                quantity: li.quantity,
                price: li.product.price ?? undefined,
                currency: li.product.currency ?? undefined,
                attributes: {
                    name: li.product.name,
                    brand: li.product.brand ?? undefined,
                    imageUrl: li.product.image ?? undefined,
                    categoryId: li.product.category_id ?? undefined,
                }
            }))
        }
    });
}

function sendPurchase(orderId: string, cart: import('@/hooks/useCart').Cart) {
    const SI = siReady();
    if (!SI) return;
    const lineItems = mapToOrderLineItems(cart);
    const totalValue = calcTotalValue(lineItems);
    // Toma la moneda del primer ítem como referencia, ajusta si usás multimoneda
    const currency = lineItems.find(li => li.currency)?.currency;

    SI.sendEvent({
        interaction: {
            name: (SI.OrderInteractionName?.Purchase ?? 'Purchase'),
            order: {
                id: orderId,
                totalValue,
                currency,
                lineItems
            }
            // attributes: { promoCode: "SAVE10" } // opcional
        }
    });
}
// === ⬆️ Helpers SDK (fin) ===================================

type UserForm = { email: string; firstName: string; lastName: string; dob: string };
type AddressForm = { street: string; number: string; city: string; state: string; zip: string; notes?: string };
type PaymentForm = { cardName: string; cardNumber: string; expiry: string; cvv: string };
type StoredOrder = import('@/hooks/useCart').Cart & { orderId: string };

function generateOrderId() {
    const seg = () => Math.random().toString(36).slice(2, 6).toUpperCase();
    return `${seg()}-${Date.now().toString().slice(-4)}-${seg()}`;
}

// --- formatters ---
function formatCardNumber(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 19);
    return (digits.match(/.{1,4}/g) ?? []).join(' ');
}

function formatExpiry(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}


export default function CheckoutPage() {
    const router = useRouter();
    const { user, update, register } = useUser();
    const { cart, clear } = useCart();
    const [processing, setProcessing] = React.useState(false);

    // ---------- Step state ----------
    const [active, setActive] = React.useState(0);

    // ---------- Forms state ----------
    const [userForm, setUserForm] = React.useState<UserForm>({
        email: user?.email ?? '',
        firstName: user?.firstName ?? '',
        lastName: user?.lastName ?? '',
        dob: user?.dob ?? '',
    });

    const [addrForm, setAddrForm] = React.useState<AddressForm>({
        street: '', number: '', city: '', state: '', zip: '', notes: '',
    });

    const [payForm, setPayForm] = React.useState<PaymentForm>({
        cardName: '', cardNumber: '', expiry: '', cvv: '',
    });

    // Prefill en caso de que el user cambie externamente
    React.useEffect(() => {
        setUserForm((prev) => ({
            ...prev,
            email: user?.email ?? '',
            firstName: user?.firstName ?? '',
            lastName: user?.lastName ?? '',
            dob: user?.dob ?? '',
        }));
    }, [user?.email, user?.firstName, user?.lastName, user?.dob]);

    React.useEffect(() => {
        if (cart.lineItems.length > 0) sendReplaceCart(cart);
    }, [cart.updatedAt]);

    // ---------- Validation ----------
    const validUser =
        userForm.email.trim().length > 3 &&
        userForm.firstName.trim().length > 0 &&
        userForm.lastName.trim().length > 0 &&
        userForm.dob.trim().length > 0;

    const validAddr =
        addrForm.street.trim() &&
        addrForm.number.trim() &&
        addrForm.city.trim() &&
        addrForm.state.trim() &&
        addrForm.zip.trim();

    const validPay =
        payForm.cardName.trim() &&
        /^\d{12,19}$/.test(payForm.cardNumber.replace(/\s+/g, '')) &&
        /^\d{2}\/\d{2}$/.test(payForm.expiry) && // MM/YY simple
        /^\d{3,4}$/.test(payForm.cvv);

    const allValid = Boolean(validUser && validAddr && validPay && cart.lineItems.length > 0);

    // ---------- Handlers ----------
    const next = () => setActive((i) => Math.min(i + 1, 2));
    const back = () => setActive((i) => Math.max(i - 1, 0));

    const saveUserStep = () => {
        // si ya teníamos user guardado, actualizamos; sino, registramos mínimo
        if (user?.email && user.email === userForm.email) {
            update(userForm);
        } else {
            // si vino de un login previo simple, esto sirve como "registro" ampliado (sin passwords)
            register({ email: userForm.email, password: '', confirmPassword: '', dob: userForm.dob, firstName: userForm.firstName, lastName: userForm.lastName });
        }
        next();
    };

    const confirm = async () => {
        if (!allValid || processing) return;
        setProcessing(true);
        await new Promise((r) => setTimeout(r, 3000));

        const orderId = generateOrderId();

        try {
            sendPurchase(orderId, cart);
        } catch { }

        // 1) Guardar exactamente el Cart + orderId (sin email)
        const order: StoredOrder = {
            orderId,
            lineItems: cart.lineItems,
            updatedAt: Date.now(),
        };

        try {
            sessionStorage.setItem(`mm_last_order_${orderId}`, JSON.stringify(order));
        } catch { }

        // 2) Vaciar carrito y redirigir con ?thanks=<orderId>
        router.push(`/?thanks=${encodeURIComponent(orderId)}`);
    };

    return (
        <CheckoutGuard>
            <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
                Checkout
            </Typography>

            <Grid container spacing={4}>
                {/* Columna principal (wizard) */}
                <Grid item xs={12} md={8}>
                    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
                        <Stepper activeStep={active} alternativeLabel sx={{ mb: 3 }}>
                            <Step><StepLabel>Usuario</StepLabel></Step>
                            <Step><StepLabel>Dirección</StepLabel></Step>
                            <Step><StepLabel>Pago</StepLabel></Step>
                        </Stepper>

                        {/* Paso 1: Usuario */}
                        {active === 0 && (
                            <Stack spacing={2}>
                                <TextField
                                    label="Email"
                                    type="email"
                                    value={userForm.email}
                                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                                    required
                                    fullWidth
                                    size="small"
                                />
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                    <TextField
                                        label="Nombres"
                                        value={userForm.firstName}
                                        onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
                                        required
                                        fullWidth
                                        size="small"
                                    />
                                    <TextField
                                        label="Apellidos"
                                        value={userForm.lastName}
                                        onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
                                        required
                                        fullWidth
                                        size="small"
                                    />
                                </Stack>
                                <TextField
                                    label="Fecha de nacimiento"
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    value={userForm.dob}
                                    onChange={(e) => setUserForm({ ...userForm, dob: e.target.value })}
                                    required
                                    fullWidth
                                    size="small"
                                />

                                <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                                    <Box />
                                    <Button variant="contained" onClick={saveUserStep} disabled={!validUser}>
                                        Continuar
                                    </Button>
                                </Stack>
                            </Stack>
                        )}

                        {/* Paso 2: Dirección */}
                        {active === 1 && (
                            <Stack spacing={2}>
                                <TextField label="Calle" value={addrForm.street} onChange={(e) => setAddrForm({ ...addrForm, street: e.target.value })} required fullWidth size="small" />
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                    <TextField label="Número" value={addrForm.number} onChange={(e) => setAddrForm({ ...addrForm, number: e.target.value })} required fullWidth size="small" />
                                    <TextField label="Código Postal" value={addrForm.zip} onChange={(e) => setAddrForm({ ...addrForm, zip: e.target.value })} required fullWidth size="small" />
                                </Stack>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                    <TextField label="Ciudad" value={addrForm.city} onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })} required fullWidth size="small" />
                                    <TextField label="Provincia" value={addrForm.state} onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })} required fullWidth size="small" />
                                </Stack>
                                <TextField label="Notas (opcional)" value={addrForm.notes} onChange={(e) => setAddrForm({ ...addrForm, notes: e.target.value })} multiline minRows={2} fullWidth size="small" />

                                <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                                    <Button onClick={back}>Atrás</Button>
                                    <Button variant="contained" onClick={next} disabled={!validAddr}>
                                        Continuar
                                    </Button>
                                </Stack>
                            </Stack>
                        )}

                        {/* Paso 3: Pago */}
                        {active === 2 && (
                            <Stack spacing={2}>
                                <TextField label="Nombre en la tarjeta" value={payForm.cardName} onChange={(e) => setPayForm({ ...payForm, cardName: e.target.value })} required fullWidth size="small" />
                                <TextField
                                    label="Número de tarjeta"
                                    value={payForm.cardNumber}
                                    onChange={(e) => setPayForm({ ...payForm, cardNumber: formatCardNumber(e.target.value) })}
                                    placeholder="4111 1111 1111 1111"
                                    required
                                    fullWidth
                                    size="small"
                                />
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                    <TextField
                                        label="Vencimiento (MM/YY)"
                                        value={payForm.expiry}
                                        onChange={(e) => setPayForm({ ...payForm, expiry: formatExpiry(e.target.value) })}
                                        placeholder="MM/YY"
                                        required
                                        fullWidth
                                        size="small"
                                    />
                                    <TextField
                                        label="CVV"
                                        value={payForm.cvv}
                                        onChange={(e) => setPayForm({ ...payForm, cvv: e.target.value.replace(/\\D/g, '') })}
                                        required
                                        fullWidth
                                        size="small"
                                    />
                                </Stack>

                                <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                                    <Button onClick={back}>Atrás</Button>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        onClick={confirm}
                                        disabled={!allValid || processing}
                                    // sx={{ mt: 2 }}
                                    >
                                        {processing ? "Confirmando..." : "Completar Compra"}
                                    </Button>
                                </Stack>
                            </Stack>
                        )}
                    </Paper>
                </Grid>

                {/* Sidebar resumen */}
                <Grid item xs={12} md={4}>
                    <CartSummary />
                </Grid>
            </Grid>
        </CheckoutGuard>
    );
}
