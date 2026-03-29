import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { API, type Room, type DRequest } from "@shared/shared-types";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { useUser } from "../components/UserContext";

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

  const handleCallGemini = async () => {
    if (requests.length === 0) return;
    setIsDeciding(true);
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
          description: room?.name || "A generic decision.",
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
      alert(
        err instanceof Error ? err.message : "Error calling AI decision maker",
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
      <div className="flex-1 flex flex-col w-full py-4 px-2 md:px-6">
        <Card className="p-4">Loading room...</Card>
      </div>
    );
  if (error)
    return (
      <div className="flex-1 flex flex-col w-full py-4 px-2 md:px-6">
        <Card className="text-red-500 p-4">{error}</Card>
      </div>
    );
  if (!room)
    return (
      <div className="flex-1 flex flex-col w-full py-4 px-2 md:px-6">
        <Card className="p-4">Room not found.</Card>
      </div>
    );

  return (
    <div className="flex-1 flex flex-col w-full min-h-screen md:min-h-0 md:h-[calc(100vh-80px)] py-4 px-4 md:px-8">
      <div className="flex flex-col md:flex-row gap-6 h-full max-w-[1800px] mx-auto w-full md:overflow-hidden lg:overflow-visible">
        {/* Left Sidebar */}
        <div className="flex flex-col gap-4 md:w-1/4 shrink-0 overflow-y-auto">
          <Card className="p-4 text-center">
            <div className="text-xs uppercase tracking-wider mb-1 text-gray-500">
              Room Code
            </div>
            <div className="text-2xl font-bold mb-1 break-all bg-gray-100 dark:bg-gray-800 p-2 rounded-md mt-1 mb-2">
              {room.roomID}
            </div>
            <div className="text-sm font-semibold mb-3">{room.name}</div>
            <div
              className={`text-xs inline-block px-2 py-1 rounded-full font-medium ${room.isAnonymous ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300" : "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"}`}
            >
              {room.isAnonymous ? "🔒 Anonymous Voting" : "👁️ Public Voting"}
            </div>
          </Card>

          <Card className="p-4 flex-1">
            <div className="text-xs uppercase tracking-wider mb-4 text-gray-500 font-semibold border-b border-gray-200 dark:border-gray-700 pb-2">
              Members ({room.members.length})
            </div>
            <ul className="space-y-3">
              {room.members.map((member, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs uppercase ${getUserColor(member)}`}
                  >
                    {member.substring(0, 2)}
                  </div>
                  <span className="text-sm font-medium">{member}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Right Main Area */}
        <div className="flex flex-col gap-4 md:w-3/4 md:h-full md:min-h-0 overflow-y-auto md:overflow-hidden pb-4 md:pb-0 relative">
          {isDeciding && (
            <div className="absolute inset-0 z-10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl border border-gray-200 dark:border-slate-700">
              <div className="text-6xl animate-pulse mb-4">✨</div>
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
                Consulting AI...
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2 font-medium">
                Crunching the factors to find the best options.
              </p>
            </div>
          )}
          {!decisionMade ? (
            <>
              {/* Add Request Form */}
              <Card className="p-4 border-t-2 border-t-indigo-500 shadow-sm shrink-0">
                <h2 className="text-lg font-bold mb-4">
                  Add a Decision Factor
                </h2>
                <form
                  onSubmit={handleAddMessage}
                  className="flex flex-col gap-3"
                >
                  <input
                    type="text"
                    placeholder="Title (e.g., Price, Location)"
                    className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                  <textarea
                    placeholder="Details (e.g., I want it to be under $5,000)"
                    className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-transparent resize-none h-20 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    required
                  />
                  <div className="self-end">
                    <Button
                      type="submit"
                      disabled={submitting}
                      variant="primary"
                    >
                      {submitting ? "Adding..." : "Submit Factor"}
                    </Button>
                  </div>
                </form>
              </Card>

              {/* Requests List */}
              <div className="flex flex-col gap-4 flex-1 md:min-h-0">
                <h2 className="text-xl font-bold mt-2 shrink-0">
                  Active Factors & Requests
                </h2>
                {requests.length === 0 && (
                  <div className="text-gray-500 italic p-8 text-center border border-dashed rounded-lg border-gray-300 dark:border-gray-700 shrink-0">
                    No factors have been added yet. Be the first to start the
                    decision making process!
                  </div>
                )}

                <div className="space-y-4 md:overflow-y-auto pr-2 custom-scrollbar flex-1 pb-4">
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
                        className="p-4 flex flex-col md:flex-row gap-4 relative shadow-sm hover:shadow-md transition-shadow"
                      >
                        {/* Vote Column */}
                        <div className="flex md:flex-col items-center gap-2 justify-center bg-gray-50 dark:bg-slate-800 rounded-lg p-2 md:p-3 md:min-w-[60px] border border-gray-100 dark:border-slate-700">
                          <button
                            title="Upvote"
                            onClick={() => handleVote(req.id, true)}
                            className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700 transition ${
                              userVote?.upvote === true
                                ? "text-green-500"
                                : "text-gray-400"
                            }`}
                          >
                            ▲
                          </button>
                          <span
                            className={`font-bold text-lg ${score > 0 ? "text-green-500" : score < 0 ? "text-red-500" : "text-gray-600 dark:text-gray-300"}`}
                          >
                            {score}
                          </span>
                          <button
                            title="Downvote"
                            onClick={() => handleVote(req.id, false)}
                            className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700 transition ${
                              userVote?.upvote === false
                                ? "text-red-500"
                                : "text-gray-400"
                            }`}
                          >
                            ▼
                          </button>
                          {userVote && (
                            <button
                              onClick={() => handleRemoveVote(req.id)}
                              className="text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mt-1 uppercase tracking-wider"
                            >
                              Clear
                            </button>
                          )}
                        </div>

                        {/* Content Column */}
                        <div className="flex-1 flex flex-col">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                              {req.title}
                            </h3>
                            {req.sentBy === user?.username && (
                              <button
                                onClick={() => handleDeleteRequest(req.id)}
                                className="text-xs text-red-400 hover:text-red-600 transition uppercase font-semibold"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap flex-1 mb-3">
                            {req.details}
                          </p>

                          {!room.isAnonymous &&
                            req.votingHistory.length > 0 && (
                              <div className="mb-3 flex flex-wrap gap-1.5 items-center">
                                <span className="text-[10px] text-gray-500 mr-1 uppercase tracking-wider font-semibold">
                                  Votes:
                                </span>
                                {req.votingHistory.map((v) => (
                                  <div
                                    key={v.username}
                                    title={`${v.username} voted ${v.upvote ? "Up" : "Down"}`}
                                    className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold border-2 cursor-help transition-colors text-white ${getUserColor(v.username)} ${
                                      v.upvote
                                        ? "border-green-400"
                                        : "border-red-400"
                                    }`}
                                  >
                                    {v.username.substring(0, 2).toUpperCase()}
                                  </div>
                                ))}
                              </div>
                            )}

                          <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-6 h-6 rounded-full text-white flex items-center justify-center font-bold text-[10px] uppercase ${getUserColor(req.sentBy)}`}
                              >
                                {req.sentBy.substring(0, 2)}
                              </span>
                              <span>
                                Added by{" "}
                                <span className="font-semibold">
                                  {req.sentBy}
                                </span>
                              </span>
                            </div>
                            <div className="text-gray-400">
                              {new Date(req.timeStamp).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {/* Make Decision Button */}
                {requests.length > 0 && (
                  <div className="flex justify-end pt-2 mt-auto shrink-0 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      onClick={handleCallGemini}
                      disabled={isDeciding}
                      variant="primary"
                      className="w-full md:w-auto text-lg px-8 py-3 shadow-lg hover:shadow-indigo-500/30 font-bold bg-indigo-600 disabled:bg-indigo-400"
                    >
                      {isDeciding
                        ? "Consulting AI..."
                        : "Call Gemini to Decide ✨"}
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-6 md:h-full min-h-0">
              <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 shrink-0">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
                  Decision Results
                </h2>
                <Button
                  onClick={() => setDecisionMade(false)}
                  variant="secondary"
                  className="px-4 py-2"
                >
                  Back to Editing
                </Button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 md:min-h-0 pb-4 overflow-y-visible md:overflow-y-auto lg:overflow-visible">
                {decisionResults.map((item, index) => (
                  <Card
                    key={index}
                    className="!p-0 flex flex-col md:h-full min-h-[600px] overflow-hidden shadow-xl hover:shadow-2xl transition-shadow border-t-4 border-t-indigo-500"
                  >
                    {/* Top frosted section */}
                    <div className="p-6 bg-gray-50 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-700/50 flex flex-col gap-4 h-1/2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                          Option {index + 1}
                        </span>
                      </div>
                      <h3 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">
                        {item.title || `Option ${index + 1}`}
                      </h3>
                      <p className="text-base text-gray-600 dark:text-gray-300 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {item.description ||
                          "The AI generated this option based on your factors, but no description was provided."}
                      </p>
                    </div>
                    {/* Bottom radar chart section */}
                    <div className="h-1/2 p-6 flex flex-col bg-transparent relative border-t border-gray-100 dark:border-gray-800">
                      <div className="text-xs font-bold text-gray-800 dark:text-gray-400 uppercase tracking-widest mb-4">
                        Factor Match Analysis
                      </div>
                      <div className="w-full flex-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                        {item.factors?.map((f: any, i: number) => {
                          const originalFactor = requests.find(
                            (r) => String(r.id) === String(f.factorId),
                          );
                          const title =
                            originalFactor?.title || `Factor ${f.factorId}`;
                          return (
                            <div key={i} className="flex flex-col gap-1.5">
                              <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                                <span className="truncate pr-2">{title}</span>
                                <span className="shrink-0">
                                  {f.matchPercent}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-1000 ${f.matchPercent >= 75 ? "bg-green-500" : f.matchPercent >= 40 ? "bg-amber-500" : "bg-red-500"}`}
                                  style={{
                                    width: `${Math.max(0, Math.min(100, f.matchPercent))}%`,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        }) || (
                          <div className="text-sm text-gray-400 text-center mt-8">
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
