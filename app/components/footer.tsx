import { ThemeSwitcherHome } from './misc/theme-switcher'

export default function Footer() {
	return (
		<footer className="border-border bg-card z-10 w-full border-t px-6">
			<div className="mx-auto flex w-full max-w-(--breakpoint-xl) flex-col items-center justify-center gap-8 py-6">
				<ThemeSwitcherHome />
				<p className="text-primary/60 text-sm font-medium">
					&copy; {new Date().getFullYear()} Fixture App. All rights reserved.
				</p>
			</div>
		</footer>
	)
}
