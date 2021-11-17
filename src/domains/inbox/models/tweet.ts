export default interface Tweet {
  text: string;
  image?: string;
  author: string;
  link: string;
  childrens?: Tweet[];
}
