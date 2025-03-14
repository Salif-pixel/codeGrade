import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FC } from "react";

interface SimpleHeaderTitleProps {
  title: string;
  icon: React.ElementType;
}

export const SimpleHeaderTitle: FC<SimpleHeaderTitleProps> = ({ title, icon: Icon }) => {
  return (
    <div className="flex items-center gap-2 px-6 md:px-8 lg:px-8 xl:px-12">
      <Link href="/dashboard">
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="Back to dashboard">
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </Link>
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
    </div>
  );
};
