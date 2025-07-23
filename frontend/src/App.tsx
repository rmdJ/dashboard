import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Dashboard } from "./app/dashboard";
import { Crypto } from "./app/crypto";
import { ThemeProvider } from "@/provider/theme";
import { QueryProvider } from "@/provider/query";
import { BinanceProvider } from "@/provider/binance";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
// import { SiteHeader } from "@/components/header/site-header";

function App() {
  return (
    <QueryProvider>
      <BinanceProvider>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <BrowserRouter>
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                {/* <SiteHeader /> */}
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/crypto" element={<Crypto />} />
                </Routes>
              </SidebarInset>
            </SidebarProvider>
          </BrowserRouter>
        </ThemeProvider>
      </BinanceProvider>
    </QueryProvider>
  );
}

export default App;
