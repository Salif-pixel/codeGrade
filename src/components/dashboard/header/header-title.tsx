"use client"

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FC, ReactElement } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

interface SimpleHeaderTitleProps {
  title?: string;
  Icon: ReactElement;
}

export const SimpleHeaderTitle: FC<SimpleHeaderTitleProps> = ({ title = "", Icon }) => {

  const [source, ...text] = title.split(".");
  const t = useTranslations(source);

  return (
    <div className="flex items-center gap-2 px-6 md:px-8 lg:px-8 xl:px-12">
      <Link href="/dashboard">
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="Back to dashboard">
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </Link>
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">{t(text.join())}</h1>
        {/* <h1 className="text-2xl font-bold tracking-tight">{title}</h1> */}
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
          {Icon}
        </div>
      </div>
    </div>
  );
};
