import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Calculator, Clock, DollarSign } from "lucide-react";
import type { UserWithStats } from "@shared/schema";

interface LoanRequestFormProps {
  userStats: UserWithStats;
  onClose: () => void;
}

export default function LoanRequestForm({ userStats, onClose }: LoanRequestFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState<number>(10000);
  const [termDays, setTermDays] = useState<number>(30);
  const [purpose, setPurpose] = useState("");
  const [calculatedTerms, setCalculatedTerms] = useState<any>(null);

  // คำนวณเงื่อนไขการกู้
  const calculateTermsMutation = useMutation({
    mutationFn: async (data: { amount: number; termDays: number }) => {
      const response = await apiRequest('POST', '/api/loans/calculate', data);
      return response.json();
    },
    onSuccess: (data) => {
      setCalculatedTerms(data);
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถคำนวณเงื่อนไขได้",
        variant: "destructive",
      });
    },
  });

  // ส่งคำขอกู้เงิน
  const createLoanMutation = useMutation({
    mutationFn: async (data: { amount: number; loanTermDays: number; loanPurpose: string }) => {
      const response = await apiRequest('POST', '/api/loans', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "ส่งคำขอสำเร็จ",
        description: "คำขอกู้เงินของคุณอยู่ระหว่างการพิจารณา",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/loans'] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถส่งคำขอได้",
        variant: "destructive",
      });
    },
  });

  const handleCalculate = () => {
    if (amount > 0 && termDays > 0) {
      calculateTermsMutation.mutate({ amount, termDays });
    }
  };

  const handleSubmit = async () => {
    // Validate form
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        variant: "destructive",
        title: "กรุณาระบุจำนวนเงิน",
        description: "จำนวนเงินต้องมากกว่า 0"
      });
      return;
    }

    if (!termDays || termDays < 7 || termDays > 90) {
      toast({
        variant: "destructive",
        title: "กรุณาระบุระยะเวลา",
        description: "ระยะเวลาต้องอยู่ระหว่าง 7-90 วัน"
      });
      return;
    }

    if (!purpose.trim()) {
      toast({
        variant: "destructive",
        title: "กรุณาระบุเหตุผล",
        description: "โปรดระบุเหตุผลในการขอกู้"
      });
      return;
    }

    try {
      await createLoanMutation.mutateAsync({
        amount: parseFloat(amount),
        loanTermDays: termDays,
        loanPurpose: purpose.trim()
      });
      toast({
        title: "ส่งคำขอกู้สำเร็จ",
        description: "กรุณารอการพิจารณาจากแอดมิน"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: error instanceof Error ? error.message : "ไม่สามารถส่งคำขอกู้ได้"
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          ขอกู้เงิน
        </CardTitle>
        <CardDescription>
          กรอกข้อมูลเพื่อขอกู้เงินตามระดับของคุณ
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* ข้อมูลผู้ใช้ปัจจุบัน */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <div className="text-center">
            <Badge variant="secondary" className="mb-2">ระดับปัจจุบัน</Badge>
            <div className="text-2xl font-bold text-blue-600">Level {userStats.level}</div>
          </div>
          <div className="text-center">
            <Badge variant="secondary" className="mb-2">วงเงินคงเหลือ</Badge>
            <div className="text-2xl font-bold text-green-600">
              ฿{userStats.availableCredit.toLocaleString()}
            </div>
          </div>
          <div className="text-center">
            <Badge variant="secondary" className="mb-2">อัตราดอกเบี้ย</Badge>
            <div className="text-2xl font-bold text-orange-600">{userStats.interestRate}%</div>
          </div>
        </div>

        {/* จำนวนเงิน */}
        <div className="space-y-2">
          <Label htmlFor="amount">จำนวนเงินที่ต้องการกู้ (บาท)</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            min="1000"
            max={userStats.availableCredit}
            step="1000"
          />
          <div className="text-sm text-gray-500">
            ขั้นต่ำ 1,000 บาท - สูงสุด {userStats.availableCredit.toLocaleString()} บาท
          </div>
        </div>

        {/* ระยะเวลากู้ */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            ระยะเวลากู้ (วัน): {termDays} วัน
          </Label>
          <Slider
            value={[termDays]}
            onValueChange={(value) => setTermDays(value[0])}
            min={7}
            max={90}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>7 วัน (ขั้นต่ำ)</span>
            <span>90 วัน (สูงสุด)</span>
          </div>
        </div>

        {/* เหตุผลการขอกู้ */}
        <div className="space-y-2">
          <Label htmlFor="purpose">เหตุผลการขอกู้เงิน</Label>
          <Textarea
            id="purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="โปรดระบุเหตุผลที่ต้องการกู้เงิน เช่น ค่าครองชีพ ค่ารักษาพยาบาล ทุนธุรกิจ..."
            rows={3}
          />
        </div>

        {/* ปุ่มคำนวณ */}
        <Button 
          onClick={handleCalculate}
          disabled={calculateTermsMutation.isPending}
          className="w-full"
          variant="outline"
        >
          <Calculator className="w-4 h-4 mr-2" />
          {calculateTermsMutation.isPending ? "กำลังคำนวณ..." : "คำนวณเงื่อนไข"}
        </Button>

        {/* แสดงผลการคำนวณ */}
        {calculatedTerms && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg text-green-800">เงื่อนไขการกู้</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">จำนวนเงินกู้</Label>
                  <div className="text-xl font-bold text-blue-600">
                    ฿{amount.toLocaleString()}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">อัตราดอกเบี้ย</Label>
                  <div className="text-xl font-bold text-orange-600">
                    {calculatedTerms.interestRate}%
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">ระยะเวลา</Label>
                  <div className="text-xl font-bold text-purple-600">
                    {calculatedTerms.termDays} วัน
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">ยอดรวมที่ต้องชำระ</Label>
                  <div className="text-xl font-bold text-red-600">
                    ฿{Math.round(calculatedTerms.totalAmount).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="text-sm text-green-700 bg-green-100 p-3 rounded">
                💡 <strong>หมายเหตุ:</strong> การชำระเงินตรงเวลาจะได้รับ XP เพิ่ม +50 คะแนน 
                หากชำระล่าช้าจะถูกหัก XP -100 คะแนน
              </div>
            </CardContent>
          </Card>
        )}

        {/* ปุ่มส่งคำขอ */}
        <div className="flex gap-3">
          <Button 
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            ยกเลิก
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={createLoanMutation.isPending || !calculatedTerms}
            className="flex-1"
          >
            {createLoanMutation.isPending ? "กำลังส่งคำขอ..." : "ส่งคำขอกู้เงิน"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}