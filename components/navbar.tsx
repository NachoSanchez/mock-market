'use client';
import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    AppBar,
    Toolbar,
    Box,
    IconButton,
    Typography,
    TextField,
    InputAdornment,
    Drawer,
    Button,
    Popper,
    Paper,
    List,
    ListItemButton,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Divider,
    Stack,
    Chip,
    Badge,
    ClickAwayListener,
    CircularProgress,
    Container
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';
import { getCategoryEmoji } from '@/lib/categoryEmoji';
import CartIcon from './CartIcon';
import CartSummary from './CartSummary';

// --- Types ---
export type Category = { id: number; name: string; slug: string };
export type Product = {
    id: string;
    name: string;
    brand: string | null;
    price: number | null;
    currency: string;
    image: string | null;
    category_id: number;
};

// --- Small helper for client-side JSON fetch ---
const fetchJSON = async <T,>(path: string, signal?: AbortSignal): Promise<T> => {
    const res = await fetch(path, { cache: 'no-store', signal });
    if (!res.ok) throw new Error('Failed to fetch ' + path);
    return res.json();
};

export default function Navbar() {
    const router = useRouter();

    // Categories (load once)
    const [categories, setCategories] = React.useState<Category[]>([]);
    React.useEffect(() => {
        let active = true;
        const ac = new AbortController();
        fetchJSON<Category[]>('/api/categories', ac.signal)
            .then((data) => { if (active) setCategories(data); })
            .catch(() => { if (active) setCategories([]); });
        return () => { active = false; ac.abort(); };
    }, []);

    // Search state
    const [query, setQuery] = React.useState('');
    const [openSug, setOpenSug] = React.useState(false);
    const [loadingSug, setLoadingSug] = React.useState(false);
    const [suggestions, setSuggestions] = React.useState<Product[]>([]);
    const anchorRef = React.useRef<HTMLInputElement | null>(null);
    const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const inFlight = React.useRef<AbortController | null>(null);

    const runSearch = React.useCallback((q: string) => {
        if (q.trim().length < 3) {
            if (inFlight.current) inFlight.current.abort();
            setSuggestions([]);
            setOpenSug(false);
            setLoadingSug(false);
            return;
        }
        if (inFlight.current) inFlight.current.abort();
        const ac = new AbortController();
        inFlight.current = ac;
        setLoadingSug(true);
        fetchJSON<{ items: Product[] }>(`/api/products?${new URLSearchParams({ q, pageSize: '3' })}`, ac.signal)
            .then((data) => {
                setSuggestions(data.items ?? []);
                setOpenSug(true);
            })
            .catch(() => {
                setSuggestions([]);
                setOpenSug(false);
            })
            .finally(() => {
                setLoadingSug(false);
                if (inFlight.current === ac) inFlight.current = null;
            });
    }, []);

    const onChangeQuery = (v: string) => {
        setQuery(v);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => runSearch(v), 250);
    };

    const goSearchPage = (q: string) => {
        const term = q.trim();
        if (!term) return;
        setOpenSug(false);
        router.push(`/q/${encodeURIComponent(term)}`);
    };

    // Auth state via localStorage (mock)
    type User = { email: string } | null;
    const [user, setUser] = React.useState<User>(null);
    React.useEffect(() => {
        try {
            const raw = localStorage.getItem('mm_user');
            if (raw) setUser(JSON.parse(raw));
        } catch { }
    }, []);

    const [openLogin, setOpenLogin] = React.useState(false);
    const [openRegister, setOpenRegister] = React.useState(false);
    const [openCart, setOpenCart] = React.useState(false);

    // Close suggestions on route change
    React.useEffect(() => {
        const close = () => setOpenSug(false);
        window.addEventListener('popstate', close);
        return () => window.removeEventListener('popstate', close);
    }, []);

    return (
        <AppBar position="sticky" color="default" elevation={1} sx={{ top: 0 }}>

            {/* Top row: brand + search + actions */}
            <Toolbar sx={{ gap: 2, borderBottom: '1px solid', borderColor: 'divider', display: "flex", alignItems: "center", justifyContent: "space-between", px: 10 }}>
                {/* Brand */}
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                    <Typography component={Link} href="/" variant="h6" fontWeight={800} color="inherit" sx={{ textDecoration: 'none' }}>
                        <span aria-hidden>🛒</span>
                        MockMarket
                    </Typography>
                </Box>

                {/* Search */}
                <Box sx={{ flex: 1, maxWidth: 720 }}>
                    <TextField
                        inputRef={anchorRef}
                        value={query}
                        onChange={(e) => onChangeQuery(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); goSearchPage(query); } }}
                        placeholder="Buscar productos..."
                        fullWidth
                        size="small"
                        InputProps={{
                            sx: {
                                background: "#FFFFFF"
                            },
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2}}>
                    {/* User/Login */}
                    <Box>
                        {user ? (
                            <Button onClick={() => setOpenLogin(true)} startIcon={<PersonIcon />} variant="text">
                                {user.email}
                            </Button>
                        ) : (
                            <Stack direction="row" spacing={1}>
                                <Button variant="text" onClick={() => setOpenLogin(true)}>Identificarse</Button>
                                <Button variant="outlined" onClick={() => setOpenRegister(true)}>Registrarse</Button>
                            </Stack>
                        )}
                    </Box>

                    {/* Cart */}
                    <CartIcon onClick={() => setOpenCart(true)} />
                </Box>
            </Toolbar>

            {/* Categories row */}
            <Toolbar variant="dense" sx={{ gap: 1, overflowX: 'auto' }}>
                {categories.map((c) => (
                    <Chip
                        key={c.id}
                        label={`${getCategoryEmoji(c.slug)} ${c.name}`}
                        component={Link}
                        href={`/c/${c.slug}`}
                        clickable
                        variant="outlined"
                        sx={{ mr: 0.5 }}
                    />
                ))}
            </Toolbar>

            {/* Search suggestions popper */}
            <Popper open={openSug} anchorEl={anchorRef.current} placement="bottom-start" sx={{ zIndex: (t) => t.zIndex.modal }}>
                <ClickAwayListener onClickAway={() => setOpenSug(false)}>
                    <Paper sx={{ width: anchorRef.current?.offsetWidth ?? 360, maxWidth: 720, p: 0.5 }}>
                        <List dense disablePadding>
                            {loadingSug && (
                                <ListItemButton disabled>
                                    <ListItemText primary={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><CircularProgress size={16} /> Buscando...</span>} />
                                </ListItemButton>
                            )}
                            {!loadingSug && suggestions.map((p) => (
                                <ListItemButton key={p.id} component={Link} href={`/p/${p.id}`} onClick={() => setOpenSug(false)}>
                                    <ListItemAvatar>
                                        <Avatar variant="rounded" src={p.image ?? undefined} sx={{ width: 40, height: 40 }} />
                                    </ListItemAvatar>
                                    <ListItemText primary={p.name} secondary={p.brand ?? ''} />
                                </ListItemButton>
                            ))}
                            {!loadingSug && query.trim().length >= 3 && (
                                <>
                                    {suggestions.length > 0 && <Divider />}
                                    <ListItemButton onClick={() => goSearchPage(query)}>
                                        <ListItemText primary={`Buscar "${query}"`} />
                                    </ListItemButton>
                                </>
                            )}
                        </List>
                    </Paper>
                </ClickAwayListener>
            </Popper>       

            {/* Login Drawer */}
            <Drawer anchor="right" open={openLogin} onClose={() => setOpenLogin(false)}>
                <Box sx={{ width: { xs: 320, sm: 380 }, p: 2 }} role="presentation">
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="h6">Identificarse</Typography>
                        <IconButton onClick={() => setOpenLogin(false)}><CloseIcon /></IconButton>
                    </Stack>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const form = new FormData(e.currentTarget as HTMLFormElement);
                            const email = String(form.get('email') || '').trim();
                            if (email) {
                                localStorage.setItem('mm_user', JSON.stringify({ email }));
                                setUser({ email });
                                setOpenLogin(false);
                            }
                        }}
                    >
                        <Stack spacing={2}>
                            <TextField name="email" type="email" label="Email" required fullWidth />
                            <TextField name="password" type="password" label="Contraseña" required fullWidth />
                            <Button type="submit" variant="contained">Ingresar</Button>
                        </Stack>
                    </form>
                    {user && (
                        <Box sx={{ mt: 3 }}>
                            <Divider sx={{ mb: 2 }} />
                            <Button color="inherit" onClick={() => { localStorage.removeItem('mm_user'); setUser(null); }}>Cerrar sesión</Button>
                        </Box>
                    )}
                </Box>
            </Drawer>

            {/* Register Drawer */}
            <Drawer anchor="right" open={openRegister} onClose={() => setOpenRegister(false)}>
                <Box sx={{ width: { xs: 320, sm: 420 }, p: 2 }} role="presentation">
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="h6">Registrarse</Typography>
                        <IconButton onClick={() => setOpenRegister(false)}><CloseIcon /></IconButton>
                    </Stack>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const form = new FormData(e.currentTarget as HTMLFormElement);
                            const email = String(form.get('email') || '').trim();
                            if (email) {
                                localStorage.setItem('mm_user', JSON.stringify({ email }));
                                setUser({ email });
                                setOpenRegister(false);
                            }
                        }}
                    >
                        <Stack spacing={2}>
                            <TextField name="email" type="email" label="Email" required fullWidth />
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <TextField name="firstName" label="Nombres" required fullWidth />
                                <TextField name="lastName" label="Apellidos" required fullWidth />
                            </Stack>
                            <TextField name="dob" type="date" label="Fecha de nacimiento" InputLabelProps={{ shrink: true }} fullWidth />
                            <TextField name="password" type="password" label="Contraseña" required fullWidth />
                            <TextField name="password2" type="password" label="Confirmar contraseña" required fullWidth />
                            <Box>
                                <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <input name="terms" type="checkbox" required />
                                    <span>Acepto términos y condiciones</span>
                                </label>
                            </Box>
                            <Box>
                                <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <input name="data" type="checkbox" />
                                    <span>Acepto uso de datos</span>
                                </label>
                            </Box>
                            <Button type="submit" variant="contained">Crear cuenta</Button>
                        </Stack>
                    </form>
                </Box>
            </Drawer>

            {/* Cart Drawer (UI only) */}
            <Drawer anchor="right" open={openCart} onClose={() => setOpenCart(false)}>
                <Box sx={{ width: { xs: 320, sm: 420, lg: 570 }, p: 2 }} role="presentation">
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="h6">Mi carrito</Typography>
                        <IconButton onClick={() => setOpenCart(false)}><CloseIcon /></IconButton>
                    </Stack>
                    <Divider sx={{ mb: 2 }} />     
                    <CartSummary onClose={() => setOpenCart(false)} />
                </Box>
            </Drawer>
        </AppBar>
    );
}
