import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Dashboard } from "./app/dashboard";
import { Crypto } from "./app/crypto";
import Cinema from "./app/cinema";
import { CinemaAgenda } from "./app/cinema-agenda";
import { Sheets } from "./app/sheets";
import Loan from "./app/loan";
import { LoginForm } from "./app/login";
import { ThemeProvider } from "@/provider/theme";
import { QueryProvider } from "@/provider/query";
import { BinanceProvider } from "@/provider/binance";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppSidebar } from "@/components/sidebar";
import { NavMobileBottom } from "@/components/nav/mobile-bottom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <QueryProvider>
      <BinanceProvider>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginForm />} />
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      {/* Desktop Layout avec sidebar */}
                      <div className="hidden md:block">
                        <SidebarProvider>
                          <AppSidebar />
                          <SidebarInset>
                            <Routes>
                              <Route path="/" element={<Dashboard />} />
                              <Route path="/crypto" element={<Crypto />} />
                              <Route path="/cinema" element={<Cinema />} />
                              <Route path="/cinema-agenda" element={<CinemaAgenda />} />
                              <Route path="/sheets" element={<Sheets />} />
                              <Route path="/loan" element={<Loan />} />
                            </Routes>
                          </SidebarInset>
                        </SidebarProvider>
                      </div>

                      {/* Mobile Layout avec navigation bottom */}
                      <div className="md:hidden">
                        <div className="md:pb-16">
                          <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/crypto" element={<Crypto />} />
                            <Route path="/cinema" element={<Cinema />} />
                            <Route path="/cinema-agenda" element={<CinemaAgenda />} />
                            <Route path="/sheets" element={<Sheets />} />
                            <Route path="/loan" element={<Loan />} />
                          </Routes>
                        </div>
                        <NavMobileBottom />
                      </div>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </BinanceProvider>
    </QueryProvider>
  );
}

export default App;
