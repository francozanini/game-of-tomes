import { WebhookEvent } from "@clerk/remix/api.server";
import { ActionFunctionArgs } from "@remix-run/node";
import { Webhook } from "svix";

const env = () => ({
  webhookSecret: process.env.WEBHOOK_SECRET!,
  production: process.env.NODE_ENV === "production",
});

export async function action({ request }: ActionFunctionArgs) {
  console.log("request", request);

  if (!env().webhookSecret) {
    throw new Error("Missing webhook secret");
  }

  const verification = await verifySignature(request);

  if (verification === "missingHeaders") {
    return new Response("Missing headers", { status: 400 });
  }

  if (verification === "cannotVerify") {
    return new Response("Cannot verify", { status: 400 });
  }

  console.log("json", await request.json());

  return new Response("ok", { status: 200 });
}

async function verifySignature(
  request: Request,
): Promise<"success" | "missingHeaders" | "cannotVerify"> {
  if (!env().production) {
    return "success";
  }

  const headers = request.headers;
  const svixId = headers.get("svix-id");
  const svixSignature = headers.get("svix-signature");
  const svixTimestamp = headers.get("svix-timestamp");

  if (!svixId || !svixSignature || !svixTimestamp) {
    console.error("Missing headers", svixId, svixSignature, svixTimestamp);
    return "missingHeaders";
  }

  const wh = new Webhook(env().webhookSecret);
  let whEvent;

  try {
    whEvent = (await wh.verify(await request.json(), {
      "svix-id": svixId,
      "svix-signature": svixSignature,
      "svix-timestamp": svixTimestamp,
    })) as WebhookEvent;

    return "success";
  } catch (err) {
    console.error("Cannot verify", err);
    return "cannotVerify";
  }
}
