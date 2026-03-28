import { Header } from "@front/components/Header";
import { Main, PageLayout } from "@front/components/PageLayout";

function AuthenticatedContent({ children }: { children: React.ReactNode }) {
  return (
    <PageLayout>
      <Header mode="authenticated" />
      <Main>{children}</Main>
    </PageLayout>
  );
}

export default AuthenticatedContent;
