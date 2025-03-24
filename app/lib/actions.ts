"use server";
import { z } from "zod";

import postgres from "postgres";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL environment variable is not defined");
}

const sql = postgres(process.env.POSTGRES_URL, { ssl: { rejectUnauthorized: false } });

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.string(),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });
  // console.log(rawFormData)
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split("T")[0];

  await sql`

INSERT INTO invoices (customer_id, amount, status, date)
VALUES (${customerId}, ${amountInCents}, ${status}, ${date})

`;

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}
