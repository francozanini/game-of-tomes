import { WebhookEvent } from "@clerk/remix/api.server";
import { ActionFunctionArgs } from "@remix-run/node";
import { Webhook } from "svix";
import { createUser, deleteUser, updateUser } from "~/.server/model/user";

const env = () => ({
  webhookSecret: process.env.WEBHOOK_SECRET!,
  production: process.env.NODE_ENV === "production",
});

export async function action({ request }: ActionFunctionArgs) {
  console.log("request", JSON.stringify(request));

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

  const body = verification.event as UserEvent;

  const data = body.data;

  if (body.type === "user.created") {
    console.log("creating user", data);
    const firstEmail = data.email_addresses[0].email_address;
    await createUser({
      id: data.id,
      email: firstEmail,
      username: data.username || firstEmail,
      imageUrl: data.image_url,
    });
    console.log("created user");
  } else if (body.type === "user.updated") {
    console.log("updating user", data);
    const firstEmail = data.email_addresses[0].email_address;
    await updateUser(data.id, {
      email: firstEmail,
      username: data.username || firstEmail,
      imageUrl: data.image_url,
    });
    console.log("updated user", data);
  } else if (body.type === "user.deleted") {
    await deleteUser(data.id);
    console.log("deleted user", data);
  } else throw new Error("Unknown event type");

  return new Response("ok", { status: 200 });
}

type EmailAddress = {
  id: string;
  email_address: string;
};

type UserCreatedEvent = {
  object: "event";
  type: "user.created";
  data: {
    id: string;
    email_addresses: EmailAddress[];
    firstName: string | undefined;
    lastName: string | undefined;
    username: string | null;
    image_url: string | null;
    phoneNumber: string;
    phoneNumberVerified: boolean;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    customFields: {
      [key: string]: string;
    };
  };
};

type UserUpdatedEvent = {
  object: "event";
  type: "user.updated";
  data: {
    id: string;
    email_addresses: EmailAddress[];
    firstName: string;
    lastName: string;
    username: string;
    phoneNumber: string;
    phoneNumberVerified: boolean;
    image_url: string | null;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    customFields: {
      [key: string]: string;
    };
  };
};

type UserDeletedEvent = {
  object: "event";
  type: "user.deleted";
  data: {
    id: string;
    email_addresses: EmailAddress[];
    firstName: string;
    lastName: string;
    username: string;
    phoneNumber: string;
    image_url: string | null;
    phoneNumberVerified: boolean;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    customFields: {
      [key: string]: string;
    };
  };
};

type UserEvent = UserCreatedEvent | UserUpdatedEvent | UserDeletedEvent;

async function verifySignature(request: Request) {
  if (!env().production) {
    return { res: "success", event: await request.json() } as const;
  }

  const headers = request.headers;
  const svixId = headers.get("svix-id");
  const svixSignature = headers.get("svix-signature");
  const svixTimestamp = headers.get("svix-timestamp");

  console.info("svix headers", svixId, svixSignature, svixTimestamp);

  if (!svixId || !svixSignature || !svixTimestamp) {
    console.error("Missing headers", svixId, svixSignature, svixTimestamp);
    return "missingHeaders" as const;
  }

  const wh = new Webhook(env().webhookSecret);
  let whEvent;

  try {
    whEvent = (await wh.verify(await request.text(), {
      "svix-id": svixId,
      "svix-signature": svixSignature,
      "svix-timestamp": svixTimestamp,
    })) as WebhookEvent;

    return { res: "success", event: whEvent } as const;
  } catch (err) {
    console.error("Cannot verify", err);
    return "cannotVerify" as const;
  }
}
