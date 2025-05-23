
"use client";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, Users, Package, AlertTriangle, TrendingUp, TrendingDown, Activity, Link as LinkIcon, BarChart2, PieChart as PieChartIcon, FileText, ShoppingBag, Banknote, CheckCircle, Clock, Archive } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Button } from "@/components/ui/button";
import Link from "next/link"; 
import React, { useState, useEffect, useCallback } from 'react';
import { getInvoices } from "@/lib/services/invoicing";
import { getInventoryItems } from "@/lib/services/inventory";
import { getContacts } from "@/lib/services/contacts";
import { getJournalEntries } from "@/lib/services/accounting"; // Assuming you might want some accounting KPIs

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  change?: string;
  isLoading?: boolean;
  description?: string;
  linkTo?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon: Icon, trend, change, isLoading, description, linkTo }) => {
  const cardContent = (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent className="flex-grow">
        {isLoading ? <div className="text-3xl font-bold text-foreground animate-pulse">تحميل...</div>
                   : <div className="text-3xl font-bold text-foreground">{value}</div>}
        {description && !isLoading && <p className="text-xs text-muted-foreground pt-1">{description}</p>}
        {change && !isLoading && (
          <p className={`text-xs ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-muted-foreground'} flex items-center pt-1`}>
            {trend === 'up' ? <TrendingUp className="h-3 w-3 ml-1" /> : trend === 'down' ? <TrendingDown className="h-3 w-3 ml-1" /> : null}
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
  return linkTo ? <Link href={linkTo} className="block h-full">{cardContent}</Link> : cardContent;
};


export default function DashboardPage() {
  const [kpiData, setKpiData] = useState<KpiCardProps[]>([]);
  const [salesData, setSalesData] = useState<{ name: string; sales: number }[]>([]);
  const [expenseCategoriesData, setExpenseCategoriesData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [topSellingProducts, setTopSellingProducts] = useState<{ name: string; quantity: number }[]>([]);
  const [recentActivities, setRecentActivities] = useState<{text: string; time: string; icon: React.ElementType}[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
        const [invoices, inventory, contacts, journalEntriesData] = await Promise.all([
            getInvoices(), getInventoryItems(), getContacts(), getJournalEntries()
        ]);

        const totalRevenue = invoices.filter(inv => inv.type === 'Sales' && inv.status === 'Paid').reduce((sum, inv) => sum + inv.totalAmount, 0);
        // Mock expenses for now, ideally from journal entries or expense claims
        const totalExpenses = journalEntriesData.filter(je => je.isPosted && je.details.some(d => d.debit && (d.accountName?.includes("مصروف") || d.accountId.startsWith("accExp")))).reduce((sum, je) => sum + je.details.find(d=>d.debit && (d.accountName?.includes("مصروف") || d.accountId.startsWith("accExp")))!.debit!, 0); // Simplified
        const netProfit = totalRevenue - totalExpenses;
        const activeCustomers = contacts.filter(c => c.type === 'Customer').length; // Assuming all are active for mock
        const dueInvoicesAmount = invoices.filter(inv => inv.type === 'Sales' && (inv.status === 'Pending' || inv.status === 'Overdue')).reduce((sum, inv) => sum + inv.totalAmount, 0);
        const inventoryValue = inventory.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);
        const lowStockItems = inventory.filter(item => item.quantity <= item.reorderPoint && item.quantity > 0).length;
        const outOfStockItems = inventory.filter(item => item.quantity === 0).length;
        const salesInvoices = invoices.filter(inv => inv.type === 'Sales');
        const averageInvoiceValue = salesInvoices.length > 0 ? salesInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0) / salesInvoices.length : 0;

        setKpiData([
            { title: "إجمالي الإيرادات", value: `${totalRevenue.toFixed(0)} ل.س`, icon: DollarSign, description: "فواتير مبيعات مدفوعة", linkTo: "/invoicing?type=Sales&status=Paid" },
            { title: "المصروفات", value: `${totalExpenses.toFixed(0)} ل.س`, icon: TrendingDown, description: "الشهر الحالي (مثال)", linkTo: "/accounting?tab=expenses" }, // Placeholder link
            { title: "صافي الربح", value: `${netProfit.toFixed(0)} ل.س`, icon: TrendingUp, description: "محسوب (مثال)" },
            { title: "العملاء النشطون", value: activeCustomers, icon: Users, description: "إجمالي العملاء", linkTo: "/contacts?type=Customer" },
            { title: "فواتير مستحقة", value: `${dueInvoicesAmount.toFixed(0)} ل.س`, icon: FileText, description: "مبالغ لم يتم تحصيلها", linkTo: "/invoicing?type=Sales&status=Pending" },
            { title: "قيمة المخزون", value: `${inventoryValue.toFixed(0)} ل.س`, icon: Package, description: "التكلفة الإجمالية", linkTo: "/inventory" },
            { title: "منتجات منخفضة المخزون", value: lowStockItems, icon: AlertTriangle, description: "تحتاج إعادة طلب", linkTo: "/inventory?filter=lowstock" },
            { title: "أصناف نفذت", value: outOfStockItems, icon: Archive, description: "أصناف غير متوفرة", linkTo: "/inventory?filter=outofstock" },
        ]);

        // Mock sales data by month (example)
        const monthlySales: { [key: string]: number } = {};
        invoices.filter(inv => inv.type === 'Sales').forEach(inv => {
            const month = new Date(inv.date.split('/').reverse().join('-')).toLocaleString('ar-EG', { month: 'short' });
            monthlySales[month] = (monthlySales[month] || 0) + inv.totalAmount;
        });
        setSalesData(Object.entries(monthlySales).map(([name, sales]) => ({ name, sales })).slice(-6)); // Last 6 months

        // Mock expense categories
        setExpenseCategoriesData([
            { name: 'إيجارات', value: 5000, color: 'hsl(var(--chart-1))' }, { name: 'رواتب', value: 12000, color: 'hsl(var(--chart-2))' },
            { name: 'تسويق', value: 3000, color: 'hsl(var(--chart-3))' }, { name: 'مشتريات مكتبية', value: 1500, color: 'hsl(var(--chart-4))' },
            { name: 'فواتير خدمات', value: 2000, color: 'hsl(var(--chart-5))' },
        ]);

        // Mock top selling products (simplified)
        const productSalesCount: { [key: string]: { name: string, quantity: number } } = {};
        invoices.filter(inv => inv.type === 'Sales').forEach(inv => {
            inv.items.forEach(item => {
                if (productSalesCount[item.productId]) {
                    productSalesCount[item.productId].quantity += item.quantity;
                } else {
                    const productDetails = inventory.find(p => p.id === item.productId);
                    productSalesCount[item.productId] = { name: productDetails?.name || item.productName || "منتج غير معروف", quantity: item.quantity };
                }
            });
        });
        setTopSellingProducts(Object.values(productSalesCount).sort((a, b) => b.quantity - a.quantity).slice(0, 5));


        setRecentActivities([
            { text: `تم إنشاء فاتورة مبيعات جديدة رقم ${invoices.find(i=>i.type==='Sales')?.invoiceNumber || "XXXX"}`, time: "منذ 5 دقائق", icon: FileText },
            { text: "تم إضافة عميل جديد: شركة الأمل", time: "منذ ساعة", icon: Users },
            { text: "تنبيه: مخزون منتج 'قهوة أرابيكا' منخفض", time: "منذ 3 ساعات", icon: AlertTriangle },
            { text: "تم تسجيل قيد يومية لمصروفات إدارية", time: "أمس", icon: BookOpenText },
        ]);

    } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        // Set empty/error state for KPIs
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const quickLinks: { label: string; href: string; icon: React.ElementType }[] = [
    { label: "إنشاء فاتورة جديدة", href: "/invoicing", icon: FileText },
    { label: "إضافة عميل جديد", href: "/contacts", icon: Users },
    { label: "إدارة المخزون", href: "/inventory", icon: Package },
    { label: "إضافة قيد يومية", href: "/accounting", icon: BookOpenText },
    { label: "عرض التقارير", href: "/reports", icon: BarChart2 },
    { label: "الإعدادات", href: "/settings", icon: Settings },
  ];

  return (
    <>
      <PageHeader title="لوحة التحكم الرئيسية" description="نظرة عامة وشاملة على أداء أعمالك ومؤشراتك الرئيسية." />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {kpiData.map((kpi, index) => (
          <KpiCard key={index} {...kpi} isLoading={isLoading} />
        ))}
         {isLoading && kpiData.length === 0 && Array.from({length: 8}).map((_, i) => <KpiCard key={`skel-${i}`} title=" " value=" " icon={DollarSign} isLoading={true} />) }
      </div>
      
       {(kpiData.length === 0 && salesData.length === 0 && expenseCategoriesData.length === 0 && !isLoading) && (
         <Card className="mb-6 shadow-lg"><CardContent className="pt-6"><p className="text-center text-muted-foreground py-8">لا توجد بيانات لعرضها في لوحة التحكم حالياً.</p></CardContent></Card>
       )}

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 mb-6">
        <Card className="shadow-lg">
          <CardHeader><CardTitle className="flex items-center"><BarChart2 className="ml-2 h-5 w-5 text-primary"/>نظرة عامة على المبيعات</CardTitle><CardDescription>إجمالي المبيعات خلال الأشهر الماضية.</CardDescription></CardHeader>
          <CardContent className="h-[350px] p-4">
            {isLoading && <div className="flex items-center justify-center h-full text-muted-foreground">جار تحميل بيانات المبيعات...</div>}
            {!isLoading && salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData} layout="vertical" margin={{ right: 30, left: 20, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} tickFormatter={(value) => `${value/1000}k`} />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" width={60} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)', color: 'hsl(var(--popover-foreground))' }} cursor={{ fill: 'hsl(var(--accent))', fillOpacity: 0.1 }} formatter={(value: number) => [`${value.toLocaleString()} ل.س`, "المبيعات"]}/>
                  <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20}/>
                </BarChart>
              </ResponsiveContainer>
            ) : (!isLoading && <div className="flex items-center justify-center h-full"><p className="text-muted-foreground text-center p-4">لا توجد بيانات مبيعات كافية لعرض الرسم البياني.</p></div>)}
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader><CardTitle className="flex items-center"><PieChartIcon className="ml-2 h-5 w-5 text-primary"/>توزيع المصروفات (مثال)</CardTitle><CardDescription>تحليل المصروفات حسب الفئات الرئيسية.</CardDescription></CardHeader>
          <CardContent className="h-[350px] p-4">
             {isLoading && <div className="flex items-center justify-center h-full text-muted-foreground">جار تحميل بيانات المصروفات...</div>}
            {!isLoading && expenseCategoriesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expenseCategoriesData} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="hsl(var(--primary))" dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {expenseCategoriesData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)', color: 'hsl(var(--popover-foreground))' }} formatter={(value: number, name: string) => [`${value.toLocaleString()} ل.س`, name]}/>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (!isLoading && <div className="flex items-center justify-center h-full"><p className="text-muted-foreground text-center p-4">لا توجد بيانات مصروفات لعرض الرسم البياني.</p></div>)}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader><CardTitle className="flex items-center"><ShoppingBag className="ml-2 h-5 w-5 text-primary"/>الأصناف الأكثر مبيعًا</CardTitle><CardDescription>أكثر 5 أصناف تم بيعها مؤخرًا.</CardDescription></CardHeader>
          <CardContent>
            {isLoading && <div className="text-center p-4 text-muted-foreground">جار تحميل الأصناف...</div>}
            {!isLoading && topSellingProducts.length > 0 ? (
              <ul className="space-y-3">
                {topSellingProducts.map((product, index) => (
                  <li key={index} className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-muted/50">
                    <span className="text-foreground font-medium">{product.name}</span>
                    <Badge variant="secondary">{product.quantity} قطعة</Badge>
                  </li>
                ))}
              </ul>
            ) : (!isLoading && <p className="text-muted-foreground text-center p-4">لا توجد بيانات عن الأصناف الأكثر مبيعًا حاليًا.</p>)}
          </CardContent>
        </Card>
         <Card className="shadow-lg">
          <CardHeader><CardTitle className="flex items-center"><LinkIcon className="ml-2 h-5 w-5 text-primary"/>روابط سريعة</CardTitle><CardDescription>اختصارات لأكثر الوظائف استخدامًا.</CardDescription></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
             {quickLinks.length > 0 ? ( quickLinks.map((link, index) => (
                  <Button key={index} variant="outline" asChild className="justify-start text-base p-3 h-auto hover:bg-accent hover:text-accent-foreground">
                    <Link href={link.href} className="flex items-center gap-2"><link.icon className="h-4 w-4" />{link.label}</Link></Button>))
            ) : (<p className="text-muted-foreground text-center p-4 col-span-full">لا توجد روابط سريعة.</p>)}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

    