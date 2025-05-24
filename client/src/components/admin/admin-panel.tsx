import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  Settings, 
  TrendingUp, 
  Shield,
  Crown,
  Ban,
  Plus,
  Minus,
  Save
} from "lucide-react";
import type { User } from "@shared/schema";

export default function AdminPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [xpChange, setXpChange] = useState<string>("");
  const [fraudData, setFraudData] = useState({
    name: "",
    phoneNumber: "",
    accountNumber: "",
    reason: "",
    severity: "medium"
  });
  const [settings, setSettings] = useState({
    level1Rate: "5",
    level2Rate: "3",
    level3Rate: "2",
    level4Rate: "1",
    membershipFee: "100",
    postXPCost: "5",
    likeXPCost: "1",
    dislikeXPCost: "2"
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/admin/stats'],
  });

  const updateXPMutation = useMutation({
    mutationFn: async ({ userId, xpChange }: { userId: string; xpChange: number }) => {
      const response = await apiRequest('PATCH', `/api/admin/users/${userId}/xp`, { xpChange });
      return response.json();
    },
    onSuccess: () => {
      setXpChange("");
      toast({
        title: "อัปเดต XP สำเร็จ",
        description: "XP ของผู้ใช้ถูกเปลี่ยนแปลงแล้ว",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
    onError: () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัปเดต XP ได้",
        variant: "destructive",
      });
    },
  });

  const banUserMutation = useMutation({
    mutationFn: async ({ userId, banned }: { userId: string; banned: boolean }) => {
      const response = await apiRequest('PATCH', `/api/admin/users/${userId}/ban`, { banned });
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: variables.banned ? "ระงับผู้ใช้สำเร็จ" : "ยกเลิกการระงับสำเร็จ",
        description: variables.banned ? "ผู้ใช้ถูกระงับแล้ว" : "ยกเลิกการระงับผู้ใช้แล้ว",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
    onError: () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเปลี่ยนสถานะผู้ใช้ได้",
        variant: "destructive",
      });
    },
  });

  const addFraudMutation = useMutation({
    mutationFn: async (data: typeof fraudData) => {
      const response = await apiRequest('POST', '/api/fraud', data);
      return response.json();
    },
    onSuccess: () => {
      setFraudData({
        name: "",
        phoneNumber: "",
        accountNumber: "",
        reason: "",
        severity: "medium"
      });
      toast({
        title: "เพิ่มข้อมูลโกงสำเร็จ",
        description: "ข้อมูลถูกเพิ่มในระบบแล้ว",
      });
    },
    onError: () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเพิ่มข้อมูลได้",
        variant: "destructive",
      });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: Record<string, string>) => {
      const promises = Object.entries(settings).map(([key, value]) =>
        apiRequest('POST', '/api/admin/settings', { key, value })
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      toast({
        title: "บันทึกการตั้งค่าสำเร็จ",
        description: "การตั้งค่าระบบถูกอัปเดตแล้ว",
      });
    },
    onError: () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกการตั้งค่าได้",
        variant: "destructive",
      });
    },
  });

  const handleUpdateXP = () => {
    const change = parseInt(xpChange);
    if (!selectedUserId || !change || isNaN(change)) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณาเลือกผู้ใช้และใส่จำนวน XP",
        variant: "destructive",
      });
      return;
    }
    updateXPMutation.mutate({ userId: selectedUserId, xpChange: change });
  };

  const handleBanUser = (userId: string, banned: boolean) => {
    banUserMutation.mutate({ userId, banned });
  };

  const handleAddFraud = () => {
    if (!fraudData.name || !fraudData.reason) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณากรอกชื่อและเหตุผล",
        variant: "destructive",
      });
      return;
    }
    addFraudMutation.mutate(fraudData);
  };

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(settings);
  };

  const getLevelBadge = (level: number) => {
    const colors = {
      1: "bg-gray-500",
      2: "bg-blue-500", 
      3: "bg-emerald-500",
      4: "bg-yellow-500"
    };
    return (
      <Badge className={`${colors[level as keyof typeof colors]} text-white text-xs`}>
        <Crown className="w-3 h-3 mr-1" />
        LV.{level}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">ผู้ใช้ทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">โพสต์ทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalPosts || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">เงินกู้ทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalLoans || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">เงินกู้ที่ใช้งาน</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.activeLoans || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">จัดการผู้ใช้</TabsTrigger>
          <TabsTrigger value="fraud">จัดการโกง</TabsTrigger>
          <TabsTrigger value="settings">ตั้งค่าระบบ</TabsTrigger>
          <TabsTrigger value="xp">จัดการ XP</TabsTrigger>
        </TabsList>

        {/* User Management */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>จัดการผู้ใช้</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={user.profileImageUrl || undefined} />
                        <AvatarFallback>
                          {user.firstName?.[0] || user.email?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">
                            {user.firstName ? `${user.firstName} ${user.lastName || ''}` : 'ผู้ใช้'}
                          </span>
                          {getLevelBadge(user.level)}
                          {user.isAdmin && (
                            <Badge variant="secondary">แอดมิน</Badge>
                          )}
                          {user.isBanned && (
                            <Badge variant="destructive">ถูกระงับ</Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email} • {user.xp} XP
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedUserId(user.id)}
                        className={selectedUserId === user.id ? "bg-blue-50 border-blue-500" : ""}
                      >
                        เลือก
                      </Button>
                      <Button
                        variant={user.isBanned ? "default" : "destructive"}
                        size="sm"
                        onClick={() => handleBanUser(user.id, !user.isBanned)}
                        disabled={banUserMutation.isPending}
                      >
                        <Ban className="w-4 h-4 mr-1" />
                        {user.isBanned ? "ยกเลิกระงับ" : "ระงับ"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* XP Management */}
        <TabsContent value="xp" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>จัดการ XP ผู้ใช้</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>ผู้ใช้ที่เลือก</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  {selectedUserId ? (
                    (() => {
                      const user = users.find(u => u.id === selectedUserId);
                      return user ? (
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.profileImageUrl || undefined} />
                            <AvatarFallback className="text-xs">
                              {user.firstName?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span>{user.firstName || 'ผู้ใช้'}</span>
                          <span className="text-sm text-gray-500">({user.xp} XP)</span>
                        </div>
                      ) : null;
                    })()
                  ) : (
                    <span className="text-gray-500">กรุณาเลือกผู้ใช้จากรายการด้านบน</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="xpChange">จำนวน XP</Label>
                  <Input
                    id="xpChange"
                    type="number"
                    placeholder="เช่น +100 หรือ -50"
                    value={xpChange}
                    onChange={(e) => setXpChange(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleUpdateXP}
                    disabled={updateXPMutation.isPending || !selectedUserId || !xpChange}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    อัปเดต XP
                  </Button>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => setXpChange(prev => prev.startsWith('-') ? prev.slice(1) : '-' + prev)}
                    className="w-full"
                  >
                    <Minus className="w-4 h-4 mr-2" />
                    สลับ +/-
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fraud Management */}
        <TabsContent value="fraud" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>เพิ่มข้อมูลโกง</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fraudName">ชื่อ-นามสกุล *</Label>
                  <Input
                    id="fraudName"
                    value={fraudData.name}
                    onChange={(e) => setFraudData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="ชื่อผู้กระทำผิด"
                  />
                </div>
                <div>
                  <Label htmlFor="fraudPhone">เบอร์โทรศัพท์</Label>
                  <Input
                    id="fraudPhone"
                    value={fraudData.phoneNumber}
                    onChange={(e) => setFraudData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    placeholder="เบอร์โทรศัพท์"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fraudAccount">เลขบัญชี</Label>
                  <Input
                    id="fraudAccount"
                    value={fraudData.accountNumber}
                    onChange={(e) => setFraudData(prev => ({ ...prev, accountNumber: e.target.value }))}
                    placeholder="เลขบัญชีธนาคาร"
                  />
                </div>
                <div>
                  <Label htmlFor="fraudSeverity">ระดับความเสี่ยง</Label>
                  <select
                    id="fraudSeverity"
                    value={fraudData.severity}
                    onChange={(e) => setFraudData(prev => ({ ...prev, severity: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="low">ความเสี่ยงต่ำ</option>
                    <option value="medium">ความเสี่ยงปานกลาง</option>
                    <option value="high">ความเสี่ยงสูง</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="fraudReason">เหตุผล/รายละเอียด *</Label>
                <Input
                  id="fraudReason"
                  value={fraudData.reason}
                  onChange={(e) => setFraudData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="อธิบายเหตุผลที่รายงาน"
                />
              </div>

              <Button
                onClick={handleAddFraud}
                disabled={addFraudMutation.isPending || !fraudData.name || !fraudData.reason}
                className="w-full"
              >
                เพิ่มข้อมูลโกง
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ตั้งค่าระบบ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Interest Rates */}
              <div>
                <h3 className="text-lg font-semibold mb-4">อัตราดอกเบี้ย (%)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Level 1</Label>
                    <Input
                      type="number"
                      value={settings.level1Rate}
                      onChange={(e) => setSettings(prev => ({ ...prev, level1Rate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Level 2</Label>
                    <Input
                      type="number"
                      value={settings.level2Rate}
                      onChange={(e) => setSettings(prev => ({ ...prev, level2Rate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Level 3</Label>
                    <Input
                      type="number"
                      value={settings.level3Rate}
                      onChange={(e) => setSettings(prev => ({ ...prev, level3Rate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Level 4</Label>
                    <Input
                      type="number"
                      value={settings.level4Rate}
                      onChange={(e) => setSettings(prev => ({ ...prev, level4Rate: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* XP Settings */}
              <div>
                <h3 className="text-lg font-semibold mb-4">ตั้งค่า XP</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>XP การโพสต์ (-)</Label>
                    <Input
                      type="number"
                      value={settings.postXPCost}
                      onChange={(e) => setSettings(prev => ({ ...prev, postXPCost: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>XP การไลค์ (-)</Label>
                    <Input
                      type="number"
                      value={settings.likeXPCost}
                      onChange={(e) => setSettings(prev => ({ ...prev, likeXPCost: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>XP การดิสไลค์ (-)</Label>
                    <Input
                      type="number"
                      value={settings.dislikeXPCost}
                      onChange={(e) => setSettings(prev => ({ ...prev, dislikeXPCost: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>ค่าสมัครสมาชิก (บาท)</Label>
                    <Input
                      type="number"
                      value={settings.membershipFee}
                      onChange={(e) => setSettings(prev => ({ ...prev, membershipFee: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSaveSettings}
                disabled={updateSettingsMutation.isPending}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                บันทึกการตั้งค่า
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
