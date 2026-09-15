import { HotelView } from "@/components/hotel-view";

export const dynamic = "force-dynamic";

export default async function HotelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <HotelView id={id} />;
}
