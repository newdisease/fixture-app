import { ThemeSwitcherHome } from './misc/theme-switcher'

export default function Footer() {
	return (
		<footer className="z-10 w-full border-t border-border bg-card px-6">
			<div className="mx-auto flex w-full max-w-screen-xl flex-col items-center justify-center gap-8 py-6">
				<ThemeSwitcherHome />
				<p className="text-sm font-medium text-primary/60">
					&copy; {new Date().getFullYear()} Fixture App. All rights reserved.
				</p>
			</div>
		</footer>
	)
}
