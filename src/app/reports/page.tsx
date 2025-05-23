
"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { DatePickerWithRange } from "@/components/ui/date-picker-with-range"; // Assuming this component exists
import { BarChart3, FileSpreadsheet, FileType2, Users, Package, DollarSign, Filter, CalendarClock, Building, UserCircle, ListFilter } from "lucide-react";
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

// Placeholder for DatePickerWithRange - simplified version
const DatePickerWithRange = ({ className, date, onDateChange }: { className?: string, date?: DateRange, onDateChange?: (date: DateRange | undefined) => void }) => (
  <div className={cn("grid gap-2", className)}>
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id="date"
          variant={"outline"}
          className={cn("w-full justify-start text-right font-normal", !date && "text-muted-foreground")}
        >
          <CalendarClock className="ml-2 h-4 w-4" />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, "dd/MM/y")} - {format(date.to, "dd/MM/y")}
              </>
            ) : (
              format(date.from, "dd/MM/y")
            )
          ) : (
            <span>اختر نطاق التاريخ</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={onDateChange}
          numberOfMonths={2}
          dir="rtl"
        />
      </PopoverContent>
    </Popover>
  </div>
);


interface ReportCardProps {
  title: string; description: string; icon: React.ElementType;
  onGenerate: (filters: any) => void; onExportPDF?: (filters: any) => void; onExportExcel?: (filters: any) => void;
  filtersNode: React.ReactNode;
}

const ReportCardComponent: React.FC<ReportCardProps> = ({ title, description, icon: Icon, onGenerate, onExportPDF, onExportExcel, filtersNode }) => {
  // In a real scenario, filters state would be managed here or passed down
  const currentFilters = {}; // Placeholder for actual filter values

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow flex flex-col">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-4">
          <div className="p-3 rounded-md bg-primary/10 text-primary shrink-0"><Icon className="h-7 w-7" /></div>
          <div className="flex-1"><CardTitle className="text-lg">{title}</CardTitle><CardDescription className="text-xs">{description}</CardDescription></div>
      </CardHeader>
      <CardContent className="space-y-3 flex-grow">
          {filtersNode}
          {/* Placeholder for displaying the report content */}
          <div className="mt-3 border rounded-md min-h-[100px] flex items-center justify-center text-muted-foreground bg-background/30 p-4 text-center text-sm">
              سيتم عرض محتوى التقرير هنا بعد الإنشاء واختيار الفلاتر.
          </div>
      </CardContent>
      <CardContent className="border-t pt-4">
        <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={() => onGenerate(currentFilters)} className="flex-1"><BarChart3 className="ml-2 h-4 w-4" /> عرض التقرير</Button>
            {onExportPDF && (<Button onClick={() => onExportPDF(currentFilters)} variant="outline" className="flex-1"><FileType2 className="ml-2 h-4 w-4" /> PDF</Button>)}
            {onExportExcel && (<Button onClick={() => onExportExcel(currentFilters)} variant="outline" className="flex-1"><FileSpreadsheet className="ml-2 h-4 w-4" /> Excel</Button>)}
        </div>
      </CardContent>
    </Card>
  );
};


