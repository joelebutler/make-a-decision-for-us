import { Button } from "@front/components/Button";
import { Card } from "@front/components/Card";
import { Header } from "@front/components/Header";
import { Main, PageLayout } from "@front/components/PageLayout";
import { Section } from "@front/components/Section";
import { NavLink as RouterLink } from "react-router";

function Home() {
  return (
    <PageLayout>
      <Header mode="homepage" />
      <Main className="relative">
        <Section className="relative overflow-hidden min-h-[90vh] flex flex-col justify-center items-center">
          {/* Decorative backdrop elements */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand/20 rounded-full blur-[100px] opacity-60 -z-10 pointer-events-none" />
          <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-brand-subtle rounded-full blur-[80px] opacity-70 -z-10 pointer-events-none mix-blend-multiply" />

          <div className="container mx-auto px-4 text-center relative z-10 space-y-8 max-w-4xl">
            <span className="inline-block py-1 px-2 pl-1 rounded-full border border-brand/30 bg-surface-muted/50 backdrop-blur-sm text-sm font-medium text-brand mb-4 shadow-sm">
              <span className="text-brand ml-1 px-1 py-0.5 rounded-full font-bold text-xs uppercase tracking-wider">
                Powered By
              </span>
              <span className="bg-brand text-surface ml-1 px-2 py-0.5 rounded-full font-bold text-xs uppercase tracking-wider">
                Google Gemini
              </span>
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-text leading-[1.1]">
              Making Decisions Together,{" "}
              <span className="text-brand">Made Easy</span>
            </h1>
            <p className="text-xl md:text-2xl text-text-muted max-w-2xl mx-auto leading-relaxed font-light">
              Say goodbye to endless debates and hello to happy choices! The
              perfect place for you and your friends to agree on... well,
              anything!
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <RouterLink to="/register">
                <Button className="px-8 py-4 text-lg font-bold shadow-xl shadow-brand/20 hover:shadow-brand/40 transition-all duration-300 hover:-translate-y-1 bg-brand text-surface rounded-xl border-none">
                  Let's Get Started!
                </Button>
              </RouterLink>
              <RouterLink to="/login">
                <Button className="px-8 py-4 text-lg font-bold shadow-sm hover:bg-surface-elevated transition-all duration-300 rounded-xl border-2 border-brand/20 text-text bg-transparent">
                  I already have an account
                </Button>
              </RouterLink>
            </div>
          </div>
        </Section>

        <Section
          variant="clear"
          className="relative z-10 py-24 bg-gradient-to-b from-transparent to-surface-subtle"
        >
          <div className="container mx-auto px-4">
            <div className="text-center w-full max-w-3xl mx-auto mb-16 space-y-4">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                A Few Things You'll Love
              </h2>
              <p className="text-xl text-text-muted font-medium">
                Making group decisions has never been this fast, fair, and
                enjoyable.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Feature 1 */}
              <Card className="group relative overflow-hidden flex flex-col border-brand/10 hover:border-brand/30 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 bg-gradient-to-b from-surface to-surface-muted p-8">
                <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center mb-6 group-hover:bg-brand group-hover:text-surface transition-colors duration-500 text-brand">
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3 tracking-tight">
                  Create Polls in a Snap
                </h3>
                <p className="text-text-muted leading-relaxed flex-grow">
                  Whip up a poll in seconds. The interface is so intuitive,
                  you'll be looking for more things to decide on.
                </p>
              </Card>

              {/* Feature 2 */}
              <Card className="group relative overflow-hidden flex flex-col border-brand/10 hover:border-brand/30 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 bg-gradient-to-b from-surface to-surface-muted p-8">
                <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center mb-6 group-hover:bg-brand group-hover:text-surface transition-colors duration-500 text-brand">
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3 tracking-tight">
                  See Results Instantly
                </h3>
                <p className="text-text-muted leading-relaxed flex-grow">
                  No more waiting! Watch the votes roll in and discover your
                  group's collective choice in beautiful real-time.
                </p>
              </Card>

              {/* Feature 3 */}
              <Card className="group relative overflow-hidden flex flex-col border-brand/10 hover:border-brand/30 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 bg-gradient-to-b from-surface to-surface-muted p-8">
                <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center mb-6 group-hover:bg-brand group-hover:text-surface transition-colors duration-500 text-brand">
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3 tracking-tight">
                  Share with a Link
                </h3>
                <p className="text-text-muted leading-relaxed flex-grow">
                  Just copy the link and send it to your friends, family, or
                  teammates anywhere. They can vote without signing up.
                </p>
              </Card>
            </div>
          </div>
        </Section>

        <Section className="relative z-10 mb-20 -mt-6">
          <div className="container mx-auto px-4">
            <div className="bg-brand text-surface rounded-[2.5rem] p-10 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-brand/20">
              {/* Internal decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

              <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                  Ready to have some fun?
                </h2>
                <p className="text-xl text-surface/90 max-w-2xl mx-auto font-medium leading-relaxed">
                  Start your first poll now and bring a little more harmony to
                  your group decisions.
                </p>
                <RouterLink to="/register" className="inline-block mt-4">
                  <Button className="px-10 py-5 text-xl font-bold text-brand bg-surface hover:bg-white hover:scale-105 transition-all duration-300 rounded-full shadow-lg border-none">
                    Create a Free Poll
                  </Button>
                </RouterLink>
              </div>
            </div>
          </div>
        </Section>
      </Main>
    </PageLayout>
  );
}

export default Home;
