import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Shield, 
  AlertTriangle, 
  Users, 
  CreditCard, 
  Settings, 
  DollarSign,
  TrendingUp,
  Calendar,
  Percent,
  Crown
} from "lucide-react";
import type { UserWithStats } from "@shared/schema";

export default function Admin() {
  const { user, isLoading } = useAuth();

  const { data: userStats } = useQuery<UserWithStats>({
    queryKey: ['/api/auth/user'],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!user || !userStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">ไม่พบผู้ใช้</h1>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              กรุณาเข้าสู่ระบบเพื่อเข้าถึงหน้านี้
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!userStats.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
        <Navbar user={userStats} />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6">
              <div className="text-center">
                <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">ไม่มีสิทธิ์เข้าถึง</h1>
                <p className="text-gray-600 mb-4">
                  คุณไม่มีสิทธิ์ในการเข้าถึงหน้าแอดมิน
                </p>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    หน้านี้สำหรับผู้ดูแลระบบเท่านั้น
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      <Navbar user={userStats} />
      
      {/* Admin Header */}
      <div className="pt-16 bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8" />
            <div>
              <h1 className="text-3xl font-bold">แผงควบคุมแอดมิน</h1>
              <p className="text-indigo-100 mt-1">
                จัดการผู้ใช้ ตั้งค่าระบบ และควบคุมแพลตฟอร์ม
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminPanel />
      </div>
    </div>
  );
}
