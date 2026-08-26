"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { VISIT_TREND } from "@/lib/mock-data";
import { useHospital } from "@/lib/store";
import { Panel } from "@/components/cards/Card";

const TOKEN_TONE: Record<string, string> = {
  WAITING: "#2E6FA7",
  IN_CONSULTATION: "#E0A238",
  COMPLETED: "#2F8F5B",
  SKIPPED: "#B3413A",
  HOLD: "#B9791F",
};

const tooltipStyle = {
  background: "#FFFFFF",
  border: "1px solid #DDE4E2",
  borderRadius: 10,
  fontSize: 12,
  fontFamily: "var(--font-sans)",
};

export default function DashboardCharts() {
  const { tokens, doctors, rooms, medicines } = useHospital();

  const tokenStatusData = ["WAITING", "IN_CONSULTATION", "COMPLETED", "SKIPPED", "HOLD"].map((status) => ({
    name: status.replace("_", " "),
    value: tokens.filter((t) => t.status === status || (status === "COMPLETED" && ["MEDICINE_PENDING", "MEDICINE_COMPLETED"].includes(t.status))).length,
    key: status,
  })).filter((d) => d.value > 0);

  const medicineUsage = medicines
    .filter((m) => m.usedToday > 0)
    .sort((a, b) => b.usedToday - a.usedToday)
    .slice(0, 6)
    .map((m) => ({ name: m.name, used: m.usedToday }));

  const doctorLoad = doctors
    .filter((d) => d.status === "ACTIVE")
    .map((d) => ({ name: d.name.replace("Dr. ", ""), patients: tokens.filter((t) => t.doctorId === d.id).length }));

  const roomLoad = rooms.map((r) => ({ name: `R${r.number}`, patients: tokens.filter((t) => t.roomId === r.id).length }));

  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <Panel title="Patient visits this week">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={VISIT_TREND} margin={{ left: -20, right: 10, top: 10 }}>
              <CartesianGrid stroke="#DDE4E2" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#63706E" }} axisLine={{ stroke: "#DDE4E2" }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#63706E" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="patients" stroke="#164E4E" strokeWidth={2.5} dot={{ r: 3, fill: "#164E4E" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Token status today">
        <div className="h-64 flex items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={tokenStatusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                {tokenStatusData.map((d) => (
                  <Cell key={d.key} fill={TOKEN_TONE[d.key]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: "#63706E" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Medicine usage today">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={medicineUsage} margin={{ left: -20, right: 10, top: 10 }}>
              <CartesianGrid stroke="#DDE4E2" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#63706E" }} axisLine={{ stroke: "#DDE4E2" }} tickLine={false} interval={0} angle={-15} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 12, fill: "#63706E" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="used" fill="#E0A238" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Doctor patient load">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={doctorLoad} layout="vertical" margin={{ left: 10, right: 20, top: 10 }}>
              <CartesianGrid stroke="#DDE4E2" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: "#63706E" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11, fill: "#63706E" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="patients" fill="#164E4E" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Room patient load" className="lg:col-span-2">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={roomLoad} margin={{ left: -20, right: 10, top: 10 }}>
              <CartesianGrid stroke="#DDE4E2" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#63706E" }} axisLine={{ stroke: "#DDE4E2" }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#63706E" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="patients" fill="#21716C" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  );
}
