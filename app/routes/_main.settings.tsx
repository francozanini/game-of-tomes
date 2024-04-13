import { Form, useLoaderData } from "@remix-run/react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../@/components/ui/select";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { db } from "~/.server/model/db";
import { requireAuthenticated } from "~/.server/auth/guards";
import { USERS } from "~/.server/model/tables";
import { Label } from "../../@/components/ui/label";
import { Button } from "../../@/components/ui/button";
import { zfd } from "zod-form-data";

export async function loader(args: LoaderFunctionArgs) {
  const { userId } = await requireAuthenticated(args);
  const { lang } = await db
    .selectFrom(USERS)
    .select("lang")
    .where("id", "=", userId)
    .executeTakeFirstOrThrow();

  return json({ lang: lang });
}

const langSchema = zfd.formData({
  lang: zfd.text().transform((arg, ctx) => {
    if (arg !== "en" && arg !== "es") {
      ctx.addIssue({
        code: "invalid_enum_value",
        message: "Invalid language selected",
        received: arg,
        options: ["en", "es"],
      });
    }

    return arg as "en" | "es";
  }),
});

export async function action(args: LoaderFunctionArgs) {
  const { userId } = await requireAuthenticated(args);
  const formData = await args.request.formData();
  const { lang } = langSchema.parse(formData);

  await db.updateTable(USERS).set({ lang }).where("id", "=", userId).execute();

  return json({ lang });
}

export default function SettingsPage() {
  const { lang } = useLoaderData<typeof loader>();

  return (
    <div className="container mt-4 max-w-xl space-y-2">
      <Form method="post" className="space-y-2">
        <Label>Language</Label>
        <Select defaultValue={lang ? lang : undefined} name="lang">
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Select your prefered language" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Language</SelectLabel>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button type="submit">Submit</Button>
      </Form>
    </div>
  );
}
