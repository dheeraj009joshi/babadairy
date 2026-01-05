import { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    Users,
    LogOut,
    Menu,
    X,
    BarChart3,
    Warehouse,
    Settings,
    Store
} from 'lucide-react';
import { useState } from 'react';

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/orders', label: 'Orders', icon: ShoppingBag },
        { path: '/admin/products', label: 'Products', icon: Package },
        { path: '/admin/inventory', label: 'Inventory', icon: Warehouse },
        { path: '/admin/users', label: 'Customers', icon: Users },
        { path: '/admin/reports', label: 'Reports', icon: BarChart3 },
        { path: '/admin/settings', label: 'Settings', icon: Settings },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-cream flex">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:flex lg:flex-col w-64 bg-chocolate text-white fixed left-0 top-0 h-screen">
                {/* Logo */}
                <div className="p-6 border-b border-white/10 flex-shrink-0">
                    <Link to="/admin/dashboard" className="flex items-center space-x-2">
                        <div className="text-3xl">🍦</div>
                        <div>
                            <h1 className="text-xl font-display font-bold">Jas&Mey</h1>
                            <p className="text-xs text-white/70">Admin Panel</p>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.path)
                                        ? 'bg-primary text-white'
                                        : 'text-white/80 hover:bg-white/10'
                                    }`}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Back to Store Link */}
                <div className="p-4 border-t border-white/10">
                    <Link
                        to="/"
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 transition-colors"
                    >
                        <Store className="h-5 w-5" />
                        <span className="font-medium">Back to Store</span>
                    </Link>
                </div>

                {/* User Info & Logout - Bottom of Sidebar */}
                <div className="p-4 border-t border-white/10 flex-shrink-0">
                    {user && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                                    {user.name?.charAt(0).toUpperCase() || 'A'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{user.name}</p>
                                    <p className="text-xs text-white/60 truncate">{user.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/90 text-sm font-medium transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {/* Mobile Sidebar */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setIsSidebarOpen(false)} />
                    <aside className="absolute left-0 top-0 bottom-0 w-64 bg-chocolate text-white flex flex-col">
                        {/* Logo */}
                        <div className="p-6 border-b border-white/10 flex items-center justify-between flex-shrink-0">
                            <Link to="/admin/dashboard" className="flex items-center space-x-2">
                                <div className="text-3xl">🍦</div>
                                <div>
                                    <h1 className="text-xl font-display font-bold">Jas&Mey</h1>
                                    <p className="text-xs text-white/70">Admin Panel</p>
                                </div>
                            </Link>
                            <button onClick={() => setIsSidebarOpen(false)}>
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.path)
                                                ? 'bg-primary text-white'
                                                : 'text-white/80 hover:bg-white/10'
                                            }`}
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span className="font-medium">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Back to Store Link */}
                        <div className="p-4 border-t border-white/10 flex-shrink-0">
                            <Link
                                to="/"
                                onClick={() => setIsSidebarOpen(false)}
                                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 transition-colors"
                            >
                                <Store className="h-5 w-5" />
                                <span className="font-medium">Back to Store</span>
                            </Link>
                        </div>

                        {/* User Info & Logout - Bottom of Sidebar */}
                        <div className="p-4 border-t border-white/10 flex-shrink-0">
                            {user && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                                            {user.name?.charAt(0).toUpperCase() || 'A'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{user.name}</p>
                                            <p className="text-xs text-white/60 truncate">{user.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/90 text-sm font-medium transition-colors"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
                {/* Header - Mobile Only */}
                <header className="bg-white border-b border-chocolate/10 px-6 py-4 lg:hidden">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="text-chocolate"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <Link to="/admin/dashboard" className="flex items-center space-x-2">
                            <div className="text-2xl">🍦</div>
                            <span className="font-display font-bold text-chocolate">Jas&Mey</span>
                        </Link>
                        <div className="w-6" /> {/* Spacer for centering */}
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
