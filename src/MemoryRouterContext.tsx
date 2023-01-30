import React from "react";
import { MemoryRouterSnapshot } from "./MemoryRouter";

/**
 * This context is optionally used by <MemoryRouterProvider>
 */
export const MemoryRouterContext = React.createContext<MemoryRouterSnapshot | null>(null);
