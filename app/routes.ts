import {
	type RouteConfig,
	route,
	index,
	layout,
	prefix,
} from '@react-router/dev/routes'

export default [
	index('./routes/home.tsx'),
	route('login', './routes/auth/login.tsx'),
	route('logout', './routes/auth/logout.ts'),
	route('google', './routes/auth/google.ts'),
	route('google-callback', './routes/auth/google-callback.ts'),
	route('magic-link', './routes/auth/magic-link.ts'),
	route('verify-code', './routes/auth/verify-code.tsx'),

	layout('./routes/layouts/app-layout.tsx', [
		route('feed', './routes/feed.tsx'),
		route('add-new', './routes/add-new.tsx'),
		layout('./routes/layouts/settings-layout.tsx', [
			route('settings', './routes/settings.tsx'),
		]),
	]),

	...prefix('onboarding', [
		route('username', './routes/onboarding/username.tsx'),
	]),

	...prefix('resources', [
		route('reset-image', './routes/resources/reset-image.ts'),
		route('update-theme', './routes/resources/update-theme.ts'),
		route('upload-image', './routes/resources/upload-image.ts'),
		route('user-images/:imageId', './routes/resources/user-images.ts'),
	]),
] satisfies RouteConfig
