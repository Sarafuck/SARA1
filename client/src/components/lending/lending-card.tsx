import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  DollarSign, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  CreditCard
} from "lucide-react";
import type { UserWithStats, Loan } from "@shared/schema";

interface LendingCardProps {
  userStats: UserWithStats;
}

export default function LendingCard({ userStats }: LendingCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loanAmount, setLoanAmount] = useState("");
  const [selectedLoanId, setSelectedLoanId] = useState<number | null>(null);

  const { data: loans = [] } = useQuery<Loan[]>({
    queryKey: ['/api/loans'],
  });

  const createLoanMutation = useMutation({
    mutationFn: async (data: { amount: number; loanTermDays: number; loanPurpose: string }) => {
      const response = await apiRequest('POST', '/api/loans', data);
      return response.json();
    },
    onSuccess: () => {
      setLoanAmount("");
      toast({
        title: "คำขอกู้เงินสำเร็จ",
        description: "คำขอของคุณอยู่ระหว่างการพิจารณา",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/loans'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถสร้างคำขอกู้เงินได้",
        variant: "destructive",
      });
    },
  });

  const repayLoanMutation = useMutation({
    mutationFn: async (loanId: number) => {
      const response = await apiRequest('PATCH', `/api/loans/${loanId}/repay`);
      return response.json();
    },
    onSuccess: () => {
      setSelectedLoanId(null);
      toast({
        title: "ชำระเงินสำเร็จ",
        description: "การชำระเงินของคุณเสร็จสิ้นแล้ว",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/loans'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถชำระเงินได้",
        variant: "destructive",
      });
    },
  });

  const handleLoanRequest = () => {
    const amount = parseFloat(loanAmount);
    
    if (!amount || amount <= 0) {
      toast({
        title: "กรุณาใส่จำนวนเงิน",
        description: "จำนวนเงินต้องมากกว่า 0",
        variant: "destructive",
      });
      return;
    }

    if (amount > (userStats.availableCredit || 0)) {
      toast({
        title: "วงเงินไม่เพียงพอ",
        description: `คุณสามารถกู้ได้สูงสุด ${userStats.availableCredit?.toLocaleString()} บาท`,
        variant: "destructive",
      });
      return;
    }

    if (!userStats.membershipPaid) {
      toast({
        title: "ต้องชำระค่าสมาชิกก่อน",
        description: "กรุณาชำระค่าสมาชิก 100 บาทเพื่อใช้บริการกู้เงิน",
        variant: "destructive",
      });
      return;
    }

    createLoanMutation.mutate({ amount });
  };

  const handleRepayLoan = (loanId: number) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะชำระเงินกู้นี้?')) {
      repayLoanMutation.mutate(loanId);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">รอพิจารณา</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-600">อนุมัติแล้ว</Badge>;
      case 'repaid':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">ชำระแล้ว</Badge>;
      case 'overdue':
        return <Badge variant="destructive">เกินกำหนด</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const activeLoans = loans.filter(loan => loan.status === 'approved');
  const pendingLoans = loans.filter(loan => loan.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Quick Loan Request */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <DollarSign className="w-5 h-5 mr-2 text-emerald-600" />
            กู้เงินด่วน
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Interest Rate and Credit Info */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-lg border border-emerald-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">อัตราดอกเบี้ย</div>
                <div className="text-lg font-bold text-emerald-600">{userStats.interestRate}%</div>
                <div className="text-xs text-gray-500">สำหรับ Level {userStats.level}</div>
              </div>
              <div>
                <div className="text-gray-600">วงเงินคงเหลือ</div>
                <div className="text-lg font-bold text-primary">
                  ฿{userStats.availableCredit?.toLocaleString() || '0'}
                </div>
                <div className="text-xs text-gray-500">จาก ฿{(userStats.level * 10000).toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Loan Request Form */}
          <div className="space-y-3">
            <Label htmlFor="loanAmount">จำนวนเงิน (บาท)</Label>
            <Input
              id="loanAmount"
              type="number"
              placeholder="5,000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              max={userStats.availableCredit || 0}
              min="1000"
              step="1000"
            />
            <div className="text-xs text-gray-500">
              จำนวนเงินขั้นต่ำ 1,000 บาท • ระยะเวลาชำระ 30 วัน
            </div>
          </div>

          {!userStats.membershipPaid ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>กรุณาชำระค่าสมาชิก 100 บาทเพื่อใช้บริการกู้เงิน</span>
              </div>
            </div>
          ) : (
            <Button
              onClick={handleLoanRequest}
              disabled={createLoanMutation.isPending || !loanAmount || parseFloat(loanAmount || "0") <= 0}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {createLoanMutation.isPending ? "กำลังส่งคำขอ..." : "ขอกู้เงิน"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Active Loans */}
      {activeLoans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Clock className="w-5 h-5 mr-2 text-orange-600" />
              เงินกู้ที่ต้องชำระ ({activeLoans.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeLoans.map((loan) => {
              const dueDate = new Date(loan.dueDate);
              const isNearDue = dueDate.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000; // 7 days
              const isOverdue = dueDate < new Date();
              
              return (
                <div key={loan.id} className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-lg">
                          ฿{parseFloat(loan.totalAmount).toLocaleString()}
                        </span>
                        {getStatusBadge(loan.status)}
                      </div>
                      <div className="text-sm text-gray-600">
                        จำนวนเงินต้น: ฿{parseFloat(loan.amount).toLocaleString()} • 
                        ดอกเบี้ย {loan.interestRate}%
                      </div>
                    </div>
                    <Button
                      onClick={() => handleRepayLoan(loan.id)}
                      disabled={repayLoanMutation.isPending}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CreditCard className="w-4 h-4 mr-1" />
                      ชำระ
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className={`flex items-center space-x-1 ${
                      isOverdue ? 'text-red-600' : isNearDue ? 'text-yellow-600' : 'text-gray-600'
                    }`}>
                      <Clock className="w-4 h-4" />
                      <span>
                        กำหนดชำระ: {dueDate.toLocaleDateString('th-TH')}
                        {isOverdue && ' (เกินกำหนด)'}
                        {!isOverdue && isNearDue && ' (ใกล้ครบกำหนด)'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Pending Loans */}
      {pendingLoans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              คำขอรอพิจารณา ({pendingLoans.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingLoans.map((loan) => (
              <div key={loan.id} className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">
                        ฿{parseFloat(loan.amount).toLocaleString()}
                      </span>
                      {getStatusBadge(loan.status)}
                    </div>
                    <div className="text-sm text-gray-600">
                      ส่งคำขอเมื่อ: {new Date(loan.createdAt).toLocaleDateString('th-TH')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">ดอกเบี้ย</div>
                    <div className="font-semibold text-blue-600">{loan.interestRate}%</div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Loan History */}
      {loans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <CheckCircle className="w-5 h-5 mr-2 text-gray-600" />
              ประวัติการกู้เงิน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loans.slice(0, 5).map((loan) => (
                <div key={loan.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <div className="font-medium">฿{parseFloat(loan.amount).toLocaleString()}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(loan.createdAt).toLocaleDateString('th-TH')}
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(loan.status)}
                    <div className="text-sm text-gray-500 mt-1">
                      {loan.interestRate}% ดอกเบี้ย
                    </div>
                  </div>
                </div>
              ))}
              {loans.length > 5 && (
                <div className="text-center text-sm text-gray-500 pt-2">
                  และอีก {loans.length - 5} รายการ
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Loans Message */}
      {loans.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">ยังไม่มีประวัติการกู้เงิน</h3>
            <p className="text-gray-600 mb-4">
              เริ่มต้นใช้บริการกู้เงินด้วยอัตราดอกเบี้ยที่ดีตามระดับของคุณ
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
