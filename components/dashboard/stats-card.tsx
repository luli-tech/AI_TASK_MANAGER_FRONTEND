"use client"

import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: number | string
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon: LucideIcon
  index: number
}

export function StatsCard({ title, value, change, changeType = "neutral", icon: Icon, index }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
              {change && (
                <p
                  className={cn(
                    "mt-1 text-sm font-medium",
                    changeType === "positive" && "text-green-500",
                    changeType === "negative" && "text-red-500",
                    changeType === "neutral" && "text-muted-foreground",
                  )}
                >
                  {change}
                </p>
              )}
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Icon className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
