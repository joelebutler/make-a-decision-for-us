export function applyTheme(theme: string) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}
export type Theme = "default" | "dark" | "sunset" | "peach" | "twilightsparkle" | 
"DIO" | "teal" | "koi" | "gamer" | "sky" | "dusk" | "cherry" | "sophia" | "sunshine" | "brat" 
| "pie" | "joel" | "sophia" | "mark" | "lilly" | "HEY";
export const Themes: Theme[] = ["default","dark", "cherry" ,"peach","koi", "sunset", "DIO" ,
     "teal" , "sky", "twilightsparkle" , "dusk" , "gamer", "sophia" , "sunshine" , "brat"
    , "pie" , "joel" , "sophia" , "mark" , "lilly" , "HEY"];