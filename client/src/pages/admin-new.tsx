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
  Crown,
  Save
} from "lucide-react";

export default function AdminNew() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Form states สำหรับการตั้งค่าระบบ
  const [loanSettings, setLoanSettings] = useState({
    minLoanAmount: 100,
    maxLoanAmount: 50000,
    baseInterestRate: 5,
    dailyInterestRate: 0.1,
    maxLoanTerm: 365,
    minLoanTerm: 7
  });

  const [membershipSettings, setMembershipSettings] = useState({
    monthlyFee: 100,
    premiumBenefits: {
      creditBonus: 50,
      interestReduction: 2,
      xpBonus: 25
    }
  });

  // ดึงข้อมูลสถิติระบบ
  const { data: systemStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
  });

  // ดึงข้อมูลผู้ใช้ทั้งหมด
  const { data: allUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
  });

  // ดึงข้อมูลสินเชื่อทั้งหมด
  const { data: allLoans = [], isLoading: loansLoading } = useQuery({
    queryKey: ['/api/admin/loans'],
  });

  // ดึงข้อมูลการชำระเงินสมาชิก
  const { data: membershipPayments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ['/api/admin/membership-payments'],
  });

  // การอัปเดตการตั้งค่าระบบ
  const updateSystemSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      const response = await apiRequest('POST', '/api/admin/system-settings', settings);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "อัปเดตสำเร็จ",
        description: "การตั้งค่าระบบได้รับการอัปเดตแล้ว",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin'] });
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถอัปเดตการตั้งค่าได้",
        variant: "destructive",
      });
    },
  });

  // การอนุมัติ/ปฏิเสธการชำระเงินสมาชิก
  const handleMembershipPaymentMutation = useMutation({
    mutationFn: async ({ id, action, notes }: { id: number; action: 'approve' | 'reject'; notes?: string }) => {
      const response = await apiRequest('POST', `/api/admin/membership-payments/${id}/${action}`, { notes });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "ดำเนินการสำเร็จ",
        description: "การชำระเงินได้รับการอัปเดตแล้ว",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/membership-payments'] });
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถดำเนินการได้",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!user?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <Shield className="h-8 w-8 text-amber-500" />
              <h1 className="text-2xl font-bold text-gray-900">ไม่มีสิทธิ์เข้าถึง</h1>
            </div>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                คุณไม่มีสิทธิ์ในการเข้าถึงหน้าแอดมิน กรุณาติดต่อผู้ดูแลระบบ
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleUpdateLoanSettings = () => {
    updateSystemSettingsMutation.mutate({ type: 'loan', settings: loanSettings });
  };

  const handleUpdateMembershipSettings = () => {
    updateSystemSettingsMutation.mutate({ type: 'membership', settings: membershipSettings });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <span>แผงควบคุมแอดมิน</span>
          </h1>
          <p className="text-gray-600 mt-1">จัดการระบบและตั้งค่าต่างๆ แบบยืดหยุ่น</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>ภาพรวม</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>ผู้ใช้</span>
          </TabsTrigger>
          <TabsTrigger value="loans" className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4" />
            <span>สินเชื่อ</span>
          </TabsTrigger>
          <TabsTrigger value="membership" className="flex items-center space-x-2">
            <Crown className="w-4 h-4" />
            <span>สมาชิก</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>ตั้งค่า</span>
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ผู้ใช้ทั้งหมด</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {systemStats?.totalUsers?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CreditCard className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">สินเชื่อทั้งหมด</p>
                    <p className="text-2xl font-bold text-green-600">
                      {systemStats?.totalLoans?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">สินเชื่อที่ใช้งาน</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {systemStats?.activeLoans?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Crown className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">สมาชิกพรีเมียม</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {Array.isArray(membershipPayments) ? membershipPayments.filter((p: any) => p.status === 'approved')?.length || '0' : '0'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* การตั้งค่าด่วน */}
          <Card>
            <CardHeader>
              <CardTitle>การตั้งค่าด่วน</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold mb-2">อัตราดอกเบี้ยรายวัน</h3>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={loanSettings.dailyInterestRate}
                      onChange={(e) => setLoanSettings(prev => ({ 
                        ...prev, 
                        dailyInterestRate: Number(e.target.value) 
                      }))}
                      className="w-20"
                    />
                    <span className="text-sm text-gray-600">%/วัน</span>
                  </div>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold mb-2">ขั้นต่ำการขอสินเชื่อ</h3>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={loanSettings.minLoanAmount}
                      onChange={(e) => setLoanSettings(prev => ({ 
                        ...prev, 
                        minLoanAmount: Number(e.target.value) 
                      }))}
                      className="w-24"
                    />
                    <span className="text-sm text-gray-600">บาท</span>
                  </div>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold mb-2">ค่าสมาชิกรายเดือน</h3>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={membershipSettings.monthlyFee}
                      onChange={(e) => setMembershipSettings(prev => ({ 
                        ...prev, 
                        monthlyFee: Number(e.target.value) 
                      }))}
                      className="w-20"
                    />
                    <span className="text-sm text-gray-600">บาท</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <Button 
                  onClick={handleUpdateLoanSettings}
                  disabled={updateSystemSettingsMutation.isPending}
                  className="flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>บันทึกการตั้งค่าสินเชื่อ</span>
                </Button>
                <Button 
                  onClick={handleUpdateMembershipSettings}
                  disabled={updateSystemSettingsMutation.isPending}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>บันทึกการตั้งค่าสมาชิก</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>จัดการผู้ใช้</CardTitle>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.isArray(allUsers) && allUsers.map((userData: any) => (
                    <div key={userData.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-bold">
                            {userData.firstName?.[0] || userData.email?.[0] || 'U'}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {userData.firstName ? `${userData.firstName} ${userData.lastName || ''}` : 'ผู้ใช้'}
                          </h3>
                          <p className="text-sm text-gray-500">{userData.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary">LV.{userData.level || 1}</Badge>
                            <Badge variant="outline">{userData.xp || 0} XP</Badge>
                            {userData.isAdmin && <Badge className="bg-red-500">แอดมิน</Badge>}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          ดูรายละเอียด
                        </Button>
                        {!userData.isAdmin && (
                          <Button size="sm" variant="destructive">
                            แบน
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Loans Tab */}
        <TabsContent value="loans" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>จัดการสินเชื่อ</CardTitle>
            </CardHeader>
            <CardContent>
              {loansLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.isArray(allLoans) && allLoans.map((loan: any) => (
                    <div key={loan.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-semibold">฿{Number(loan.amount).toLocaleString()}</h3>
                        <p className="text-sm text-gray-500">
                          {loan.user?.firstName || 'ผู้ใช้'} • {loan.termDays} วัน • 
                          {new Date(loan.createdAt).toLocaleDateString('th-TH')}
                        </p>
                        <Badge className={`mt-1 ${
                          loan.status === 'pending' ? 'bg-yellow-500' :
                          loan.status === 'approved' ? 'bg-green-500' :
                          loan.status === 'rejected' ? 'bg-red-500' : 'bg-gray-500'
                        } text-white`}>
                          {loan.status === 'pending' ? 'รอพิจารณา' :
                           loan.status === 'approved' ? 'อนุมัติแล้ว' :
                           loan.status === 'rejected' ? 'ปฏิเสธ' : loan.status}
                        </Badge>
                      </div>
                      {loan.status === 'pending' && (
                        <div className="flex space-x-2">
                          <Button size="sm" variant="default">
                            อนุมัติ
                          </Button>
                          <Button size="sm" variant="destructive">
                            ปฏิเสธ
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Membership Tab */}
        <TabsContent value="membership" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>จัดการการชำระเงินสมาชิก</CardTitle>
            </CardHeader>
            <CardContent>
              {paymentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.isArray(membershipPayments) && membershipPayments.filter((p: any) => p.status === 'pending').map((payment: any) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-semibold">฿{Number(payment.amount).toLocaleString()}</h3>
                        <p className="text-sm text-gray-500">
                          {payment.user?.firstName || 'ผู้ใช้'} • 
                          {new Date(payment.createdAt).toLocaleDateString('th-TH')}
                        </p>
                        {payment.notes && (
                          <p className="text-sm text-gray-600 mt-1">หมายเหตุ: {payment.notes}</p>
                        )}
                        {payment.proofImageUrl && (
                          <a 
                            href={payment.proofImageUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            ดูหลักฐานการโอนเงิน
                          </a>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleMembershipPaymentMutation.mutate({ 
                            id: payment.id, 
                            action: 'approve' 
                          })}
                          disabled={handleMembershipPaymentMutation.isPending}
                        >
                          อนุมัติ
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleMembershipPaymentMutation.mutate({ 
                            id: payment.id, 
                            action: 'reject',
                            notes: 'ไม่พบหลักฐานการโอนเงินที่ถูกต้อง'
                          })}
                          disabled={handleMembershipPaymentMutation.isPending}
                        >
                          ปฏิเสธ
                        </Button>
                      </div>
                    </div>
                  ))}
                  {Array.isArray(membershipPayments) && membershipPayments.filter((p: any) => p.status === 'pending').length === 0 && (
                    <div className="text-center py-8">
                      <Crown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">ไม่มีการชำระเงินที่รอการอนุมัติ</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          {/* Loan Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>ตั้งค่าระบบสินเชื่อ แบบยืดหยุ่น</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minLoanAmount">จำนวนเงินกู้ขั้นต่ำ (บาท)</Label>
                  <Input
                    id="minLoanAmount"
                    type="number"
                    value={loanSettings.minLoanAmount}
                    onChange={(e) => setLoanSettings(prev => ({ 
                      ...prev, 
                      minLoanAmount: Number(e.target.value) 
                    }))}
                  />
                  <p className="text-xs text-gray-500 mt-1">ปัจจุบัน: ฿{loanSettings.minLoanAmount.toLocaleString()}</p>
                </div>
                <div>
                  <Label htmlFor="maxLoanAmount">จำนวนเงินกู้สูงสุด (บาท)</Label>
                  <Input
                    id="maxLoanAmount"
                    type="number"
                    value={loanSettings.maxLoanAmount}
                    onChange={(e) => setLoanSettings(prev => ({ 
                      ...prev, 
                      maxLoanAmount: Number(e.target.value) 
                    }))}
                  />
                  <p className="text-xs text-gray-500 mt-1">ปัจจุบัน: ฿{loanSettings.maxLoanAmount.toLocaleString()}</p>
                </div>
                <div>
                  <Label htmlFor="baseInterestRate">อัตราดอกเบี้ยพื้นฐาน (%/ปี)</Label>
                  <Input
                    id="baseInterestRate"
                    type="number"
                    step="0.1"
                    value={loanSettings.baseInterestRate}
                    onChange={(e) => setLoanSettings(prev => ({ 
                      ...prev, 
                      baseInterestRate: Number(e.target.value) 
                    }))}
                  />
                  <p className="text-xs text-gray-500 mt-1">ปัจจุบัน: {loanSettings.baseInterestRate}% ต่อปี</p>
                </div>
                <div>
                  <Label htmlFor="dailyInterestRate">อัตราดอกเบี้ยรายวัน (%/วัน)</Label>
                  <Input
                    id="dailyInterestRate"
                    type="number"
                    step="0.01"
                    value={loanSettings.dailyInterestRate}
                    onChange={(e) => setLoanSettings(prev => ({ 
                      ...prev, 
                      dailyInterestRate: Number(e.target.value) 
                    }))}
                  />
                  <p className="text-xs text-gray-500 mt-1">ปัจจุบัน: {loanSettings.dailyInterestRate}% ต่อวัน (เทียบเท่า {(loanSettings.dailyInterestRate * 365).toFixed(1)}% ต่อปี)</p>
                </div>
                <div>
                  <Label htmlFor="minLoanTerm">ระยะเวลาขั้นต่ำ (วัน)</Label>
                  <Input
                    id="minLoanTerm"
                    type="number"
                    value={loanSettings.minLoanTerm}
                    onChange={(e) => setLoanSettings(prev => ({ 
                      ...prev, 
                      minLoanTerm: Number(e.target.value) 
                    }))}
                  />
                  <p className="text-xs text-gray-500 mt-1">ปัจจุบัน: {loanSettings.minLoanTerm} วัน</p>
                </div>
                <div>
                  <Label htmlFor="maxLoanTerm">ระยะเวลาสูงสุด (วัน)</Label>
                  <Input
                    id="maxLoanTerm"
                    type="number"
                    value={loanSettings.maxLoanTerm}
                    onChange={(e) => setLoanSettings(prev => ({ 
                      ...prev, 
                      maxLoanTerm: Number(e.target.value) 
                    }))}
                  />
                  <p className="text-xs text-gray-500 mt-1">ปัจจุบัน: {loanSettings.maxLoanTerm} วัน ({Math.round(loanSettings.maxLoanTerm / 30)} เดือน)</p>
                </div>
              </div>
              <Button 
                onClick={handleUpdateLoanSettings}
                disabled={updateSystemSettingsMutation.isPending}
                className="w-full flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{updateSystemSettingsMutation.isPending ? "กำลังบันทึก..." : "บันทึกการตั้งค่าสินเชื่อ"}</span>
              </Button>
            </CardContent>
          </Card>

          {/* Membership Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Crown className="w-5 h-5" />
                <span>ตั้งค่าระบบสมาชิก แบบยืดหยุ่น</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="monthlyFee">ค่าสมาชิกรายเดือน (บาท)</Label>
                  <Input
                    id="monthlyFee"
                    type="number"
                    value={membershipSettings.monthlyFee}
                    onChange={(e) => setMembershipSettings(prev => ({ 
                      ...prev, 
                      monthlyFee: Number(e.target.value) 
                    }))}
                  />
                  <p className="text-xs text-gray-500 mt-1">ปัจจุบัน: ฿{membershipSettings.monthlyFee}/เดือน</p>
                </div>
                <div>
                  <Label htmlFor="creditBonus">โบนัสเครดิต (%)</Label>
                  <Input
                    id="creditBonus"
                    type="number"
                    value={membershipSettings.premiumBenefits.creditBonus}
                    onChange={(e) => setMembershipSettings(prev => ({ 
                      ...prev, 
                      premiumBenefits: {
                        ...prev.premiumBenefits,
                        creditBonus: Number(e.target.value)
                      }
                    }))}
                  />
                  <p className="text-xs text-gray-500 mt-1">สมาชิกพรีเมียมได้เครดิตเพิ่ม {membershipSettings.premiumBenefits.creditBonus}%</p>
                </div>
                <div>
                  <Label htmlFor="interestReduction">ลดอัตราดอกเบี้ย (%)</Label>
                  <Input
                    id="interestReduction"
                    type="number"
                    step="0.1"
                    value={membershipSettings.premiumBenefits.interestReduction}
                    onChange={(e) => setMembershipSettings(prev => ({ 
                      ...prev, 
                      premiumBenefits: {
                        ...prev.premiumBenefits,
                        interestReduction: Number(e.target.value)
                      }
                    }))}
                  />
                  <p className="text-xs text-gray-500 mt-1">สมาชิกพรีเมียมได้ลดดอกเบี้ย {membershipSettings.premiumBenefits.interestReduction}%</p>
                </div>
                <div>
                  <Label htmlFor="xpBonus">โบนัส XP (%)</Label>
                  <Input
                    id="xpBonus"
                    type="number"
                    value={membershipSettings.premiumBenefits.xpBonus}
                    onChange={(e) => setMembershipSettings(prev => ({ 
                      ...prev, 
                      premiumBenefits: {
                        ...prev.premiumBenefits,
                        xpBonus: Number(e.target.value)
                      }
                    }))}
                  />
                  <p className="text-xs text-gray-500 mt-1">สมาชิกพรีเมียมได้ XP เพิ่ม {membershipSettings.premiumBenefits.xpBonus}%</p>
                </div>
              </div>
              <Button 
                onClick={handleUpdateMembershipSettings}
                disabled={updateSystemSettingsMutation.isPending}
                className="w-full flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{updateSystemSettingsMutation.isPending ? "กำลังบันทึก..." : "บันทึกการตั้งค่าสมาชิก"}</span>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}