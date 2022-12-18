declare module "templater.js" {
  interface Template {
    (data: Record<string, unknown>): string;
  }
  interface Templater {
    (templateString: string): Template;
  }
  const templater: Templater;
  export default templater;
}
