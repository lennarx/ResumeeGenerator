import type { Cv, Application } from "@/lib/types";

export const mockCvs: Cv[] = [
  {
    id: "cv-qa",
    name: "QA",
    updatedAt: "Actualizado hace 3 dias",
    iconColor: "blue",
  },
  {
    id: "cv-salud",
    name: "Salud",
    updatedAt: "Actualizado hace 2 semanas",
    iconColor: "green",
  },
];

export const mockApplications: Application[] = [
  {
    id: "app-1",
    company: "Laboratorios Sur",
    date: "18 ago 2026",
    cvUsed: "Salud",
  },
  {
    id: "app-2",
    company: "Nimbus Software",
    date: "12 ago 2026",
    cvUsed: "QA",
  },
  {
    id: "app-3",
    company: "Clinica del Parque",
    date: "30 jul 2026",
    cvUsed: "Salud",
  },
];
