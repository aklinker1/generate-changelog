import { DefaultLogFields, ListLogLine } from "simple-git";

export type Commit = DefaultLogFields & ListLogLine;

export interface Changes {
  fixes: Commit[];
  features: Commit[];
  breakingChanges: Commit[];
}
