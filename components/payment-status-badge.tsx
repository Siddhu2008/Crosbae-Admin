import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface PaymentStatusBadgeProps {
  status: string
  className?: string
}

export function PaymentStatusBadge({ status, className }: PaymentStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return { variant: "secondary" as const, color: "text-yellow-700 bg-yellow-100 border-yellow-200" }
      case "completed":
        return { variant: "default" as const, color: "text-green-700 bg-green-100 border-green-200" }
      case "failed":
        return { variant: "destructive" as const, color: "text-red-700 bg-red-100 border-red-200" }
      case "refunded":
        return { variant: "outline" as const, color: "text-orange-700 bg-orange-100 border-orange-200" }
      default:
        return { variant: "outline" as const, color: "text-muted-foreground bg-muted border-border" }
    }
  }

  const config = getStatusConfig(status)

  return (
    <Badge
      variant={config.variant}
      className={cn(
        "text-xs px-2 py-0.5 rounded whitespace-nowrap",
        config.color,
        className
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}
