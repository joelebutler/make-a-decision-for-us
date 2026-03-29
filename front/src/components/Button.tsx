import { Button as AriaButton } from "@ariakit/react";
import type { ButtonProps as AriaButtonProps } from "@ariakit/react";

export const Button: React.FC<AriaButtonProps> = ({ children, ...props }) => {
  return (
    <AriaButton {...props} className={`${props.className}`}>
      {children}
    </AriaButton>
  );
};
