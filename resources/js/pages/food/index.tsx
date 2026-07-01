import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import {
    Utensils, ShoppingCart, Plus, Minus, Trash2, CheckCircle2, Clock, ChefHat,
    BedDouble, Search, Filter, Printer, Pencil, X, Check, DollarSign, Receipt,
    Coffee, Salad, IceCream, Pizza,
} from 'lucide-react';
import { index as foodIndex, store as foodStore, update as foodUpdate, destroy as foodDestroy, toggleAvailability as foodToggleAvailability } from '@/routes/food/index';
import { store as orderStore, updateStatus as orderUpdateStatus, destroy as orderDestroy } from '@/routes/food-orders/index';

type FoodItem = {
    id: string;
    name: string;
    category: string;
    price: number;
    description: string;
    available: boolean;
    prepTime: number | null;
    image: string;
};

type Category = 'Appetizers' | 'Mains' | 'Desserts' | 'Beverages' | 'Breakfast' | 'Sides';

interface OrderItem {
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
}

type OrderType = 'Dine-In' | 'Room Service' | 'Takeaway' | 'Banquet';
type OrderStatus = 'Pending' | 'Preparing' | 'Ready' | 'Served' | 'Cancelled';

interface Order {
    id: string;
    orderType: OrderType;
    tableOrRoom: string;
    guestName: string;
    items: OrderItem[];
    subtotal: number;
    tax: number;
    total: number;
    status: OrderStatus;
    payment: string;
    createdAt: string;
    createdAtIso: string;
    notes: string;
}

interface Props {
    foodItems: FoodItem[];
    orders: Order[];
    activeRoomNumber: string | null;
    activeRoomId: number | null;
}

const categoryIcons: Record<Category, React.ReactNode> = {
    Appetizers: <Salad className="w-4 h-4" />,
    Mains: <Pizza className="w-4 h-4" />,
    Desserts: <IceCream className="w-4 h-4" />,
    Beverages: <Coffee className="w-4 h-4" />,
    Breakfast: <Coffee className="w-4 h-4" />,
    Sides: <Utensils className="w-4 h-4" />,
};

const exec = (url: string, method: 'get' | 'post' | 'patch' | 'delete', data?: Record<string, unknown>) => {
    router.visit(url, { method, data: data as Record<string, string>, preserveScroll: true, preserveState: true });
};

const guestAuthName = (auth: unknown): string => {
    const a = auth as { user?: { name: string } } | undefined;
    return a?.user?.name ?? '';
};

