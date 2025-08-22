import { CinemaNextReleases } from "@/app/dashboard/cinema-next-releases";
import { CryptoOverview } from "@/app/dashboard/crypto-overview";

export const Dashboard = () => {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 md:gap-6 md:py-6">
          <div className="md:px-4 lg:px-6 flex flex-col gap-4">
            <CryptoOverview />
            <CinemaNextReleases />
          </div>
        </div>
      </div>
    </div>
  );
};
