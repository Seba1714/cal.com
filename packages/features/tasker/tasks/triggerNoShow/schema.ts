import { z } from "zod";

import { TIME_UNIT } from "@calcom/features/ee/workflows/lib/constants";

const commonSchema = z.object({
  bookingId: z.number(),
});

export const ZWebhook = z.object({
  id: z.string(),
  subscriberUrl: z.string().url(),
  appId: z.string().nullable(),
  secret: z.string(),
  time: z.number(),
  timeUnit: z.enum(TIME_UNIT),
  eventTriggers: z.array(z.string()),
});

export const TWebhook = z.infer<typeof ZWebhook>;

export const triggerNoShowPayloadSchema = z.object({
  total_count: z.number(),
  data: z.array(
    z
      .object({
        id: z.string(),
        room: z.string(),
        start_time: z.string(),
        duration: z.number(),
        max_participants: z.number(),
        participants: z.array(
          z.object({
            user_id: z.string(),
            participant_id: z.string(),
            user_name: z.string(),
            join_time: z.number(),
            duration: z.number(),
          })
        ),
      })
      .passthrough()
  ),
});

export const TTriggerNoShowPayloadSchema = z.infer<typeof triggerNoShowPayloadSchema>;

export const ZSendNoShowWebhookPayloadSchema = commonSchema.extend({
  webhook: ZWebhook,
});

export const TSendNoShowWebhookPayloadSchema = z.infer<typeof ZSendNoShowWebhookPayloadSchema>;
