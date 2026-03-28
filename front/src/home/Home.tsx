import { Button } from "@front/components/Button";
import { Card } from "@front/components/Card";
import { Header } from "@front/components/Header";
import { Main, PageLayout } from "@front/components/PageLayout";
import { Section } from "@front/components/Section";

function Home() {
  return (
    <PageLayout>
      <Header mode="homepage" />
      <Main>
        <Section>
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Making Decisions Together, Made Easy
            </h1>
            <p className="text-lg md:text-xl text-text/80 max-w-3xl mx-auto mb-8">
              Say goodbye to endless debates and hello to happy choices! Our app
              is the perfect place for you and your friends to agree on... well,
              anything!
            </p>
            <Button>Let's Get Started!</Button>
          </div>
        </Section>
        <Section variant="clear">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">
                A Few Things You'll Love
              </h2>
              <p className="text-lg text-text/70 mt-2">
                Making group decisions has never been this enjoyable.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <h3 className="text-xl font-bold mb-2">
                  Create Polls in a Snap
                </h3>
                <p>
                  Whip up a poll in seconds. It's so easy, you'll be looking for
                  more things to decide on.
                </p>
              </Card>
              <Card>
                <h3 className="text-xl font-bold mb-2">
                  See Results Instantly
                </h3>
                <p>
                  No more waiting! Watch the votes roll in and discover your
                  group's choice in real-time.
                </p>
              </Card>
              <Card>
                <h3 className="text-xl font-bold mb-2">
                  Share with a Simple Link
                </h3>
                <p>
                  Just copy the link and send it to your friends, family, or
                  teammates anywhere.
                </p>
              </Card>
            </div>
          </div>
        </Section>
        <Section>
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to have some fun?
            </h2>
            <p className="text-lg text-text/80 max-w-2xl mx-auto mb-8">
              Start your first poll now and bring a little more harmony to your
              group decisions.
            </p>
            <Button>Start Your First Poll</Button>
          </div>
        </Section>
      </Main>
    </PageLayout>
  );
}

export default Home;
