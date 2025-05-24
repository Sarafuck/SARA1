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
  Crown,
  CheckCircle,
  Clock,
  AlertTriangle,
  MessageCircle,
  Upload,
  Star
} from "lucide-react";

const membershipSchema = z.object({
  amount: z.number().min(100, "จำนวนขั้นต่ำ 100 บาท").max(100, "ค่าสมาชิก 100 บาท"),
  paymentMethod: z.string().default('manual'),
  notes: z.string().min(10, "กรุณาระบุหมายเหตุอย่างน้อย 10 ตัวอักษร"),
  proofImageUrl: z.string().optional(),
});

type MembershipFormData = z.infer<typeof membershipSchema>;

export default function MembershipPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<MembershipFormData>({
    resolver: zodResolver(membershipSchema),
    defaultValues: {
      amount: 100,
      paymentMethod: "manual",
      notes: "",
      proofImageUrl: "",
    },
  });

  // ดึงข้อมูลการชำระเงินของผู้ใช้
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['/api/membership/payments'],
  });

  // การสร้างคำขอชำระเงินใหม่
  const createPaymentMutation = useMutation({
    mutationFn: async (data: MembershipFormData) => {
      const response = await apiRequest('POST', '/api/membership/payments', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "ส่งคำขอแล้ว!",
        description: "คำขอชำระค่าสมาชิกของคุณอยู่ในระหว่างการพิจารณา",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/membership/payments'] });
      setDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถส่งคำขอได้",
        variant: "destructive",
      });
    },
  });

  // การติดต่อแอดมิน
  const contactAdminMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/chat/contact-admin', {
        message: "สวัสดีครับ ต้องการติดต่อเรื่องการชำระค่าสมาชิก 100 บาท"
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "ส่งข้อความแล้ว",
        description: "ส่งข้อความถึงแอดมินเรียบร้อยแล้ว กรุณาตรวจสอบในหน้าแชท",
      });
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถส่งข้อความได้",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'รอพิจารณา';
      case 'approved': return 'อนุมัติแล้ว';
      case 'rejected': return 'ปฏิเสธ';
      default: return status;
    }
  };

  const onSubmit = (data: MembershipFormData) => {
    createPaymentMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const activeMembership = payments.find((p: any) => p.status === 'approved' && new Date(p.expiresAt) > new Date());
  const pendingPayment = payments.find((p: any) => p.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">สมาชิกพรีเมียม</h1>
          <p className="text-gray-600 mt-1">อัปเกรดเป็นสมาชิกพรีเมียมเพื่อสิทธิพิเศษ</p>
        </div>
      </div>

      {/* Membership Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className={`${activeMembership ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' : 'bg-gradient-to-r from-gray-50 to-slate-50'}`}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-lg ${activeMembership ? 'bg-green-100' : 'bg-gray-100'}`}>
                <Crown className={`w-6 h-6 ${activeMembership ? 'text-green-600' : 'text-gray-600'}`} />
              </div>
              <div>
                <p className="text-sm text-gray-600">สถานะสมาชิก</p>
                <p className={`text-2xl font-bold ${activeMembership ? 'text-green-600' : 'text-gray-600'}`}>
                  {activeMembership ? 'พรีเมียม' : 'ธรรมดา'}
                </p>
                {activeMembership && (
                  <p className="text-sm text-green-600">
                    หมดอายุ {new Date(activeMembership.expiresAt).toLocaleDateString('th-TH')}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">ค่าสมาชิก</p>
                <p className="text-2xl font-bold text-blue-600">100 บาท</p>
                <p className="text-sm text-blue-600">ต่อเดือน</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Premium Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>สิทธิพิเศษสมาชิกพรีเมียม</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>เครดิตสินเชื่อเพิ่มขึ้น 50%</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>อัตราดอกเบี้ยลดลง 2%</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>ไอเทมพิเศษในร้านค้า</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>แชทตรงกับแอดมิน</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>รับ XP โบนัส 25%</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>ตราสมาชิกพรีเมียม</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {!activeMembership && !pendingPayment && (
        <div className="flex space-x-4">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4" />
                <span>ชำระค่าสมาชิก</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>ชำระค่าสมาชิกพรีเมียม</DialogTitle>
                <DialogDescription>
                  ค่าสมาชิก 100 บาท/เดือน - โอนเงินและส่งหลักฐาน
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">ข้อมูลการโอนเงิน</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p><strong>ธนาคาร:</strong> กรุงเทพ</p>
                    <p><strong>เลขบัญชี:</strong> 123-4-56789-0</p>
                    <p><strong>ชื่อบัญชี:</strong> ThaiSocial Platform</p>
                    <p><strong>จำนวนเงิน:</strong> 100 บาท</p>
                  </div>
                </div>

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
                              value={100}
                              disabled
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="proofImageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL รูปหลักฐานการโอนเงิน</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://example.com/proof.jpg"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>หมายเหตุ</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="เวลาที่โอน, เลขที่อ้างอิง หรือรายละเอียดเพิ่มเติม..."
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
                        disabled={createPaymentMutation.isPending}
                      >
                        {createPaymentMutation.isPending ? "กำลังส่ง..." : "ส่งคำขอ"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            onClick={() => contactAdminMutation.mutate()}
            disabled={contactAdminMutation.isPending}
            className="flex items-center space-x-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>ติดต่อแอดมิน</span>
          </Button>
        </div>
      )}

      {pendingPayment && (
        <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Clock className="w-6 h-6 text-yellow-600" />
              <div>
                <h3 className="font-semibold text-yellow-900">คำขอชำระเงินอยู่ในระหว่างการพิจารณา</h3>
                <p className="text-sm text-yellow-800">
                  แอดมินจะตรวจสอบการชำระเงินของคุณภายใน 24 ชั่วโมง
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>ประวัติการชำระเงิน</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">ยังไม่มีประวัติการชำระเงิน</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment: any) => (
                <div
                  key={payment.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Badge className={`${getStatusColor(payment.status)} text-white`}>
                        {getStatusText(payment.status)}
                      </Badge>
                      <span className="text-lg font-semibold">
                        ฿{payment.amount}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(payment.createdAt).toLocaleDateString('th-TH')}
                    </div>
                  </div>
                  
                  {payment.notes && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600">หมายเหตุ:</p>
                      <p className="text-sm">{payment.notes}</p>
                    </div>
                  )}
                  
                  {payment.adminNotes && (
                    <div className="p-3 bg-blue-50 rounded-md">
                      <p className="text-sm text-blue-600">หมายเหตุจากแอดมิน:</p>
                      <p className="text-sm text-blue-800">{payment.adminNotes}</p>
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