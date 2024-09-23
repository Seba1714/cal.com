import { WEBHOOK_TRIGGER_EVENTS } from "@calcom/features/webhooks/lib/constants";

import {
  calculateMaxStartTime,
  getHosts,
  getMeetingSessionsFromRoomName,
  sendWebhookPayload,
} from "./common";
import { ZSendNoShowWebhookPayloadSchema } from "./schema";

export async function triggerGuestNoShow(payload: string): Promise<void> {
  const { roomName, bookingId, webhook } = ZSendNoShowWebhookPayloadSchema.parse(JSON.parse(payload));

  const meetingDetails = await getMeetingSessionsFromRoomName(roomName);
  const booking = await getBooking(bookingId);

  const hosts = getHosts(booking);
  const allParticipants = meetingDetails.data.flatMap((meeting) => meeting.participants);

  const hostsThatDidntJoinTheCall = hosts.filter(
    (host) => !checkIfUserJoinedTheCall(host.id, allParticipants)
  );

  const numberOfHostsThatJoined = hosts.length - hostsThatDidntJoinTheCall.length;

  const maxStartTime = calculateMaxStartTime(booking.startTime, webhook.time, webhook.timeUnit);

  const didGuestJoinTheCall = meetingDetails.data.some(
    (meeting) => meeting.max_participants < numberOfHostsThatJoined
  );

  if (!didGuestJoinTheCall) {
    await sendWebhookPayload(
      webhook,
      WEBHOOK_TRIGGER_EVENTS.AFTER_GUESTS_DAILY_NO_SHOW,
      booking,
      roomName,
      maxStartTime
    );
  }
}

function checkIfUserJoinedTheCall(userId: string, allParticipants: Participants): boolean {
  return allParticipants.some((participant) => participant.user_id === userId);
}
