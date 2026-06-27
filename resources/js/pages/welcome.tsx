import { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { dashboard, login, register, home } from '@/routes';
import { publicCreate as bookingsPublicCreate } from '@/routes/bookings';
import {
    Leaf,
    Waves,
    Utensils,
    Star,
    MapPin,
    Phone,
    Mail,
    ArrowRight,
    Check,
    Users,
    Sparkles,
    ChevronDown,
    Navigation,
    Menu,
    X,
    Wifi,
    Wind,
    Tv,
    Refrigerator,
    Coffee,
    Bath,
    Dumbbell,
    VolumeX,
    Car,
} from 'lucide-react';

const heroImg = '/images/aquawood-hero.jpg';
const poolImg = '/images/aquawood-pool.jpg';
const gardenImg = '/images/aquawood-garden.jpg';
const roomImg = '/images/aquawood-room.jpg';
const restaurantImg = '/images/aquawood-restaurant.jpg';
const eventImg = '/images/aquawood-event.jpg';

const aq = {
    hero: heroImg,
    pool: poolImg,
    garden: gardenImg,
    room: roomImg,
    restaurant: restaurantImg,
    event: eventImg,
};

const MAP_EMBED =
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3870.6!2d121.4378!3d13.9293!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDU1JzQ1LjgiTiAxMjHCsDI2JzE2LjMiRQ!5e0!3m2!1sen!2sph!4v1700000000000!5m2!1sen!2sph';
const MAP_LINK =
    'https://www.google.com/maps/search/?api=1&query=Aquawood+Garden+Resort+Candelaria+Quezon&query_place_id=13.9293,121.4378';

interface Floor {
    id: number;
    name: string;
}

interface Category {
    id: number;
    name: string;
    base_price: string;
    capacity: number;
    amenities: string[] | null;
    image: string | null;
    available_rooms_count: number;
    floor: Floor | null;
}

const amenityIcons: Record<string, React.ReactNode> = {
    wifi: <Wifi className="h-3.5 w-3.5" />,
    'air conditioning': <Wind className="h-3.5 w-3.5" />,
    tv: <Tv className="h-3.5 w-3.5" />,
    'mini bar': <Refrigerator className="h-3.5 w-3.5" />,
    'coffee maker': <Coffee className="h-3.5 w-3.5" />,
    bathtub: <Bath className="h-3.5 w-3.5" />,
    gym: <Dumbbell className="h-3.5 w-3.5" />,
    'sound proof': <VolumeX className="h-3.5 w-3.5" />,
    parking: <Car className="h-3.5 w-3.5" />,
};

export default function Welcome() {
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const { auth, property: prop, roomCategories } = usePage().props;

    const p = prop || {};
    const name = p.name || 'Aquawood Garden Resort';
    const shortName = name.split(',')[0] || 'Aquawood';
    const subName =
        name.split(',').slice(1).join(',').trim() || 'Garden Resort';

    const categories: Category[] = roomCategories || [];
    const featuredCategories = categories.slice(0, 4);

    return (
        <>
            <Head title="Welcome" />
            <div className="min-h-screen bg-cream-50">
                <header className="fixed top-0 right-0 left-0 z-50 border-b border-brand-100 bg-cream-50/85 backdrop-blur-md">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                        <Link href={home()} className="flex items-center gap-2">
                            {p.logo ? (
                                <img
                                    src={p.logo}
                                    alt={name}
                                    className="h-10 w-10 rounded-full bg-brand-50 object-cover"
                                />
                            ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-800 text-cream-50">
                                    <Leaf className="h-5 w-5" />
                                </div>
                            )}
                            <div className="leading-tight">
                                <div className="font-serif text-xl text-brand-900">
                                    {shortName}
                                </div>
                                <div className="text-[10px] tracking-[0.2em] text-brand-600 uppercase">
                                    {subName}
                                </div>
                            </div>
                        </Link>
                        <button
                            className="flex p-1 text-brand-800 md:hidden"
                            onClick={() => setMobileNavOpen(!mobileNavOpen)}
                            aria-label="Toggle navigation"
                        >
                            {mobileNavOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                        <nav className="hidden items-center gap-6 text-sm text-brand-800 md:flex">
                            <a
                                href="#rooms"
                                className="transition hover:text-brand-500"
                            >
                                Rooms
                            </a>
                            <a
                                href="#dining"
                                className="transition hover:text-brand-500"
                            >
                                Restaurant
                            </a>
                            <a
                                href="#events"
                                className="transition hover:text-brand-500"
                            >
                                Events
                            </a>
                            <a
                                href="#pool"
                                className="transition hover:text-brand-500"
                            >
                                Pool & Garden
                            </a>
                            <a
                                href="#contact"
                                className="transition hover:text-brand-500"
                            >
                                Contact
                            </a>

                            {auth?.user ? (
                                <Link
                                    href={dashboard()}
                                    className="rounded-full border border-brand-300 px-4 py-1.5 text-xs text-brand-700 transition hover:bg-brand-50"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="rounded-full border border-brand-300 px-4 py-1.5 text-xs text-brand-700 transition hover:bg-brand-50"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href={bookingsPublicCreate()}
                                        className="rounded-full bg-brand-800 px-5 py-2 text-cream-50 transition hover:bg-brand-900"
                                    >
                                        Book Now
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                    {mobileNavOpen && (
                        <div className="border-t border-brand-100 bg-cream-50 px-6 py-4 md:hidden">
                            <nav className="flex flex-col gap-4 text-sm text-brand-800">
                                <a
                                    href="#rooms"
                                    onClick={() => setMobileNavOpen(false)}
                                    className="transition hover:text-brand-500"
                                >
                                    Rooms
                                </a>
                                <a
                                    href="#dining"
                                    onClick={() => setMobileNavOpen(false)}
                                    className="transition hover:text-brand-500"
                                >
                                    Restaurant
                                </a>
                                <a
                                    href="#events"
                                    onClick={() => setMobileNavOpen(false)}
                                    className="transition hover:text-brand-500"
                                >
                                    Events
                                </a>
                                <a
                                    href="#pool"
                                    onClick={() => setMobileNavOpen(false)}
                                    className="transition hover:text-brand-500"
                                >
                                    Pool & Garden
                                </a>
                                <a
                                    href="#contact"
                                    onClick={() => setMobileNavOpen(false)}
                                    className="transition hover:text-brand-500"
                                >
                                    Contact
                                </a>
                                <div className="mt-2 flex flex-col gap-3 pt-2 border-t border-brand-100">
                                    {auth?.user ? (
                                        <Link
                                            href={dashboard()}
                                            onClick={() => setMobileNavOpen(false)}
                                            className="rounded-full border border-brand-300 px-4 py-2 text-center text-xs text-brand-700 transition hover:bg-brand-50"
                                        >
                                            Dashboard
                                        </Link>
                                    ) : (
                                        <>
                                            <Link
                                                href={login()}
                                                onClick={() => setMobileNavOpen(false)}
                                                className="rounded-full border border-brand-300 px-4 py-2 text-center text-xs text-brand-700 transition hover:bg-brand-50"
                                            >
                                                Login
                                            </Link>
                                            <Link
                                                href={bookingsPublicCreate()}
                                                onClick={() => setMobileNavOpen(false)}
                                                className="rounded-full bg-brand-800 px-5 py-2.5 text-center text-cream-50 transition hover:bg-brand-900"
                                            >
                                                Book Now
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </nav>
                        </div>
                    )}
                </header>

                <section className="relative h-screen min-h-[700px]">
                    <img
                        src={aq.hero}
                        alt={name}
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 hero-overlay" />
                    <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 pt-20 text-center text-cream-50">
                        <div className="mb-6 flex animate-fade-up items-center gap-2 text-xs tracking-[0.4em] text-gold-400 uppercase">
                            <Sparkles className="h-4 w-4" /> Candelaria, Quezon{' '}
                            <Sparkles className="h-4 w-4" />
                        </div>
                        <h1
                            className="mb-6 animate-fade-up font-serif text-4xl leading-tight font-light md:text-7xl"
                            style={{ animationDelay: '0.1s' }}
                        >
                            {p.tagline ||
                                'Your peaceful retreat in the heart of Quezon'}
                        </h1>
                        <p
                            className="mb-10 max-w-2xl animate-fade-up text-lg text-cream-100/90"
                            style={{ animationDelay: '0.2s' }}
                        >
                            A garden retreat just off the Maharlika Highway —
                            refreshing pools, comfortable rooms, authentic
                            Filipino cuisine, and beautiful venues for every
                            celebration.
                        </p>
                        <div
                            className="flex animate-fade-up flex-wrap justify-center gap-4"
                            style={{ animationDelay: '0.3s' }}
                        >
                            <Link
                                href={bookingsPublicCreate()}
                                className="flex items-center gap-2 rounded-full bg-gold-500 px-8 py-3.5 font-medium text-white transition hover:bg-gold-600"
                            >
                                Reserve Your Stay{' '}
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <a
                                href="#rooms"
                                className="rounded-full border border-cream-50/60 px-8 py-3.5 text-cream-50 transition hover:bg-cream-50/10"
                            >
                                Explore the Resort
                            </a>
                        </div>
                    </div>
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-cream-50">
                        <ChevronDown className="h-6 w-6" />
                    </div>
                </section>

                <section className="bg-cream-50 px-6 py-24">
                    <div className="mx-auto grid max-w-6xl items-center gap-16 md:grid-cols-2">
                        <div>
                            <div className="mb-4 text-xs tracking-[0.3em] text-gold-500 uppercase">
                                Welcome to {shortName}
                            </div>
                            <h2 className="mb-6 font-serif text-5xl leading-tight text-brand-900">
                                Your getaway in the heart of Quezon
                            </h2>
                            <p className="mb-4 leading-relaxed text-brand-800/80">
                                Set within {p.gardenArea || '4 hectares'} of
                                beautifully landscaped grounds in Barangay
                                Malabanban Norte, Aquawood Garden Resort is a
                                peaceful escape just minutes from the town
                                center of Candelaria, Quezon.{' '}
                                {p.description || ''}
                            </p>
                            <p className="mb-8 leading-relaxed text-brand-800/80">
                                Whether you're here for a family weekend, a
                                wedding celebration, or a productive corporate
                                retreat, our friendly team and{' '}
                                {p.totalEmployees || 20} staff members are ready
                                to make your stay memorable.
                            </p>
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    {
                                        n: p.totalRooms || 20,
                                        l: 'Comfortable Rooms',
                                    },
                                    {
                                        n: (p.gardenArea || '4').split(' ')[0],
                                        l: 'Hectares of Garden',
                                    },
                                    { n: '3.5★', l: 'Guest Rating' },
                                ].map((s) => (
                                    <div
                                        key={s.l}
                                        className="border-l-2 border-gold-500 pl-4"
                                    >
                                        <div className="font-serif text-3xl text-brand-900">
                                            {s.n}
                                        </div>
                                        <div className="text-xs tracking-wider text-brand-700 uppercase">
                                            {s.l}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <img
                                src={aq.pool}
                                alt="Aquawood pool"
                                className="aspect-[4/3] w-full rounded-lg object-cover shadow-xl"
                            />
                            <img
                                src={aq.garden}
                                alt="Garden pathway"
                                className="absolute -bottom-8 -left-8 hidden h-48 w-48 rounded-lg border-4 border-cream-50 object-cover shadow-xl md:block"
                            />
                        </div>
                    </div>
                </section>

                <section
                    id="rooms"
                    className="bg-brand-900 px-6 py-24 text-cream-50"
                >
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-16 text-center">
                            <div className="mb-4 text-xs tracking-[0.3em] text-gold-400 uppercase">
                                Featured Room Categories
                            </div>
                            <h2 className="mb-4 font-serif text-5xl">
                                Choose your perfect stay
                            </h2>
                            <p className="mx-auto max-w-2xl text-cream-100/70">
                                Browse our selection of comfortable room
                                categories — each designed to make your stay
                                memorable. Pick your dates and book in just a
                                few clicks.
                            </p>
                        </div>

                        {featuredCategories.length > 0 ? (
                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                                {featuredCategories.map((cat) => (
                                    <div
                                        key={cat.id}
                                        className="group flex flex-col"
                                    >
                                        <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-lg">
                                            {cat.image ? (
                                                <img
                                                    src={'/storage/' + cat.image}
                                                    alt={cat.name}
                                                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center bg-brand-800 text-gold-400/40">
                                                    <svg
                                                        className="h-16 w-16"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={1}
                                                            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                                                        />
                                                    </svg>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                            <div className="absolute right-3 bottom-3 left-3">
                                                <div className="text-sm font-semibold text-gold-400">
                                                    From ₱{parseFloat(cat.base_price).toFixed(0)}/night
                                                </div>
                                            </div>
                                        </div>

                                        <h3 className="mb-1 font-serif text-xl">
                                            {cat.name}
                                        </h3>

                                        <p className="mb-3 text-sm text-cream-100/60">
                                            Up to {cat.capacity} guests
                                            {cat.floor
                                                ? ` · ${cat.floor.name}`
                                                : ''}
                                        </p>

                                        {cat.amenities && cat.amenities.length > 0 && (
                                            <div className="mb-4 flex flex-wrap gap-1.5">
                                                {cat.amenities
                                                    .slice(0, 4)
                                                    .map((amenity, i) => (
                                                        <span
                                                            key={i}
                                                            className="inline-flex items-center gap-1 rounded-full bg-brand-800/60 px-2.5 py-0.5 text-[11px] text-cream-100/80"
                                                        >
                                                            {amenityIcons[
                                                                amenity.toLowerCase()
                                                            ] || null}
                                                            {amenity}
                                                        </span>
                                                    ))}
                                            </div>
                                        )}

                                        <div className="mt-auto pt-2">
                                            <Link
                                                href={bookingsPublicCreate()}
                                                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gold-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gold-600"
                                            >
                                                Book Now
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center text-cream-100/50">
                                <p>Room categories coming soon.</p>
                            </div>
                        )}

                        <div className="mt-12 text-center">
                            <Link
                                href={bookingsPublicCreate()}
                                className="inline-flex items-center gap-2 rounded-full border border-cream-50/30 px-8 py-3 text-cream-50 transition hover:bg-cream-50/10"
                            >
                                View All Categories
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </section>

                <section id="dining" className="bg-cream-50 px-6 py-24">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-16 text-center">
                            <div className="mb-4 text-xs tracking-[0.3em] text-gold-500 uppercase">
                                <Utensils className="mr-2 inline h-4 w-4" />
                                The Restaurant
                            </div>
                            <h2 className="mb-4 font-serif text-5xl text-brand-900">
                                Authentic Filipino & International Cuisine
                            </h2>
                            <p className="mx-auto max-w-2xl text-brand-800/70">
                                From hearty Filipino breakfasts to romantic
                                dinner dates and large group banquets — our
                                restaurant brings together fresh local
                                ingredients with classic favorites.
                            </p>
                        </div>
                        <div className="grid gap-8 md:grid-cols-3">
                            {[
                                {
                                    img: aq.restaurant,
                                    name: 'Aquawood Restaurant',
                                    desc: 'Indoor and al fresco dining with a wide menu of Filipino specialties, international dishes, and refreshing beverages. Open daily for breakfast, lunch & dinner.',
                                    price: 'Casual Dining',
                                },
                                {
                                    img: aq.event,
                                    name: 'Events & Catering',
                                    desc: 'Birthday celebrations, weddings, debuts and corporate parties — our events team handles styling, catering and venue setup.',
                                    price: 'By Reservation',
                                },
                                {
                                    img: aq.pool,
                                    name: 'Poolside Service',
                                    desc: 'Cool drinks, grilled favorites and Filipino merienda served right by the pool. The perfect way to relax after a swim.',
                                    price: '11 AM – 8 PM',
                                },
                            ].map((d) => (
                                <div key={d.name} className="group">
                                    <div className="mb-4 aspect-[4/3] overflow-hidden rounded-lg">
                                        <img
                                            src={d.img}
                                            alt={d.name}
                                            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="mb-2 flex items-baseline justify-between">
                                        <h3 className="font-serif text-2xl text-brand-900">
                                            {d.name}
                                        </h3>
                                        <span className="text-xs tracking-wider text-gold-500 uppercase">
                                            {d.price}
                                        </span>
                                    </div>
                                    <p className="text-sm leading-relaxed text-brand-800/70">
                                        {d.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="events" className="bg-brand-50 px-6 py-24">
                    <div className="mx-auto grid max-w-7xl items-center gap-16 md:grid-cols-2">
                        <div>
                            <div className="mb-4 text-xs tracking-[0.3em] text-gold-500 uppercase">
                                Events & Functions
                            </div>
                            <h2 className="mb-6 font-serif text-5xl leading-tight text-brand-900">
                                Celebrate the moments that matter
                            </h2>
                            <p className="mb-6 leading-relaxed text-brand-800/80">
                                From intimate birthday parties and debuts to
                                garden weddings and corporate team-buildings,
                                our event spaces and dedicated team make sure
                                every detail is taken care of. Tell us your
                                vision — we'll bring it to life.
                            </p>
                            <ul className="mb-8 space-y-3">
                                {[
                                    'Capacity from 20 to 300 guests',
                                    'Indoor function halls & open-air garden venues',
                                    'Filipino & international catering menus',
                                    'Full styling, sound system & A/V available',
                                    'Discounted room blocks for guests',
                                ].map((f) => (
                                    <li
                                        key={f}
                                        className="flex items-center gap-3 text-brand-800"
                                    >
                                        <Check className="h-5 w-5 flex-shrink-0 text-gold-500" />{' '}
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <Link
                                href={bookingsPublicCreate()}
                                className="inline-flex items-center gap-2 rounded-full bg-brand-800 px-8 py-3 text-cream-50 transition hover:bg-brand-900"
                            >
                                Request Proposal
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <img
                                src={aq.event}
                                alt="Wedding setup"
                                className="aspect-[3/4] w-full rounded-lg object-cover"
                            />
                            <img
                                src={aq.restaurant}
                                alt="Function hall"
                                className="mt-6 aspect-[3/4] w-full rounded-lg object-cover md:mt-12"
                            />
                        </div>
                    </div>
                </section>

                <section id="pool" className="bg-cream-50 px-6 py-24">
                    <div className="mx-auto grid max-w-6xl items-center gap-16 md:grid-cols-2">
                        <img
                            src={aq.pool}
                            alt="Aquawood pool"
                            className="order-2 aspect-square w-full rounded-lg object-cover md:order-1"
                        />
                        <div className="order-1 md:order-2">
                            <div className="mb-4 text-xs tracking-[0.3em] text-gold-500 uppercase">
                                Pool & Garden
                            </div>
                            <h2 className="mb-6 font-serif text-5xl leading-tight text-brand-900">
                                Splash, relax, recharge
                            </h2>
                            <p className="mb-6 leading-relaxed text-brand-800/80">
                                Take a refreshing dip in our swimming pool,
                                enjoy a leisurely walk through our manicured
                                tropical gardens, or simply unwind in our shaded
                                cabanas. The perfect escape from the everyday —
                                open daily to in-house guests and day-tour
                                visitors.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    {
                                        i: <Waves className="h-5 w-5" />,
                                        t: 'Swimming Pool',
                                    },
                                    {
                                        i: <Leaf className="h-5 w-5" />,
                                        t: 'Tropical Gardens',
                                    },
                                    {
                                        i: <Sparkles className="h-5 w-5" />,
                                        t: 'Cabanas & Loungers',
                                    },
                                    {
                                        i: <Users className="h-5 w-5" />,
                                        t: 'Day Tour Packages',
                                    },
                                ].map((f) => (
                                    <div
                                        key={f.t}
                                        className="flex items-center gap-3 text-sm text-brand-800"
                                    >
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                                            {f.i}
                                        </div>
                                        {f.t}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-brand-900 px-6 py-24 text-cream-50">
                    <div className="mx-auto max-w-5xl text-center">
                        <Star className="mx-auto mb-6 h-8 w-8 text-gold-400" />
                        <h2 className="mb-12 font-serif text-3xl leading-snug md:text-4xl">
                            "A peaceful place to stay in Candelaria — the pool
                            was clean, the rooms were comfortable, and the staff
                            were really friendly and accommodating. Great for
                            family weekends and small celebrations."
                        </h2>
                        <div className="text-cream-100/70">
                            — Verified Guest Review · TripAdvisor
                        </div>
                        <div className="mt-12 flex flex-wrap justify-center gap-8">
                            {[
                                '★★★½ TripAdvisor',
                                '1,000+ Facebook Reviews',
                                'Family-Friendly',
                            ].map((a) => (
                                <div
                                    key={a}
                                    className="text-sm tracking-wider text-gold-400 uppercase"
                                >
                                    {a}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="contact" className="bg-cream-50 px-6 py-24">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-12 text-center">
                            <div className="mb-4 text-xs tracking-[0.3em] text-gold-500 uppercase">
                                Visit Us
                            </div>
                            <h2 className="mb-3 font-serif text-5xl text-brand-900">
                                Get in touch
                            </h2>
                            <p className="mx-auto max-w-2xl text-brand-800/70">
                                Reach out for room reservations, event inquiries
                                or directions. Located along the Pan-Philippine
                                (Maharlika) Highway in Brgy. Malabanban Norte,
                                Candelaria.
                            </p>
                        </div>

                        <div className="mb-8 grid gap-6 lg:grid-cols-3">
                            <div className="flex items-start gap-4 rounded-lg border border-brand-100 bg-white p-6">
                                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="font-medium text-brand-900">
                                        Address
                                    </div>
                                    <div className="mt-1 text-sm text-brand-800/70">
                                        Brgy. Malabanban Norte
                                        <br />
                                        Candelaria, Quezon 4323
                                        <br />
                                        Philippines
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 rounded-lg border border-brand-100 bg-white p-6">
                                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                                    <Phone className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="font-medium text-brand-900">
                                        Phone
                                    </div>
                                    <div className="mt-1 text-sm text-brand-800/70">
                                        <a
                                            href={`tel:${p.phone || '+63 (42) 123-4567'}`}
                                            className="hover:text-brand-900"
                                        >
                                            {p.phone || '+63 (42) 123-4567'}
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 rounded-lg border border-brand-100 bg-white p-6">
                                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="font-medium text-brand-900">
                                        Email
                                    </div>
                                    <div className="mt-1 text-sm text-brand-800/70">
                                        <a
                                            href={`mailto:${p.email || 'info@aquawoodgardenresort.com'}`}
                                            className="break-all hover:text-brand-900"
                                        >
                                            {p.email ||
                                                'info@aquawoodgardenresort.com'}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-2">
                            <div className="overflow-hidden rounded-lg border border-brand-100 bg-white">
                                <div className="aspect-[4/3] w-full bg-brand-50">
                                    <iframe
                                        src={MAP_EMBED}
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="Aquawood Garden Resort Location"
                                    />
                                </div>
                                <div className="flex items-center justify-between bg-brand-50 p-4">
                                    <div className="text-xs text-brand-700">
                                        <div className="font-medium">
                                            Aquawood Garden Resort, Hotel &
                                            Restaurant
                                        </div>
                                        <div>
                                            Pan-Philippine (Maharlika) Hwy,
                                            Candelaria, Quezon
                                        </div>
                                    </div>
                                    <a
                                        href={MAP_LINK}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex flex-shrink-0 items-center gap-1 rounded-md bg-brand-800 px-3 py-2 text-xs text-cream-50 hover:bg-brand-900"
                                    >
                                        <Navigation className="h-3 w-3" />{' '}
                                        Directions
                                    </a>
                                </div>
                            </div>

                            <form
                                className="space-y-4 rounded-lg border border-brand-100 bg-white p-8"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    alert(
                                        'Salamat! Our team will respond within 24 hours.',
                                    );
                                }}
                            >
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <label className="space-y-1">
                                    <span className="text-sm text-brand-700">First name</span>
                                    <input
                                        required
                                        placeholder="Juan"
                                        className="w-full rounded-md border border-brand-100 px-4 py-3 focus:border-brand-500 focus:outline-none"
                                    />
                                </label>
                                <label className="space-y-1">
                                    <span className="text-sm text-brand-700">Last name</span>
                                    <input
                                        required
                                        placeholder="Dela Cruz"
                                        className="w-full rounded-md border border-brand-100 px-4 py-3 focus:border-brand-500 focus:outline-none"
                                    />
                                </label>
                            </div>
                                <label className="block space-y-1">
                                    <span className="text-sm text-brand-700">Email address</span>
                                    <input
                                        required
                                        type="email"
                                        placeholder="you@example.com"
                                        className="w-full rounded-md border border-brand-100 px-4 py-3 focus:border-brand-500 focus:outline-none"
                                    />
                                </label>
                                <label className="block space-y-1">
                                    <span className="text-sm text-brand-700">Mobile number</span>
                                    <input
                                        required
                                        type="tel"
                                        placeholder="+63 9XX XXX XXXX"
                                        className="w-full rounded-md border border-brand-100 px-4 py-3 focus:border-brand-500 focus:outline-none"
                                    />
                                </label>
                                <label className="block space-y-1">
                                    <span className="text-sm text-brand-700">I'm interested in</span>
                                    <select className="w-full rounded-md border border-brand-100 bg-white px-4 py-3 focus:border-brand-500 focus:outline-none">
                                        <option value="">Select an option...</option>
                                        <option>Room reservation</option>
                                        <option>
                                            Wedding / debut / birthday inquiry
                                        </option>
                                        <option>Corporate event / function</option>
                                        <option>Day-tour package</option>
                                        <option>General question</option>
                                    </select>
                                </label>
                                <label className="block space-y-1">
                                    <span className="text-sm text-brand-700">Message</span>
                                    <textarea
                                        rows={4}
                                        placeholder="Tell us about your inquiry..."
                                        className="w-full resize-none rounded-md border border-brand-100 px-4 py-3 focus:border-brand-500 focus:outline-none"
                                    />
                                </label>
                                <button className="w-full rounded-md bg-brand-800 px-6 py-3 text-cream-50 transition hover:bg-brand-900">
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                </section>

                <footer
                    className="px-6 py-16 text-cream-100/70"
                    style={{ backgroundColor: '#0f2217' }}
                >
                    <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">
                        <div>
                            <div className="mb-4 flex items-center gap-2">
                                {p.logo ? (
                                    <img
                                        src={p.logo}
                                        alt={name}
                                        className="h-10 w-10 rounded-full bg-cream-50 object-cover"
                                    />
                                ) : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-500 text-white">
                                        <Leaf className="h-5 w-5" />
                                    </div>
                                )}
                                <div>
                                    <div className="font-serif text-xl text-cream-50">
                                        {shortName}
                                    </div>
                                    <div className="text-[10px] tracking-[0.2em] text-gold-400 uppercase">
                                        {subName}
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm leading-relaxed">
                                {p.description || ''}
                            </p>
                            <div className="mt-4 space-y-1 text-xs">
                                <div>
                                    <MapPin className="mr-1 inline h-3 w-3" />{' '}
                                    Brgy. Malabanban Norte, Candelaria, Quezon
                                </div>
                                <div>
                                    <Phone className="mr-1 inline h-3 w-3" />{' '}
                                    {p.phone || '+63 (42) 123-4567'}
                                </div>
                                <div>
                                    <Mail className="mr-1 inline h-3 w-3" />{' '}
                                    {p.email || 'info@aquawoodgardenresort.com'}
                                </div>
                            </div>
                        </div>
                        {[
                            {
                                h: 'Stay',
                                l: ['Rooms', 'Day Tour', 'Offers', 'Loyalty'],
                            },
                            {
                                h: 'Experience',
                                l: [
                                    'Restaurant',
                                    'Pool & Garden',
                                    'Events',
                                    'Catering',
                                ],
                            },
                            {
                                h: 'Info',
                                l: ['About', 'Directions', 'Contact', 'FAQ'],
                            },
                        ].map((col) => (
                            <div key={col.h}>
                                <div className="mb-4 font-medium text-cream-50">
                                    {col.h}
                                </div>
                                <ul className="space-y-2 text-sm">
                                    {col.l.map((i) => (
                                        <li key={i}>
                                            <a
                                                href="#"
                                                className="transition hover:text-gold-400"
                                            >
                                                {i}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <div className="mx-auto mt-12 flex max-w-7xl flex-wrap justify-between gap-2 border-t border-brand-800 pt-6 text-xs">
                        <div>
                            © {new Date().getFullYear()} {name}. All rights
                            reserved.
                        </div>
                        <div>Privacy · Terms · Accessibility</div>
                    </div>
                </footer>
            </div>
        </>
    );
}
