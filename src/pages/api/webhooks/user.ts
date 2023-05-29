import { IncomingHttpHeaders } from "http";
import { buffer } from "micro";
import { NextApiRequest, NextApiResponse } from "next";
import { Webhook, WebhookRequiredHeaders } from "svix";
import { prisma } from "~/server/db";

const isProduction = process.env.NODE_ENV === "production";
const webhookSecret = isProduction
  ? process.env.WEBHOOK_SECRET_PROD
  : process.env.WEBHOOK_SECRET || "";

type EventType = "user.created" | "user.updated" | "*";

type Event = {
  data: Record<string, string | number>;
  object: "event";
  type: EventType;
};

type NextApiRequestWithSvixRequiredHeaders = NextApiRequest & {
  headers: IncomingHttpHeaders & WebhookRequiredHeaders;
};

// Disable the bodyParser so we can access the raw
// request body for verification.
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequestWithSvixRequiredHeaders,
  res: NextApiResponse
) {
  if (!webhookSecret) {
    throw new Error("Webhook secret must be defined in environment variables");
  }

  // Verify the webhook signature
  // See https://docs.svix.com/receiving/verifying-payloads/how
  const payload = (await buffer(req)).toString();
  const headers = req.headers;
  const wh = new Webhook(webhookSecret);
  let evt: Event | null = null;
  try {
    evt = wh.verify(payload, headers) as Event;
  } catch (_) {
    return res.status(400).json({});
  }

  // Handle the webhook
  // Upser the users in the db
  const eventType: EventType = evt.type;
  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, ...attributes } = evt.data;

    await prisma.user.upsert({
      where: { externalId: id as string },
      create: {
        externalId: id as string,
        attributes,
      },
      update: { attributes },
    });
  }

  res.json({});
}
