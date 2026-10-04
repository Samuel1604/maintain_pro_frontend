

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge, PriorityBadge, StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ArrowRight } from 'lucide-react'
import { WorkOrder } from '@/types/common.types'
import { Link } from 'react-router-dom'
import { usePortalPath } from '@/hooks/usePortal'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface WorkOrderListProps {
  workOrders: WorkOrder[]
  title?: string
  showViewAll?: boolean
  maxItems?: number
}

export function WorkOrderList({ workOrders, title = 'Recent Work Orders', showViewAll = true, maxItems = 5 }: WorkOrderListProps) {
  const workOrdersPath = usePortalPath('work-orders')
  const displayOrders = workOrders.slice(0, maxItems)

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        {showViewAll && (
          <Button variant="ghost" size="sm" asChild>
            <Link
              to={workOrdersPath}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Work Order</TableHead>
                <TableHead className="text-muted-foreground">Priority</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Assignee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayOrders.map((order) => (
                <TableRow key={order.id} className="border-border">
                  <TableCell>
                    <Link to={`${workOrdersPath}/${order.id}`} className="block group">
                      <p className="font-medium text-foreground transition-colors line-clamp-1 group-hover:text-foreground/90">
                        {order.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span className="font-mono">{order.id}</span>
                        <span>•</span>
                        <span>{order.category}</span>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={order.priority} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>
                    {order.assigneeName ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-primary/20 text-primary text-xs">
                            {(order.assigneeName || '').split(' ').filter(Boolean).map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{order.assigneeName}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
