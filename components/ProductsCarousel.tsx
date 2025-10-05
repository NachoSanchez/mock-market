// components/ProductsCarousel.tsx
'use client';
import * as React from 'react';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import { Box, Typography, IconButton, Paper, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/hooks/useCart';
import { getCategoryEmoji } from '@/lib/categoryEmoji';

function useSlidesToShow() {
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down('sm'));        // <600
    const isSm = useMediaQuery(theme.breakpoints.between('sm', 'md')); // 600–900
    const isMd = useMediaQuery(theme.breakpoints.between('md', 'lg')); // 900–1200
    const isLg = useMediaQuery(theme.breakpoints.between('lg', 'xl')); // 1200–1536
    if (isXs) return 1;
    if (isSm) return 2;
    if (isMd) return 3;
    if (isLg) return 4;
    return 5; // >= xl
}

export default function ProductsCarousel({
    title,
    products,
    categorySlug,
}: {
    title: string;
    products: Product[];
    categorySlug: string;
}) {
    const slidesToShow = useSlidesToShow();
    const slideBasis = `${(100 / slidesToShow).toFixed(5)}%`;
    const GUTTER = 16;
    const sideGutter = `${GUTTER}px`;

    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: false,
        align: 'start',
        dragFree: false,
        slidesToScroll: 1,
    });

    const [prevEnabled, setPrevEnabled] = React.useState(false);
    const [nextEnabled, setNextEnabled] = React.useState(false);

    const onSelect = React.useCallback((api: any) => {
        setPrevEnabled(api.canScrollPrev());
        setNextEnabled(api.canScrollNext());
    }, []);

    React.useEffect(() => {
        if (!emblaApi) return;
        onSelect(emblaApi);
        emblaApi.on('select', onSelect);
        emblaApi.on('reInit', onSelect);
        return () => {
            emblaApi.off('select', onSelect);
            emblaApi.off('reInit', onSelect);
        };
    }, [emblaApi, onSelect]);

    const scrollPrev = React.useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const scrollNext = React.useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

    return (
        <Box sx={{ mt: 6, mb: 0 }}>
            <Stack direction="row" justifyContent="space-between">
                <Typography variant="h5" fontWeight={800}>
                    <Link
                        href={`/c/${encodeURIComponent(categorySlug)}`}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                        aria-label={`Ver categoría ${title}`}
                    >
                        {`${getCategoryEmoji(categorySlug)} ${title}`}
                    </Link>
                </Typography>

                <Stack direction="row" gap={1}>
                    <IconButton
                        aria-label="Anterior"
                        onClick={scrollPrev}
                        disabled={!prevEnabled}
                        sx={{
                            pointerEvents: 'auto', 
                            bgcolor: 'primary.main',
                            color: "primary.contrastText",
                            boxShadow: 1,
                            '&:hover': { bgcolor: 'primary.dark' },
                            opacity: prevEnabled ? 1 : 0.5,
                        }}
                    >
                        <ChevronLeftIcon />
                    </IconButton>

                    <IconButton
                        aria-label="Siguiente"
                        onClick={scrollNext}
                        disabled={!nextEnabled}
                        sx={{
                            pointerEvents: 'auto',
                            bgcolor: 'primary.main',
                            color: "primary.contrastText",
                            boxShadow: 1,
                            '&:hover': { bgcolor: 'primary.dark' },
                            opacity: nextEnabled ? 1 : 0.5,
                        }}
                    >
                        <ChevronRightIcon />
                    </IconButton>
                </Stack>
            </Stack>

            {/* Contenedor relativo para centrar flechas sobre el carrusel */}
            <Box sx={{ position: 'relative', width: "100%" }}>
                {/* Viewport Embla */}
                <Box ref={emblaRef} sx={{ overflow: 'hidden' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            gap: `${GUTTER}px`,
                            px: sideGutter,           // 🔧 gutters laterales dentro del viewport
                            py: `${GUTTER / 2}px`,    // 🔧 evita recorte arriba/abajo
                            touchAction: 'pan-y pinch-zoom',
                            alignItems: 'stretch',
                        }}
                    >
                        {products.map((p) => (
                            <Box key={p.id} sx={{ flex: `0 0 ${slideBasis}`, minWidth: 0, height: '100%' }}>
                                <ProductCard product={p} />
                            </Box>
                        ))}



                        <Box key={`${title}-link`} sx={{ flex: `0 0 ${slideBasis}`, minWidth: 0, height: '100%' }}>
                            <Paper
                                sx={{
                                    height: 370,
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    bgcolor: "primary.main",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 1,
                                    p: 2
                                }}
                                elevation={0}
                            >
                                <Typography variant="h2">{getCategoryEmoji(categorySlug)}</Typography>
                                <Typography variant="h6" color="#FAFAFA" align='center'>
                                    <Link
                                        href={`/c/${encodeURIComponent(categorySlug)}`}
                                        style={{ textDecoration: 'none', color: 'inherit' }}
                                        aria-label={`Ver categoría ${title}`}
                                    >   
                                        Ver mas {title}
                                    </Link>
                                </Typography>

                        </Paper>
                    </Box>

                </Box>
            </Box>

            {/* Overlay de controles centrados verticalmente 
            <Box
                aria-hidden
                sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 0.5,
                    pointerEvents: 'none', // no bloquea drag
                }}
            >

            </Box>
            */}
        </Box>
        </Box >
    );
}
