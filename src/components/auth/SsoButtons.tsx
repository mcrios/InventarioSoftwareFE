import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export function SsoButtons() {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <Button variant="outline" className="rounded-xl py-2.5">
        <Icon name="shield_person" className="text-[18px]" />
        <span>Microsoft Entra ID</span>
      </Button>
      <Button variant="outline" className="rounded-xl py-2.5">
        <Icon name="account_circle" className="text-[18px]" />
        <span>Google Workspace</span>
      </Button>
    </div>
  );
}
