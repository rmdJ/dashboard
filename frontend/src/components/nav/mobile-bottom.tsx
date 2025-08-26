import { useLocation, useNavigate } from "react-router-dom";
import {
  IconDashboard,
  IconCurrencyBitcoin,
  IconDeviceTv,
  IconHome,
  IconCalendar,
  IconLogout,
  IconNotes,
} from "@tabler/icons-react";
import { useAuth } from "@/contexts/AuthContext";

const navigationItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: IconDashboard,
  },
  {
    name: "Crypto",
    href: "/crypto",
    icon: IconCurrencyBitcoin,
  },
  {
    name: "Cinéma",
    href: "/cinema",
    icon: IconDeviceTv,
  },
  {
    name: "Agenda",
    href: "/cinema-agenda",
    icon: IconCalendar,
  },
  {
    name: "Fiches",
    href: "/fiches",
    icon: IconNotes,
  },
  {
    name: "Prêts",
    href: "/loan",
    icon: IconHome,
  },
];

export function NavMobileBottom() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleNavigation = (href: string) => {
    navigate(href);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* Backdrop avec bordure supérieure subtile */}
      <div className="bg-white/95 backdrop-blur-sm border-t border-gray-200/50">
        {/* Container principal */}
        <div className="px-4 py-0 pb-safe">
          <div className="flex items-center justify-between">
            {/* Navigation items */}
            <div className="flex items-center justify-around flex-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;

                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.href)}
                    className="flex flex-col items-center justify-center py-2 px-4 transition-colors duration-200"
                    aria-label={item.name}
                  >
                    {/* Icône */}
                    <div className="mb-1">
                      <Icon
                        className={`h-6 w-6 transition-colors duration-200 ${
                          isActive ? "text-blue-600" : "text-gray-600"
                        }`}
                        strokeWidth={1.5}
                      />
                    </div>

                    {/* Label */}
                    <span
                      className={`text-xs font-medium transition-colors duration-200 ${
                        isActive ? "text-blue-600" : "text-gray-600"
                      }`}
                    >
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </div>
            
            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="flex flex-col items-center justify-center py-2 px-4 transition-colors duration-200"
              aria-label="Déconnexion"
            >
              <div className="mb-1">
                <IconLogout
                  className="h-6 w-6 text-red-600 transition-colors duration-200"
                  strokeWidth={1.5}
                />
              </div>
              <span className="text-xs font-medium text-red-600">
                Logout
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
