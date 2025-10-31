import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import Navbar from '@/components/navbar';
import { Container } from '@mui/material';
import Providers from './providers';
import Footer from '@/components/Footer';
import SfInit from './SfInit';
import IdentityEvents from './IdentityEvents';
import AgentforceEmbed from './AgentforceEmbed';
import AgentforceAssistantCTA from '@/components/AgentforceAssistanceCTA';
//import './globals.css';


export const metadata: Metadata = {
	title: 'Mock Mercado',
	description: 'Catálogo mock con Next 15 + MUI',
};

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	minimumScale: 1,
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
					<IdentityEvents />
				</Providers>

				{/* Beacon global */}
				<Script
					id="sf-c360a"
					src="https://cdn.c360a.salesforce.com/beacon/c360a/636f02d0-3483-4dfd-a693-e34b85f6494d/scripts/c360a.min.js"
					strategy="beforeInteractive"   // o "beforeInteractive" si necesitás que esté antes de cualquier JS
				/>

				<SfInit/>
				<AgentforceEmbed />
				<AgentforceAssistantCTA
					message="Hola, soy tu asistente virtual. ¡Hablame cuando me necesites!"
					offsetY={84}     // separa el CTA del botón (hacia arriba)
					offsetX={0}      // mueve a la izquierda si el botón tiene mucho right
					rememberDismissDays={7}
				/>
			</body>
		</html>
	);
}