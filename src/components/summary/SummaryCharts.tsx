'use client';

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CategoryStat, TopItem } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface SummaryChartsProps {
  categoryStats: CategoryStat[];
  topItems: TopItem[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-900">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {p.name === 'Value' ? formatCurrency(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

export function SummaryCharts({ categoryStats, topItems }: SummaryChartsProps) {
  const pieValueData = categoryStats.map((c) => ({
    name: c.category,
    value: parseFloat(c.value.toFixed(2)),
    color: c.color,
  }));

  const pieQtyData = categoryStats.map((c) => ({
    name: c.category,
    value: c.quantity,
    color: c.color,
  }));

  const topItemsValueData = topItems
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)
    .map((t) => ({
      name: t.item.name.length > 15 ? t.item.name.slice(0, 14) + '…' : t.item.name,
      Value: parseFloat(t.value.toFixed(2)),
      Qty: t.quantity,
    }));

  const topItemsQtyData = [...topItems]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 8)
    .map((t) => ({
      name: t.item.name.length > 15 ? t.item.name.slice(0, 14) + '…' : t.item.name,
      Qty: t.quantity,
      Value: parseFloat(t.value.toFixed(2)),
    }));

  return (
    <div className="space-y-4">
      {/* Category Value Pie */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Value by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieValueData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={85}
                paddingAngle={2}
                dataKey="value"
              >
                {pieValueData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => formatCurrency(Number(v))}
                contentStyle={{ borderRadius: '8px', border: '1px solid #f0f0f0' }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Quantity Pie */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Quantity by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieQtyData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={85}
                paddingAngle={2}
                dataKey="value"
              >
                {pieQtyData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #f0f0f0' }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Items by Value */}
      {topItemsValueData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Highest Value Items</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topItemsValueData} layout="vertical" margin={{ left: 0, right: 16 }}>
                <XAxis type="number" tickFormatter={(v) => `$${v}`} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" width={95} tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Value" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Top Items by Quantity */}
      {topItemsQtyData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Most Consumed Items</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topItemsQtyData} layout="vertical" margin={{ left: 0, right: 16 }}>
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" width={95} tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Qty" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