export default function Food({ foodItems, orders, activeRoomNumber, activeRoomId }: Props) {
    const { auth } = usePage().props;
    const roles = (auth as { roles?: string[] }).roles ?? [];
    const isAdmin = roles.includes('Admin');
    const isStaff = roles.includes('Staff');
    const isGuest = roles.includes('Guest');
    const canManageMenu = isAdmin;
    const canManageOrders = isAdmin || isStaff;

    const [tab, setTab] = useState<'pos' | 'orders' | 'kitchen' | 'menu'>('pos');
    const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

    // POS state
    const [cart, setCart] = useState<OrderItem[]>([]);
    const [orderType, setOrderType] = useState<OrderType>(isGuest ? 'Room Service' : 'Dine-In');
    const [tableOrRoom, setTableOrRoom] = useState(isGuest && activeRoomNumber ? `Room ${activeRoomNumber}` : 'Table 1');
    const [guestName, setGuestName] = useState(isGuest ? guestAuthName(auth) : 'Walk-in');
    const [orderNotes, setOrderNotes] = useState('');
    const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
    const [menuSearch, setMenuSearch] = useState('');

    // Menu management state
    const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
    const [showMenuForm, setShowMenuForm] = useState(false);
    const [menuFilter, setMenuFilter] = useState<Category | 'all'>('all');

    // KPIs
    const isToday = (iso: string) => {
        const d = new Date(iso);
        const n = new Date();
        return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
    };
    const todaysOrders = orders.filter((o) => isToday(o.createdAtIso));
    const todayRevenue = todaysOrders.filter((o) => o.status !== 'Cancelled').reduce((s, o) => s + o.total, 0);
    const activeOrders = orders.filter((o) => o.status === 'Pending' || o.status === 'Preparing').length;
    const completedOrders = todaysOrders.filter((o) => o.status === 'Served').length;

    // Cart
    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const tax = subtotal * 0.12;
    const total = subtotal + tax;

    const addToCart = (item: FoodItem) => {
        setCart((c) => {
            const exists = c.find((i) => i.menuItemId === item.id);
            if (exists) return c.map((i) => (i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i));
            return [...c, { menuItemId: item.id, name: item.name, price: item.price, quantity: 1 }];
        });
    };

    const updateQty = (id: string, delta: number) => {
        setCart((c) => c.map((i) => (i.menuItemId === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i)));
    };

    const removeFromCart = (id: string) => setCart((c) => c.filter((i) => i.menuItemId !== id));

    const filteredMenu = useMemo(() => {
        return foodItems.filter(
            (m) =>
                (activeCategory === 'All' || m.category === activeCategory) &&
                (m.name.toLowerCase().includes(menuSearch.toLowerCase()) || m.description.toLowerCase().includes(menuSearch.toLowerCase())),
        );
    }, [foodItems, activeCategory, menuSearch]);

    const placeOrder = (payment: string) => {
        if (cart.length === 0) return;
        exec(orderStore().url, 'post', {
            order_type: orderType,
            room_id: isGuest && activeRoomId ? activeRoomId : undefined,
            guest_name: guestName,
            notes: orderNotes,
            items: cart.map((i) => ({ food_item_id: i.menuItemId, quantity: i.quantity })),
        });
        const newOrder: Order = {
            id: `ORD-${Date.now().toString().slice(-6)}`,
            orderType,
            tableOrRoom,
            guestName,
            items: [...cart],
            subtotal,
            tax,
            total,
            status: 'Pending',
            payment,
            createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            createdAtIso: new Date().toISOString(),
            notes: orderNotes,
        };
        setCart([]);
        setOrderNotes('');
        setReceiptOrder(newOrder);
    };

    const categories: (Category | 'All')[] = ['All', 'Appetizers', 'Mains', 'Breakfast', 'Desserts', 'Beverages', 'Sides'];

    return (
        <>
            <Head title="Food & Beverage" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <div className="text-xs uppercase tracking-[0.25em] text-gold-500 font-medium mb-1">Restaurant & Room Service</div>
                        <h1 className="font-serif text-4xl text-brand-900">Food Ordering & POS</h1>
                        <p className="text-brand-700 mt-1">Point of sale, in-room dining, kitchen display, and menu management.</p>
                    </div>
                    {!isGuest && (
                        <div className="flex gap-3">
                            <KPI label="Today's Revenue" value={`₱${todayRevenue.toFixed(2)}`} icon={<DollarSign className="w-4 h-4" />} />
                            <KPI label="Active Orders" value={activeOrders.toString()} icon={<Clock className="w-4 h-4" />} />
                            <KPI label="Completed" value={completedOrders.toString()} icon={<CheckCircle2 className="w-4 h-4" />} />
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl border border-brand-100 p-2 flex flex-wrap gap-1">
                    {[
                        { k: 'pos' as const, l: 'Order Food', i: <ShoppingCart className="w-4 h-4" /> },
                        ...(isGuest ? [] : [
                            { k: 'orders' as const, l: 'All Orders', i: <Receipt className="w-4 h-4" /> },
                            { k: 'kitchen' as const, l: 'Kitchen Display', i: <ChefHat className="w-4 h-4" /> },
                        ]),
                        ...(canManageMenu ? [{ k: 'menu' as const, l: 'Menu Management', i: <Utensils className="w-4 h-4" /> }] : []),
                    ].map((t) => (
                        <button
                            key={t.k}
                            onClick={() => setTab(t.k)}
                            className={`px-4 py-2 rounded-md text-sm flex items-center gap-2 transition ${tab === t.k ? 'bg-brand-800 text-cream-50 shadow' : 'text-brand-700 hover:bg-brand-50'}`}
                        >
                            {t.i} {t.l}
                        </button>
                    ))}
                </div>

                {/* POS TERMINAL */}
                {tab === 'pos' && (
                    <div className="grid lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">
                            <div className="bg-white rounded-xl border border-brand-100 p-4">
                                <div className="flex gap-3 items-center mb-4">
                                    <div className="relative flex-1">
                                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-400" />
                                        <input
                                            value={menuSearch}
                                            onChange={(e) => setMenuSearch(e.target.value)}
                                            placeholder="Search menu items..."
                                            className="w-full pl-9 pr-4 py-2 text-sm border border-brand-200 rounded-md bg-white focus:outline-none focus:border-brand-500"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {categories.map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => setActiveCategory(c)}
                                            className={`px-3 py-1.5 text-xs rounded-full flex items-center gap-1.5 transition ${activeCategory === c ? 'bg-brand-800 text-cream-50' : 'bg-brand-50 text-brand-700 hover:bg-brand-100'}`}
                                        >
                                            {c !== 'All' && categoryIcons[c]} {c}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {filteredMenu.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => item.available && addToCart(item)}
                                        disabled={!item.available}
                                        className={`text-left bg-white rounded-lg border overflow-hidden transition ${item.available ? 'border-brand-100 hover:border-brand-500 hover:shadow-md' : 'border-brand-100 opacity-50 cursor-not-allowed'}`}
                                    >
                                        <div className="aspect-video bg-brand-50 relative overflow-hidden flex items-center justify-center text-brand-300">
                                            {item.image ? (
                                                <img src={'/storage/' + item.image}alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Utensils className="w-8 h-8" />
                                            )}
                                            {!item.available && (
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                    <span className="text-white text-xs uppercase tracking-wider">86'd</span>
                                                </div>
                                            )}
                                            {item.prepTime && (
                                                <div className="absolute top-1 right-1 bg-white/95 px-1.5 py-0.5 rounded text-[10px] text-brand-700 flex items-center gap-1">
                                                    <Clock className="w-2.5 h-2.5" /> {item.prepTime}m
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-3">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <div className="font-medium text-sm text-brand-900 leading-tight">{item.name}</div>
                                                <div className="font-serif text-base text-brand-900 flex-shrink-0">₱{item.price}</div>
                                            </div>
                                            <div className="text-[11px] text-brand-600 line-clamp-2">{item.description}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* CART */}
                        <div className="bg-white rounded-xl border border-brand-100 p-5 h-fit sticky top-24">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-serif text-xl text-brand-900 flex items-center gap-2">
                                    <ShoppingCart className="w-5 h-5" /> Current Order
                                </h3>
                                {cart.length > 0 && (
                                    <button onClick={() => setCart([])} className="text-xs text-red-600 hover:text-red-700">Clear</button>
                                )}
                            </div>
                            <div className="space-y-3 mb-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <label className="text-xs text-brand-700">
                                        Order Type
                                        <select value={orderType} onChange={(e) => setOrderType(e.target.value as OrderType)} className="mt-1 w-full px-2 py-1.5 border border-brand-200 rounded text-sm bg-white">
                                            <option>Dine-In</option>
                                            <option>Room Service</option>
                                            <option>Takeaway</option>
                                            <option>Banquet</option>
                                        </select>
                                    </label>
                                    <label className="text-xs text-brand-700">
                                        {orderType === 'Room Service' ? 'Room #' : 'Table #'}
                                        <input value={tableOrRoom} onChange={(e) => setTableOrRoom(e.target.value)} className="mt-1 w-full px-2 py-1.5 border border-brand-200 rounded text-sm" />
                                    </label>
                                </div>
                                <label className="text-xs text-brand-700 block">
                                    Guest / Customer
                                    <input value={guestName} onChange={(e) => setGuestName(e.target.value)} className="mt-1 w-full px-2 py-1.5 border border-brand-200 rounded text-sm" />
                                </label>
                            </div>
                            <div className="border-t border-brand-100 pt-3 max-h-72 overflow-y-auto">
                                {cart.length === 0 ? (
                                    <div className="text-center py-8 text-brand-500 text-sm">
                                        <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                        Tap menu items to add
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {cart.map((item) => (
                                            <div key={item.menuItemId} className="flex items-center gap-2 py-2 border-b border-brand-50 last:border-0">
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium text-brand-900 truncate">{item.name}</div>
                                                    <div className="text-xs text-brand-600">₱{item.price.toFixed(2)} × {item.quantity}</div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => updateQty(item.menuItemId, -1)} className="w-6 h-6 rounded bg-brand-100 hover:bg-brand-200 flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                                                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                                                    <button onClick={() => updateQty(item.menuItemId, 1)} className="w-6 h-6 rounded bg-brand-100 hover:bg-brand-200 flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                                                    <button onClick={() => removeFromCart(item.menuItemId)} className="w-6 h-6 rounded hover:bg-red-50 flex items-center justify-center text-red-600 ml-1"><Trash2 className="w-3 h-3" /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {cart.length > 0 && (
                                <>
                                    <textarea value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} placeholder="Special instructions, allergies..." rows={2} className="w-full mt-3 px-2 py-1.5 text-xs border border-brand-200 rounded resize-none" />
                                    <div className="space-y-1 text-sm mt-3 pt-3 border-t border-brand-100">
                                        <div className="flex justify-between text-brand-700"><span>Subtotal</span><span>₱{subtotal.toFixed(2)}</span></div>
                                        <div className="flex justify-between text-brand-700"><span>Tax (12%)</span><span>₱{tax.toFixed(2)}</span></div>
                                        <div className="flex justify-between pt-2 border-t border-brand-100"><span className="font-medium">Total</span><span className="font-serif text-2xl text-brand-900">₱{total.toFixed(2)}</span></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-4">
                                        <button onClick={() => placeOrder('Cash')} className="py-2 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700 flex items-center justify-center gap-1"><DollarSign className="w-4 h-4" /> Cash</button>
                                        <button onClick={() => placeOrder('Card')} className="py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">Card</button>
                                        {orderType === 'Room Service' && (
                                            <button onClick={() => placeOrder('Room Charge')} className="py-2 bg-brand-800 text-cream-50 rounded-md text-sm hover:bg-brand-900 col-span-2 flex items-center justify-center gap-1"><BedDouble className="w-4 h-4" /> Charge to Room</button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Guest Order History */}
                {isGuest && orders.length > 0 && (
                    <MyOrders orders={orders} />
                )}

                {/* ALL ORDERS */}
                {tab === 'orders' && (
                    <OrdersTable orders={orders} canManageOrders={canManageOrders} />
                )}

                {/* KITCHEN DISPLAY */}
                {tab === 'kitchen' && (
                    <KitchenDisplay orders={orders.filter((o) => o.status === 'Pending' || o.status === 'Preparing' || o.status === 'Ready')} />
                )}

                {/* MENU MANAGEMENT */}
                {tab === 'menu' && canManageMenu && (
                    <MenuManagement foodItems={foodItems} />
                )}
            </div>

            {/* RECEIPT MODAL */}
            {receiptOrder && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setReceiptOrder(null)}>
                    <div className="bg-white rounded-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-brand-100 flex items-start justify-between">
                            <div>
                                <div className="text-xs uppercase tracking-wider text-gold-500">Order Receipt</div>
                                <h3 className="font-serif text-2xl text-brand-900">{receiptOrder.id}</h3>
                            </div>
                            <button onClick={() => setReceiptOrder(null)} className="text-brand-600 hover:text-brand-900 text-2xl leading-none">&times;</button>
                        </div>
                        <div className="p-6">
                            <div className="text-center mb-4">
                                <div className="font-serif text-xl text-brand-900">Aquawood Garden Resort</div>
                                <div className="text-xs text-brand-500">{receiptOrder.orderType} · {receiptOrder.tableOrRoom} · {receiptOrder.createdAt}</div>
                            </div>
                            <div className="text-sm border-t border-b border-brand-100 py-3 mb-3">
                                <div className="flex justify-between"><span className="text-brand-600">Guest</span><span className="font-medium">{receiptOrder.guestName}</span></div>
                                <div className="flex justify-between"><span className="text-brand-600">Status</span><span>{receiptOrder.status}</span></div>
                                <div className="flex justify-between"><span className="text-brand-600">Payment</span><span>{receiptOrder.payment}</span></div>
                            </div>
                            <div className="text-sm space-y-1">
                                {receiptOrder.items.map((it) => (
                                    <div key={it.menuItemId} className="flex justify-between"><span>{it.quantity}× {it.name}</span><span>₱{(it.price * it.quantity).toFixed(2)}</span></div>
                                ))}
                            </div>
                            <div className="mt-3 pt-3 border-t border-brand-100 text-sm space-y-1">
                                <div className="flex justify-between"><span className="text-brand-600">Subtotal</span><span>₱{receiptOrder.subtotal.toFixed(2)}</span></div>
                                <div className="flex justify-between"><span className="text-brand-600">Tax</span><span>₱{receiptOrder.tax.toFixed(2)}</span></div>
                                <div className="flex justify-between text-base pt-2 border-t border-brand-100 mt-2"><span className="font-medium">Total</span><span className="font-serif text-xl">₱{receiptOrder.total.toFixed(2)}</span></div>
                            </div>
                            {receiptOrder.notes && <div className="mt-3 text-xs italic text-brand-600 bg-brand-50 p-2 rounded">{receiptOrder.notes}</div>}
                        </div>
                        <div className="p-4 border-t border-brand-100 flex gap-2">
                            <button onClick={() => setReceiptOrder(null)} className="flex-1 py-2.5 bg-brand-800 text-cream-50 rounded-md text-sm hover:bg-brand-900">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// ============= SUB-COMPONENTS =============

function KPI({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
    return (
        <div className="bg-white rounded-lg border border-brand-100 px-4 py-2 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center">{icon}</div>
            <div>
                <div className="text-[10px] text-brand-600 uppercase tracking-wider">{label}</div>
                <div className="font-serif text-lg text-brand-900 leading-tight">{value}</div>
            </div>
        </div>
    );
}

function OrdersTable({ orders, canManageOrders }: { orders: Order[]; canManageOrders: boolean }) {
    const [filterStatus, setFilterStatus] = useState<'all' | OrderStatus>('all');
    const [filterType, setFilterType] = useState<'all' | OrderType>('all');

    const filtered = orders.filter(
        (o) => (filterStatus === 'all' || o.status === filterStatus) && (filterType === 'all' || o.orderType === filterType),
    );

    return (
        <div className="bg-white rounded-xl border border-brand-100 p-6">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                <div>
                    <h3 className="font-serif text-xl text-brand-900">All Orders</h3>
                    <div className="text-xs text-brand-600">Track every order across POS, room service, and dine-in</div>
                </div>
                <div className="flex gap-2 items-center">
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value as typeof filterType)} className="px-3 py-2 text-xs border border-brand-200 rounded-md bg-white">
                        <option value="all">All Types</option>
                        <option>Dine-In</option>
                        <option>Room Service</option>
                        <option>Takeaway</option>
                        <option>Banquet</option>
                    </select>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)} className="px-3 py-2 text-xs border border-brand-200 rounded-md bg-white">
                        <option value="all">All Status</option>
                        <option>Pending</option>
                        <option>Preparing</option>
                        <option>Ready</option>
                        <option>Served</option>
                        <option>Cancelled</option>
                    </select>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-xs text-brand-600 uppercase tracking-wider border-b border-brand-100">
                            <th className="text-left pb-2 font-medium">Order #</th>
                            <th className="text-left pb-2 font-medium">Type</th>
                            <th className="text-left pb-2 font-medium">Location</th>
                            <th className="text-left pb-2 font-medium">Guest</th>
                            <th className="text-left pb-2 font-medium">Items</th>
                            <th className="text-right pb-2 font-medium">Total</th>
                            <th className="text-left pb-2 font-medium">Payment</th>
                            <th className="text-left pb-2 font-medium">Status</th>
                            <th className="text-left pb-2 font-medium">Time</th>
                            <th className="text-right pb-2 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-50">
                        {filtered.length === 0 && (
                            <tr><td colSpan={10} className="py-10 text-center text-brand-500 text-sm"><Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />No orders match these filters.</td></tr>
                        )}
                        {filtered.map((order) => (
                            <tr key={order.id} className="hover:bg-brand-50/40">
                                <td className="py-3 font-mono text-xs">{order.id}</td>
                                <td className="py-3">
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${order.orderType === 'Room Service' ? 'bg-purple-100 text-purple-800' : order.orderType === 'Dine-In' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'}`}>
                                        {order.orderType === 'Room Service' && <BedDouble className="inline w-3 h-3 mr-1" />}
                                        {order.orderType}
                                    </span>
                                </td>
                                <td className="py-3 font-medium text-brand-900">{order.tableOrRoom}</td>
                                <td className="py-3 text-brand-700 text-xs">{order.guestName}</td>
                                <td className="py-3 text-brand-700 text-xs">{order.items.reduce((s, i) => s + i.quantity, 0)} items</td>
                                <td className="py-3 text-right font-medium">₱{order.total.toFixed(2)}</td>
                                <td className="py-3 text-xs">
                                    <span className={`px-2 py-0.5 rounded-full ${order.payment === 'Unpaid' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>{order.payment}</span>
                                </td>
                                <td className="py-3">
                                    <select
                                        value={order.status}
                                        onChange={(e) => exec(orderUpdateStatus({ foodOrder: Number(order.id) }).url, 'patch', { status: e.target.value })}
                                        className={`text-xs px-2 py-1 rounded-full border-0 cursor-pointer ${order.status === 'Served' ? 'bg-emerald-100 text-emerald-800' : order.status === 'Ready' ? 'bg-blue-100 text-blue-800' : order.status === 'Preparing' ? 'bg-amber-100 text-amber-800' : order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'}`}
                                    >
                                        <option>Pending</option>
                                        <option>Preparing</option>
                                        <option>Ready</option>
                                        <option>Served</option>
                                        <option>Cancelled</option>
                                    </select>
                                </td>
                                <td className="py-3 text-brand-600 text-xs">{order.createdAt}</td>
                                <td className="py-3 text-right">
                                    {canManageOrders && (
                                        <button onClick={() => exec(orderDestroy({ foodOrder: Number(order.id) }).url, 'delete')} className="p-1.5 rounded hover:bg-red-50 text-red-600" title="Delete">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function KitchenDisplay({ orders }: { orders: Order[] }) {
    const buckets = [
        { status: 'Pending' as OrderStatus, label: 'New Orders', color: 'bg-slate-700' },
        { status: 'Preparing' as OrderStatus, label: 'Preparing', color: 'bg-amber-600' },
        { status: 'Ready' as OrderStatus, label: 'Ready to Serve', color: 'bg-emerald-600' },
    ];

    return (
        <div className="grid md:grid-cols-3 gap-4">
            {buckets.map((bucket) => {
                const bucketOrders = orders.filter((o) => o.status === bucket.status);
                return (
                    <div key={bucket.status} className="bg-white rounded-xl border border-brand-100">
                        <div className={`${bucket.color} text-white px-4 py-3 rounded-t-xl flex items-center justify-between`}>
                            <div className="flex items-center gap-2"><ChefHat className="w-4 h-4" /><h3 className="font-medium">{bucket.label}</h3></div>
                            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{bucketOrders.length}</span>
                        </div>
                        <div className="p-3 space-y-3 max-h-[600px] overflow-y-auto">
                            {bucketOrders.length === 0 ? (
                                <div className="text-center py-8 text-brand-500 text-sm">No orders</div>
                            ) : (
                                bucketOrders.map((order) => (
                                    <div key={order.id} className="border border-brand-100 rounded-lg p-3">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <div className="font-mono text-xs text-brand-600">{order.id}</div>
                                                <div className="font-medium text-brand-900 text-sm flex items-center gap-1">
                                                    {order.orderType === 'Room Service' && <BedDouble className="w-3.5 h-3.5" />}
                                                    {order.tableOrRoom}
                                                </div>
                                            </div>
                                            <div className="text-xs text-brand-600">{order.createdAt}</div>
                                        </div>
                                        <div className="space-y-1 mb-3 text-sm">
                                            {order.items.map((item) => (
                                                <div key={item.menuItemId} className="flex justify-between text-brand-800">
                                                    <span><span className="font-medium">{item.quantity}×</span> {item.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                        {order.notes && <div className="text-xs bg-amber-50 text-amber-800 px-2 py-1 rounded mb-3">Note: {order.notes}</div>}
                                        <div className="flex gap-1">
                                            {bucket.status === 'Pending' && (
                                                <button onClick={() => exec(orderUpdateStatus({ foodOrder: Number(order.id) }).url, 'patch', { status: 'Preparing' })} className="flex-1 py-1.5 bg-amber-600 text-white rounded text-xs hover:bg-amber-700">Start Preparing</button>
                                            )}
                                            {bucket.status === 'Preparing' && (
                                                <button onClick={() => exec(orderUpdateStatus({ foodOrder: Number(order.id) }).url, 'patch', { status: 'Ready' })} className="flex-1 py-1.5 bg-emerald-600 text-white rounded text-xs hover:bg-emerald-700">Mark Ready</button>
                                            )}
                                            {bucket.status === 'Ready' && (
                                                <button onClick={() => exec(orderUpdateStatus({ foodOrder: Number(order.id) }).url, 'patch', { status: 'Served' })} className="flex-1 py-1.5 bg-brand-800 text-cream-50 rounded text-xs hover:bg-brand-900">Mark Served</button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function MenuManagement({ foodItems }: { foodItems: FoodItem[] }) {
    const [editing, setEditing] = useState<FoodItem | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState<Category | 'all'>('all');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [form, setForm] = useState({ name: '', category: 'Appetizers', price: '', description: '', available: true, prep_time: '' });

    const filtered = filter === 'all' ? foodItems : foodItems.filter((m) => m.category === filter);

    const resetForm = () => {
        setForm({ name: '', category: 'Appetizers', price: '', description: '', available: true, prep_time: '' });
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setImageFile(file);
        setImagePreview(file ? URL.createObjectURL(file) : null);
    };

    const openEdit = (item: FoodItem) => {
        setEditing(item);
        setForm({ name: item.name, category: item.category, price: String(item.price), description: item.description, available: item.available, prep_time: item.prepTime ? String(item.prepTime) : '' });
        setImagePreview(item.image ? '/storage/' + item.image : null);
        setImageFile(null);
        setShowForm(true);
    };

    const save = () => {
        const fd = new FormData();
        fd.append('name', form.name);
        fd.append('category', form.category);
        fd.append('price', form.price);
        fd.append('description', form.description);
        fd.append('available', form.available ? '1' : '0');
        if (form.prep_time) fd.append('prep_time', form.prep_time);
        if (imageFile) fd.append('image', imageFile);

        if (editing) {
            fd.append('_method', 'PATCH');
            router.post(foodUpdate({ foodItem: Number(editing.id) }).url, fd, { preserveScroll: true, preserveState: true });
        } else {
            router.post(foodStore().url, fd, { preserveScroll: true, preserveState: true });
        }
        setShowForm(false);
        setEditing(null);
        resetForm();
    };

    return (
        <div className="bg-white rounded-xl border border-brand-100 p-6">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                <div>
                    <h3 className="font-serif text-xl text-brand-900">Menu Management</h3>
                    <div className="text-xs text-brand-600">{foodItems.length} items · {foodItems.filter((m) => m.available).length} available</div>
                </div>
                <div className="flex gap-2 items-center">
                    <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="px-3 py-2 text-xs border border-brand-200 rounded-md bg-white">
                        <option value="all">All Categories</option>
                        <option>Appetizers</option>
                        <option>Mains</option>
                        <option>Breakfast</option>
                        <option>Desserts</option>
                        <option>Beverages</option>
                        <option>Sides</option>
                    </select>
                    <button onClick={() => { setEditing(null); resetForm(); setShowForm(true); }} className="px-3 py-2 bg-brand-800 text-cream-50 rounded-md text-xs hover:bg-brand-900 flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5" /> Add Item
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="mb-6 p-4 border border-brand-200 rounded-lg bg-brand-50/50 space-y-3">
                    <h4 className="font-medium text-sm text-brand-900">{editing ? 'Edit Item' : 'New Item'}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="px-3 py-2 text-sm border border-brand-200 rounded-md" />
                        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="px-3 py-2 text-sm border border-brand-200 rounded-md bg-white">
                            <option>Appetizers</option><option>Mains</option><option>Desserts</option><option>Beverages</option><option>Breakfast</option><option>Sides</option>
                        </select>
                        <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price" type="number" step="0.01" className="px-3 py-2 text-sm border border-brand-200 rounded-md" />
                        <input value={form.prep_time} onChange={(e) => setForm({ ...form, prep_time: e.target.value })} placeholder="Prep time (min)" type="number" className="px-3 py-2 text-sm border border-brand-200 rounded-md" />
                        <div className="flex items-center gap-2">
                            <input type="checkbox" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} className="h-4 w-4 accent-brand-700" id="avail" />
                            <label htmlFor="avail" className="text-sm text-brand-700">Available</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/jpeg,image/png,image/webp" className="text-sm text-brand-700 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:bg-brand-100 file:text-brand-700 hover:file:bg-brand-200" />
                            {(imagePreview || editing?.image) && (
                                <button onClick={() => { setImageFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="text-xs text-red-600 hover:text-red-700">Remove</button>
                            )}
                        </div>
                        {imagePreview && (
                            <div className="col-span-full">
                                <img src={imagePreview} alt="Preview" className="h-20 w-20 rounded-md object-cover border border-brand-200" />
                            </div>
                        )}
                    </div>
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={2} className="w-full px-3 py-2 text-sm border border-brand-200 rounded-md resize-none" />
                    <div className="flex gap-2">
                        <button onClick={save} className="px-4 py-2 bg-brand-800 text-cream-50 rounded-md text-xs hover:bg-brand-900">{editing ? 'Update' : 'Create'}</button>
                        <button onClick={() => { setShowForm(false); setEditing(null); resetForm(); }} className="px-4 py-2 border border-brand-200 rounded-md text-xs hover:bg-brand-50">Cancel</button>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-xs text-brand-600 uppercase tracking-wider border-b border-brand-100">
                            <th className="text-left pb-2 font-medium">Item</th>
                            <th className="text-left pb-2 font-medium">Category</th>
                            <th className="text-left pb-2 font-medium">Description</th>
                            <th className="text-right pb-2 font-medium">Price</th>
                            <th className="text-left pb-2 font-medium">Prep</th>
                            <th className="text-left pb-2 font-medium">Status</th>
                            <th className="text-right pb-2 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-50">
                        {filtered.map((item) => (
                            <tr key={item.id} className="hover:bg-brand-50/40">
                                <td className="py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-md bg-brand-50 flex items-center justify-center text-brand-300 overflow-hidden">
                                            {item.image ? <img src={'/storage/' + item.image} alt={item.name} className="w-full h-full object-cover" /> : <Utensils className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <div className="font-medium text-brand-900">{item.name}</div>
                                            <div className="font-mono text-[10px] text-brand-500">{item.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-3">
                                    <span className="text-xs px-2 py-0.5 bg-brand-50 text-brand-700 rounded-full flex items-center gap-1 w-fit">
                                        {categoryIcons[item.category as Category] || null} {item.category}
                                    </span>
                                </td>
                                <td className="py-3 text-brand-700 text-xs max-w-xs truncate">{item.description}</td>
                                <td className="py-3 text-right font-medium">₱{item.price}</td>
                                <td className="py-3 text-brand-700 text-xs">{item.prepTime ?? '-'}</td>
                                <td className="py-3">
                                    <button
                                        onClick={() => exec(foodToggleAvailability({ foodItem: Number(item.id) }).url, 'patch')}
                                        className={`text-xs px-2 py-0.5 rounded-full ${item.available ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'} cursor-pointer hover:opacity-80`}
                                    >
                                        {item.available ? 'Available' : "86'd"}
                                    </button>
                                </td>
                                <td className="py-3 text-right">
                                    <div className="flex justify-end gap-1">
                                        <button onClick={() => openEdit(item)} className="p-1.5 rounded hover:bg-brand-100 text-brand-600" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => exec(foodDestroy({ foodItem: Number(item.id) }).url, 'delete')} className="p-1.5 rounded hover:bg-red-50 text-red-600" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function MyOrders({ orders }: { orders: Order[] }) {
    const sorted = [...orders].sort((a, b) => new Date(b.createdAtIso).getTime() - new Date(a.createdAtIso).getTime());
    const active = sorted.filter((o) => o.status === 'Pending' || o.status === 'Preparing');
    const history = sorted.filter((o) => o.status === 'Ready' || o.status === 'Served' || o.status === 'Cancelled');

    return (
        <div className="space-y-4">
            {active.length > 0 && (
                <div className="bg-white rounded-xl border border-brand-100 p-5">
                    <h3 className="font-serif text-xl text-brand-900 mb-3 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-amber-600" /> Active Orders
                    </h3>
                    <div className="space-y-3">
                        {active.map((order) => (
                            <div key={order.id} className="border border-brand-100 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <div className="font-mono text-xs text-brand-600">{order.id}</div>
                                        <div className="text-sm text-brand-800">{order.orderType} · {order.tableOrRoom}</div>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${order.status === 'Pending' ? 'bg-slate-100 text-slate-700' : 'bg-amber-100 text-amber-800'}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="text-sm space-y-1 mb-2">
                                    {order.items.map((item) => (
                                        <div key={item.menuItemId} className="flex justify-between text-brand-700">
                                            <span>{item.quantity}× {item.name}</span>
                                            <span>₱{(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between text-xs text-brand-500 border-t border-brand-50 pt-2">
                                    <span>Subtotal ₱{order.subtotal.toFixed(2)} · Tax ₱{order.tax.toFixed(2)}</span>
                                    <span className="font-medium text-brand-900">Total ₱{order.total.toFixed(2)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {history.length > 0 && (
                <div className="bg-white rounded-xl border border-brand-100 p-5">
                    <h3 className="font-serif text-xl text-brand-900 mb-3">Order History</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-xs text-brand-600 uppercase tracking-wider border-b border-brand-100">
                                    <th className="text-left pb-2 font-medium">Order</th>
                                    <th className="text-left pb-2 font-medium">Items</th>
                                    <th className="text-right pb-2 font-medium">Total</th>
                                    <th className="text-left pb-2 font-medium">Status</th>
                                    <th className="text-left pb-2 font-medium">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-50">
                                {history.map((order) => (
                                    <tr key={order.id} className="hover:bg-brand-50/40">
                                        <td className="py-3 font-mono text-xs">{order.id}</td>
                                        <td className="py-3 text-brand-700 text-xs">{order.items.reduce((s, i) => s + i.quantity, 0)} items</td>
                                        <td className="py-3 text-right font-medium">₱{order.total.toFixed(2)}</td>
                                        <td className="py-3">
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === 'Served' ? 'bg-emerald-100 text-emerald-800' : order.status === 'Ready' ? 'bg-blue-100 text-blue-800' : order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="py-3 text-brand-600 text-xs">{order.createdAt}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
