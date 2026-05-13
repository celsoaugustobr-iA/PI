"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, Menu, LayoutDashboard, X, TrendingUp, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface HeaderProps {
  activeAlerts: number
}

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/predicoes", label: "Predições", icon: TrendingUp },
  { href: "/monitoramento", label: "Monitoramento", icon: Activity },
]

export default function Header({ activeAlerts }: HeaderProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-success/15 text-success shadow-sm shadow-success/10">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">GeoRisk</p>
            <h1 className="text-lg font-semibold text-foreground">Painel de monitoramento</h1>
          </div>
        </div>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <Link key={href} href={href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
                    isActive
                      ? "border border-success bg-success/10 text-success shadow-[0_0_0_1px_rgba(76,175,80,0.18)]"
                      : "text-muted-foreground hover:border hover:border-success/30 hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {activeAlerts > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -right-1 -top-1 h-5 min-w-5 px-1 text-[11px]"
                  >
                    {activeAlerts}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <div className="space-y-2 p-3">
                <p className="text-sm font-medium">Notificações</p>
                <p className="text-xs text-muted-foreground">
                  {activeAlerts > 0
                    ? `${activeAlerts} alerta${activeAlerts > 1 ? "s" : ""} ativo${activeAlerts > 1 ? "s" : ""}`
                    : "Nenhum alerta ativo"}
                </p>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <div className={cn("border-t border-border md:hidden", mobileMenuOpen ? "block" : "hidden")}>
        <nav className="container mx-auto flex flex-col gap-1 px-4 py-3">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-2 rounded-xl px-4 py-3 text-sm font-medium",
                    isActive ? "bg-success/10 text-success" : "text-muted-foreground hover:bg-muted/50",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
