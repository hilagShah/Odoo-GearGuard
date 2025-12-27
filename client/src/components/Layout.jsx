import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Wrench, Users, ClipboardList, Calendar, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SidebarItem = ({ icon: Icon, label, path, active, onClick, isButton = false }) => {
    const baseClasses = `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors cursor-pointer w-full text-left`;
    const activeClasses = active
        ? 'bg-blue-600 text-white'
        : 'text-gray-400 hover:bg-gray-800 hover:text-white';

    if (isButton) {
        return (
            <button onClick={onClick} className={`${baseClasses} ${activeClasses} hover:bg-red-500/10 hover:text-red-400 text-gray-400`}>
                <Icon size={20} />
                <span className="font-medium">{label}</span>
            </button>
        );
    }

    return (
        <Link to={path} className={`${baseClasses} ${activeClasses}`}>
            <Icon size={20} />
            <span className="font-medium">{label}</span>
        </Link>
    );
};

const Layout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    const navItems = [
        { label: 'Dashboard', path: '/', icon: LayoutDashboard },
        { label: 'Equipment', path: '/equipment', icon: Wrench },
        { label: 'Requests', path: '/requests', icon: ClipboardList },
        { label: 'Calendar', path: '/calendar', icon: Calendar },
        { label: 'Teams', path: '/teams', icon: Users },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-900 text-gray-100 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col">
                <div className="p-6">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                        GearGuard
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">Maintenance Tracker</p>
                </div>

                <nav className="flex-1 px-3 space-y-1">
                    {navItems.map((item) => (
                        <SidebarItem
                            key={item.path}
                            {...item}
                            active={location.pathname === item.path}
                        />
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white uppercase text-sm">
                            {user?.name ? user.name.charAt(0) : 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.role || 'Guest'}</p>
                        </div>
                    </div>
                    <SidebarItem
                        icon={LogOut}
                        label="Logout"
                        onClick={handleLogout}
                        isButton={true}
                    />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
