import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(req: NextRequest) {
    // 1. Inicializamos la respuesta base
    let res = NextResponse.next({
        request: {
            headers: req.headers,
        },
    })

    // 2. Creamos el cliente Supabase SSR seguro
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return req.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        req.cookies.set(name, value)
                        res.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    // 3. Obtenemos la sesión del usuario
    const { data: { session } } = await supabase.auth.getSession()
    const path = req.nextUrl.pathname

    // 4. Lógica Zero Trust (Redirección a login si no hay sesión)
    if (!session && (path.startsWith('/admin') || path.startsWith('/chef') || path.startsWith('/subscriber'))) {
        return NextResponse.redirect(new URL('/auth/login', req.url))
    }

    // 5. Verificación de Roles
    if (session) {
        const userRole = session.user.user_metadata?.role || 'subscriber'

        if (path.startsWith('/admin') && userRole !== 'admin') {
            return NextResponse.redirect(new URL('/unauthorized', req.url))
        }
        if (path.startsWith('/chef') && userRole !== 'chef' && userRole !== 'admin') {
            return NextResponse.redirect(new URL('/unauthorized', req.url))
        }
    }

    return res
}

export const config = {
    matcher: ['/admin/:path*', '/chef/:path*', '/subscriber/:path*', '/auth/:path*'],
}