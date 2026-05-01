import { BellSimpleIcon, CheckCircleIcon } from "@phosphor-icons/react";
import Button from "../../../components/button/button";

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
                <p>You have 0 unread notifications</p>
                </div>
            </div>

            <div className="text-gray-500 flex flex-col items-center justify-center gap-4 py-10 border border-gray-500/[0.1] rounded-[10px]">
                <BellSimpleIcon size={48} color="currentColor" />
                <p>No notifications yet.</p>
            </div>
        </section>
    </div>
  );
}

export default Notifications;
