// import "./DashboardDialog.module.css";
import * as Ariakit from "@ariakit/react";
import "@front/components/Dialog.module.css";

interface JoinDialogProps {
  open: boolean;
  onClose: () => void;
  joinCode: string;
  setJoinCode: (code: string) => void;
  joinError: string | null;
  setJoinError: (err: string | null) => void;
  onSubmit: (code: string) => void;
}

export function JoinDialog({
  open,
  onClose,
  joinCode,
  setJoinCode,
  joinError,
  setJoinError,
  onSubmit,
}: JoinDialogProps) {
  return (
    <Ariakit.Dialog open={open} onClose={onClose} className="dialog">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setJoinError(null);
          if (!joinCode.trim()) {
            setJoinError("Please enter a room code.");
            return;
          }
          onSubmit(joinCode.trim());
        }}
      >
        <div className="relative p-2 md:p-4 overflow-hidden">
          {/* Decorative backdrop elements inside dialog */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

          <div className="relative z-10">
            <Ariakit.DialogHeading className="text-2xl font-black mb-6 tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
              </div>
              Join a Room
            </Ariakit.DialogHeading>

            <div className="space-y-4">
              <div>
                <label
                  className="block mb-1.5 text-sm font-bold text-text-muted uppercase tracking-wider"
                  htmlFor="join-room-code"
                >
                  Room Code
                </label>
                <input
                  id="join-room-code"
                  className="w-full bg-surface-muted/50 border-2 border-brand/10 hover:border-brand/30 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-brand/20 focus:border-brand transition-all duration-300 text-lg font-mono tracking-widest uppercase placeholder:normal-case placeholder:tracking-normal placeholder:font-sans placeholder:text-text-muted/50 text-center"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="e.g. 1A2B3C"
                  maxLength={8}
                  autoFocus
                  required
                />
              </div>

              {joinError && (
                <div className="bg-red-50 text-red-600 text-sm font-semibold p-3 rounded-lg flex items-center gap-2 border border-red-100">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  {joinError}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-8 pt-6 border-t border-brand/10">
              <Ariakit.DialogDismiss className="flex-1 py-3 bg-surface-muted hover:bg-surface-elevated text-text font-bold rounded-xl transition-all duration-200 shadow-sm border border-transparent hover:border-brand/10 focus:outline-none focus:ring-2 focus:ring-brand/20 outline-none text-center hover:cursor-pointer">
                Cancel
              </Ariakit.DialogDismiss>
              <button
                type="submit"
                className="flex-1 py-3 bg-brand text-surface font-bold rounded-xl shadow-lg shadow-brand/20 hover:shadow-brand/40 hover:-translate-y-0.5 transition-all duration-200 border border-transparent focus:outline-none focus:ring-4 focus:ring-brand/30 outline-none hover:cursor-pointer"
              >
                Join Room
              </button>
            </div>
          </div>
        </div>
      </form>
    </Ariakit.Dialog>
  );
}
