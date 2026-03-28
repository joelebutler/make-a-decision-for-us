import {
  Menu as AriaMenu,
  MenuButton,
  MenuButtonArrow,
  MenuItem,
  MenuProvider,
  MenuSeparator,
} from "@ariakit/react";

export type MenuItemType = {
  type: "button" | "separator";
  label?: string;
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
      <MenuButton className="px-2 py-1 rounded bg-brand text-surface font-semibold flex items-center">
        {title}
        <MenuButtonArrow />
      </MenuButton>
      <AriaMenu
        gutter={8}
        className="min-w-40 rounded shadow-lg bg-surface z-50"
      >
        {items.map((item, i) => {
          if (item.type === "separator") {
            return (
              <MenuSeparator
                key={i}
                className={item.className || "border-t border-brand/10"}
              />
            );
          }
          return (
            <MenuItem
              key={i}
              className={
                item.className ||
                `block w-full px-4 py-2 text-left ${item.disabled ? "text-text/40 cursor-not-allowed opacity-60" : "text-text hover:bg-brand/10 focus:bg-brand/10 focus:outline-none"}`
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
