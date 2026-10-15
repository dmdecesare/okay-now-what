import { cache } from "react";
import { getCustomerAccountByToken } from "@/db/queries";

/** Deduped per request, so the layout header and the page share one lookup. */
export const getCustomer = cache(getCustomerAccountByToken);
