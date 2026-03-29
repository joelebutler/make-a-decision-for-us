import { useState } from "react";
import { useNavigate } from "react-router";
import * as Ariakit from "@ariakit/react";
import styles from "@front/components/Dialog.module.css";
import { Button } from "@front/components/Button";

interface DialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}
export default function Dialog({ open, setOpen }: DialogProps) {
  const [roomID, setRoomId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = roomID.trim();
    if (!trimmed) {
      setError("Please enter a room ID.");
      return;
    }
    setOpen(false);
    navigate(`/room/${trimmed}`);
  };

  return (
    <Ariakit.Dialog
      open={open}
      onClose={() => setOpen(false)}
      className={styles.dialog}
    >
      <Ariakit.DialogHeading className={styles.heading}>
        Join a Room
      </Ariakit.DialogHeading>
      <form onSubmit={handleSubmit}>
        <label htmlFor="room-id" className="block mb-2 text-sm font-medium">
          Room ID
        </label>
        <input
          id="room-id"
          className="w-full border border-brand/20 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-brand bg-surface/80 text-text"
          value={roomID}
          onChange={(e) => setRoomId(e.target.value.toUpperCase())}
          placeholder="Enter code (e.g. 1A2B3C4D)"
          maxLength={8}
          autoFocus
          required
        />
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <div className="flex justify-end gap-2 mt-4">
          <Button type="submit" className="px-2 py-1">
            <Ariakit.DialogDismiss>Cancel</Ariakit.DialogDismiss>
          </Button>
          <Button type="submit" className="px-2 py-1">
            Join
          </Button>
        </div>
      </form>
    </Ariakit.Dialog>
  );
}
