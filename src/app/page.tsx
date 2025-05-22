"use client";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Package, AlertTriangle, TrendingUp, TrendingDown, Activity, Link as LinkIcon } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Button } from "@/components/ui/button"; // Added Button import

// Data is now expected to come from state or props
// const kpiData = []; 
// const salesData = [];
// const expenseData = [];
// const recentActivities = [];
// const quickLinks = [];

export default function DashboardPage() {
  // In a real app, this data would come from API calls and be stored in state
  const kpiData: { title: string; value: string; icon: React.ElementType; trend?: "up" | "down" | "neutral"; change?: string }[] = [
    // Example structure, data should be fetched
    // { title: "إجمالي الإيرادات", value: "0 ر.س", icon: DollarSign, trend: "neutral", change: "0%" },
    // { title: "عملاء جدد", value: "0", icon: Users, trend: "neutral", change: "0%" },
  ];
  const salesData: { name: string; sales: number }[] = [];
  const expenseData: { name: string; value: number; color: string }[] = [];
  const recentActivities: string[] = [];
  const quickLinks: { label: string; href: string }[] = [];


  return (
    <>
      <PageHeader title="لوحة التحكم" description="نظرة عامة على أداء عملك." />
      
      {kpiData.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {kpiData.map((kpi) => (
            <Card key={kpi.title} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <kpi.icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
                {kpi.change && (
                  <p className={`text-xs ${kpi.trend === 'up' ? 'text-green-500' : kpi.trend === 'down' ? 'text-red-500' : 'text-muted-foreground'} flex items-center`}>
                    {kpi.trend === 'up' ? <TrendingUp className="h-3 w-3 ml-1" /> : kpi.trend === 'down' ? <TrendingDown className="h-3 w-3 ml-1" /> : null}
                    {kpi.change} مقارنة بالشهر الماضي
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="mb-6 shadow-lg">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">لا توجد مؤشرات أداء رئيسية لعرضها حالياً.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>نظرة عامة على المبيعات</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" reversed={true} />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" width={80} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', color: 'hsl(var(--popover-foreground))' }} cursor={{ fill: 'hsl(var(--accent))', fillOpacity: 0.1 }}/>
                  <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20}/>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">لا توجد بيانات مبيعات لعرضها.</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>توزيع المصروفات</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
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
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', color: 'hsl(var(--popover-foreground))' }}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
               <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">لا توجد بيانات مصروفات لعرضها.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><Activity className="ml-2 h-5 w-5"/>النشاطات الأخيرة</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivities.length > 0 ? (
              <ul className="space-y-3">
                {recentActivities.map((activity, index) => (
                  <li key={index} className="text-sm text-muted-foreground">{activity}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">لا توجد نشاطات حديثة لعرضها.</p>
            )}
          </CardContent>
        </Card>
         <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><LinkIcon className="ml-2 h-5 w-5"/>روابط سريعة</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col space-y-2">
             {quickLinks.length > 0 ? (
                quickLinks.map((link, index) => (
                    <Button key={index} variant="link" className="text-primary justify-start p-0 h-auto hover:underline">
                        {link.label}
                    </Button>
                ))
            ) : (
              <p className="text-muted-foreground">لا توجد روابط سريعة حاليًا.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
