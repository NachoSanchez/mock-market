import type { Metadata } from 'next';
import Navbar from '@/components/navbar';
import { CartProvider } from '@/hooks/useCart';
import { Container } from '@mui/material';
import Providers from './providers';
//import './globals.css';


export const metadata: Metadata = {
	title: 'Mock Mercado',
	description: 'Catálogo mock con Next 15 + MUI',
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="es">
			<body style={{ background: "#F5F5F5" }}>
				<Providers>
					<CartProvider>
						<Navbar />
						<Container maxWidth="xl" sx={{ py: 3 }}>
							{children}
						</Container>
					</CartProvider>
				</Providers>
			</body>
		</html>
	);
}