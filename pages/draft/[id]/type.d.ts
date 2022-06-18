import { TestQueryResult } from "@/lib/queries/test.graphql";

export interface Props {
  data: TestQueryResult["data"];
  query: {
    id: string
  }
}
