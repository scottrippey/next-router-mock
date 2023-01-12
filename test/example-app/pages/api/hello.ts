// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type HelloWorld = {
  hello: string;
};

export default function handler(req: NextApiRequest, res: NextApiResponse<HelloWorld>) {
  res.status(200).json({ hello: "World" });
}