export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({ from: addDays(new Date(), -30), to: new Date() });
  // Add more state for other filters as needed

  const handleGenerateReport = (reportTitle: string, filters: any) => {
    console.log(`Generating report: ${reportTitle}`, filters);
    // Placeholder: In a real app, fetch and display report data
  };

  const commonFilters = (
     <>
        <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
        <Select dir="rtl"><SelectTrigger><SelectValue placeholder="اختر الفرع (الكل)" /></SelectTrigger>
            <SelectContent><SelectItem value="all">جميع الفروع</SelectItem></SelectContent></Select>
     </>
  );
  
  const inventoryReportFilters = (
     <>
        <Select dir="rtl"><SelectTrigger><SelectValue placeholder="اختر المستودع (الكل)" /></SelectTrigger>
            <SelectContent><SelectItem value="all">جميع المستودعات</SelectItem></SelectContent></Select>
        <Input placeholder="بحث عن منتج (SKU أو الاسم)" />
        <Select dir="rtl"><SelectTrigger><SelectValue placeholder="حالة المخزون (الكل)" /></SelectTrigger>
            <SelectContent><SelectItem value="all">الكل</SelectItem><SelectItem value="low">منخفض</SelectItem><SelectItem value="out">نفذ</SelectItem></SelectContent></Select>
     </>
  );

  const salesReportFilters = (
      <>
        {commonFilters}
        <Input placeholder="بحث عن عميل..." />
        <Input placeholder="بحث عن مندوب مبيعات..." />
        <Input placeholder="بحث عن منتج..." />
      </>
  );
   const purchaseReportFilters = (
      <>
        {commonFilters}
        <Input placeholder="بحث عن مورد..." />
        <Input placeholder="بحث عن منتج..." />
      </>
  );


  const reportsConfig = [
    { id: "trial_balance", title: "ميزان المراجعة", description: "ملخص أرصدة الحسابات.", icon: BarChart3, filtersNode: commonFilters },
    { id: "income_statement", title: "قائمة الدخل", description: "عرض الإيرادات، التكاليف، وصافي الربح.", icon: DollarSign, filtersNode: commonFilters },
    { id: "balance_sheet", title: "الميزانية العمومية", description: "بيان الأصول، الالتزامات، وحقوق الملكية.", icon: BarChart3, filtersNode: <DatePickerWithRange date={dateRange} onDateChange={setDateRange} /> /* Specific filter */ },
    { id: "cash_flow", title: "التدفقات النقدية", description: "تتبع حركة النقد الداخل والخارج.", icon: DollarSign, filtersNode: commonFilters },
    
    { id: "inventory_movement", title: "حركة المخزون", description: "تفاصيل دخول وخروج الأصناف.", icon: Package, filtersNode: inventoryReportFilters },
    { id: "inventory_balance", title: "أرصدة المخزون الحالية", description: "كميات وقيم الأصناف المتوفرة.", icon: Package, filtersNode: inventoryReportFilters },
    { id: "low_stock", title: "الأصناف تحت حد الطلب", description: "قائمة بالمنتجات التي تحتاج إعادة طلب.", icon: AlertTriangle, filtersNode: <Select dir="rtl"><SelectTrigger><SelectValue placeholder="اختر المستودع (الكل)" /></SelectTrigger><SelectContent><SelectItem value="all">الكل</SelectItem></SelectContent></Select> },
    { id: "inventory_value", title: "تقرير قيمة المخزون", description: "تقييم المخزون بناءً على سعر التكلفة.", icon: DollarSign, filtersNode: inventoryReportFilters },
    
    { id: "sales_by_customer", title: "مبيعات العملاء", description: "تحليل مبيعات كل عميل.", icon: Users, filtersNode: salesReportFilters },
    { id: "sales_by_product", title: "مبيعات المنتجات", description: "تحليل مبيعات كل منتج.", icon: Package, filtersNode: salesReportFilters },
    { id: "sales_by_salesperson", title: "مبيعات مناديب البيع", description: "تحليل مبيعات كل مندوب.", icon: UserCircle, filtersNode: salesReportFilters },
    
    { id: "purchases_by_supplier", title: "مشتريات الموردين", description: "تحليل المشتريات من كل مورد.", icon: Users, filtersNode: purchaseReportFilters },
    { id: "purchases_by_product", title: "مشتريات المنتجات", description: "تحليل مشتريات كل منتج.", icon: Package, filtersNode: purchaseReportFilters },
    
    { id: "vat_report", title: "إقرار ضريبي (VAT)", description: "تجهيز البيانات اللازمة للإقرار الضريبي.", icon: FileSpreadsheet, filtersNode: commonFilters },
  ];

  return (
    <>
      <PageHeader 
        title="التقارير والتحليلات الشاملة" 
        description="احصل على رؤى دقيقة حول أداء أعمالك من خلال مجموعة متنوعة من التقارير القابلة للتخصيص."
        actions={<Button variant="outline"><ListFilter className="ml-2 h-4 w-4"/> تخصيص لوحة التقارير</Button>}
      />
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportsConfig.map((report) => (
          <ReportCardComponent
            key={report.id}
            title={report.title}
            description={report.description}
            icon={report.icon}
            filtersNode={<div className="space-y-2 text-sm">{report.filtersNode}</div>}
            onGenerate={(filters) => handleGenerateReport(report.title, filters)}
            onExportPDF={(filters) => console.log(`Exporting PDF: ${report.title}`, filters)}
            onExportExcel={(filters) => console.log(`Exporting Excel: ${report.title}`, filters)}
          />
        ))}
      </div>
       {reportsConfig.length === 0 && (
         <Card className="shadow-lg"><CardContent className="pt-6"><p className="text-center text-muted-foreground py-10">لا توجد تقارير معدة للعرض حاليًا.</p></CardContent></Card>
       )}
    </>
  );
}

    