"use client";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, Users, Package, AlertTriangle, TrendingUp, TrendingDown, Activity, Link as LinkIcon, BarChart2, PieChart as PieChartIcon, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Button } from "@/components/ui/button";
import Link from "next/link"; 
import React from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  change?: string;
  isLoading?: boolean;
  description?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon: Icon, trend, change, isLoading, description }) => (
  <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <Icon className="h-5 w-5 text-primary" />
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="text-2xl font-bold text-foreground animate-pulse">تحميل...</div>
      ) : (
        <div className="text-2xl font-bold text-foreground">{value}</div>
      )}
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


export default function DashboardPage() {
  const kpiData: KpiCardProps[] = [
    { title: "إجمالي الإيرادات", value: "0 ر.س", icon: DollarSign, description: "الشهر الحالي", trend: "neutral", change: "0%" },
    { title: "المصروفات", value: "0 ر.س", icon: TrendingDown, description: "الشهر الحالي", trend: "neutral", change: "0%" },
    { title: "صافي الربح", value: "0 ر.س", icon: DollarSign, description: "الشهر الحالي", trend: "neutral", change: "0%" },
    { title: "عدد العملاء", value: "0", icon: Users, description: "إجمالي العملاء النشطين" },
    { title: "الفواتير المستحقة", value: "0 ر.س", icon: FileText, description: "مبالغ لم يتم تحصيلها" },
    { title: "قيمة المخزون", value: "0 ر.س", icon: Package, description: "التكلفة الإجمالية للمخزون" },
    { title: "المنتجات منخفضة المخزون", value: "0", icon: AlertTriangle, description: "تحتاج إلى إعادة طلب" },
    { title: "متوسط قيمة الفاتورة", value: "0 ر.س", icon: BarChart2, description: "متوسط قيمة كل عملية بيع" },
  ];
  
  const salesData: { name: string; sales: number }[] = [];
  const expenseData: { name: string; value: number; color: string }[] = [];
  
  const recentActivities: {text: string; time: string; icon: React.ElementType}[] = [];
  
  const quickLinks: { label: string; href: string; icon: React.ElementType }[] = [
    { label: "إنشاء فاتورة جديدة", href: "/invoicing", icon: FileText },
    { label: "إضافة عميل جديد", href: "/contacts", icon: Users },
    { label: "عرض تقرير المبيعات", href: "#", icon: BarChart2 }, 
    { label: "إدارة المخزون", href: "/inventory", icon: Package },
  ];


  return (
    <>
      <PageHeader title="لوحة التحكم الرئيسية" description="نظرة عامة وشاملة على أداء أعمالك ومؤشراتك الرئيسية." />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {kpiData.map((kpi, index) => (
          <KpiCard key={index} {...kpi} />
        ))}
      </div>
      
       {(kpiData.length === 0 && salesData.length === 0 && expenseData.length === 0) && (
         <Card className="mb-6 shadow-lg">
           <CardContent className="pt-6">
             <p className="text-center text-muted-foreground py-8">لا توجد بيانات لعرضها في لوحة التحكم حالياً. ابدأ بإدخال البيانات في الأقسام المختلفة.</p>
           </CardContent>
         </Card>
       )}

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><BarChart2 className="ml-2 h-5 w-5 text-primary"/>نظرة عامة على المبيعات الشهرية</CardTitle>
            <CardDescription>عرض بياني لإجمالي المبيعات خلال الأشهر الماضية.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] p-4">
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData} layout="vertical" margin={{ right: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" reversed={false} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" width={80} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)', color: 'hsl(var(--popover-foreground))' }} 
                    cursor={{ fill: 'hsl(var(--accent))', fillOpacity: 0.1 }}
                  />
                  <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20}/>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground text-center p-4">لا توجد بيانات مبيعات لعرضها في الرسم البياني حاليًا. <br/> سيتم عرض البيانات بمجرد تسجيل عمليات بيع.</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><PieChartIcon className="ml-2 h-5 w-5 text-primary"/>توزيع المصروفات</CardTitle>
            <CardDescription>تحليل المصروفات حسب الفئات الرئيسية.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] p-4">
            {expenseData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)', color: 'hsl(var(--popover-foreground))' }}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
               <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground text-center p-4">لا توجد بيانات مصروفات لعرضها في الرسم البياني حاليًا. <br/> سيتم عرض البيانات بمجرد تسجيل المصروفات.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><Activity className="ml-2 h-5 w-5 text-primary"/>النشاطات الأخيرة</CardTitle>
            <CardDescription>آخر التحديثات والإجراءات المسجلة في النظام.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivities.length > 0 ? (
              <ul className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm">
                    <activity.icon className="h-4 w-4 mt-1 text-primary flex-shrink-0" />
                    <div>
                        <p className="text-foreground">{activity.text}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center p-4">لا توجد نشاطات حديثة لعرضها. <br/> ستظهر هنا آخر الإجراءات التي تمت في النظام.</p>
            )}
          </CardContent>
        </Card>
         <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><LinkIcon className="ml-2 h-5 w-5 text-primary"/>روابط سريعة</CardTitle>
            <CardDescription>اختصارات لأكثر الوظائف استخدامًا في النظام.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
             {quickLinks.length > 0 ? (
                quickLinks.map((link, index) => (
                  <Button key={index} variant="outline" asChild className="justify-start text-base p-3 h-auto hover:bg-accent hover:text-accent-foreground">
                    <Link href={link.href} className="flex items-center gap-2">
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  </Button>
                ))
            ) : (
              <p className="text-muted-foreground text-center p-4 col-span-full">لا توجد روابط سريعة مضافة حاليًا.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

    