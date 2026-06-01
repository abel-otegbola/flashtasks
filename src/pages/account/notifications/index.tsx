import { BellSimpleIcon } from "@phosphor-icons/react";

function Notifications() {
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

      <div className="text-gray-500 flex flex-col items-center justify-center gap-4 py-10 border border-gray-500/[0.1] rounded-[10px]">
        <BellSimpleIcon size={48} color="currentColor" />
        <p>Open the invite email to join an organization.</p>
        <p className="text-sm text-center max-w-md">Invitation acceptance now happens on the dedicated invitation page.</p>
      </div>
        </section>
    </div>
  );
}

export default Notifications;
