import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'

export default function ProductionTrendChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -12 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5EDE6" vertical={false} />
        <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#4B5563', fontSize: 12 }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: '#4B5563', fontSize: 12 }} />
        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E5EDE6', fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="milk" name="Milk (L)" stroke="#245C3A" strokeWidth={2.5} dot={false} />
        <Line type="monotone" dataKey="eggs" name="Eggs (pcs)" stroke="#65A765" strokeWidth={2.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}