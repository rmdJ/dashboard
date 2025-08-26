import { CryptoOverview } from "@/app/dashboard/cryptoOverview";
import { LoanOverview } from "@/app/dashboard/loanOverview";

export const Dashboard = () => {
  return (
    <div className="flex-1  space-y-6 p-4 md:p-8 md:pt-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <div className="space-y-6">
        <div>
          <CryptoOverview />
        </div>

        <div>
          <div className="w-full md:w-1/2">
            <LoanOverview />
          </div>
        </div>
      </div>
    </div>
  );
};
