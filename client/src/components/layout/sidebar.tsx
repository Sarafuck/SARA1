import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import {
  Home,
  Users,
  CreditCard,
  MessageSquare,
  ShoppingBag,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Crown,
  Shield,
  Coins
} from "lucide-react";

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ isCollapsed = false, onToggle }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => {
    if (path === '/') {
      return location === '/';
    }
    return location.startsWith(path);
  };

  const getLevelColor = (level: number) => {
    switch (Math.floor(level / 10)) {
      case 0: return "bg-gray-500";
      case 1: return "bg-green-500";
      case 2: return "bg-blue-500";
      case 3: return "bg-purple-500";
      case 4: return "bg-orange-500";
      case 5: return "bg-red-500";
      default: return "bg-gradient-to-r from-yellow-400 to-red-500";
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={`hidden md:flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}>
        {/* Toggle Button */}
        <div className="flex justify-end p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* User Info */}
        <div className="px-4 py-2">
          <Card className="mb-4">
            <CardContent className="p-3">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${getLevelColor(user.level)}`}>
                  {user.level}
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.firstName || user.email}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Coins className="h-3 w-3 text-yellow-500" />
                      <span className="text-xs text-gray-500">{user.xp} XP</span>
                      {user.isPremium && (
                        <Crown className="h-3 w-3 text-yellow-500" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="mx-4" />

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-2">
          <Link
            href="/"
            className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
              isActive('/') 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Home className={`h-5 w-5 ${isCollapsed ? "" : "mr-3"}`} />
            {!isCollapsed && <span>หน้าหลัก</span>}
          </Link>

          <Link
            href="/loans"
            className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
              isActive('/loans') 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <CreditCard className={`h-5 w-5 ${isCollapsed ? "" : "mr-3"}`} />
            {!isCollapsed && <span>สินเชื่อ</span>}
          </Link>

          <Link
            href="/friends"
            className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
              isActive('/friends') 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Users className={`h-5 w-5 ${isCollapsed ? "" : "mr-3"}`} />
            {!isCollapsed && <span>เพื่อน</span>}
          </Link>

          <Link
            href="/chat"
            className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
              isActive('/chat') 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <MessageSquare className={`h-5 w-5 ${isCollapsed ? "" : "mr-3"}`} />
            {!isCollapsed && <span>แชท</span>}
          </Link>

          <Link
            href="/shop"
            className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
              isActive('/shop') 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ShoppingBag className={`h-5 w-5 ${isCollapsed ? "" : "mr-3"}`} />
            {!isCollapsed && <span>ร้านค้า</span>}
          </Link>

          <Separator className="my-4" />

          <Link
            href="/membership"
            className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
              isActive('/membership') 
                ? 'bg-yellow-100 text-yellow-700' 
                : 'text-gray-700 hover:bg-yellow-50'
            }`}
          >
            <Crown className={`h-5 w-5 ${isCollapsed ? "" : "mr-3"}`} />
            {!isCollapsed && (
              <div className="flex items-center justify-between w-full">
                <span>สมาชิกพรีเมียม</span>
                {user.membershipLevel === 'premium' && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    PREMIUM
                  </Badge>
                )}
              </div>
            )}
          </Link>

          {user.role === 'admin' && (
            <Link
              href="/admin"
              className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                isActive('/admin') 
                  ? 'bg-red-100 text-red-700' 
                  : 'text-gray-700 hover:bg-red-50'
              }`}
            >
              <Shield className={`h-5 w-5 ${isCollapsed ? "" : "mr-3"}`} />
              {!isCollapsed && <span>แผงแอดมิน</span>}
            </Link>
          )}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-200">
          <Button
            variant="ghost" 
            className="w-full justify-start text-gray-700 hover:bg-gray-100"
            onClick={() => window.location.href = '/api/auth/logout'}
          >
            <LogOut className={`h-5 w-5 ${isCollapsed ? "" : "mr-3"}`} />
            {!isCollapsed && <span>ออกจากระบบ</span>}
          </Button>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
        <div className="flex justify-around items-center py-2">
          <Link
            href="/"
            className={`flex flex-col items-center px-3 py-2 rounded-lg transition-colors ${
              isActive('/') 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">หน้าหลัก</span>
          </Link>

          <Link
            href="/loans"
            className={`flex flex-col items-center px-3 py-2 rounded-lg transition-colors ${
              isActive('/loans') 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <CreditCard className="h-5 w-5" />
            <span className="text-xs mt-1">สินเชื่อ</span>
          </Link>

          <Link
            href="/friends"
            className={`flex flex-col items-center px-3 py-2 rounded-lg transition-colors ${
              isActive('/friends') 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <Users className="h-5 w-5" />
            <span className="text-xs mt-1">เพื่อน</span>
          </Link>

          <Link
            href="/chat"
            className={`flex flex-col items-center px-3 py-2 rounded-lg transition-colors ${
              isActive('/chat') 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <MessageSquare className="h-5 w-5" />
            <span className="text-xs mt-1">แชท</span>
          </Link>

          <Link
            href="/shop"
            className={`flex flex-col items-center px-3 py-2 rounded-lg transition-colors ${
              isActive('/shop') 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="text-xs mt-1">ร้านค้า</span>
          </Link>
        </div>
      </div>
    </>
  );
}