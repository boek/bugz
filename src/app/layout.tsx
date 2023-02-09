import Link from 'next/link';
import "../styles/globals.css";

type Props = {
	children: React.ReactNode
}

export default function RootLayout({ children }: Props) {
	return (
		<html lang="en">
			<body>
				<main className="flex flex-col w-screen h-screen overflow-auto text-gray-700 bg-gradient-to-tr from-sky-200 via-blue-200 to-orange-200">
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
