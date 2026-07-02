import { Link } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { AlertTriangle, BedDouble, BookOpen, Building2, CalendarCheck, LayoutGrid, Leaf, MessageSquare, Monitor, Tag, Users, Utensils } from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { index as adminBookingsIndex } from '@/routes/admin/bookings';
import { index as adminCategoriesIndex } from '@/routes/admin/categories';
import { index as adminGuestsIndex } from '@/routes/admin/guests';
import { index as adminFloorsIndex } from '@/routes/admin/floors';
import { index as adminRoomsIndex } from '@/routes/admin/rooms';
import { index as adminEmergenciesIndex } from '@/routes/admin/emergencies';
import { index as adminRequestsIndex } from '@/routes/admin/requests';
import { index as bookingsIndex } from '@/routes/bookings';
import { index as requestsIndex } from '@/routes/requests';
import { index as frontdeskIndex } from '@/routes/frontdesk';
import { index as foodIndex } from '@/routes/food/index';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

const footerNavItems: NavItem[] = [

];

export function AppSidebar() {
    const { setOpenMobile } = useSidebar();
    const isMobile = useIsMobile();
    const { auth, activeEmergencyCount } = usePage().props as { auth: { roles?: string[] }; activeEmergencyCount?: number };
    const isAdmin = auth.roles?.includes('Admin') ?? false;
    const isReceptionist = auth.roles?.includes('Receptionist') ?? false;
    const isStaff = auth.roles?.includes('Staff') ?? false;
    const isGuest = auth.roles?.includes('Guest') ?? false;
    const canAccessFrontdesk = isAdmin || isReceptionist;
    const canAccessFood = isAdmin || isStaff || isReceptionist || isGuest;
    const emergencyBadge = activeEmergencyCount && activeEmergencyCount > 0 ? activeEmergencyCount : null;

    const frontdeskNavItems: NavItem[] = [
        {
            title: 'Front Desk',
            href: frontdeskIndex(),
            icon: Monitor,
            badge: emergencyBadge,
        },
    ];

    const foodNavItems: NavItem[] = [
        {
            title: 'Food & Beverage',
            href: foodIndex(),
            icon: Utensils,
        },
    ];

    const guestNavItems: NavItem[] = [
        {
            title: 'Bookings',
            href: bookingsIndex(),
            icon: BookOpen,
        },
        {
            title: 'Requests',
            href: requestsIndex(),
            icon: MessageSquare,
        },
    ];

    const adminNavItems: NavItem[] = [
        {
            title: 'Reservations',
            href: adminBookingsIndex(),
            icon: CalendarCheck,
        },
        {
            title: 'Guests',
            href: adminGuestsIndex(),
            icon: Users,
        },
        {
            title: 'Floors',
            href: adminFloorsIndex(),
            icon: Building2,
        },
        {
            title: 'Rooms',
            href: adminRoomsIndex(),
            icon: BedDouble,
        },
        {
            title: 'Categories',
            href: adminCategoriesIndex(),
            icon: Tag,
        },
        {
            title: 'Requests',
            href: adminRequestsIndex(),
            icon: MessageSquare,
        },
        {
            title: 'Emergencies',
            href: adminEmergenciesIndex(),
            icon: AlertTriangle,
            badge: emergencyBadge,
        },
    ];

    const handleNavClick = () => {
        if (isMobile) {
            setOpenMobile(false);
        }
    };

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch onClick={handleNavClick} className="flex items-center gap-2">
                                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-800 text-cream-50">
                                    <Leaf className="h-4 w-4" />
                                </div>
                                <div className="grid leading-tight">
                                    <span className="truncate font-serif text-base text-sidebar-foreground">
                                        Aquawood
                                    </span>
                                    <span className="truncate text-[9px] tracking-[0.2em] text-sidebar-foreground/70 uppercase">
                                        Garden Resort
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} label="Main" />
                {canAccessFrontdesk && <NavMain items={frontdeskNavItems} label="Operations" />}
                {canAccessFood && <NavMain items={foodNavItems} label="Food & Beverage" />}
                {isGuest && <NavMain items={guestNavItems} label="Bookings" />}
                {isAdmin && <NavMain items={adminNavItems} label="Management" />}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
