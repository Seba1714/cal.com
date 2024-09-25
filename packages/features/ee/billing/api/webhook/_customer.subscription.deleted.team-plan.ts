import { z } from "zod";

import { TeamBilling } from "../../teams";
import type { SWHMap } from "./__handler";

const metadataSchema = z.object({
  teamId: z.coerce.number(),
});

const handler = async (data: SWHMap["customer.subscription.deleted"]["data"]) => {
  const subscription = data.object;
  try {
    const { teamId } = metadataSchema.parse(subscription.metadata);
    const teamBilling = await TeamBilling.findAndInit(teamId);
    await teamBilling.downgrade();
    return { success: true };
  } catch (error) {
    const team = await TeamBilling.findBySubscriptionId(subscription.id);
    const teamBilling = TeamBilling.init(team);
    await teamBilling.downgrade();
    return { success: true };
  }
};

export default handler;
