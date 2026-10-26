import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'

export default function IncomeExpenseChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -12 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5EDE6" vertical={false} />
        <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#4B5563', fontSize: 12 }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: '#4B5563', fontSize: 12 }} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: '1px solid #E5EDE6', fontSize: 12 }}
          formatter={(v) => [`৳${v.toLocaleString()}`, undefined]}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="income" name="Income" fill="#65A765" radius={[6, 6, 0, 0]} />
        <Bar dataKey="expense" name="Expense" fill="#8B6A43" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}