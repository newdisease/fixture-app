import type { LinksFunction, LoaderFunctionArgs } from '@remix-run/node'
import {
  json,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react'
import { AuthenticityTokenProvider } from 'remix-utils/csrf/react'
import { HoneypotProvider } from 'remix-utils/honeypot/react'

import { ClientHintCheck } from '~/components/misc/client-hints'
import { GenericErrorBoundary } from '~/components/misc/error-boundary'
import { getHints } from '~/utils/hooks/use-hints'
import { useNonce } from '~/utils/hooks/use-nonce'
import { getTheme, useTheme } from '~/utils/hooks/use-theme'
import type { Theme } from '~/utils/hooks/use-theme'
import { getDomainUrl, combineHeaders } from '~/utils/misc.server'

import { authenticator } from './modules/auth/auth.server'
import RootCSS from './root.css?url'
import { csrf } from './utils/csrf.server'
import { prisma } from './utils/db.server'
import { honeypot } from './utils/honeypot.server'
import { useToast } from './utils/hooks/use-toast'
import { getToastSession } from './utils/toast.server'

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
  { rel: 'stylesheet', href: RootCSS },
]

export async function loader({ request }: LoaderFunctionArgs) {
  const sessionUser = await authenticator.isAuthenticated(request)
  const user = sessionUser?.id
    ? await prisma.user.findUnique({
        where: { id: sessionUser?.id },
        include: {
          image: { select: { id: true } },
        },
      })
    : null

  const { toast, headers: toastHeaders } = await getToastSession(request)
  const [csrfToken, csrfCookieHeader] = await csrf.commitToken()

  return json(
    {
      user,
      toast,
      csrfToken,
      honeypotProps: honeypot.getInputProps(),
      requestInfo: {
        hints: getHints(request),
        origin: getDomainUrl(request),
        path: new URL(request.url).pathname,
        userPrefs: { theme: getTheme(request) },
      },
    } as const,
    {
      headers: combineHeaders(
        toastHeaders,
        csrfCookieHeader ? { 'Set-Cookie': csrfCookieHeader } : null,
      ),
    },
  )
}

function Document({
  children,
  nonce,
  lang = 'en',
  dir = 'ltr',
  theme = 'light',
}: {
  children: React.ReactNode
  nonce: string
  lang?: string
  dir?: 'ltr' | 'rtl'
  theme?: Theme
}) {
  return (
    <html
      lang={lang}
      dir={dir}
      className={`${theme} overflow-x-hidden`}
      style={{ colorScheme: theme }}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <ClientHintCheck nonce={nonce} />
        <Meta />
        <Links />
      </head>
      <body className="h-auto w-full">
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  )
}

export default function AppWithProviders() {
  const { csrfToken, honeypotProps, toast } = useLoaderData<typeof loader>()

  const nonce = useNonce()
  const theme = useTheme()

  useToast(toast)

  return (
    <Document nonce={nonce} theme={theme} lang="en">
      <AuthenticityTokenProvider token={csrfToken}>
        <HoneypotProvider {...honeypotProps}>
          <Outlet />
        </HoneypotProvider>
      </AuthenticityTokenProvider>
    </Document>
  )
}

export function ErrorBoundary() {
  const nonce = useNonce()
  const theme = useTheme()

  return (
    <Document nonce={nonce} theme={theme}>
      <GenericErrorBoundary
        statusHandlers={{
          403: ({ error }) => (
            <p>You are not allowed to do that: {error?.data.message}</p>
          ),
        }}
      />
    </Document>
  )
}
