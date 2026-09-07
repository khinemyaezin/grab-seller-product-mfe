import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router";
import { ThemeProvider, Toaster } from "@khinemyaezin/seller-ui";
import AppRoutes from "./AppRoutes";
import { configureApi } from "@khinemyaezin/seller-api";

configureApi({
  baseUrl: "/api/v1",
  getToken: async () => {
    const token = localStorage.getItem("access_token");
    return token || undefined;
  }
});

export default function StandaloneApp() {
  const [client] = useState(() => new QueryClient());
  return (
    <ThemeProvider>
      <QueryClientProvider client={client}>
        <BrowserRouter>
          <main className="min-h-screen bg-background p-8">
            <Toaster />
            <AppRoutes link={{ href: import.meta.env.VITE_CATALOG_API_URL }} />
          </main>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
