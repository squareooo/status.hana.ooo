import MUUID from "uuid-mongodb";

import Series from "@/models/series";

export const aSeries = async (
  _: unknown,
  args: { input: { id: string } }
): Promise<unknown> => {
  const id = args.input.id.replace(
    /(\w{8})(\w{4})(\w{4})(\w{4})(\w{12})/,
    "$1-$2-$3-$4-$5"
  );
  const aSeries = await Series.findOne({ id: MUUID.from(id) });

  if (aSeries == null) return;
  aSeries.id = MUUID.from(aSeries.id).toString("N");

  return aSeries;
};
