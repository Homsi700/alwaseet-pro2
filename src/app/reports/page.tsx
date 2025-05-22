
"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/date-picker-with-range"; // Assuming this component exists or will be created
import { BarChart3, FileSpreadsheet, FileType2, Users, Package, DollarSign, Filter } from "lucide-react";
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";

interface ReportCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  onGenerate: () => void;
  onExportPDF?: () => void;
  onExportExcel?: () => void;
  filters?: React.ReactNode;
}

const ReportCard: React.FC<ReportCardProps> = ({ title, description, icon: Icon, onGenerate, onExportPDF, onExportExcel, filters }) => (
  <Card className="shadow-lg hover:shadow-xl transition-shadow">
    <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-4">
        <div className="p-3 rounded-md bg-primary/10 text-primary">
            <Icon className="h-7 w-7" />
        </div>
        <div className="flex-1">
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
        </div>
    </CardHeader>
    <CardContent className="space-y-4">
        {filters && <div className="space-y-3 p-4 border rounded-md bg-muted/50">{filters}</div>}
        <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={onGenerate} className="flex-1">
                <BarChart3 className="ml-2 h-4 w-4" /> عرض التقرير
            </Button>
            {onExportPDF && (
                <Button onClick={onExportPDF} variant="outline" className="flex-1">
                    <FileType2 className="ml-2 h-4 w-4" /> تصدير PDF
                </Button>
            )}
            {onExportExcel && (
                <Button onClick={onExportExcel} variant="outline" className="flex-1">
                    <FileSpreadsheet className="ml-2 h-4 w-4" /> تصدير Excel
                </Button>
            )}
        </div>
        {/* Placeholder for displaying the report content */}
        {/* <div className="mt-4 border rounded-md min-h-[200px] flex items-center justify-center text-muted-foreground bg-background">
            سيتم عرض محتوى التقرير هنا بعد الإنشاء.
        </div> */}
    </CardContent>
  </Card>
);


export default function ReportsPage() {
  // TODO: Add state and handlers for filters and report generation

  const financialReportFilters = (
     <>
        <h4 className="font-medium mb-2 text-sm">فلاتر التقرير المالي:</h4>
        {/* <DatePickerWithRange /> Re-enable when component is ready */}
        <div className="text-center text-sm text-muted-foreground p-2 border border-dashed rounded-md">مكون اختيار نطاق التاريخ (سيتم إضافته)</div>
        <Select dir="rtl">
            <SelectTrigger><SelectValue placeholder="اختر الفرع (اختياري)" /></SelectTrigger>
            <SelectContent>
                <SelectItem value="all">جميع الفروع</SelectItem>
                <SelectItem value="branch1">الفرع الرئيسي</SelectItem>
                <SelectItem value="branch2">فرع جدة</SelectItem>
            </SelectContent>
        </Select>
     </>
  );
  
  const inventoryReportFilters = (
     <>
        <h4 className="font-medium mb-2 text-sm">فلاتر تقرير المخزون:</h4>
         <Select dir="rtl">
            <SelectTrigger><SelectValue placeholder="اختر المستودع" /></SelectTrigger>
            <SelectContent>
                <SelectItem value="all">جميع المستودعات</SelectItem>
                <SelectItem value="main_wh">المستودع الرئيسي</SelectItem>
            </SelectContent>
        </Select>
        <Input placeholder="بحث عن منتج محدد (SKU أو الاسم)" />
     </>
  );


  const reports: Omit<ReportCardProps, 'onGenerate' | 'onExportPDF' | 'onExportExcel'>[] = [
    { title: "ميزان المراجعة", description: "ملخص أرصدة جميع الحسابات.", icon: BarChart3, filters: financialReportFilters },
    { title: "قائمة الدخل (الأرباح والخسائر)", description: "عرض الإيرادات، التكاليف، وصافي الربح لفترة محددة.", icon: DollarSign, filters: financialReportFilters },
    { title: "الميزانية العمومية", description: "بيان الأصول، الالتزامات، وحقوق الملكية في تاريخ معين.", icon: BarChart3, filters: financialReportFilters },
    { title: "تقرير التدفقات النقدية", description: "تتبع حركة النقد الداخل والخارج.", icon: DollarSign, filters: financialReportFilters },
    { title: "تقرير حركة المخزون", description: "تفاصيل دخول وخروج الأصناف من المستودعات.", icon: Package, filters: inventoryReportFilters },
    { title: "تقرير أرصدة المخزون الحالية", description: "كميات وقيم الأصناف المتوفرة حاليًا.", icon: Package, filters: inventoryReportFilters },
    { title: "تقرير مبيعات العملاء", description: "تحليل مبيعات كل عميل.", icon: Users, filters: <><h4 className="font-medium mb-2 text-sm">فلاتر تقرير المبيعات:</h4><div className="text-center text-sm text-muted-foreground p-2 border border-dashed rounded-md">مكون اختيار نطاق التاريخ</div><Input placeholder="بحث عن عميل محدد" /></> },
    { title: "تقرير مشتريات الموردين", description: "تحليل المشتريات من كل مورد.", icon: Users, filters: <><h4 className="font-medium mb-2 text-sm">فلاتر تقرير المشتريات:</h4><div className="text-center text-sm text-muted-foreground p-2 border border-dashed rounded-md">مكون اختيار نطاق التاريخ</div><Input placeholder="بحث عن مورد محدد" /></> },
    { title: "إقرار ضريبي (VAT)", description: "تجهيز البيانات اللازمة للإقرار الضريبي.", icon: FileSpreadsheet, filters: financialReportFilters },
  ];

  return (
    <>
      <PageHeader 
        title="التقارير والتحليلات الشاملة" 
        description="احصل على رؤى دقيقة حول أداء أعمالك من خلال مجموعة متنوعة من التقارير القابلة للتخصيص."
        actions={
            <Button variant="outline"> <Filter className="ml-2 h-4 w-4"/> تخصيص لوحة التقارير </Button>
        }
      />
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report, index) => (
          <ReportCard
            key={index}
            {...report}
            onGenerate={() => console.log(`Generating report: ${report.title}`)}
            onExportPDF={() => console.log(`Exporting PDF: ${report.title}`)}
            onExportExcel={() => console.log(`Exporting Excel: ${report.title}`)}
          />
        ))}
      </div>
       {reports.length === 0 && (
         <Card className="shadow-lg">
           <CardContent className="pt-6">
             <p className="text-center text-muted-foreground py-10">لا توجد تقارير معدة للعرض حاليًا.</p>
           </CardContent>
         </Card>
       )}
    </>
  );
}

// Placeholder for DatePickerWithRange - this should be in its own file in components/ui or similar
// For now, to avoid breaking the build if it's not there yet:
const DatePickerWithRange = ({ className }: { className?: string }) => (
  <div className={cn("grid gap-2", className)}>
    <Input type="text" placeholder="من تاريخ - إلى تاريخ (مؤقت)" />
  </div>
);
