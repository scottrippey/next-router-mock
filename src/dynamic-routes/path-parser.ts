import {MemoryRouter, UrlObject, UrlObjectWithPath} from "../MemoryRouter";

declare module "../MemoryRouter" {
  interface MemoryRouter {
    setPathParser(parser: (url: UrlObject) => UrlObjectWithPath): void
  }
}

MemoryRouter.prototype.setPathParser = function(parser: (url: UrlObject) => UrlObjectWithPath) {
  this.pathParser = parser
}

export {}
