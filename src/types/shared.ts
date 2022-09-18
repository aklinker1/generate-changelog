import { DefaultLogFields, ListLogLine } from "simple-git";

export type Commit = DefaultLogFields & ListLogLine;

export interface Changes {
  fixes: Pick<Commit, "message" | "hash">[];
  features: Pick<Commit, "message" | "hash">[];
  breakingChanges: Pick<Commit, "message" | "hash">[];
}
