import * as React from "react"
import { ArrowLeftRight, Plus, Monitor, AlertCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { usePage, Link } from "@inertiajs/react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export interface Project {
  name: string
  logo?: string
  url: string
  isActive?: boolean
}

export interface Monitor {
  id: string | number
  name: string
  website: {
    name: string
    url: string
  }
  status: string
  isPending?: boolean
}

interface ProjectSwitcherProps {
  monitors?: Monitor[]
}

export function ProjectSwitcher({ monitors = [] }: ProjectSwitcherProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false)

  // Get the first monitor as active, or null if no monitors
  const activeMonitor = monitors.length > 0 ? monitors[0] : null

  // Show empty state if no monitors
  if (!activeMonitor) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
            <div className="flex size-6 items-center justify-center rounded-sm bg-muted">
              <Monitor className="size-3" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium">No monitors yet</span>
              <span className="text-xs">Create your first monitor</span>
            </div>
          </div>
          <div className="px-2 pt-1">
            <Link href="/monitors/create">
              <Button size="sm" className="w-full h-6 text-xs">
                <Plus className="size-3 mr-1" />
                Create Monitor
              </Button>
            </Link>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
            >
              <Avatar className="size-6 rounded-sm">
                <AvatarImage
                  src={`https://www.google.com/s2/favicons?domain=${activeMonitor.website.url}&sz=64`}
                  alt={activeMonitor.website.name}
                  className="object-contain"
                />
                <AvatarFallback className="rounded-sm bg-primary/10 text-xs">
                  {activeMonitor.website.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeMonitor.website.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {activeMonitor.website.url}
                </span>
              </div>
              <div className="flex items-center gap-1 ml-auto">
                {activeMonitor.isPending && (
                  <AlertCircle className="size-3 text-yellow-500" />
                )}
                {monitors.length > 1 && (
                  <ArrowLeftRight className="size-4 text-muted-foreground/50" />
                )}
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-[240px]"
            align="start"
          >
            <DropdownMenuLabel>Brand Monitors</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {monitors.map((monitor) => (
              <DropdownMenuItem
                key={monitor.id}
                className="gap-2 p-2"
              >
                <Avatar className="size-5 rounded-sm">
                  <AvatarImage
                    src={`https://www.google.com/s2/favicons?domain=${monitor.website.url}&sz=64`}
                    alt={monitor.website.name}
                    className="object-contain"
                  />
                  <AvatarFallback className="rounded-sm bg-muted text-[10px]">
                    {monitor.website.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-sm leading-tight">
                  <span className="truncate font-medium">
                    {monitor.website.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {monitor.website.url}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {monitor.isPending && (
                    <AlertCircle className="size-3 text-yellow-500" />
                  )}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    monitor.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : monitor.isPending
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    {monitor.isPending ? 'Pending' : monitor.status}
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              onSelect={(e) => {
                e.preventDefault()
                setDropdownOpen(false)
                window.location.href = '/monitors/create'
              }}
            >
              <div className="flex size-5 items-center justify-center rounded-sm bg-muted">
                <Plus className="size-3" />
              </div>
              <span className="text-sm">Add Monitor</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}