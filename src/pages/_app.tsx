import { ClerkProvider } from "@clerk/nextjs";
import { type AppType } from "next/app";
import { PageFooter } from "~/components/page-footer";
import { PageHeader } from "~/components/page-header";
import { ThemeProvider } from "~/components/theme-provider";

import { api } from "~/utils/api";

import "~/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider {...pageProps}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <PageHeader />
        <Component {...pageProps} />
        <PageFooter />
      </ThemeProvider>
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
