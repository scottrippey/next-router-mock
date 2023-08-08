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
    "expected.asPath": expectedValues.asPath,
    "router.pathname": router.pathname.replace(root, ""),
    "expected.pathname": expectedValues.pathname,
    "router.query": router.query,
    "expected.query": expectedValues.query,
  };
  const pathname = "/[[...route]]";

  return (
    <>
      <fieldset style={{ display: "flex", flexDirection: "column" }}>
        <legend>Test Links</legend>

        <TestLink
          href="/"
          as="/"
          {...expected({
            asPath: "",
            pathname,
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
            pathname,
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
            pathname,
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
            pathname,
            query: { route: ["path"] },
          })}
        >
          Different hash
        </TestLink>

        <TestLink
          href={pathname}
          as="/one/two/three"
          {...expected({
            asPath: "/one/two/three",
            pathname,
            query: { route: ["one", "two", "three"] },
          })}
        >
          Dynamic path
        </TestLink>
      </fieldset>
      <fieldset style={{ display: "flex", flexDirection: "column" }}>
        <legend>Using objects for URLs</legend>
        <TestLink
          href={{ pathname, query: { param: "href" } }}
          as="/one/two/three"
          {...expected({
            asPath: "/one/two/three",
            pathname,
            query: { param: "href", route: ["one", "two", "three"] },
          })}
        >
          Dynamic path
        </TestLink>

        <TestLink
          href={{ pathname, query: { hrefParam: "href" } }}
          as={{ pathname: "/one/two/three", query: { asParam: "as" } }}
          {...expected({
            asPath: "/",
            pathname,
            query: { hrefParam: "href", route: ["one", "two", "three"] },
          })}
        >
          Dynamic path
        </TestLink>
      </fieldset>
      <fieldset style={{ display: "flex", flexDirection: "column" }}>
        <legend>The following URLs have mismatched paths, so they behave strangely</legend>
        <TestLink
          href="/real-path"
          as="/as-path"
          {...expected({
            asPath: "/as-path",
            pathname,
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
            pathname,
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
  PropsWithChildren<
    Pick<NextLinkProps, "href" | "as"> & {
      active: boolean;
      onClick: ReactEventHandler;
    }
  >
> = ({ href, as, children, active, onClick }) => {
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
