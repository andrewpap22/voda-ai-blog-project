import { type NextPage } from "next";
import Head from "next/head";
import { Icons } from "~/components/icons";
import { Button } from "~/components/ui/button";
import Blog from "./blog-posts";

import { SignIn, SignInButton, useUser } from "@clerk/nextjs";

const Home: NextPage = () => {
  const user = useUser();

  return (
    <>
      <Head>
        <title>📚 Blog</title>
        <meta name="description" content="Voda-AI Blog Project" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center py-2">
        <div>
          {!user.isSignedIn && (
            <Button>
              <Icons.doorClosed /> <SignInButton />
            </Button>
          )}
          {!!user.isSignedIn && <Blog />}
        </div>

        <SignIn path="/sign-in" routing="path" />
      </main>
    </>
  );
};

export default Home;
