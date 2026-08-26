import {
  LayoutDashboard,
  Search,
  Ticket,
  Bell,
  User,
  Users,
  Stethoscope,
  FileText,
  ClipboardList,
  PackageSearch,
  DoorOpen,
  CalendarClock,
  Boxes,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";

import type { Role } from "./types";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV: Record<Role, NavItem[]> = {
  patient: [
    {
      label: "Dashboard",
      href: "/patient/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Search OPD",
      href: "/patient/search",
      icon: Search,
    },
    {
      label: "My Token",
      href: "/patient/token",
      icon: Ticket,
    },
    {
      label: "Prescriptions",
      href: "/patient/prescriptions",
      icon: FileText,
    },
    {
      label: "Notifications",
      href: "/patient/notifications",
      icon: Bell,
    },
    {
      label: "Profile",
      href: "/patient/profile",
      icon: User,
    },
  ],

  doctor: [
    {
      label: "Dashboard",
      href: "/doctor/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Patient Queue",
      href: "/doctor/patients",
      icon: Users,
    },
    {
      label: "Current Patient",
      href: "/doctor/consultation",
      icon: Stethoscope,
    },
    {
      label: "Prescription",
      href: "/doctor/prescription",
      icon: FileText,
    },
  ],

  clinic: [
    {
      label: "Dashboard",
      href: "/clinic/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Pending Prescriptions",
      href: "/clinic/prescriptions",
      icon: ClipboardList,
    },
    {
      label: "Dispensing",
      href: "/clinic/dispensing",
      icon: PackageSearch,
    },
  ],

  admin: [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Doctors",
      href: "/admin/doctors",
      icon: Stethoscope,
    },
    {
      label: "Rooms",
      href: "/admin/rooms",
      icon: DoorOpen,
    },
    {
      label: "Doctor Assignments",
      href: "/admin/assignments",
      icon: CalendarClock,
    },
    {
      label: "OPD Management",
      href: "/admin/opd",
      icon: Users,
    },
    {
      label: "Inventory",
      href: "/admin/inventory",
      icon: Boxes,
    },
    {
      label: "Prescriptions",
      href: "/admin/prescriptions",
      icon: FileText,
    },
    {
      label: "Reports",
      href: "/admin/reports",
      icon: BarChart3,
    },
    {
      label: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ],
};

export const ROLE_LABEL: Record<Role, string> = {
  patient: "Patient",
  doctor: "Doctor",
  clinic: "Clinic / Medical Shop",
  admin: "Administrator",
};
