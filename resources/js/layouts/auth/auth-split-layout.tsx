import { Link, usePage } from '@inertiajs/react';
import { Leaf } from 'lucide-react';
import { home, login as loginRoute, register as registerRoute } from '@/routes';
import type { AuthLayoutProps } from '@/types';

const heroImg = '/images/aquawood-hero.jpg';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name, auth } = usePage().props;

    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const isLogin = currentPath === loginRoute().url;
    const isRegister = currentPath === registerRoute().url;

    return (
        <div className="relative grid min-h-dvh flex-col bg-cream-50 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col lg:flex">
                <div className="absolute inset-0">
                    <img
                        src={heroImg}
                        alt=""
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-brand-900/80 via-brand-800/70 to-brand-950/90" />
                </div>

                <div className="relative z-10 flex h-full flex-col p-10">
                    <Link href={home()} className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-500 text-white">
                            <Leaf className="h-6 w-6" />
                        </div>
                        <div className="leading-tight">
                            <div className="font-serif text-xl text-cream-50">
                                {String(name).split(',')[0] || 'Aquawood'}
                            </div>
                            <div className="text-[10px] uppercase tracking-[0.2em] text-gold-400">
                                {String(name).split(',').slice(1).join(',').trim() || 'Garden Resort'}
                            </div>
                        </div>
                    </Link>

                    <div className="mt-auto mb-16 max-w-md">
                        <h2 className="font-serif text-4xl leading-tight text-cream-50">
                            {isRegister
                                ? 'Join us for a peaceful escape'
                                : 'Welcome back to your retreat'}
                        </h2>
                        <p className="mt-4 text-sm leading-relaxed text-cream-100/80">
                            {isRegister
                                ? 'Create your account to book rooms, reserve events, and manage your stays at Aquawood Garden Resort.'
                                : 'Sign in to manage bookings, explore room options, and plan your next visit to Candelaria, Quezon.'}
                        </p>
                    </div>

                    <div className="mt-auto flex items-center gap-4 text-xs text-cream-100/60">
                        <span>© {new Date().getFullYear()} {String(name).split(',')[0]}</span>
                        <span className="h-3 w-px bg-cream-100/20" />
                        <a href="#" className="hover:text-gold-400 transition">Privacy</a>
                        <span className="h-3 w-px bg-cream-100/20" />
                        <a href="#" className="hover:text-gold-400 transition">Terms</a>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-center p-6 lg:p-8">
                <div className="mx-auto flex w-full max-w-sm flex-col justify-center space-y-6">
                    <Link
                        href={home()}
                        className="flex items-center justify-center gap-2 lg:hidden"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-800 text-cream-50">
                            <Leaf className="h-5 w-5" />
                        </div>
                        <div className="leading-tight">
                            <div className="font-serif text-lg text-brand-900">
                                {String(name).split(',')[0] || 'Aquawood'}
                            </div>
                        </div>
                    </Link>

                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-xl font-medium text-brand-900">{title}</h1>
                        <p className="text-balance text-sm text-brand-700/70">{description}</p>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}
