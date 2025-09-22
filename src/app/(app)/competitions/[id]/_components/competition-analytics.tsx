'use client';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { Participant } from '@/lib/types';

interface CompetitionAnalyticsProps {
  participants: Participant[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function CompetitionAnalytics({ participants }: CompetitionAnalyticsProps) {
  const ageData = useMemo(() => {
    const ageGroups: { [key: string]: number } = {
      '0-10': 0,
      '11-20': 0,
      '21-30': 0,
      '31-40': 0,
      '41+': 0,
    };
    participants.forEach(p => {
      if (p.age <= 10) ageGroups['0-10']++;
      else if (p.age <= 20) ageGroups['11-20']++;
      else if (p.age <= 30) ageGroups['21-30']++;
      else if (p.age <= 40) ageGroups['31-40']++;
      else ageGroups['41+']++;
    });
    return Object.entries(ageGroups).map(([name, value]) => ({ name, participants: value }));
  }, [participants]);

  const districtData = useMemo(() => {
    const districtGroups: { [key: string]: number } = {};
    participants.forEach(p => {
      districtGroups[p.district] = (districtGroups[p.district] || 0) + 1;
    });
    return Object.entries(districtGroups)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Show top 10 districts for clarity
  }, [participants]);

  if (participants.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground py-10">
                <p>No participant data available to generate analytics.</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Age Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false}/>
              <Tooltip />
              <Legend />
              <Bar dataKey="participants" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>District Representation (Top 10)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={districtData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {districtData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
