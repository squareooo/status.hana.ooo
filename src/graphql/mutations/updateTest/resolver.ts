import { AuthenticationError } from "apollo-server-core";
import MUUID from "uuid-mongodb";

import Test from "@/models/test";

export const updateTest = async (
  _: any,
  args: { input: any },
  { payload }: any
): Promise<any> => {
  try {
    if (payload == null) return new AuthenticationError("");

    const id = args.input.id.replace(
      /(\w{8})(\w{4})(\w{4})(\w{4})(\w{12})/,
      "$1-$2-$3-$4-$5"
    );

    const test = await Test.findOneAndUpdate(
      {
        id: MUUID.from(id),
        userId: MUUID.from(payload.sub),
      },
      {
        name: args.input.name,
      },
      {
        new: true,
      }
    );
    if (test == null) return;

    test.id = MUUID.from(test.id).toString("N");

    return test;
  } catch (err) {
    console.error(err);
  }
};
