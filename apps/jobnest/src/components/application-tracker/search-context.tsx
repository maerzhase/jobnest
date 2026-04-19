"use client";

import {
  createContext,
  useContext,
  useDeferredValue,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

type ApplicationSearchContextValue = {
  deferredSearchQuery: string;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
};

const ApplicationSearchContext =
  createContext<ApplicationSearchContextValue | null>(null);

type ApplicationSearchProviderProps = {
  children: ReactNode;
};

export function ApplicationSearchProvider({
  children,
}: ApplicationSearchProviderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const value = useMemo(
    () => ({
      deferredSearchQuery,
      searchQuery,
      setSearchQuery,
    }),
    [deferredSearchQuery, searchQuery]
  );

  return (
    <ApplicationSearchContext.Provider value={value}>
      {children}
    </ApplicationSearchContext.Provider>
  );
}

export function useApplicationSearch() {
  const context = useContext(ApplicationSearchContext);

  if (!context) {
    throw new Error(
      "useApplicationSearch must be used within an ApplicationSearchProvider"
    );
  }

  return context;
}
