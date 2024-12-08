import { useState } from "react";

import * as Game from "~/game/model";
import { useUnit } from "effector-react";

export const SendInviteDialog = () => {
  const { inviteLink } = useUnit({
    inviteLink: Game.$inviteLink,
  });

  const [copied, setCopied] = useState(false);
  if (!inviteLink) return null;
  const handleCopy = async () => {
    try {
      if (navigator?.clipboard) {
        await navigator.clipboard.writeText(inviteLink);
        setCopied(true);
      } else {
        // Fallback for browsers without clipboard API
        const textArea = document.createElement("textarea");
        textArea.value = inviteLink;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopied(true);
      }
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <dialog open className="relative p-4 mt-[20%] bg-white shadow-lg rounded-lg border-none max-w-md w-full mx-4">
        <h3 className="mb-3 text-lg font-medium">Send link to invite a competitor</h3>
        <div className="flex">
          <input
            type="text"
            value={inviteLink}
            readOnly
            className="h-10 px-3 rounded-l-md border border-gray flex-grow"
          />
          <button
            onClick={handleCopy}
            className={`h-10 px-3 rounded-r-md border border-l-0 border-gray 
            ${copied ? "bg-green_yellow text-gray hover:bg-green_yellow-600 active:bg-green_yellow-700" : "bg-white text-gray hover:bg-gray-50 active:bg-gray-600"} 
            transition-colors duration-200`}
          >
            {copied ? (
              // Checkmark icon
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17L4 12" />
              </svg>
            ) : (
              // Copy icon
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M13 0H6C4.9 0 4 0.9 4 2V10C4 11.1 4.9 12 6 12H13C14.1 12 15 11.1 15 10V2C15 0.9 14.1 0 13 0ZM13 10H6V2H13V10ZM2 4H0V14C0 15.1 0.9 16 2 16H12V14H2V4Z"
                  fill="currentColor"
                />
              </svg>
            )}
          </button>
        </div>
      </dialog>
    </div>
  );
};
