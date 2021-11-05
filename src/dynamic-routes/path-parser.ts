import {MemoryRouter, UrlObject} from "../MemoryRouter";

declare module "../MemoryRouter" {
  interface MemoryRouter {
    setPathParser(parser: (url: UrlObject) => UrlObject): void
  }
}

MemoryRouter.prototype.setPathParser = function(parser: (url: UrlObject) => UrlObject) {
  this.pathParser = parser
}

export {}
