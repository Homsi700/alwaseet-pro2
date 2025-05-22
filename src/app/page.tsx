"use client";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Package, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Image from 'next/image';


const kpiData = [
  { title: "Total Revenue", value: "$125,670", icon: DollarSign, trend: "up", change: "+12.5%" },
  { title: "New Customers", value: "1,250", icon: Users, trend: "up", change: "+8.2%" },
  { title: "Pending Invoices", value: "85", icon: Package, trend: "down", change: "-3.1%" },
  { title: "Low Stock Items", value: "12", icon: AlertTriangle, trend: "neutral", change: "" },
];

const salesData = [
  { name: 'Jan', sales: 4000 },
  { name: 'Feb', sales: 3000 },
  { name: 'Mar', sales: 5000 },
  { name: 'Apr', sales: 4500 },
  { name: 'May', sales: 6000 },
  { name: 'Jun', sales: 5500 },
];

const expenseData = [
  { name: 'Salaries', value: 400, color: 'hsl(var(--chart-1))' },
  { name: 'Marketing', value: 300, color: 'hsl(var(--chart-2))'  },
  { name: 'Rent', value: 200, color: 'hsl(var(--chart-3))'  },
  { name: 'Utilities', value: 278, color: 'hsl(var(--chart-4))'  },
];


export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" description="Overview of your business performance." />
      
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
                <p className={`text-xs ${kpi.trend === 'up' ? 'text-green-600' : kpi.trend === 'down' ? 'text-red-600' : 'text-muted-foreground'} flex items-center`}>
                  {kpi.trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : kpi.trend === 'down' ? <TrendingDown className="h-3 w-3 mr-1" /> : null}
                  {kpi.change} vs last month
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Expense Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="text-sm text-muted-foreground">Invoice #INV001 created.</li>
              <li className="text-sm text-muted-foreground">New customer "Tech Solutions" added.</li>
              <li className="text-sm text-muted-foreground">Stock updated for "Product X".</li>
            </ul>
          </CardContent>
        </Card>
         <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col space-y-2">
            <button className="text-sm text-primary hover:underline">Create New Invoice</button>
            <button className="text-sm text-primary hover:underline">Add New Product</button>
            <button className="text-sm text-primary hover:underline">View Reports</button>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Promotional Banner</CardTitle>
            </CardHeader>
            <CardContent>
                <Image 
                    src="https://placehold.co/600x400.png" 
                    alt="Promotional Banner" 
                    width={600} 
                    height={400} 
                    className="rounded-md"
                    data-ai-hint="business promotion" 
                />
                <p className="text-sm mt-2 text-muted-foreground">Special offer this month! Upgrade your plan and get 20% off.</p>
            </CardContent>
        </Card>
      </div>
    </>
  );
}
