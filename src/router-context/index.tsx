/**
 * This file is a replacement mock for `next/router/dist/shared/router-context
 *
 * It exports a context that defaults to the `memoryRouter` singleton.
 * This is a workaround for `next/link` v12.2, since it no longer uses the `useRouter` hook.
 */

import React from "react";
import { memoryRouter } from "../index";

export const RouterContext = React.createContext(memoryRouter);
