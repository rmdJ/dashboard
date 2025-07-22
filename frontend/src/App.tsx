import { Dashboard } from "./app/dashboard";
import { ThemeProvider } from "@/provider/theme";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Dashboard />
    </ThemeProvider>
  );
}

export default App;
