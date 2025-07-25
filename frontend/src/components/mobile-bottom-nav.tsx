import { useLocation, useNavigate } from "react-router-dom";
import { IconDashboard, IconCurrencyBitcoin } from "@tabler/icons-react";

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
];

export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (href: string) => {
    navigate(href);
  };

  return (
    <div className="md:hidden fixed bottom-1 right-0 z-50 w-[96%] left-[2%]">
      {/* Backdrop blur avec gradient */}
      <div className="absolute rounded-2xl m-2 inset-0 bg-white backdrop-blur-xl border-t border-border/50" />

      {/* Safe area pour iOS */}
      <div className="relative">
        <div className="px-6 pb-safe">
          <div className="flex items-center justify-around">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className="group relative flex items-center justify-center p-5 rounded-2xl transition-all duration-300 ease-out"
                  aria-label={item.name}
                >
                  {/* Glow effect pour l'état actif */}
                  {isActive && (
                    <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-sm scale-110 transition-all duration-300" />
                  )}

                  <div className="relative z-10">
                    <div
                      className={`p-2 rounded-xl transition-all duration-300 text-primary-foreground shadow-lg shadow-primary/25 scale-110 ${
                        isActive ? "bg-primary" : "bg-primary/10"
                      }`}
                    >
                      <Icon className="h-5 w-5" strokeWidth={1.5} />
                    </div>
                  </div>

                  {/* Ripple effect au tap */}
                  <div className="absolute inset-0 rounded-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-primary/10 scale-0 rounded-full transition-transform duration-300 group-active:scale-150 group-active:opacity-30" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
