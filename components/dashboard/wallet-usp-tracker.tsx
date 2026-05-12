import { Card, CardTitle, CardBody } from "@/components/ui/card";

interface Props {
  walletMentions: number;
  walletConversion: number;
}

export function WalletUSPTracker({ walletMentions, walletConversion }: Props) {
  return (
    <Card>
      <CardTitle>Wallet-USP</CardTitle>
      <CardBody>
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between"><dt>Mentions</dt><dd>{walletMentions}</dd></div>
          <div className="flex justify-between"><dt>Konversion</dt><dd>{(walletConversion * 100).toFixed(1)}%</dd></div>
        </dl>
      </CardBody>
    </Card>
  );
}
