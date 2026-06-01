import React, { useEffect, useState } from 'react';
import { useOrganizations } from '../../context/organizationContext';
import { ChatMessage } from '../../interface/organization';
import { PaperclipIcon } from '@phosphor-icons/react/dist/ssr';
import Button from '../button/button';
import GetAvatar from '../../customHooks/useGetAvatar';
import GetUsername from '../../customHooks/useGetUsername';
import { formatDateTime } from '../../helpers/dateTime';
import { useUser } from '../../context/authContext';

export default function Chat({ orgId }: { orgId: string }) {
  const { loadMessages, messages, sendMessage, uploadFile } = useOrganizations();
  const { user } = useUser();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (!orgId) return;
    let cancelled = false;

    const refreshMessages = async () => {
      if (cancelled) return;
      await loadMessages(orgId);
    };

    refreshMessages();
    const intervalId = window.setInterval(refreshMessages, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [orgId, loadMessages]);

  const handleSend = async () => {
    if (!orgId || (!text.trim() && !selectedFile)) return;
    setSending(true);
    try {
      const attachments: string[] = [];
      if (selectedFile) {
        const uploaded = await uploadFile(selectedFile);
        if (uploaded) attachments.push(uploaded.url);
      }
      await sendMessage(orgId, { text: text.trim(), attachments });
      setText('');
      setSelectedFile(null);
      await loadMessages(orgId);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white dark:bg-dark rounded-lg border border-gray-500/[0.1] p-2 flex flex-col h-[400px] justify-between">
      <div className="max-h-64 overflow-y-auto pr-1 bg-background rounded-lg py-3 space-y-1 flex-1">
        {(messages || []).length === 0 ? (
          <p className="text-sm text-gray-500 px-3">No messages yet. Start the conversation below.</p>
        ) : null}
        {(messages || []).map((m: ChatMessage) => (
          <div key={m.$id} className=" rounded-lg">
            <div className={`flex items-center gap-2 ${m.userEmail === user?.email ? 'justify-end' : ''}`}>
              <GetAvatar email={m.userEmail || 'unknown@flashtasks.app'} className="w-8 h-8" />
              <div className="flex flex-col">
                <GetUsername email={m.userEmail} userId={m.userId} className="text-sm font-medium" />
                {m.$createdAt ? (
                  <span className="text-[9px] text-gray-500">{formatDateTime(m.$createdAt, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                ) : null}
              </div>
            </div>

            <p className={`mt-3 text-sm whitespace-pre-wrap p-2 px-4 max-w-[75%] w-fit ${m.userEmail === user?.email ? 'ml-auto bg-blue-100 dark:bg-blue-900/30 text-right rounded-l-lg' : 'bg-gray-100 dark:bg-gray-800 rounded-r-lg'}`}>
              {m.text || ''}
            </p>

            {m.attachments?.length ? (
              <div className="mt-2 flex flex-wrap gap-2 max-w-[75%] ml-auto">
                {m.attachments.map((url) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs underline break-all"
                  >
                    {url}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="flex gap-2 items-start bg-white dark:bg-dark-bg border border-gray-500/[0.2] p-2">
        <div className='flex-1'>
            <textarea
            placeholder="Write a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 p-2 border-none w-full outline-none"
            />
            <div>
                <label className="text-xs text-gray-500 cursor-pointer">
                    <PaperclipIcon size={16} />
                    <input type="file" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                </label>
            </div>
        </div>
        <Button size="small" onClick={handleSend} disabled={sending} className="px-3 py-2 bg-primary text-white rounded">
          Send
        </Button>
      </div>
    </div>
  );
}
