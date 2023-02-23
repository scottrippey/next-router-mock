import React from "react";
import { useRouter } from "next/router";

const CatchAll = () => {
  const router = useRouter();

  const values = {
    asPath: router.asPath,
    pathname: router.pathname,
  };

  return (
    <Table>
      {(Object.keys(values) as Array<keyof typeof values>).map((key) => {
        const value = values[key as keyof typeof values];
        return (
          <Row key={key} label={key}>
            {value}
          </Row>
        );
      })}
    </Table>
  );
};
const Table = "div";

const Row: React.FC<{ label: string }> = ({ label = "", children }) => {
  return (
    <div>
      <label>
        <span>{label}</span>
        {children}
      </label>
    </div>
  );
};

export default CatchAll;
