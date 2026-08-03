import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";

const PALETTE = {
  primary: "#2563EB",
  secondary: "#10B981",
  accent: "#F59E0B",
  danger: "#EF4444",
  violet: "#8B5CF6",
  sky: "#0EA5E9",
  pink: "#EC4899",
};

const CHART_COLORS = [PALETTE.primary, PALETTE.secondary, PALETTE.accent, PALETTE.danger, PALETTE.violet, PALETTE.sky, PALETTE.pink];

const axisStyle = { fontSize: 11, fill: "#64748b" };
const tooltipStyle = {
  borderRadius: 10,
  border: "1px solid #e2e8f0",
  boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
  fontSize: 12,
  fontFamily: "Inter, sans-serif",
};

export { PALETTE, CHART_COLORS, tooltipStyle, axisStyle };

export const TrendAreaChart = ({ data }: { data: Array<Record<string, string | number>> }) => (
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
      <defs>
        <linearGradient id="gSubmitted" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={PALETTE.primary} stopOpacity={0.28} />
          <stop offset="95%" stopColor={PALETTE.primary} stopOpacity={0} />
        </linearGradient>
        <linearGradient id="gCompleted" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={PALETTE.secondary} stopOpacity={0.28} />
          <stop offset="95%" stopColor={PALETTE.secondary} stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
      <XAxis dataKey="label" tick={axisStyle} axisLine={false} tickLine={false} />
      <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
      <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "#cbd5e1" }} />
      <Area type="monotone" dataKey="submitted" name="Submitted" stroke={PALETTE.primary} strokeWidth={2.5} fill="url(#gSubmitted)" />
      <Area type="monotone" dataKey="completed" name="Completed" stroke={PALETTE.secondary} strokeWidth={2.5} fill="url(#gCompleted)" />
    </AreaChart>
  </ResponsiveContainer>
);

export const GroupedBarChart = ({ data }: { data: Array<Record<string, string | number>> }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data} margin={{ top: 8, right: 8, left: -22, bottom: 0 }} barSize={12}>
      <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
      <XAxis dataKey="label" tick={axisStyle} axisLine={false} tickLine={false} interval={0} />
      <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
      <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#f1f5f9" }} />
      <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" iconSize={8} />
      <Bar dataKey="completed" name="Completed" fill={PALETTE.secondary} radius={[4, 4, 0, 0]} />
      <Bar dataKey="pending" name="Pending" fill={PALETTE.primary} radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);

export const SimpleBarChart = ({ data }: { data: Array<Record<string, string | number>> }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data} margin={{ top: 8, right: 8, left: -22, bottom: 0 }} barSize={18}>
      <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
      <XAxis dataKey="label" tick={axisStyle} axisLine={false} tickLine={false} interval={0} />
      <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
      <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#f1f5f9" }} />
      <Bar dataKey="count" name="Count" fill={PALETTE.primary} radius={[6, 6, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);

export const DonutChart = ({
  data,
}: {
  data: Array<{ name: string; value: number; color?: string }>;
}) => (
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie
        data={data}
        dataKey="value"
        nameKey="name"
        innerRadius="62%"
        outerRadius="88%"
        paddingAngle={3}
        stroke="none"
      >
        {data.map((entry, i) => (
          <Cell key={entry.name} fill={entry.color ?? CHART_COLORS[i % CHART_COLORS.length]} />
        ))}
      </Pie>
      <Tooltip contentStyle={tooltipStyle} />
      <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" iconSize={8} />
    </PieChart>
  </ResponsiveContainer>
);

export const RadialGauge = ({
  value,
  label,
  color = PALETTE.primary,
}: {
  value: number;
  label: string;
  color?: string;
}) => (
  <div className="flex flex-col items-center gap-1">
    <ResponsiveContainer width="100%" height={150}>
      <RadialBarChart
        cx="50%"
        cy="50%"
        innerRadius="70%"
        outerRadius="100%"
        barSize={12}
        data={[{ name: label, value }]}
        startAngle={220}
        endAngle={-40}
      >
        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
        <RadialBar dataKey="value" cornerRadius={10} fill={color} background={{ fill: "#f1f5f9" }} />
      </RadialBarChart>
    </ResponsiveContainer>
    <div className="-mt-2 text-center">
      <p className="text-2xl font-bold text-foreground">{Math.round(value)}%</p>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  </div>
);

export const MiniLineChart = ({
  data,
  dataKey,
  color = PALETTE.primary,
}: {
  data: Array<Record<string, string | number>>;
  dataKey: string;
  color?: string;
}) => (
  <ResponsiveContainer width="100%" height={60}>
    <LineChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
      <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
    </LineChart>
  </ResponsiveContainer>
);
