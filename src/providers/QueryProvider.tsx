"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Create a single, shared QueryClient instance for the application.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Set a default stale time of 1 minute to reduce unnecessary refetching.
      staleTime: 60 * 1000,
      // Disable refetching when the window regains focus.
      refetchOnWindowFocus: false,
      // Retry failed queries once by default.
      retry: 1,
    },
  },
});

/**
 * A client-side provider component that sets up the React Query context for the application.
 *
 * This component should wrap the root of the application (or any part that needs
 * data fetching capabilities) to provide a shared `QueryClient` instance. It also
 * includes the React Query Devtools for easier debugging during development.
 *
 * @component
 * @param {object} props - The properties for the component.
 * @param {ReactNode} props.children - The child components that will have access to the React Query context.
 * @returns {JSX.Element} The QueryClientProvider wrapping the children.
 */
const QueryProvider = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default QueryProvider;
