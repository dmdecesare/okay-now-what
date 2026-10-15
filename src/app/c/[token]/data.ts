import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getCustomerView, type CustomerView } from "@/db/queries";

/** Shared by every customer tab: request-time load, friendly 404 for unknown links. */
export async function loadCustomer(params: Promise<{ token: string }>): Promise<CustomerView & { token: string }> {
  await connection();
  const { token } = await params;
  const view = await getCustomerView(token);
  if (!view) notFound();
  return { ...view, token };
}
