import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface OrderStatusBadgeProps {
  status: string
  className?: string
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return { variant: "secondary" as const, color: "text-yellow-700 bg-yellow-100 border-yellow-200" }
      case "processing":
        return { variant: "default" as const, color: "text-blue-700 bg-blue-100 border-blue-200" }
      case "shipped":
        return { variant: "default" as const, color: "text-purple-700 bg-purple-100 border-purple-200" }
      case "delivered":
        return { variant: "default" as const, color: "text-green-700 bg-green-100 border-green-200" }
      case "cancelled":
        return { variant: "destructive" as const, color: "text-red-700 bg-red-100 border-red-200" }
      case "returned":
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
