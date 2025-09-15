import UpgradePage from "@/components/UpgradePlan";

export default function TenantPage({ params }) {
  // params.slug is available here
  return <UpgradePage slug={params.slug} />;
}
