import { CinemaNextReleases } from "@/app/cinema-agenda/cinemaNextReleases";

export const CinemaAgenda = () => {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 md:pt-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agenda cinéma</h1>
        <div className="text-xs text-muted-foreground mt-1">
          Prochaines sorties cinéma
        </div>
      </div>
      <CinemaNextReleases />
    </div>
  );
};
