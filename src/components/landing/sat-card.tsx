import {motion} from "framer-motion";

export function StatCard({ number, label, delay = 0 }: { number: string, label: string, delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay }}
            viewport={{ once: true }}
        >
            <div className="text-4xl font-bold text-primary mb-2">{number}</div>
            <div className="text-gray-600 dark:text-muted-foreground">{label}</div>
        </motion.div>
    )
}