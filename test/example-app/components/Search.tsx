import React from "react";
import { useRouter } from "next/router";

/**
 * A Search input that keeps the `search` parameter in the current URL
 */
export const Search = () => {
  const router = useRouter();

  const value = router.query.search || "";

  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const newSearch = ev.currentTarget.value;
    router.replace({
      query: {
        ...router.query,
        search: newSearch,
      },
    });
  };

  return <input type="search" value={value} onChange={onChange} />;
};
