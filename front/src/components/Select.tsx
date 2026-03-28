import * as Ariakit from "@ariakit/react";

export type SelectItemType = {
  value: string;
  label?: string;
  disabled?: boolean;
  className?: string;
};

interface SelectProps {
  label: string;
  value: string;
  items: SelectItemType[];
  onChange: (value: string) => void;
  className?: string;
}

function Select({ label, value, items, onChange, className }: SelectProps) {
  // Ensure the value passed to onChange is always a string
  const handleChange = (val: string | unknown) => {
    if (typeof val === "string") onChange(val);
  };
  return (
    <div className={className || "w-full"}>
      <Ariakit.SelectProvider value={value} setValue={handleChange}>
        <Ariakit.SelectLabel className="block text-lg font-medium mb-2">
          {label}
        </Ariakit.SelectLabel>
        <Ariakit.Select className="w-full px-4 py-2 rounded border border-brand/30 bg-surface/80 text-text font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-brand transition-colors duration-150 cursor-pointer flex items-center justify-between gap-2" />
        <Ariakit.SelectPopover className="mt-2 rounded shadow-lg bg-white dark:bg-surface/90 border border-brand/20 py-2 z-50 animate-fade-in">
          {items.map((item) => (
            <Ariakit.SelectItem
              key={item.value}
              value={item.value}
              disabled={item.disabled}
              className={
                item.className ||
                `block w-full px-4 py-2 text-left rounded transition-colors duration-100 ${item.disabled ? "text-text/40 cursor-not-allowed opacity-60" : "text-text hover:bg-brand/10 focus:bg-brand/10 focus:outline-none capitalize"}`
              }
            >
              {item.label || item.value}
            </Ariakit.SelectItem>
          ))}
        </Ariakit.SelectPopover>
      </Ariakit.SelectProvider>
    </div>
  );
}

export default Select;
