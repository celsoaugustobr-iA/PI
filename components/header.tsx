"use client"

import { useState } from "react"
import Link from "next/link"
import { Bell, Menu, Settings, History, LayoutDashboard, X } from "lucide-react"
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

export function Header({ activeAlerts }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5 text-primary-foreground"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">ClearFlow</h1>
            <p className="text-xs text-muted-foreground">IoT Dashboard</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/history">
            <Button variant="ghost" size="sm" className="gap-2">
              <History className="h-4 w-4" />
              Histórico
            </Button>
          </Link>
          <Link href="/settings">
            <Button variant="ghost" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </Button>
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {activeAlerts > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -right-1 -top-1 h-5 min-w-5 px-1 text-xs"
                  >
                    {activeAlerts}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-2">
                <p className="text-sm font-medium">Notificações</p>
                <p className="text-xs text-muted-foreground">
                  {activeAlerts > 0
                    ? `${activeAlerts} alerta${activeAlerts > 1 ? "s" : ""} ativo${activeAlerts > 1 ? "s" : ""}`
                    : "Nenhum alerta ativo"}
                </p>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={cn(
          "border-t border-border md:hidden",
          mobileMenuOpen ? "block" : "hidden"
        )}
      >
        <nav className="container mx-auto flex flex-col gap-1 px-4 py-2">
          <Link href="/" onClick={() => setMobileMenuOpen(false)}>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/history" onClick={() => setMobileMenuOpen(false)}>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <History className="h-4 w-4" />
              Histórico
            </Button>
          </Link>
          <Link href="/settings" onClick={() => setMobileMenuOpen(false)}>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}
