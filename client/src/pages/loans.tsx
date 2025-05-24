import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CreditCard,
  Plus,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";

const loanSchema = z.object({
  amount: z.number().min(100, "จำนวนขั้นต่ำ 100 บาท").max(50000, "จำนวนสูงสุด 50,000 บาท"),
  reason: z.string().min(10, "กรุณาระบุเหตุผลอย่างน้อย 10 ตัวอักษร"),
  termDays: z.number().min(7, "ระยะเวลาขั้นต่ำ 7 วัน").max(365, "ระยะเวลาสูงสุด 365 วัน"),
});

type LoanFormData = z.infer<typeof loanSchema>;

export default function LoansPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<LoanFormData>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      amount: 1000,
      reason: "",
      termDays: 30,
    },
  });

  // ดึงข้อมูลสินเชื่อของผู้ใช้
  const { data: loans = [], isLoading } = useQuery({
    queryKey: ['/api/loans'],
  });

  // การสร้างสินเชื่อใหม่
  const createLoanMutation = useMutation({
    mutationFn: async (data: LoanFormData) => {
      const response = await apiRequest('POST', '/api/loans', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "ส่งคำขอสินเชื่อแล้ว",
        description: "คำขอของคุณอยู่ในระหว่างการพิจารณา",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/loans'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถส่งคำขอสินเชื่อได้",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'paid': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'รอพิจารณา';
      case 'approved': return 'อนุมัติแล้ว';
      case 'rejected': return 'ปฏิเสธ';
      case 'paid': return 'ชำระแล้ว';
      default: return status;
    }
  };

  const onSubmit = (data: LoanFormData) => {
    createLoanMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">จัดการสินเชื่อ</h1>
          <p className="text-gray-600 mt-1">ขอกู้เงินและติดตามสถานะสินเชื่อของคุณ</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>ขอสินเชื่อใหม่</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>ขอสินเชื่อใหม่</DialogTitle>
              <DialogDescription>
                กรอกข้อมูลสำหรับการขอสินเชื่อ
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>จำนวนเงิน (บาท)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1000"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="termDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ระยะเวลา (วัน)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="30"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>เหตุผลในการกู้</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="ระบุเหตุผลในการขอสินเชื่อ..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    ยกเลิก
                  </Button>
                  <Button
                    type="submit"
                    disabled={createLoanMutation.isPending}
                  >
                    {createLoanMutation.isPending ? "กำลังส่ง..." : "ส่งคำขอ"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">เครดิตที่มี</p>
                <p className="text-2xl font-bold text-blue-600">
                  ฿{user?.availableCredit?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">หนี้ค้างชำระ</p>
                <p className="text-2xl font-bold text-red-600">
                  ฿{user?.outstandingDebt?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">อัตราดอกเบี้ย</p>
                <p className="text-2xl font-bold text-green-600">
                  {user?.interestRate?.toFixed(1) || '0'}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loans List */}
      <Card>
        <CardHeader>
          <CardTitle>ประวัติสินเชื่อ</CardTitle>
        </CardHeader>
        <CardContent>
          {loans.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">ยังไม่มีประวัติสินเชื่อ</p>
              <p className="text-sm text-gray-400">คลิก "ขอสินเชื่อใหม่" เพื่อเริ่มต้น</p>
            </div>
          ) : (
            <div className="space-y-4">
              {loans.map((loan: any) => (
                <div
                  key={loan.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Badge className={`${getStatusColor(loan.status)} text-white`}>
                        {getStatusText(loan.status)}
                      </Badge>
                      <span className="text-lg font-semibold">
                        ฿{loan.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      {new Date(loan.createdAt).toLocaleDateString('th-TH')}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">เหตุผล</p>
                      <p className="font-medium">{loan.reason}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">ระยะเวลา</p>
                      <p className="font-medium">{loan.termDays} วัน</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">ยอดรวมชำระ</p>
                      <p className="font-medium text-blue-600">
                        ฿{loan.totalAmount?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  {loan.notes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-600">หมายเหตุ:</p>
                      <p className="text-sm">{loan.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}