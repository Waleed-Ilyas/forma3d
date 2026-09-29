import { Configurator } from "@/components/Configurator";
import { ConfigProvider } from "@/components/ConfigProvider";
import { decodeConfig } from "@/lib/share";

// The configuration is read from the URL on the server, so a shared link renders the right options with no flash of defaults.
export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const initial = decodeConfig(await searchParams);
  return (
    <ConfigProvider initial={initial}>
      <Configurator />
    </ConfigProvider>
  );
}
