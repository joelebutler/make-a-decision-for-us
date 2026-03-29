import {
  Menu as AriaMenu,
  MenuButton,
  MenuButtonArrow,
  MenuItem,
  MenuProvider,
  MenuSeparator,
} from "@ariakit/react";
import type { ReactNode } from "react";

export type MenuItemType = {
  type: "button" | "separator";
  label?: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
};

interface MenuProps {
  title: string;
  items: MenuItemType[];
}

function Menu({ title, items }: MenuProps) {
  return (
    <MenuProvider>
      <MenuButton className="pl-2.5 pr-4 py-1.5 text-sm font-bold shadow-sm hover:bg-surface-elevated transition-all duration-300 rounded-xl border-2 border-brand/20 text-brand bg-transparent flex items-center gap-2.5 outline-none h-[40px]">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand to-brand-hover text-surface shadow-sm flex items-center justify-center text-xs font-black">
          {title.charAt(0).toUpperCase()}
        </div>
        <span className="hidden leading-none sm:block">{title}</span>
        <MenuButtonArrow className="opacity-60 transition-transform group-hover:opacity-100 -ml-1" />
      </MenuButton>
      <AriaMenu
        gutter={8}
        className="min-w-[14rem] p-1.5 rounded-2xl shadow-2xl shadow-brand/10 border border-brand/10 bg-surface z-50 flex flex-col focus:outline-none"
      >
        {items.map((item, i) => {
          if (item.type === "separator") {
            return (
              <MenuSeparator
                key={i}
                className={item.className || "my-1.5 border-t border-brand/10"}
              />
            );
          }
          return (
            <MenuItem
              key={i}
              className={
                item.className ||
                `flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-xl my-0.5 outline-none transition-all duration-200 ${
                  item.disabled
                    ? "text-text/40 cursor-not-allowed opacity-60"
                    : "text-text hover:bg-brand/10 hover:text-brand focus:bg-brand/10 focus:text-brand cursor-pointer"
                }`
              }
              onClick={item.onClick}
              disabled={item.disabled}
            >
              {item.label}
            </MenuItem>
          );
        })}
      </AriaMenu>
    </MenuProvider>
  );
}

export default Menu;
