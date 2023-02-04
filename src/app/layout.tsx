import Link from 'next/link';
import "../styles/globals.css";

type Props = {
	children: React.ReactNode
}

export default function RootLayout({ children }: Props) {
	return (
		<html lang="en">
			<body>
				<main className="flex min-h-screen flex-col items-center bg-gradient-to-b to-indigo-50 from-indigo-200 text-indigo-500">
					<nav>
						<Link href="/">Triage</Link>
						<Link href="/components">Components</Link>
						<Link href="/sprint">Sprint</Link>
					</nav>
					{children}
				</main>
			</body>
		</html>
	);
}
