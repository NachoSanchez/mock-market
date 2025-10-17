import type { Metadata } from 'next';
import Script from 'next/script';
import Navbar from '@/components/navbar';
import { Container } from '@mui/material';
import Providers from './providers';
import Footer from '@/components/Footer';
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
					<Navbar />
					<Container maxWidth="xl" sx={{ py: 3, px: 2 }}>
						{children}
						<Footer />
					</Container>
				</Providers>

				{/* Beacon global */}
				<Script
					id="sf-c360a"
					src="https://cdn.c360a.salesforce.com/beacon/c360a/636f02d0-3483-4dfd-a693-e34b85f6494d/scripts/c360a.min.js"
					strategy="afterInteractive"   // o "beforeInteractive" si necesitás que esté antes de cualquier JS
				/>
			</body>
		</html>
	);
}