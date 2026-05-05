import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BellSimpleIcon } from "@phosphor-icons/react";
import { useUser } from "../../../context/authContext";

function Notifications() {
  const { acceptTeamInvite } = useUser();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'idle' | 'accepting' | 'accepted' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const teamId = searchParams.get('teamId') || '';
    const membershipId = searchParams.get('membershipId') || '';
    const userId = searchParams.get('userId') || '';
    const secret = searchParams.get('secret') || '';

    if (!teamId || !membershipId || !userId || !secret || status !== 'idle') return;

    const accept = async () => {
      setStatus('accepting');
      const accepted = await acceptTeamInvite(teamId, membershipId, userId, secret);

      if (accepted) {
        setStatus('accepted');
        setMessage('Invite accepted. You can now access the organization.');
      } else {
        setStatus('error');
        setMessage('Unable to accept this invite link. Please open the invite email again or sign in first.');
      }
    };

    accept();
  }, [acceptTeamInvite, searchParams, status]);

  return (
    <div className="min-h-screen">

      {/* Notifications Cards */}
       <section className="flex flex-col gap-6 bg-white dark:bg-dark-bg md:rounded-[10px] p-6 h-full mb-4">
            <div className="flex justify-between gap-6 items-start flex-wrap">
                <div className="flex flex-col gap-3">
                <h1 className="font-medium md:text-[24px] text-[18px] leading-[120%]">
                    Notifications
                </h1>
                <p>Organization invites are delivered by email.</p>
                </div>
            </div>

      {message ? (
        <div className={`flex flex-col items-center justify-center gap-4 py-10 border rounded-[10px] ${status === 'error' ? 'text-red-500 border-red-500/20' : 'text-gray-500 border-gray-500/[0.1]'}`}>
          <BellSimpleIcon size={48} color="currentColor" />
          <p className="text-center max-w-md">{message}</p>
        </div>
      ) : (
        <div className="text-gray-500 flex flex-col items-center justify-center gap-4 py-10 border border-gray-500/[0.1] rounded-[10px]">
          <BellSimpleIcon size={48} color="currentColor" />
          <p>Open the invite email to join an organization.</p>
          <p className="text-sm text-center max-w-md">If the email link includes the Appwrite membership parameters, this page will accept it automatically.</p>
        </div>
      )}
        </section>
    </div>
  );
}

export default Notifications;
