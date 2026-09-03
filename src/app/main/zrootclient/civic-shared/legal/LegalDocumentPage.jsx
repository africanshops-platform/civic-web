import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { ArrowBack, MenuBook, Schedule } from '@mui/icons-material';
import { Button } from '@mui/material';
import { TYPE } from '../typography';
import { useLegalDocument } from './hooks/useLegalDocumentRepo';

/**
 * LegalDocumentPage — the shared, reusable page every keyed legal document
 * (privacy policy, terms & conditions, ...) renders through. One component,
 * one visual treatment, so a new policy type never means a new one-off page.
 *
 * Visual language matches CivicLandingPage.jsx (same orange gradient, same
 * rounded-24 warm cards), and font sizing uses the shared TYPE scale from
 * civic-shared/typography.js — this app's html root is 62.5% (1rem = 10px),
 * so a locally-invented rem scale here would have rendered noticeably
 * smaller than intended, the same "tiny text" issue TYPE was extracted to
 * fix platform-wide (see feedback_civicweb_typography_scale memory).
 */

const ORANGE_GRADIENT = 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)';
const WARM_BG = 'linear-gradient(180deg, #fafaf9 0%, #fff7ed 100%)';

const fadeUp = (delay = 0) => ({
	initial: { opacity: 0, y: 24 },
	animate: { opacity: 1, y: 0 },
	transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }
});

function slugify(text) {
	return String(text)
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '')
		.replace(/\s+/g, '-');
}

/** Pulls every `## Heading` line out of the raw markdown to build a table
 * of contents — react-markdown doesn't expose this itself, and adding a
 * rehype plugin just for heading ids would be a whole extra dependency for
 * something 20 lines of regex covers. */
function extractHeadings(markdown) {
	if (!markdown) return [];
	const lines = markdown.split('\n');
	const headings = [];

	lines.forEach((line) => {
		const match = /^##\s+(.+)$/.exec(line.trim());

		if (match) {
			headings.push({ text: match[1].trim(), id: slugify(match[1]) });
		}
	});

	return headings;
}

