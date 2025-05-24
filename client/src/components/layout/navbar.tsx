import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  Home, 
  DollarSign, 
  Users, 
  Shield, 
  Settings,
  LogOut,
  Menu,
  Star,
  Crown
} from "lucide-react";
import type { UserWithStats } from "@shared/schema";

interface NavbarProps {
  user: UserWithStats;
}

export default function Navbar({ user }: NavbarProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  // Calculate XP progress for next level
  const getXPProgress = () => {
    const level = user.level;
    const xp = user.xp;
    
    const levelThresholds = { 1: 500, 2: 1500, 3: 3000, 4: Infinity };
    const currentThreshold = levelThresholds[level as keyof typeof levelThresholds];
    const previousThreshold = level === 1 ? 0 : levelThresholds[(level - 1) as keyof typeof levelThresholds];
    
    if (currentThreshold === Infinity) return 100;
    
    const progress = ((xp - previousThreshold) / (currentThreshold - previousThreshold)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const getNextLevelXP = () => {
    const level = user.level;
    const levelThresholds = { 1: 500, 2: 1500, 3: 3000, 4: Infinity };
    return levelThresholds[level as keyof typeof levelThresholds];
  };

  const navItems = [
    { href: "/", label: "หน้าแรก", icon: Home, active: location === "/" },
    { href: "/lending", label: "กู้เงิน", icon: DollarSign, active: location === "/lending" },
    { href: "/friends", label: "เพื่อน", icon: Users, active: location === "/friends" },
    { href: "/fraud", label: "ตรวจสอบ", icon: Shield, active: location === "/fraud" },
  ];

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-lg shadow-sm z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link href="/">
              <h1 className="text-2xl font-bold text-gradient-primary cursor-pointer">
                ThaiSocial
              </h1>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6 ml-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    item.active
                      ? "text-primary bg-primary/10"
                      : "text-gray-700 hover:text-primary hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* XP and Level Display */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="bg-gradient-to-r from-emerald-500/10 to-green-600/10 px-4 py-2 rounded-full border border-emerald-200">
              <div className="flex items-center space-x-3">
                <Badge className="level-badge text-white px-3 py-1 text-xs font-bold">
                  <Crown className="w-3 h-3 mr-1" />
                  LV.{user.level}
                </Badge>
                <div className="flex flex-col min-w-0">
                  <div className="text-xs text-gray-600">
                    XP: {user.xp.toLocaleString()} 
                    {getNextLevelXP() !== Infinity && ` / ${getNextLevelXP().toLocaleString()}`}
                  </div>
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="xp-bar h-full rounded-full transition-all duration-300" 
                      style={{ width: `${getXPProgress()}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Profile and Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Mobile XP Display */}
            <div className="lg:hidden flex items-center space-x-2">
              <span className="text-sm font-semibold text-emerald-600">
                {user.xp.toLocaleString()} XP
              </span>
              <Badge variant="secondary" className="text-xs">
                L{user.level}
              </Badge>
            </div>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border-2 border-primary/20 hover:border-primary/40 transition-colors">
                    <AvatarImage src={user.profileImageUrl || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {user.firstName?.[0] || user.email?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-2">
                    <p className="text-sm font-medium leading-none">
                      {user.firstName ? `${user.firstName} ${user.lastName || ''}` : 'ผู้ใช้'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                    <div className="flex items-center space-x-2 pt-2">
                      <Badge className="level-badge text-white text-xs">
                        Level {user.level}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {user.xp.toLocaleString()} XP
                      </Badge>
                    </div>
                    {getNextLevelXP() !== Infinity && (
                      <div className="pt-2">
                        <div className="text-xs text-muted-foreground mb-1">
                          Progress to Level {user.level + 1}
                        </div>
                        <Progress value={getXPProgress()} className="h-2" />
                        <div className="text-xs text-muted-foreground mt-1">
                          {getNextLevelXP() - user.xp} XP remaining
                        </div>
                      </div>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Star className="mr-2 h-4 w-4" />
                  <span>โปรไฟล์</span>
                </DropdownMenuItem>
                {user.isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>แอดมิน</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>ออกจากระบบ</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle>เมนู</SheetTitle>
                  <SheetDescription>
                    นำทางและข้อมูลบัญชีของคุณ
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  {/* Mobile XP Display */}
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-lg border border-emerald-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <Badge className="level-badge text-white px-3 py-1">
                        Level {user.level}
                      </Badge>
                      <Badge variant="outline">
                        {user.xp.toLocaleString()} XP
                      </Badge>
                    </div>
                    {getNextLevelXP() !== Infinity && (
                      <div>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Progress to Level {user.level + 1}</span>
                          <span>{Math.round(getXPProgress())}%</span>
                        </div>
                        <Progress value={getXPProgress()} className="h-2" />
                      </div>
                    )}
                  </div>

                  {/* Mobile Navigation */}
                  <div className="space-y-2">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                          item.active
                            ? "text-primary bg-primary/10"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    ))}
                  </div>

                  {user.isAdmin && (
                    <div className="border-t pt-4">
                      <Link
                        href="/admin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-all"
                      >
                        <Settings className="w-5 h-5" />
                        <span className="font-medium">แอดมิน</span>
                      </Link>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <Button 
                      onClick={handleLogout}
                      variant="ghost"
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="mr-3 h-5 w-5" />
                      ออกจากระบบ
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
