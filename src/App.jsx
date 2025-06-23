import React, { Suspense } from "react";
import { useRoutes } from "react-router-dom";
import { Loading } from "@/components/ui/Loading";
import routes from "./routes/index";
import { AuthProvider } from "./contexts/AuthContext";

export default function App() {
    const routerDOM = useRoutes(routes);

    return (
        <AuthProvider>
            <Suspense fallback={
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh'
                }}>
                    <Loading text="Loading..." />
                </div>
            }>
                {routerDOM}
          </Suspense>
        </AuthProvider>
    );
}
