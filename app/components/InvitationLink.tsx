import { Link } from "@remix-run/react";
import { Button } from "../../@/components/ui/button";

export function InvitationLink(props: { invitation: Invitation }) {
  return (
    <div className="flex flex-col gap-2">
      <Link to={invitationLink(props.invitation)}>
        Invitation Link: {props.invitation.inviteToken}
      </Link>
    </div>
  );
}

type Invitation = {
  clubId: number;
  invitationId: number;
  inviteToken: string;
};

export function invitationLink({
  invitationId,
  inviteToken,
}: Omit<Invitation, "clubId">) {
  return `/invite/${invitationId}/${inviteToken}/`;
}
