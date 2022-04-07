import React from "react";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const symbol = Symbol("ChilChildrenRerendererdRerenderer");

export function ChildrenRerenderer({ children }: Props) {
  return (
    <>
      {React.Children.map(children, (element) => {
        if (React.isValidElement(element)) {
          return React.cloneElement(element, { ...element.props, [symbol]: {} });
        } else {
          return element;
        }
      })}
    </>
  );
}
