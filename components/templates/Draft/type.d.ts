import { useStates } from "./states";

import { Props } from "@/pages/draft/[id]/type";

export type States = ReturnType<typeof useStates>;

export interface Props extends Props {}
