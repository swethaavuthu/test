import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc
} from "firebase/firestore";

import List from "./List";
import Navbar from "./Navbar";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { useBoard } from "../context/BoardContext";

export default function Board({ boardId }) {

  const { lists, setLists } = useBoard();
  const [title, setTitle] = useState("");

  /* ================= LOAD LISTS ================= */

  useEffect(() => {

    if (!boardId) return;

    const unsub = onSnapshot(
      collection(db, "boards", boardId, "lists"),
      snap => {

        const data = snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
          cards: d.data().cards || []
        }));

        setLists(data);
      }
    );

    return () => unsub();

  }, [boardId, setLists]); // ✅ FIXED FOR VERCEL


  /* ================= ADD LIST ================= */

  const addList = async () => {

    if (!title.trim()) return;

    await addDoc(
      collection(db, "boards", boardId, "lists"),
      { title, cards: [] }
    );

    setTitle("");
  };


  /* ================= FIRESTORE SYNC ================= */

  const syncFirestore = async (updatedLists) => {

    for (const list of updatedLists) {

      await updateDoc(
        doc(db, "boards", boardId, "lists", list.id),
        {
          title: list.title,
          cards: list.cards
        }
      );
    }
  };


  /* ================= UI ================= */

  return (
    <>
      <Navbar />

      <DndContext collisionDetection={closestCenter}>

        <div className="flex gap-6 p-8 overflow-x-auto min-h-screen bg-gradient-to-br from-rose-200 via-pink-200 to-fuchsia-200 items-start">

          {lists.map(list => (
            <List
              key={list.id}
              list={list}
              boardId={boardId}
              syncFirestore={syncFirestore}
            />
          ))}

          <div className="bg-white/80 backdrop-blur rounded-lg p-3 w-[280px] shadow">

            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter list title"
              className="w-full border rounded p-2 mb-2"
            />

            <button
              onClick={addList}
              className="bg-blue-600 text-white w-full p-2 rounded hover:bg-blue-700 transition"
            >
              Add List
            </button>

          </div>

        </div>

      </DndContext>
    </>
  );
}