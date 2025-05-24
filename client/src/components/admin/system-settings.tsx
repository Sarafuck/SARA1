import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Save, Settings, DollarSign, Star, Calendar, AlertTriangle } from "lucide-react";

interface SystemSetting {
  id: number;
  key: string;
  value: string;
  description: string;
  dataType: string;
  category: string;
}

export default function SystemSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingSettings, setEditingSettings] = useState<Record<string, string>>({});

  // ดึงการตั้งค่าระบบทั้งหมด
  const { data: settings = [], isLoading } = useQuery<SystemSetting[]>({
    queryKey: ['/api/admin/settings'],
  });

  // อัปเดตการตั้งค่า
  const updateSettingMutation = useMutation({
    mutationFn: async (data: { key: string; value: string }) => {
      const response = await apiRequest('PUT', '/api/admin/settings', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "บันทึกสำเร็จ",
        description: "การตั้งค่าได้รับการอัปเดตแล้ว",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
      setEditingSettings({});
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถบันทึกการตั้งค่าได้",
        variant: "destructive",
      });
    },
  });

  const handleValueChange = (key: string, value: string) => {
    setEditingSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = (setting: SystemSetting) => {
    const newValue = editingSettings[setting.key] ?? setting.value;
    updateSettingMutation.mutate({ key: setting.key, value: newValue });
  };

  const renderSettingInput = (setting: SystemSetting) => {
    const currentValue = editingSettings[setting.key] ?? setting.value;
    
    switch (setting.dataType) {
      case 'number':
        return (
          <Input
            type="number"
            value={currentValue}
            onChange={(e) => handleValueChange(setting.key, e.target.value)}
            step={setting.key.includes('rate') ? '0.01' : '1'}
          />
        );
      case 'boolean':
        return (
          <select 
            value={currentValue}
            onChange={(e) => handleValueChange(setting.key, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="true">เปิดใช้งาน</option>
            <option value="false">ปิดใช้งาน</option>
          </select>
        );
      case 'json':
        return (
          <Textarea
            value={currentValue}
            onChange={(e) => handleValueChange(setting.key, e.target.value)}
            rows={4}
            placeholder="JSON format"
          />
        );
      default:
        return (
          <Input
            value={currentValue}
            onChange={(e) => handleValueChange(setting.key, e.target.value)}
          />
        );
    }
  };

  const getDefaultSettings = () => [
    // การตั้งค่าระบบกู้เงิน
    { key: 'max_loan_level_1', value: '10000', description: 'วงเงินกู้สูงสุดสำหรับ Level 1', dataType: 'number', category: 'lending' },
    { key: 'max_loan_level_2', value: '20000', description: 'วงเงินกู้สูงสุดสำหรับ Level 2', dataType: 'number', category: 'lending' },
    { key: 'max_loan_level_3', value: '30000', description: 'วงเงินกู้สูงสุดสำหรับ Level 3', dataType: 'number', category: 'lending' },
    { key: 'max_loan_level_4', value: '50000', description: 'วงเงินกู้สูงสุดสำหรับ Level 4', dataType: 'number', category: 'lending' },
    
    { key: 'interest_rate_level_1', value: '5.0', description: 'อัตราดอกเบี้ยสำหรับ Level 1 (%)', dataType: 'number', category: 'lending' },
    { key: 'interest_rate_level_2', value: '3.0', description: 'อัตราดอกเบี้ยสำหรับ Level 2 (%)', dataType: 'number', category: 'lending' },
    { key: 'interest_rate_level_3', value: '2.0', description: 'อัตราดอกเบี้ยสำหรับ Level 3 (%)', dataType: 'number', category: 'lending' },
    { key: 'interest_rate_level_4', value: '1.0', description: 'อัตราดอกเบี้ยสำหรับ Level 4 (%)', dataType: 'number', category: 'lending' },
    
    { key: 'max_loan_term_days', value: '90', description: 'ระยะเวลากู้สูงสุด (วัน)', dataType: 'number', category: 'lending' },
    { key: 'min_loan_term_days', value: '7', description: 'ระยะเวลากู้ขั้นต่ำ (วัน)', dataType: 'number', category: 'lending' },
    
    // การตั้งค่าระบบ XP
    { key: 'xp_post_create', value: '10', description: 'XP ที่ได้จากการโพสต์', dataType: 'number', category: 'xp' },
    { key: 'xp_post_like', value: '2', description: 'XP ที่ได้จากการไลค์โพสต์', dataType: 'number', category: 'xp' },
    { key: 'xp_comment_create', value: '5', description: 'XP ที่ได้จากการคอมเมนต์', dataType: 'number', category: 'xp' },
    { key: 'xp_loan_repay_ontime', value: '50', description: 'XP ที่ได้จากการชำระเงินตรงเวลา', dataType: 'number', category: 'xp' },
    { key: 'xp_loan_repay_late', value: '-100', description: 'XP ที่ถูกหักจากการชำระล่าช้า', dataType: 'number', category: 'xp' },
    
    // การตั้งค่าระดับ
    { key: 'level_2_required_xp', value: '500', description: 'XP ที่ต้องการสำหรับ Level 2', dataType: 'number', category: 'levels' },
    { key: 'level_3_required_xp', value: '1500', description: 'XP ที่ต้องการสำหรับ Level 3', dataType: 'number', category: 'levels' },
    { key: 'level_4_required_xp', value: '3000', description: 'XP ที่ต้องการสำหรับ Level 4', dataType: 'number', category: 'levels' },
    
    // การตั้งค่าทั่วไป
    { key: 'membership_fee', value: '100', description: 'ค่าสมาชิก (บาท)', dataType: 'number', category: 'general' },
    { key: 'max_active_loans', value: '3', description: 'จำนวนเงินกู้ที่ยังไม่ชำระสูงสุดต่อคน', dataType: 'number', category: 'general' },
    { key: 'auto_approve_threshold', value: '5000', description: 'อนุมัติอัตโนมัติสำหรับเงินกู้ต่ำกว่า (บาท)', dataType: 'number', category: 'general' },
  ];

  // รวมการตั้งค่าที่มีอยู่กับค่าเริ่มต้น
  const allSettings = [...settings];
  const defaultSettings = getDefaultSettings();
  
  defaultSettings.forEach(defaultSetting => {
    if (!settings.find(s => s.key === defaultSetting.key)) {
      allSettings.push({
        id: 0,
        ...defaultSetting
      });
    }
  });

  const settingsByCategory = allSettings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, SystemSetting[]>);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">กำลังโหลดการตั้งค่า...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">ตั้งค่าระบบ</h2>
        <Badge variant="secondary" className="text-sm">
          <Settings className="w-4 h-4 mr-1" />
          ปรับแต่งได้ยืดหยุ่น
        </Badge>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-blue-800">
            <AlertTriangle className="w-5 h-5" />
            <div>
              <div className="font-semibold">หมายเหตุสำคัญ</div>
              <div className="text-sm">
                การเปลี่ยนแปลงการตั้งค่าจะมีผลทันทีกับระบบ กรุณาตรวจสอบให้ดีก่อนบันทึก
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="lending" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="lending" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            ระบบกู้เงิน
          </TabsTrigger>
          <TabsTrigger value="xp" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            ระบบ XP
          </TabsTrigger>
          <TabsTrigger value="levels" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            ระดับผู้ใช้
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            ทั่วไป
          </TabsTrigger>
        </TabsList>

        {Object.entries(settingsByCategory).map(([category, categorySettings]) => (
          <TabsContent key={category} value={category}>
            <div className="space-y-4">
              {categorySettings.map((setting) => (
                <Card key={setting.key}>
                  <CardHeader>
                    <CardTitle className="text-lg">{setting.description}</CardTitle>
                    <CardDescription>
                      Key: <code className="bg-gray-100 px-2 py-1 rounded">{setting.key}</code>
                      {' | '}
                      Type: <Badge variant="outline">{setting.dataType}</Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>ค่าปัจจุบัน</Label>
                      {renderSettingInput(setting)}
                    </div>
                    <div className="flex justify-end">
                      <Button
                        onClick={() => handleSave(setting)}
                        disabled={updateSettingMutation.isPending}
                        size="sm"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {updateSettingMutation.isPending ? "กำลังบันทึก..." : "บันทึก"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <h3 className="font-semibold text-green-800 mb-2">ตัวอย่างการใช้งาน</h3>
          <div className="text-sm text-green-700 space-y-1">
            <div>• ปรับวงเงินกู้ตามระดับผู้ใช้</div>
            <div>• เปลี่ยนอัตราดอกเบี้ยตามความต้องการ</div>
            <div>• ตั้งค่า XP ที่ได้รับจากกิจกรรมต่างๆ</div>
            <div>• กำหนดเงื่อนไขการขึ้นระดับ</div>
            <div>• เปิด/ปิดการอนุมัติอัตโนมัติ</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}