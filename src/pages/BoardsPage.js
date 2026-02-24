import Navbar from "../components/Navbar";
import { db, auth } from "../firebase";

import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where
} from "firebase/firestore";

import { useEffect, useState } from "react";
import BoardCard from "../components/BoardCard";

export default function BoardsPage() {

  const [boards, setBoards] = useState([]);
  const [creating, setCreating] = useState(false);
  const [boardName, setBoardName] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  /* ================= LOAD USER BOARDS ================= */

  useEffect(() => {

    if (!auth.currentUser) return;

    const q = query(
      collection(db, "boards"),
      where("ownerId", "==", auth.currentUser.uid)
    );

    const unsub = onSnapshot(q, snap => {
      setBoards(
        snap.docs.map(d => ({
          id: d.id,
          ...d.data()
        }))
      );
    });

    return unsub;

  }, []);

  /* ================= CREATE BOARD ================= */

  const createBoard = async () => {

    if (!boardName.trim()) return;

    await addDoc(collection(db, "boards"), {
      name: boardName,
      ownerId: auth.currentUser.uid
    });

    setBoardName("");
    setCreating(false);
  };

  /* ================= EDIT BOARD ================= */

  const startEdit = board => {
    setEditingId(board.id);
    setEditName(board.name);
  };

  const saveEdit = async id => {

    if (!editName.trim()) return;

    await updateDoc(doc(db, "boards", id), {
      name: editName
    });

    setEditingId(null);
  };

  /* ================= DELETE BOARD ================= */

  const deleteBoard = async id => {
    if (!window.confirm("Delete this board?")) return;
    await deleteDoc(doc(db, "boards", id));
  };

  /* ================= UI ================= */

  return (
    <>
      <Navbar />

      <div className="
        min-h-screen
        p-10
        bg-gradient-to-br
        from-[#cfe3db]
        via-[#b9d6cb]
        to-[#a9c8bd]
      ">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

          {boards.map(board => (

            <div key={board.id} className="relative">

              {editingId === board.id ? (

                <div className="
                  bg-white/80
                  backdrop-blur
                  p-4
                  rounded-xl
                  shadow-lg
                ">
                  <input
                    value={editName}
                    autoFocus
                    onChange={e => setEditName(e.target.value)}
                    onBlur={() => saveEdit(board.id)}
                    onKeyDown={e =>
                      e.key === "Enter" && saveEdit(board.id)
                    }
                    className="border w-full p-2 rounded-lg outline-none"
                  />
                </div>

              ) : (

                <>
                  <BoardCard board={board} />

                  <div className="absolute top-2 right-2 flex gap-2">

                    <button
                      onClick={() => startEdit(board)}
                      className="
                        bg-white/80
                        backdrop-blur
                        text-xs
                        px-2 py-1
                        rounded-lg
                        shadow
                        hover:bg-white
                      "
                    >
                      ✏️
                    </button>

                    <button
                      onClick={() => deleteBoard(board.id)}
                      className="
                        bg-white/80
                        backdrop-blur
                        text-xs
                        px-2 py-1
                        rounded-lg
                        shadow
                        hover:bg-red-200
                      "
                    >
                      🗑
                    </button>

                  </div>
                </>
              )}

            </div>
          ))}

          {creating ? (

            <div className="
              bg-white/80
              backdrop-blur
              p-5
              rounded-xl
              shadow-lg
            ">

              <input
                value={boardName}
                autoFocus
                placeholder="Enter board name"
                onChange={e => setBoardName(e.target.value)}
                onKeyDown={e =>
                  e.key === "Enter" && createBoard()
                }
                className="border w-full p-2 rounded-lg mb-3 outline-none"
              />

              <div className="flex gap-3">

                <button
                  onClick={createBoard}
                  className="
                    bg-slate-800
                    text-white
                    px-4 py-2
                    rounded-lg
                    hover:bg-slate-900
                    transition
                  "
                >
                  Create
                </button>

                <button
                  onClick={() => setCreating(false)}
                  className="text-slate-600"
                >
                  Cancel
                </button>

              </div>

            </div>

          ) : (

            <button
              onClick={() => setCreating(true)}
              className="
                bg-white/70
                backdrop-blur
                hover:bg-white
                p-8
                rounded-xl
                shadow-lg
                font-semibold
                text-slate-700
                transition
                hover:scale-105
              "
            >
              + Create Board
            </button>

          )}

        </div>

      </div>
    </>
  );
}