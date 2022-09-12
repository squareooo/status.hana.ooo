import { TestQueryResult } from "@/lib/queries/test.gql";

export interface Props {
  data: TestQueryResult["data"];
  query: {
    id: string
  }
}
