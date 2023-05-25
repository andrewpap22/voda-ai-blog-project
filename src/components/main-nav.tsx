"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { Icons } from "~/components/icons";
import { siteConfig } from "~/config/site";
import { cn } from "~/lib/utils";

export function MainNav() {
  const pathname = usePathname();

  return (
    <div className="mr-4 hidden md:flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <Icons.logo className="h-6 w-6" />
        <span className="hidden font-bold sm:inline-block">
          {siteConfig.name}
        </span>
      </Link>
      <nav className="flex items-center space-x-6 text-sm font-medium">
        <Link
          href="/posts"
          className={cn(
            "hover:text-foreground/80 transition-colors",
            pathname?.startsWith("/posts")
              ? "text-foreground"
              : "text-foreground/60"
          )}
        >
          Posts
        </Link>
        <Link
          href={siteConfig.links.github}
          className={cn(
            "text-foreground/60 hover:text-foreground/80 hidden transition-colors lg:block"
          )}
        >
          GitHub
        </Link>
      </nav>
    </div>
  );
}
