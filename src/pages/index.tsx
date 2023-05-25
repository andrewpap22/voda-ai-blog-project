import { type NextPage } from "next";
import Head from "next/head";

import { SignIn, SignInButton, SignOutButton, useUser } from "@clerk/nextjs";

const Home: NextPage = () => {

  const user = useUser();

  return (
    <>
      <Head>
        <title>📚 Blog</title>
        <meta name="description" content="Voda-AI Blog Project" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div>
          {!user.isSignedIn && <SignInButton />}
          {!!user.isSignedIn && <SignOutButton />}
        </div>

        <SignIn path="/sign-in" routing="path" />
      </main>
    </>
  );
};

export default Home;
