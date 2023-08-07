import React, { CSSProperties, FC, PropsWithChildren, ReactEventHandler, useEffect, useState } from "react";
import NextLink from "next/link";
import { Router, useRouter } from "next/router";

const root = "/as-tests";

const Page = () => {
  const [activeId, setActiveId] = useState(-1);
  const [expectedValues, setExpectedValues] = useState<Pick<Router, "asPath" | "pathname" | "query">>({
    asPath: "",
    pathname: "",
    query: {},
  });

  let index = 0;
  const expected = (expectedDetails: typeof expectedValues) => {
    const id = index++;
    return {
      onClick: () => {
        setActiveId(id);
        setExpectedValues(expectedDetails);
      },
      active: id === activeId,
    };
  };

  const router = useRouter();
  const values = {
    "root path": root,
    "router.asPath": router.asPath.replace(root, ""),
    "expected.asPath": expectedValues.asPath,
    "router.pathname": router.pathname.replace(root, ""),
    "expected.pathname": expectedValues.pathname,
    "router.query": router.query,
    "expected.query": expectedValues.query,
  };

  return (
    <>
      <fieldset style={{ display: "flex", flexDirection: "column" }}>
        <legend>Test Links</legend>

        <TestLink
          href="/"
          as="/"
          {...expected({
            asPath: "",
            pathname: "/[[...route]]",
            query: {},
          })}
        >
          Empty
        </TestLink>

        <TestLink
          href="/path?query=real"
          as="/path?query=as"
          {...expected({
            asPath: "/path?query=as",
            pathname: "/[[...route]]",
            query: { query: "real", route: ["path"] },
          })}
        >
          Different query params
        </TestLink>

        <TestLink
          href="/path?foo=real"
          as="/path?bar=as"
          {...expected({
            asPath: "/path?bar=as",
            pathname: "/[[...route]]",
            query: { foo: "real", route: ["path"] },
          })}
        >
          Different parameters
        </TestLink>

        <TestLink
          href="/path#real-hash"
          as="/path#as-hash"
          {...expected({
            asPath: "/path#as-hash",
            pathname: "/[[...route]]",
            query: { route: ["path"] },
          })}
        >
          Different hash
        </TestLink>

        <br />
        <div>The following URLs have different paths, so they behave strangely</div>
        <TestLink
          href="/real-path"
          as="/as-path"
          {...expected({
            asPath: "/as-path",
            pathname: "/[[...route]]",
            query: { route: ["as-path"] },
          })}
        >
          Different paths (will cause full refresh)
        </TestLink>

        <TestLink
          href="/path-one/path-two"
          as="/path-one/path-three"
          {...expected({
            asPath: "/path-one/path-three",
            pathname: "/[[...route]]",
            query: { route: ["path-one", "path-three"] },
          })}
        >
          Different paths (will cause full refresh)
        </TestLink>
      </fieldset>
      <fieldset>
        <legend>Router Details</legend>
        <DetailsTable values={values} />
      </fieldset>
    </>
  );
};
const TestLink: FC<
  PropsWithChildren<{
    href: string;
    as: string;
    active: boolean;
    onClick: ReactEventHandler;
  }>
> = ({ href, as, children, active, onClick }) => {
  return (
    <NextLink
      href={root + href}
      as={root + as}
      style={{
        color: active ? "lightblue" : undefined,
      }}
      onClick={onClick}
    >
      {children}
      (href <code>{JSON.stringify(href)}</code> as <code>{JSON.stringify(as)}</code>)
    </NextLink>
  );
};

const DetailsTable: FC<{ values: object }> = ({ values }) => {
  return (
    <Table>
      {Object.keys(values).map((key) => {
        const value = values[key as keyof typeof values];
        return (
          <Row key={key} label={key}>
            <code>{JSON.stringify(value)}</code>
          </Row>
        );
      })}
    </Table>
  );
};

const Table: FC<PropsWithChildren<{}>> = ({ children }) => {
  return (
    <table style={{ textAlign: "left" }}>
      <tbody>{children}</tbody>
    </table>
  );
};

const Row: FC<
  PropsWithChildren<{
    label: string;
  }>
> = ({ label = "", children }) => {
  return (
    <tr>
      <th>
        <code>{label}</code>
      </th>
      <td>{children}</td>
    </tr>
  );
};

export default Page;
