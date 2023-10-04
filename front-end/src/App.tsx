import { QueryClientProvider } from "@tanstack/react-query";
import React, { FC } from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { queryClient } from "./lib/tanstack-query/query-client";
import { AppRoutes } from "./router";
import "./styles.css";

const App: FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
