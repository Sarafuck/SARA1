import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign, 
  User, 
  Calendar,
  MessageSquare,
  Settings
} from "lucide-react";
import type { Loan } from "@shared/schema";

export default function LoanManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);

  // ดึงข้อมูลคำขอกู้ทั้งหมด
  const { data: loans = [], isLoading } = useQuery<Loan[]>({
    queryKey: ['/api/admin/loans'],
  });

  // อนุมัติคำขอกู้
  const approveLoanMutation = useMutation({
    mutationFn: async (data: { loanId: number; notes: string }) => {
      const response = await apiRequest('POST', `/api/admin/loans/${data.loanId}/approve`, {
        notes: data.notes
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "อนุมัติสำเร็จ",
        description: "คำขอกู้เงินได้รับการอนุมัติแล้ว",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/loans'] });
      setIsApprovalDialogOpen(false);
      setApprovalNotes("");
      setSelectedLoan(null);
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถอนุมัติได้",
        variant: "destructive",
      });
    },
  });

  // ปฏิเสธคำขอกู้
  const rejectLoanMutation = useMutation({
    mutationFn: async (data: { loanId: number; reason: string }) => {
      const response = await apiRequest('POST', `/api/admin/loans/${data.loanId}/reject`, {
        reason: data.reason
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "ปฏิเสธสำเร็จ",
        description: "คำขอกู้เงินถูกปฏิเสธแล้ว",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/loans'] });
      setIsRejectionDialogOpen(false);
      setRejectionReason("");
      setSelectedLoan(null);
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถปฏิเสธได้",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">รอพิจารณา</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">อนุมัติแล้ว</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">ปฏิเสธ</Badge>;
      case 'repaid':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">ชำระแล้ว</Badge>;
      case 'overdue':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">เกินกำหนด</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleApprove = (loan: Loan) => {
    setSelectedLoan(loan);
    setIsApprovalDialogOpen(true);
  };

  const handleReject = (loan: Loan) => {
    setSelectedLoan(loan);
    setIsRejectionDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">กำลังโหลดข้อมูล...</div>
        </CardContent>
      </Card>
    );
  }

  const pendingLoans = loans.filter(loan => loan.status === 'pending');
  const processedLoans = loans.filter(loan => loan.status !== 'pending');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">จัดการคำขอกู้เงิน</h2>
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-500">คำขอรอพิจารณา</div>
            <div className="text-2xl font-bold text-yellow-600">{pendingLoans.length}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">คำขอทั้งหมด</div>
            <div className="text-2xl font-bold text-blue-600">{loans.length}</div>
          </div>
        </div>
      </div>

      {/* คำขอรอพิจารณา */}
      {pendingLoans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <Clock className="w-5 h-5" />
              คำขอรอพิจารณา ({pendingLoans.length})
            </CardTitle>
            <CardDescription>
              คำขอกู้เงินที่รอการอนุมัติหรือปฏิเสธ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingLoans.map((loan) => (
                <Card key={loan.id} className="border-l-4 border-l-yellow-500">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      <div>
                        <div className="font-semibold text-lg">฿{Number(loan.amount).toLocaleString()}</div>
                        <div className="text-sm text-gray-500">ผู้ขอ: {loan.userId}</div>
                        <div className="text-sm text-gray-500">
                          วันที่: {new Date(loan.createdAt).toLocaleDateString('th')}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">ระยะเวลา</div>
                        <div className="font-medium">{loan.loanTermDays || 30} วัน</div>
                        <div className="text-sm text-gray-600">อัตราดอกเบี้ย: {Number(loan.interestRate)}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">เหตุผล</div>
                        <div className="font-medium truncate" title={loan.loanPurpose || "ไม่ระบุ"}>
                          {loan.loanPurpose || "ไม่ระบุเหตุผล"}
                        </div>
                        <div className="text-sm text-gray-600">
                          รวมชำระ: ฿{Number(loan.totalAmount).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprove(loan)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          อนุมัติ
                        </Button>
                        <Button
                          onClick={() => handleReject(loan)}
                          size="sm"
                          variant="destructive"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          ปฏิเสธ
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ประวัติคำขอทั้งหมด */}
      <Card>
        <CardHeader>
          <CardTitle>ประวัติคำขอทั้งหมด</CardTitle>
          <CardDescription>
            คำขอกู้เงินที่ผ่านการพิจารณาแล้ว
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ผู้ขอ</TableHead>
                <TableHead>จำนวนเงิน</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>วันที่ขอ</TableHead>
                <TableHead>การดำเนินการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedLoans.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell>
                    <div className="font-medium">{loan.userId}</div>
                    <div className="text-sm text-gray-500">
                      {loan.loanPurpose && loan.loanPurpose.substring(0, 30)}
                      {loan.loanPurpose && loan.loanPurpose.length > 30 && "..."}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold">฿{Number(loan.amount).toLocaleString()}</div>
                    <div className="text-sm text-gray-500">
                      รวม: ฿{Number(loan.totalAmount).toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(loan.status)}
                  </TableCell>
                  <TableCell>
                    {new Date(loan.createdAt).toLocaleDateString('th')}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      ดูรายละเอียด
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog อนุมัติ */}
      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>อนุมัติคำขอกู้เงิน</DialogTitle>
            <DialogDescription>
              คุณต้องการอนุมัติคำขอกู้เงินจำนวน ฿{selectedLoan ? Number(selectedLoan.amount).toLocaleString() : 0} บาท?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="approval-notes">หมายเหตุ (ไม่บังคับ)</Label>
              <Textarea
                id="approval-notes"
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="หมายเหตุเพิ่มเติมสำหรับการอนุมัติ..."
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsApprovalDialogOpen(false)}
                className="flex-1"
              >
                ยกเลิก
              </Button>
              <Button 
                onClick={() => selectedLoan && approveLoanMutation.mutate({ 
                  loanId: selectedLoan.id, 
                  notes: approvalNotes 
                })}
                disabled={approveLoanMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {approveLoanMutation.isPending ? "กำลังอนุมัติ..." : "ยืนยันอนุมัติ"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog ปฏิเสธ */}
      <Dialog open={isRejectionDialogOpen} onOpenChange={setIsRejectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ปฏิเสธคำขอกู้เงิน</DialogTitle>
            <DialogDescription>
              คุณต้องการปฏิเสธคำขอกู้เงินจำนวน ฿{selectedLoan ? Number(selectedLoan.amount).toLocaleString() : 0} บาท?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejection-reason">เหตุผลการปฏิเสธ *</Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="โปรดระบุเหตุผลที่ปฏิเสธคำขอ..."
                rows={3}
                required
              />
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsRejectionDialogOpen(false)}
                className="flex-1"
              >
                ยกเลิก
              </Button>
              <Button 
                onClick={() => selectedLoan && rejectionReason.trim() && rejectLoanMutation.mutate({ 
                  loanId: selectedLoan.id, 
                  reason: rejectionReason 
                })}
                disabled={rejectLoanMutation.isPending || !rejectionReason.trim()}
                variant="destructive"
                className="flex-1"
              >
                {rejectLoanMutation.isPending ? "กำลังปฏิเสธ..." : "ยืนยันปฏิเสธ"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}