import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { useEffect } from "react";

/**
 * This component is used to wrap pages that require authentication.
 * If the user is not signed in, they will be redirected to the home page so that they can sign in first.
 */
const Authenticated = ({ children }: { children: any }) => {
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user.isSignedIn && router.route != "/") {
      router.push("/");
    }
  }, [user, router]);

  return <>{children}</>;
};

export default Authenticated;
