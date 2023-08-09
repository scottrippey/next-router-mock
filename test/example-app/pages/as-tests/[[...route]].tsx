import React, { FC, PropsWithChildren, ReactEventHandler, useState } from "react";
import NextLink, { LinkProps as NextLinkProps } from "next/link";
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
    "expect.asPath": expectedValues.asPath,
    "router.pathname": router.pathname.replace(root, ""),
    "expect.pathname": expectedValues.pathname,
    "router.query": router.query,
    "expect.query": expectedValues.query,
  };
  const pathname = "/[[...route]]";

  return (
    <>
      <fieldset style={{ display: "flex", flexDirection: "column" }}>
        <legend>Links with different query strings</legend>

        <TestLink
          label="Empty"
          href="/"
          as="/"
          {...expected({
            asPath: "",
            pathname,
            query: {},
          })}
        />

        <TestLink
          label="Different query params"
          href="/path?query=real"
          as="/path?query=as"
          {...expected({
            asPath: "/path?query=as",
            pathname,
            query: { query: "real", route: ["path"] },
          })}
        />

        <TestLink
          label="Different parameters"
          href="/path?foo=real"
          as="/path?bar=as"
          {...expected({
            asPath: "/path?bar=as",
            pathname,
            query: { foo: "real", route: ["path"] },
          })}
        />

        <TestLink
          label="Different hash"
          href="/path#real-hash"
          as="/path#as-hash"
          {...expected({
            asPath: "/path#as-hash",
            pathname,
            query: { route: ["path"] },
          })}
        />
      </fieldset>

      <fieldset style={{ display: "flex", flexDirection: "column" }}>
        <legend>Dynamic Paths</legend>

        <TestLink
          label="Dynamic path"
          href={pathname}
          as="/one/two/three"
          {...expected({
            asPath: "/one/two/three",
            pathname,
            query: { route: ["one", "two", "three"] },
          })}
        />

        <TestLink
          label="With conflicting params in route & query"
          href="/one/two/three?route=four"
          as="/one/two/three?route=four"
          {...expected({
            asPath: "/one/two/three?route=four",
            pathname,
            query: { route: ["one", "two", "three"] },
          })}
        />

        <TestLink
          label="With query strings"
          href={{ pathname, query: { param: "href" } }}
          as="/one/two/three"
          {...expected({
            asPath: "/one/two/three",
            pathname,
            query: { param: "href", route: ["one", "two", "three"] },
          })}
        />

        <TestLink
          label="With multiple query strings"
          href={{ pathname, query: { hrefParam: "href" } }}
          as={{ pathname: "/one/two/three", query: { asParam: "as" } }}
          {...expected({
            asPath: "/one/two/three?asParam=as",
            pathname,
            query: { hrefParam: "href", route: ["one", "two", "three"] },
          })}
        />
      </fieldset>

      <fieldset style={{ display: "flex", flexDirection: "column" }}>
        <legend>Links with different static paths</legend>
        <TestLink
          label="Real paths"
          href="/real-path"
          as="/as-path"
          {...expected({
            asPath: "/as-path",
            pathname: "/real-path",
            query: {},
          })}
        />

        <TestLink
          label="With different query strings"
          href="/real-path?real=param"
          as="/as-path?as=param"
          {...expected({
            asPath: "/as-path?as=param",
            pathname: "/real-path",
            query: { real: "param" },
          })}
        />

        <TestLink
          label="With overriding query strings"
          href="/real-path?param=real"
          as="/as-path?param=as"
          {...expected({
            asPath: "/as-path?param=as",
            pathname: "/real-path",
            query: { param: "real" },
          })}
        />
      </fieldset>

      <fieldset style={{ display: "flex", flexDirection: "column" }}>
        <legend>Links with different dynamic paths (can cause full-page refresh)</legend>
        <TestLink
          label="Different paths (will cause full refresh)"
          href="/path-real"
          as="/path-as"
          {...expected({
            asPath: "/path-as",
            pathname,
            query: { route: ["path-as"] },
          })}
        />

        <TestLink
          label="Different paths (will cause full refresh)"
          href="/path-one/path-two"
          as="/path-one/path-three"
          {...expected({
            asPath: "/path-one/path-three",
            pathname,
            query: { route: ["path-one", "path-three"] },
          })}
        />
      </fieldset>

      <fieldset>
        <legend>Router Details</legend>
        <DetailsTable values={values} />
      </fieldset>
    </>
  );
};
const TestLink: FC<
  Pick<NextLinkProps, "href" | "as"> & {
    label: string;
    active: boolean;
    onClick: ReactEventHandler;
  }
> = ({ label, href, as, active, onClick }) => {
  const normalizeUrl = (url: typeof as) => {
    // Prepend the 'root' URL:
    if (typeof url === "string") {
      return root + url;
    }
    if (typeof url === "object") {
      url = { ...url, pathname: root + (url.pathname || "") };
    }
    return url;
  };
  return (
    <NextLink
      href={normalizeUrl(href)!}
      as={normalizeUrl(as)}
      style={{
        color: active ? "lightblue" : undefined,
      }}
      onClick={onClick}
    >
      {label}
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
