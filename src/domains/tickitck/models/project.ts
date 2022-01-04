export default interface Project {
  closed: boolean;
  color?: string;
  id: string;
  kind: "TASK" | "NOTE";
  modifiedTime: Date;
  name: string;
}
