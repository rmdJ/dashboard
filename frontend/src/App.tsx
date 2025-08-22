import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Dashboard } from "./app/dashboard";
import { Crypto } from "./app/crypto";
import Cinema from "./app/cinema";
import { ThemeProvider } from "@/provider/theme";
import { QueryProvider } from "@/provider/query";
import { BinanceProvider } from "@/provider/binance";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

function App() {
  return (
    <QueryProvider>
      <BinanceProvider>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <BrowserRouter>
            {/* Desktop Layout avec sidebar */}
            <div className="hidden md:block">
              <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/crypto" element={<Crypto />} />
                    <Route path="/cinema" element={<Cinema />} />
                  </Routes>
                </SidebarInset>
              </SidebarProvider>
            </div>

            {/* Mobile Layout avec navigation bottom */}
            <div className="md:hidden">
              <div className="md:pb-16">
                {" "}
                {/* Padding pour éviter que le contenu soit masqué par la nav */}
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/crypto" element={<Crypto />} />
                  <Route path="/cinema" element={<Cinema />} />
                </Routes>
              </div>
              <MobileBottomNav />
            </div>
          </BrowserRouter>
        </ThemeProvider>
      </BinanceProvider>
    </QueryProvider>
  );
}

export default App;
