import { Link } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { BedDouble, BookOpen, Building2, CalendarCheck, LayoutGrid, Leaf, Tag, Users } from 'lucide-react';
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
import { index as bookingsIndex } from '@/routes/bookings';
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
    const { auth } = usePage().props;
    const isAdmin = auth.roles?.includes('Admin') ?? false;

    const guestNavItems: NavItem[] = [
        {
            title: 'Bookings',
            href: bookingsIndex(),
            icon: BookOpen,
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
                {!isAdmin && <NavMain items={guestNavItems} label="Bookings" />}
                {isAdmin && <NavMain items={adminNavItems} label="Management" />}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
