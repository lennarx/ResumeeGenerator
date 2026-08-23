import NuevoCvForm from "./NuevoCvForm";

export default function NuevoCvPage() {
  return (
    <div className="flex flex-col gap-5 px-4 pt-6 pb-4">
      <h1 className="text-2xl font-bold text-foreground">Agregar CV</h1>
      <NuevoCvForm />
    </div>
  );
}
