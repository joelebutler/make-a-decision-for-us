import { Button as AriaButton } from "@ariakit/react";
import type { ButtonProps as AriaButtonProps } from "@ariakit/react";
import styles from "./Button.module.css";

export const Button: React.FC<AriaButtonProps> = ({ children, ...props }) => {
  return (
    <AriaButton {...props} className={styles.button}>
      {children}
    </AriaButton>
  );
};
