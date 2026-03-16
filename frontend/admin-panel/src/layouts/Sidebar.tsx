import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FilePlus, Archive, Settings, LogOut, Edit2 } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: FilePlus, label: 'Add Edition', path: '/edition/new' },
    { icon: Edit2, label: 'Edit Edition', path: '/editions/edit' },
    { icon: Archive, label: 'Archived', path: '/archived' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('admin_user');
    navigate('/login');
  };

  return (
    <aside className={`w-80 h-screen fixed left-0 top-0 bg-background/50 backdrop-blur-3xl border-r border-white/10 flex flex-col p-8 z-50 shrink-0 transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center gap-3 mb-12">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
          <span className="text-white font-bold text-xl">T</span>
        </div>
        <h1 className="font-bold text-lg tracking-tight text-white">Talent Admin</h1>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setIsOpen(false)}
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'text-muted-foreground hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <item.icon size={20} className="group-hover:scale-110 transition-transform" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="pt-6 border-t border-white/10 space-y-2">
        <NavLink 
          to="/settings"
          onClick={() => setIsOpen(false)}
          className={({ isActive }) => 
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full ${
              isActive 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-muted-foreground hover:bg-white/5 hover:text-white'
            }`
          }
        >
          <Settings size={20} />
          <span className="font-medium">Settings</span>
        </NavLink>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 w-full transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