function LoadingState() {
	return (
		<div style={{ width: '100%', minHeight: '70vh', background: WARM_BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
			<motion.div
				animate={{ opacity: [0.4, 1, 0.4] }}
				transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
				style={{ color: '#ea580c', fontWeight: 700, fontSize: TYPE.body }}
			>
				Loading…
			</motion.div>
		</div>
	);
}

function NotPublishedState({ title }) {
	return (
		<div style={{ width: '100%', minHeight: '70vh', background: WARM_BG }}>
			<div
				style={{
					maxWidth: 560,
					margin: '0 auto',
					padding: 'clamp(80px, 12vw, 140px) clamp(20px, 5vw, 40px) 60px',
					textAlign: 'center'
				}}
			>
				<motion.div {...fadeUp(0)}>
					<div
						style={{
							width: 72,
							height: 72,
							borderRadius: 20,
							background: 'white',
							border: '1px solid #fed7aa',
							boxShadow: '0 12px 32px rgba(234,88,12,0.1)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							margin: '0 auto 24px'
						}}
					>
						<MenuBook sx={{ fontSize: 32, color: '#ea580c' }} />
					</div>
					<h1 style={{ fontSize: TYPE.sectionH, fontWeight: 800, color: '#1f2937', margin: '0 0 12px' }}>
						{title || 'This document'} isn&apos;t published yet
					</h1>
					<p style={{ fontSize: TYPE.body, color: '#6b7280', lineHeight: 1.65, margin: '0 0 28px' }}>
						We&apos;re still finalizing this page. Check back soon, or head back to the home page in the
						meantime.
					</p>
					<Button
						component={Link}
						to="/"
						variant="contained"
						startIcon={<ArrowBack />}
						sx={{
							background: ORANGE_GRADIENT,
							color: 'white',
							fontWeight: 700,
							px: 3.5,
							py: 1.25,
							borderRadius: '12px',
							'&:hover': { opacity: 0.92 }
						}}
					>
						Back to home
					</Button>
				</motion.div>
			</div>
		</div>
	);
}

const markdownComponents = {
	h2: ({ children }) => {
		const text = Array.isArray(children) ? children.join('') : children;
		return (
			<h2
				id={slugify(text)}
				style={{
					fontSize: TYPE.sectionH,
					fontWeight: 800,
					color: '#1f2937',
					margin: '2.2em 0 0.7em',
					scrollMarginTop: 96
				}}
			>
				{children}
			</h2>
		);
	},
	h3: ({ children }) => (
		<h3 style={{ fontSize: TYPE.subH, fontWeight: 700, color: '#1f2937', margin: '1.6em 0 0.5em' }}>
			{children}
		</h3>
	),
	p: ({ children }) => (
		<p style={{ fontSize: TYPE.body, lineHeight: 1.75, color: '#374151', margin: '0 0 1.1em' }}>{children}</p>
	),
	strong: ({ children }) => <strong style={{ color: '#1f2937', fontWeight: 700 }}>{children}</strong>,
	ul: ({ children }) => <ul style={{ margin: '0 0 1.1em', paddingLeft: '1.4em' }}>{children}</ul>,
	ol: ({ children }) => <ol style={{ margin: '0 0 1.1em', paddingLeft: '1.4em' }}>{children}</ol>,
	li: ({ children }) => (
		<li style={{ fontSize: TYPE.body, lineHeight: 1.75, color: '#374151', marginBottom: '0.5em' }}>{children}</li>
	),
	a: ({ children, href }) => (
		<a href={href} style={{ color: '#ea580c', fontWeight: 600, textDecoration: 'underline' }}>
			{children}
		</a>
	),
	blockquote: ({ children }) => (
		<blockquote
			style={{
				margin: '0 0 1.1em',
				padding: '14px 20px',
				borderLeft: '4px solid #fdba74',
				background: '#fff7ed',
				borderRadius: '0 12px 12px 0',
				color: '#9a3412',
				fontSize: TYPE.meta
			}}
		>
			{children}
		</blockquote>
	)
};

function LegalDocumentPage({ documentKey, eyebrow = 'Legal' }) {
	const { data: doc, isLoading, isError } = useLegalDocument(documentKey);
	const [activeSection, setActiveSection] = useState(null);

	const headings = useMemo(() => extractHeadings(doc?.content), [doc?.content]);

	if (isLoading) return <LoadingState />;

	if (isError || !doc) return <NotPublishedState />;

	const lastUpdated = doc.publishedAt || doc.updatedAt;

	return (
		<div style={{ width: '100%', background: WARM_BG }}>
			{/* ───────────────────────── Hero ───────────────────────── */}
			<div
				style={{
					background: ORANGE_GRADIENT,
					padding: 'clamp(48px, 7vw, 80px) clamp(20px, 5vw, 64px) clamp(56px, 8vw, 88px)',
					position: 'relative',
					overflow: 'hidden'
				}}
			>
				<svg
					className="pointer-events-none absolute inset-0 opacity-10"
					viewBox="0 0 960 400"
					width="100%"
					height="100%"
					preserveAspectRatio="xMidYMax slice"
					xmlns="http://www.w3.org/2000/svg"
				>
					<g fill="none" stroke="white" strokeWidth="2">
						<circle r="220" cx="880" cy="60" opacity="0.25" />
						<circle r="160" cx="60" cy="380" opacity="0.2" />
					</g>
				</svg>

				<div style={{ maxWidth: 880, margin: '0 auto', position: 'relative', zIndex: 1 }}>
					<motion.div {...fadeUp(0)}>
						<Link
							to="/"
							style={{
								display: 'inline-flex',
								alignItems: 'center',
								gap: 6,
								color: 'rgba(255,255,255,0.85)',
								textDecoration: 'none',
								fontSize: TYPE.meta,
								fontWeight: 600,
								marginBottom: 20
							}}
						>
							<ArrowBack sx={{ fontSize: 16 }} /> Back to home
						</Link>
					</motion.div>

					<motion.span
						{...fadeUp(0.05)}
						style={{
							display: 'inline-block',
							color: 'white',
							background: 'rgba(255,255,255,0.18)',
							backdropFilter: 'blur(6px)',
							padding: '5px 14px',
							borderRadius: 999,
							fontSize: TYPE.meta,
							fontWeight: 700,
							letterSpacing: '0.02em',
							marginBottom: 16
						}}
					>
						{eyebrow}
					</motion.span>

					<motion.h1
						{...fadeUp(0.1)}
						style={{
							color: 'white',
							fontWeight: 900,
							lineHeight: 1.12,
							margin: '0 0 14px',
							fontSize: TYPE.hero,
							textWrap: 'balance'
						}}
					>
						{doc.title}
					</motion.h1>

					{lastUpdated && (
						<motion.div
							{...fadeUp(0.16)}
							style={{
								display: 'inline-flex',
								alignItems: 'center',
								gap: 6,
								color: 'rgba(255,255,255,0.85)',
								fontSize: TYPE.meta
							}}
						>
							<Schedule sx={{ fontSize: 16 }} />
							Last updated{' '}
							{new Date(lastUpdated).toLocaleDateString('en-US', {
								year: 'numeric',
								month: 'long',
								day: 'numeric'
							})}
						</motion.div>
					)}
				</div>
			</div>

			{/* ───────────────────── Content ─────────────────────
			    grid-cols-1 on mobile always; the 260px sidebar column only
			    kicks in at lg+ (matching the nav's own `hidden lg:block`) so
			    the two never disagree about whether there's a second column. */}
			<div
				className={headings.length > 3 ? 'grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px]' : 'grid grid-cols-1'}
				style={{
					maxWidth: 1080,
					margin: '0 auto',
					padding: 'clamp(32px, 5vw, 56px) clamp(20px, 5vw, 64px) clamp(64px, 8vw, 96px)',
					gap: 'clamp(24px, 4vw, 56px)',
					alignItems: 'start'
				}}
			>
				<motion.div
					{...fadeUp(0.1)}
					style={{
						background: 'white',
						border: '1px solid #fed7aa',
						borderRadius: 24,
						boxShadow: '0 12px 32px rgba(234,88,12,0.08)',
						padding: 'clamp(28px, 4vw, 48px)',
						minWidth: 0
					}}
				>
					<ReactMarkdown components={markdownComponents}>{doc.content}</ReactMarkdown>
				</motion.div>

				{headings.length > 3 && (
					<motion.nav
						{...fadeUp(0.18)}
						aria-label="Table of contents"
						className="hidden lg:block"
						style={{
							position: 'sticky',
							top: 24,
							background: 'rgba(255,255,255,0.75)',
							border: '1px solid #fdecdc',
							borderRadius: 20,
							padding: '20px 22px'
						}}
					>
						<div style={{ fontSize: TYPE.meta, fontWeight: 800, color: '#9a3412', marginBottom: 12, letterSpacing: '0.02em' }}>
							ON THIS PAGE
						</div>
						<ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
							{headings.map((h) => (
								<li key={h.id}>
									<a
										href={`#${h.id}`}
										onClick={() => setActiveSection(h.id)}
										style={{
											fontSize: TYPE.meta,
											color: activeSection === h.id ? '#ea580c' : '#6b7280',
											fontWeight: activeSection === h.id ? 700 : 500,
											textDecoration: 'none',
											lineHeight: 1.4,
											display: 'block'
										}}
									>
										{h.text}
									</a>
								</li>
							))}
						</ul>
					</motion.nav>
				)}
			</div>
		</div>
	);
}

export default LegalDocumentPage;
