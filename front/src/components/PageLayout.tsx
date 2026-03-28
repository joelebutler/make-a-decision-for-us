import type { ComponentProps } from "react";
import { Background } from "./Background";

type PageLayoutProps = ComponentProps<"div">;

export function PageLayout({ className, ...props }: PageLayoutProps) {
  return (
    <div className={`relative flex flex-col min-h-screen ${className}`}>
      <Background />
      {props.children}
    </div>
  );
}

type MainProps = ComponentProps<"main">;

export function Main({ className, ...props }: MainProps) {
  return <main className={`grow ${className}`} {...props} />;
}
