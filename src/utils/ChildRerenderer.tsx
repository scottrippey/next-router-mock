import React from "react";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const symbol = Symbol("ChildRerenderer");

export function ChildRerenderer({ children }: Props) {
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
