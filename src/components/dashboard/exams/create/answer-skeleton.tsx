import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import React from "react";

const AnswerSkeleton = () => (
    <div className="space-y-6">
        <Card className="border-primary/20">
            <CardHeader>
                <Skeleton className="h-6 w-3/4"/>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <Skeleton className="h-24 w-full"/>
                </div>
            </CardContent>
        </Card>
    </div>
)

export default AnswerSkeleton;
