import * as Game from "~/game/model";
import { useUnit } from "effector-react";

export const SendInviteDialog = () => {
  const { inviteLink } = useUnit({
    inviteLink: Game.$inviteLink,
  });
  if (!inviteLink) return null;
  const handleCopy = async () => {
    try {
      if (navigator?.clipboard) {
        await navigator.clipboard.writeText(inviteLink);
      } else {
        // Fallback for browsers without clipboard API
        const textArea = document.createElement("textarea");
        textArea.value = inviteLink;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <dialog
      open
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        padding: "16px",
        backgroundColor: "white",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        borderRadius: "8px",
        border: "none",
      }}
    >
      <h3 style={{ marginBottom: "12px" }}>Send link to invite a competitor</h3>
      <div style={{ display: "flex", alignItems: "center" }}>
        <input
          type="text"
          value={inviteLink}
          readOnly
          style={{
            padding: "8px",
            borderRadius: "4px 0 0 4px",
            border: "1px solid #ccc",
            flexGrow: 1,
          }}
        />
        <button
          onClick={handleCopy}
          style={{
            padding: "8px",
            borderRadius: "0 4px 4px 0",
            border: "1px solid #ccc",
            borderLeft: "none",
            background: "white",
            cursor: "pointer",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M13 0H6C4.9 0 4 0.9 4 2V10C4 11.1 4.9 12 6 12H13C14.1 12 15 11.1 15 10V2C15 0.9 14.1 0 13 0ZM13 10H6V2H13V10ZM2 4H0V14C0 15.1 0.9 16 2 16H12V14H2V4Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
    </dialog>
  );
};
