import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
    LucideIcon,
    PartyPopper,
    AlertCircle,
    CheckCircle2,
    XCircle
} from "lucide-react";
import { toast } from "sonner";

type AlertVariant = "success" | "error" | "warning" | "info" | "celebration";

interface AlertComponentProps {
    className?: string;
    title: string;
    description?: string;
    variant?: AlertVariant;
    icon?: LucideIcon;
    badge?: string;
}

const variantStyles = {
    success: {
        bg: "bg-emerald-50/50 dark:bg-emerald-950/20",
        border: "border-emerald-200/30 dark:border-emerald-800/30",
        iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        textColor: "text-emerald-800 dark:text-emerald-200",
        component: CheckCircle2
    },
    error: {
        bg: "bg-red-50/50 dark:bg-red-950/20",
        border: "border-red-200/30 dark:border-red-800/30",
        iconBg: "bg-red-100 dark:bg-red-900/50",
        iconColor: "text-red-600 dark:text-red-400",
        textColor: "text-red-800 dark:text-red-200",
        component: XCircle
    },
    warning: {
        bg: "bg-amber-50/50 dark:bg-amber-950/20",
        border: "border-amber-200/30 dark:border-amber-800/30",
        iconBg: "bg-amber-100 dark:bg-amber-900/50",
        iconColor: "text-amber-600 dark:text-amber-400",
        textColor: "text-amber-800 dark:text-amber-200",
        component: AlertCircle
    },
    celebration: {
        bg: "bg-violet-50/50 dark:bg-violet-950/20",
        border: "border-violet-200/30 dark:border-violet-800/30",
        iconBg: "bg-violet-100 dark:bg-violet-900/50",
        iconColor: "text-violet-600 dark:text-violet-400",
        textColor: "text-violet-800 dark:text-violet-200",
        component: PartyPopper
    },
    info: {
        bg: "bg-blue-50/50 dark:bg-blue-950/20",
        border: "border-blue-200/30 dark:border-blue-800/30",
        iconBg: "bg-blue-100 dark:bg-blue-900/50",
        iconColor: "text-blue-600 dark:text-blue-400",
        textColor: "text-blue-800 dark:text-blue-200",
        component: AlertCircle
    }
};

export function AlertComponent({
                                   className,
                                   title,
                                   description,
                                   variant = "success",
                                   icon,
                                   badge
                               }: AlertComponentProps) {
    const styles = variantStyles[variant];
    const IconComponent = icon || styles.component;

    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm mx-auto"
        >
            <div className={cn(
                "relative overflow-hidden rounded-lg border p-4 shadow-sm",
                styles.bg,
                styles.border,
                className
            )}>
                <div className="flex items-center gap-3">
                    <motion.div
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                        }}
                    >
                        <div className={cn("rounded-full p-1", styles.iconBg)}>
                            <IconComponent className={cn("h-4 w-4", styles.iconColor)} />
                        </div>
                    </motion.div>
                    <motion.p
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className={cn("text-sm font-medium", styles.textColor)}
                    >
                        {title}
                        {description && (
                            <span className="block text-xs opacity-80 font-normal mt-0.5">
                {description}
              </span>
                        )}
                    </motion.p>

                    {badge && (
                        <div className="ml-auto">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 20,
                                    delay: 0.2
                                }}
                                className={cn(
                                    "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                                    `bg-${variant}-100/50 dark:bg-${variant}-900/30`,
                                    `text-${variant}-700 dark:text-${variant}-300`
                                )}
                            >
                                {badge}
                            </motion.div>
                        </div>
                    )}
                </div>
                <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-transparent via-white/20 to-transparent"
                />
            </div>
        </motion.div>
    );
}

export function useCustomToast() {
    const showToast = (
        title: string,
        description?: string,
        variant: AlertVariant = "success",
        badge?: string
    ) => {
        toast.custom(() => (
            <AlertComponent
                title={title}
                description={description}
                variant={variant}
                badge={badge}
            />
        ), {
            duration: 4000,
            position: "bottom-right"
        });
    };

    return { showToast };
}