import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { API, type Room, type DRequest } from "@shared/shared-types";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { useUser } from "../components/UserContext";
import Chart from "../components/Chart";

const getUserColor = (username: string) => {
  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-amber-500",
    "bg-green-500",
    "bg-emerald-500",
    "bg-teal-500",
    "bg-cyan-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-violet-500",
    "bg-purple-500",
    "bg-fuchsia-500",
    "bg-pink-500",
    "bg-rose-500",
  ];
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

function RoomPage() {
  const { id } = useParams();
  const { user } = useUser();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<DRequest[]>([]);

  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [decisionMade, setDecisionMade] = useState(false);
  const [isDeciding, setIsDeciding] = useState(false);
  const [decisionResults, setDecisionResults] = useState<any[]>([]);
  const [decisionError, setDecisionError] = useState<string | null>(null);

  const handleCallGemini = async () => {
    if (requests.length < 3) {
      setDecisionError(
        "Please add at least 3 factors to give Gemini enough context to decide.",
      );
      return;
    }
    setIsDeciding(true);
    setDecisionError(null);
    try {
      const promptFactors = requests.map((req) => {
        const upvotes = req.votingHistory.filter((v) => v.upvote).length;
        const downvotes = req.votingHistory.filter((v) => !v.upvote).length;
        return {
          id: req.id,
          title: req.title,
          details: req.details,
          user_weighting: upvotes - downvotes,
        };
      });

      const res = await fetch(API.BASE + API.CALL_GEMINI, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: room?.problemDescription
            ? `${room?.name}\n\nContext: ${room?.problemDescription}`
            : room?.name || "A generic decision.",
          factors: promptFactors,
        }),
      });

      if (!res.ok) {
        throw new Error((await res.text()) || "Failed to generate decision.");
      }

      const rawText = await res.text();
      // Remove any markdown block wrapping if present
      const cleanString = rawText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      const data = JSON.parse(cleanString);

      setDecisionResults(data);
      setDecisionMade(true);
    } catch (err) {
      console.error("Error generating decision:", err);
      setDecisionError(
        err instanceof Error
          ? err.message
          : "We ran into an error connecting to Gemini. Please try again.",
      );
    } finally {
      setIsDeciding(false);
    }
  };

  useEffect(() => {
    async function fetchRoomAndJoin() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(API.BASE + API.ROOM_BASE + "/" + id);
        if (!res.ok) {
          throw new Error(await res.text());
        }
        const data: Room = await res.json();
        setRoom(data);
        if (data.requests) setRequests(data.requests);

        if (user && data && !data.members.includes(user.username)) {
          await fetch(API.BASE + API.ROOM_BASE + "/" + id + API.ADD_TO_ROOM, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: user.username }),
          });
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchRoomAndJoin();
  }, [id, user]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(
        API.BASE + API.ROOM_BASE + "/" + id + API.GET_MESSAGES,
      );
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !details || !user) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        API.BASE + API.ROOM_BASE + "/" + id + API.ADD_MESSAGE,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sentBy: user.username,
            title,
            details,
          }),
        },
      );
      if (res.ok) {
        setTitle("");
        setDetails("");
        fetchMessages();
      }
    } catch (err) {
      console.error("Error adding message:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (messageId: string, upvote: boolean) => {
    if (!user) return;
    try {
      const res = await fetch(
        API.BASE + API.ROOM_BASE + "/" + id + API.ADD_VOTE,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messageId,
            username: user.username,
            upvote,
          }),
        },
      );
      if (res.ok) fetchMessages();
    } catch (err) {
      console.error("Error voting:", err);
    }
  };

  const handleRemoveVote = async (messageId: string) => {
    if (!user) return;
    try {
      const res = await fetch(
        API.BASE + API.ROOM_BASE + "/" + id + API.REMOVE_VOTE,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messageId,
            username: user.username,
          }),
        },
      );
      if (res.ok) fetchMessages();
    } catch (err) {
      console.error("Error removing vote:", err);
    }
  };

  const handleDeleteRequest = async (messageId: string) => {
    if (!user) return;
    try {
      const res = await fetch(
        API.BASE + API.ROOM_BASE + "/" + id + API.REMOVE_MESSAGE,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messageId }),
        },
      );
      if (res.ok) fetchMessages();
    } catch (err) {
      console.error("Error deleting request:", err);
    }
  };

  if (loading)
    return (
      <div className="flex-1 flex items-center justify-center w-full py-20">
        <div className="flex flex-col items-center gap-4">
          <svg
            className="animate-spin h-10 w-10 text-brand"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-text-muted font-bold tracking-widest uppercase text-sm">
            Loading Room...
          </span>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="flex-1 flex items-center justify-center w-full py-20 px-4">
        <Card className="text-red-500 bg-red-50 p-8 border border-red-100 shadow-sm text-center max-w-md w-full">
          <svg
            className="w-12 h-12 mx-auto mb-4 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="font-bold text-lg mb-2">Room Error</h3>
          <p className="text-sm font-medium">{error}</p>
        </Card>
      </div>
    );
  if (!room)
    return (
      <div className="flex-1 flex items-center justify-center w-full py-20 px-4">
        <Card className="p-8 shadow-sm text-center max-w-md w-full border border-surface-elevated">
          <svg
            className="w-12 h-12 mx-auto mb-4 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="font-bold text-lg text-text mb-2">Room not found</h3>
          <p className="text-sm text-text-muted">
            This room may have been deleted or the code is incorrect.
          </p>
        </Card>
      </div>
    );

  return (
    <div className="w-full flex-1 flex flex-col py-8 px-4 md:px-8 relative min-h-0">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-brand/5 blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-[1400px] mx-auto w-full flex flex-col lg:flex-row gap-8 relative items-start">
        {/* Left Sidebar */}
        <div className="flex flex-col gap-6 w-full lg:w-[320px] shrink-0 sticky top-8">
          {/* Room Details Card */}
          <Card className="p-6 bg-surface/80 backdrop-blur-xl shadow-sm border border-brand/10 flex flex-col text-center">
            <span className="text-xs uppercase tracking-widest font-black text-text-muted mb-2">
              Room Code
            </span>
            <div className="font-mono text-2xl font-black bg-surface-muted/50 py-3 px-4 rounded-xl border border-surface-elevated text-brand mb-5 mx-auto w-max tracking-widest shadow-inner">
              {room.roomID}
            </div>
            <h1 className="text-2xl font-black text-text mb-4 leading-tight">
              {room.name}
            </h1>
            {room.problemDescription && (
              <div className="flex flex-col mb-6 bg-surface-muted/40 rounded-xl border border-surface-elevated overflow-hidden shadow-sm text-left">
                <div className="bg-surface-elevated/50 px-4 py-2 border-b border-surface-elevated">
                  <span className="text-xs font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-brand"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    The Decision
                  </span>
                </div>
                <div className="p-4 text-sm font-medium text-text-muted leading-relaxed">
                  {room.problemDescription}
                </div>
              </div>
            )}
            <div className="flex justify-center">
              <span
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${room.isAnonymous ? "bg-purple-50 text-purple-600 border border-purple-100" : "bg-brand/10 text-brand border border-brand/20"}`}
              >
                {room.isAnonymous ? (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>{" "}
                    Anonymous Mode
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>{" "}
                    Public Voting
                  </>
                )}
              </span>
            </div>
          </Card>

          {/* Members List */}
          <Card className="p-6 bg-surface shadow-sm border border-surface-elevated/50 flex-1">
            <h3 className="text-sm uppercase tracking-widest font-black text-text mb-5 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-brand"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              Members{" "}
              <span className="bg-surface-muted text-text-muted px-2 py-0.5 rounded-md text-xs">
                {room.members.length}
              </span>
            </h3>
            <ul className="space-y-4 pt-1">
              {room.members.map((member, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-3 bg-surface-muted/30 p-2 rounded-xl border border-transparent hover:border-surface-elevated transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-lg shadow-sm flex items-center justify-center text-white font-black text-sm uppercase shrink-0 ${getUserColor(member)}`}
                  >
                    {member.substring(0, 2)}
                  </div>
                  <span className="text-base font-bold text-text truncate">
                    {member}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Right Main Area */}
        <div className="flex flex-col gap-8 w-full lg:flex-1 relative pb-12">
          {isDeciding && (
            <div className="absolute inset-0 z-50 bg-surface/60 backdrop-blur-xl flex flex-col items-center justify-center rounded-3xl border border-brand/20 shadow-2xl shadow-brand/10 mx-[-1rem] px-[1rem]">
              <svg
                className="animate-spin w-16 h-16 text-brand mb-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-hover mb-3">
                Consulting Gemini...
              </h2>
              <p className="text-text-muted font-bold text-xl text-center max-w-sm">
                Crunching the factors to find the absolute best option.
              </p>
            </div>
          )}

          {!decisionMade ? (
            <>
              {/* Add Request Form */}
              <Card className="p-6 md:p-8 bg-surface/80 backdrop-blur-md shadow-sm border border-brand/10">
                <h2 className="text-2xl font-black text-text mb-6 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </span>
                  Add a Decision Factor
                </h2>
                <form
                  onSubmit={handleAddMessage}
                  className="flex flex-col gap-5"
                >
                  <input
                    type="text"
                    placeholder="E.g. Cost, Location, Mood..."
                    className="w-full bg-surface-muted/50 border-2 border-brand/10 hover:border-brand/30 rounded-xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-brand/20 focus:border-brand transition-all duration-300 text-lg font-bold placeholder:font-medium placeholder:text-text-muted/50 shadow-sm"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                  <textarea
                    placeholder="Details about this factor..."
                    className="w-full bg-surface-muted/50 border-2 border-brand/10 hover:border-brand/30 rounded-xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-brand/20 focus:border-brand transition-all duration-300 text-base font-medium placeholder:font-normal placeholder:text-text-muted/50 shadow-sm min-h-[120px] resize-y"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    required
                  />
                  <div className="flex justify-end pt-1">
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="px-8 py-3.5 bg-brand text-surface text-lg font-black rounded-xl shadow-xl shadow-brand/20 hover:shadow-brand/40 hover:-translate-y-0.5 transition-all border-none"
                    >
                      {submitting ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 inline"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Adding...
                        </>
                      ) : (
                        "Add Factor"
                      )}
                    </Button>
                  </div>
                </form>
              </Card>

              {/* Factors List */}
              <div className="flex flex-col gap-6 mt-2">
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-3xl font-black text-text">
                    Active Factors
                  </h2>
                  <span className="text-sm font-black text-text-muted/80 bg-surface-muted px-4 py-1.5 rounded-full border border-surface-elevated uppercase tracking-wider">
                    {requests.length} total
                  </span>
                </div>

                {requests.length === 0 && (
                  <Card className="p-16 text-center border-2 border-dashed border-surface-elevated bg-transparent shadow-none">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-brand/5 flex items-center justify-center">
                      <svg
                        className="w-10 h-10 text-brand/40"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </div>
                    <p className="text-xl font-black text-text mb-2">
                      No factors added yet
                    </p>
                    <p className="text-base text-text-muted font-medium max-w-sm mx-auto">
                      Add the first constraint or requirement above to start
                      shaping the decision.
                    </p>
                  </Card>
                )}

                <div className="grid grid-cols-1 gap-5">
                  {requests.map((req) => {
                    const upvotes = req.votingHistory.filter(
                      (v) => v.upvote,
                    ).length;
                    const downvotes = req.votingHistory.filter(
                      (v) => !v.upvote,
                    ).length;
                    const score = upvotes - downvotes;

                    const userVote = req.votingHistory.find(
                      (v) => v.username === user?.username,
                    );

                    return (
                      <Card
                        key={req.id}
                        className="p-6 flex flex-col md:flex-row gap-6 shadow-sm hover:shadow-md transition-all bg-surface border-2 border-surface-elevated relative group"
                      >
                        {/* Vote Column */}
                        <div className="flex md:flex-col items-center gap-1.5 justify-center bg-surface-muted/50 rounded-2xl p-2 md:p-3 md:min-w-[80px] border border-surface-elevated/50 shrink-0">
                          <button
                            title={
                              userVote?.upvote === true
                                ? "Remove Upvote"
                                : "Upvote"
                            }
                            onClick={() =>
                              userVote?.upvote === true
                                ? handleRemoveVote(req.id)
                                : handleVote(req.id, true)
                            }
                            className={`p-2 rounded-xl transition-all shadow-sm active:scale-95 border-2 ${
                              userVote?.upvote === true
                                ? "bg-green-500 text-white border-green-600 scale-105"
                                : "bg-surface text-text-muted hover:text-green-600 hover:border-green-400/50 border-transparent shadow-none"
                            }`}
                          >
                            <svg
                              className="w-7 h-7"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 15l7-7 7 7"
                              />
                            </svg>
                          </button>
                          <span
                            className={`font-black text-2xl my-1 ${score > 0 ? "text-green-500" : score < 0 ? "text-red-500" : "text-text"}`}
                          >
                            {score}
                          </span>
                          <button
                            title={
                              userVote?.upvote === false
                                ? "Remove Downvote"
                                : "Downvote"
                            }
                            onClick={() =>
                              userVote?.upvote === false
                                ? handleRemoveVote(req.id)
                                : handleVote(req.id, false)
                            }
                            className={`p-2 rounded-xl transition-all shadow-sm active:scale-95 border-2 ${
                              userVote?.upvote === false
                                ? "bg-red-500 text-white border-red-600 scale-105"
                                : "bg-surface text-text-muted hover:text-red-600 hover:border-red-400/50 border-transparent shadow-none"
                            }`}
                          >
                            <svg
                              className="w-7 h-7"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>
                        </div>

                        {/* Content Column */}
                        <div className="flex-1 flex flex-col min-w-0">
                          <div className="flex justify-between items-start mb-3 gap-4">
                            <h3 className="text-xl md:text-2xl font-black text-text leading-tight break-words">
                              {req.title}
                            </h3>
                            {req.sentBy === user?.username && (
                              <button
                                onClick={() => handleDeleteRequest(req.id)}
                                className="text-xs text-red-500 hover:text-red-700 transition-colors uppercase font-black tracking-widest shrink-0 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-900/50"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                          <p className="text-base text-text-muted whitespace-pre-wrap flex-1 mb-5 font-medium leading-relaxed">
                            {req.details}
                          </p>

                          {/* Footer Info */}
                          <div className="mt-auto pt-4 border-t-2 border-surface-elevated/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2 bg-surface-muted px-3 py-1.5 rounded-full">
                                <span
                                  className={`w-5 h-5 rounded-full text-white flex items-center justify-center font-bold text-[10px] uppercase shadow-sm ${getUserColor(req.sentBy)}`}
                                >
                                  {req.sentBy.substring(0, 2)}
                                </span>
                                <span className="text-xs font-bold text-text">
                                  {req.sentBy}
                                </span>
                              </div>
                              <span className="text-xs font-bold text-text-muted/60 tracking-wider uppercase">
                                {new Date(req.timeStamp).toLocaleDateString(
                                  undefined,
                                  { month: "short", day: "numeric" },
                                )}
                              </span>
                            </div>

                            {/* Votes visualization */}
                            {!room.isAnonymous &&
                              req.votingHistory.length > 0 && (
                                <div className="flex items-center gap-1.5 justify-end flex-wrap">
                                  <span className="text-[10px] text-text-muted uppercase tracking-widest font-black mr-2">
                                    Voters:
                                  </span>
                                  {req.votingHistory.map((v) => (
                                    <div
                                      key={v.username}
                                      title={`${v.username} voted ${v.upvote ? "Up" : "Down"}`}
                                      className={`flex items-center justify-center w-7 h-7 rounded-lg text-[10px] font-black border-2 shadow-sm transform hover:scale-110 hover:-translate-y-1 transition-all cursor-help text-white ${getUserColor(v.username)} ${
                                        v.upvote
                                          ? "border-green-400"
                                          : "border-red-400"
                                      }`}
                                    >
                                      {v.username.substring(0, 2)}
                                    </div>
                                  ))}
                                </div>
                              )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {/* Make Decision Button */}
                {requests.length > 0 && (
                  <div className="pt-8 mt-4 sticky bottom-8 z-10 w-full flex flex-col gap-4">
                    {decisionError && (
                      <div className="bg-red-50 dark:bg-red-900/20 text-red-600 border border-red-200 dark:border-red-800/50 p-4 rounded-xl flex items-center gap-3 shadow-sm animate-fade-in w-full backdrop-blur-md">
                        <svg
                          className="w-6 h-6 shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                        <span className="font-bold text-sm flex-1">
                          {decisionError}
                        </span>
                        <button
                          onClick={() => setDecisionError(null)}
                          className="ml-auto hover:bg-red-100 dark:hover:bg-red-900/40 p-1.5 rounded-lg transition-colors"
                        >
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
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    )}

                    {requests.length < 3 && (
                      <div className="text-center bg-surface-muted/90 backdrop-blur-md py-2.5 px-5 rounded-2xl border-2 border-surface-elevated text-sm font-bold text-text-muted shadow-sm w-max mx-auto shadow-brand/5">
                        <svg
                          className="w-4 h-4 inline-block mr-2 text-brand -mt-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Need {3 - requests.length} more factor
                        {3 - requests.length === 1 ? "" : "s"} to consult Gemini
                      </div>
                    )}

                    <Button
                      onClick={handleCallGemini}
                      disabled={isDeciding || requests.length < 3}
                      className="w-full text-xl md:text-2xl px-10 py-6 shadow-2xl shadow-brand/20 hover:shadow-brand/40 font-black bg-brand text-surface rounded-2xl transition-all hover:-translate-y-1 flex items-center justify-center gap-4 border-none disabled:opacity-60 disabled:hover:translate-y-0 disabled:cursor-not-allowed group"
                    >
                      {isDeciding ? (
                        <>
                          <svg
                            className="animate-spin h-7 w-7 text-surface"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <span className="bg-surface/20 p-0 rounded-xl group-hover:scale-110 transition-transform">
                            <svg
                              className="w-8 h-8"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                              />
                            </svg>
                          </span>
                          Help me decide!
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-8 w-full animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-surface/80 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-brand/10">
                <div>
                  <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-hover mb-2 leading-tight">
                    Decision Results
                  </h2>
                  <p className="text-text-muted font-bold text-lg">
                    Review the top recommendations based on your factors.
                  </p>
                </div>
                <Button
                  onClick={() => setDecisionMade(false)}
                  className="px-6 py-3.5 bg-surface-muted text-text hover:bg-surface-elevated font-black rounded-xl border-2 border-surface-elevated transition-colors shadow-sm whitespace-nowrap"
                >
                  <svg
                    className="w-5 h-5 inline mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Back to Editing
                </Button>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {decisionResults.map((item, index) => (
                  <Card
                    key={index}
                    className="flex flex-col min-h-[600px] overflow-hidden shadow-sm border-2 border-surface-elevated relative group hover:shadow-lg transition-all hover:-translate-y-1 bg-surface p-0"
                  >
                    {/* Podium Ranking Badge */}
                    <div className="absolute top-5 right-5 z-10">
                      <span
                        className={`flex items-center justify-center w-12 h-12 rounded-2xl font-black text-xl shadow-md border-2 ${index === 0 ? "bg-amber-100 text-amber-600 border-amber-300 shadow-amber-500/20" : index === 1 ? "bg-slate-100 text-slate-500 border-slate-300 shadow-slate-500/20" : index === 2 ? "bg-orange-50 text-orange-700 border-orange-200 shadow-orange-500/20" : "bg-surface-elevated text-text border-surface-elevated"}`}
                      >
                        #{index + 1}
                      </span>
                    </div>

                    {/* Top Text Section */}
                    <div className="p-8 pb-6 border-b-2 border-surface-elevated flex flex-col gap-4 h-1/2">
                      <h3 className="text-3xl font-black text-text leading-tight pr-14 mt-2">
                        {item.title || `Option ${index + 1}`}
                      </h3>
                      <p className="text-base text-text-muted font-medium pr-2 leading-relaxed overflow-y-auto custom-scrollbar">
                        {item.description ||
                          "Gemini generated this option based on your factors, but no description was provided."}
                      </p>
                    </div>

                    {/* Radar Chart Section */}
                    <div className="bg-surface-muted/30 p-8 flex flex-col h-1/2">
                      <div className="text-xs font-black text-text-muted uppercase tracking-widest mb-6 text-center">
                        Factor Match Score
                      </div>
                      <div className="flex-1 flex items-center justify-center w-full min-h-[220px]">
                        {item.factors && item.factors.length > 0 ? (
                          <Chart
                            metrics={item.factors.map((f: any) => {
                              const originalFactor = requests.find(
                                (r) => String(r.id) === String(f.factorId),
                              );
                              return (
                                originalFactor?.title || `Factor ${f.factorId}`
                              );
                            })}
                            data={item.factors.map((f: any) => f.matchPercent)}
                            label={`Match Score`}
                          />
                        ) : (
                          <div className="text-sm font-bold text-text-muted/60 text-center">
                            No factor data available
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RoomPage;
