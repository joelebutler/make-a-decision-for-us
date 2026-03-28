import { Header } from "@front/components/Header";
import { Main, PageLayout } from "@front/components/PageLayout";
import { useUser } from "./UserContext";
import { useEffect } from "react";

function AuthenticatedContent({ children }: { children: React.ReactNode }) {
  const user = useUser().user;
  useEffect(() => {
    if (!user) {
      window.location.href = "/";
    }
  }, [user]);
  return (
    <PageLayout>
      <Header mode="authenticated" />
      <Main>{children}</Main>
    </PageLayout>
  );
}

export default AuthenticatedContent;
