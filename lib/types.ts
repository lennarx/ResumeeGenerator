export type Cv = {
  id: string;
  name: string;
  updatedAt: string;
  iconColor: "blue" | "green";
};

export type Application = {
  id: string;
  company: string;
  date: string;
  cvUsed: string;
};
