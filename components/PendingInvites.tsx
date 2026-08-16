'use client';

import { Mail } from 'lucide-react';
import { useNotifications, respondToInvite } from '@/lib/invites';

export default function PendingInvites() {
  const notifications = useNotifications();
  const invites = notifications.filter(
    (n) => n.invitationToken && n.invitationStatus === 'pending'
  );

  if (invites.length === 0) return null;

  return (
    <div className="mb-6 rounded-2xl border border-[#E3E5EC] bg-white">
      <div className="flex items-center gap-2 border-b border-[#E3E5EC] px-4 py-3">
        <Mail className="h-4 w-4 text-[#4C5FD5]" />
        <p className="text-[13.5px] font-medium text-[#171A21]">
          You have {invites.length} pending {invites.length === 1 ? 'invite' : 'invites'}
        </p>
      </div>

      <div className="flex flex-col divide-y divide-[#E3E5EC]">
        {invites.map((invite) => (
          <div key={invite.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <p className="min-w-0 truncate text-[13.5px] text-[#171A21]">
              <span className="font-semibold">{invite.title}</span> &middot; {invite.message}
            </p>
            <div className="flex flex-shrink-0 items-center gap-2">
              <button
                onClick={() => respondToInvite(invite.id, invite.invitationToken!, 'accept')}
                className="rounded-lg bg-[#4C5FD5] px-3 py-1.5 text-[12.5px] font-medium text-white transition-colors hover:bg-[#3E4EC0]"
              >
                Accept
              </button>
              <button
                onClick={() => respondToInvite(invite.id, invite.invitationToken!, 'decline')}
                className="rounded-lg border border-[#E3E5EC] px-3 py-1.5 text-[12.5px] font-medium text-[#6B7280] transition-colors hover:border-[#C4453D] hover:text-[#C4453D]"
              >
                Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
