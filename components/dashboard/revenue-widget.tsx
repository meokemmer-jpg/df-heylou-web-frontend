import { Card, CardTitle, CardBody } from "@/components/ui/card";
import type { RevenueSummary } from "@/lib/heylou-api";

export function RevenueWidget({ revenue }: { revenue: RevenueSummary | null }) {
  if (!revenue) {
    return (
      <Card>
        <CardTitle>Revenue</CardTitle>
        <CardBody><p className="text-neutral-500">Keine Daten verfuegbar.</p></CardBody>
      </Card>
    );
  }
  return (
    <Card>
      <CardTitle>Revenue ({revenue.windowDays} Tage)</CardTitle>
      <CardBody>
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between"><dt>Direct</dt><dd>EUR {Math.round(revenue.directBookingsRevenue).toLocaleString("de-DE")}</dd></div>
          <div className="flex justify-between"><dt>OTA</dt><dd>EUR {Math.round(revenue.otaRevenue).toLocaleString("de-DE")}</dd></div>
          <div className="flex justify-between font-semibold"><dt>Anteil</dt><dd>{Math.round(revenue.directBookingRatio * 100)}%</dd></div>
        </dl>
      </CardBody>
    </Card>
  );
}
