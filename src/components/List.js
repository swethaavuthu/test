import CardItem from "./CardItem";
import { v4 as uuid } from "uuid";
import { useState } from "react";
import { useBoard } from "../context/BoardContext";
import { useDroppable } from "@dnd-kit/core";
import { db } from "../firebase";
import { doc, deleteDoc } from "firebase/firestore";

export default function List({ list, boardId, syncFirestore }) {

  const { lists, setLists } = useBoard();

  const { setNodeRef } = useDroppable({ id: list.id });

  const [editing,setEditing] = useState(false);
  const [title,setTitle] = useState(list.title);

  const updateLists = updated=>{
    setLists(updated);
    syncFirestore(updated);
  };

  const addCard=()=>{
    const updated = lists.map(l =>
      l.id===list.id
        ?{
            ...l,
            cards:[
              ...l.cards,
              { id:uuid(), text:"New Card", image:"" }
            ]
          }
        :l
    );
    updateLists(updated);
  };

  /* ⭐ REAL DELETE FIX */
  const deleteList = async (e) => {
    e.stopPropagation();

    await deleteDoc(
      doc(db,"boards",boardId,"lists",list.id)
    );
  };

  const saveTitle=()=>{
    if(!title.trim()) return;

    updateLists(
      lists.map(l=>l.id===list.id?{...l,title}:l)
    );

    setEditing(false);
  };

  return(
    <div ref={setNodeRef} className="bg-[#ebecf0] rounded-2xl p-3 w-[300px] shadow-lg">

      <div className="flex justify-between items-center mb-0">

        {editing?(
          <input
            value={title}
            autoFocus
            onChange={e=>setTitle(e.target.value)}
            onBlur={saveTitle}
            className="border rounded p-1 w-full"
          />
        ):(
          <h3 onClick={()=>setEditing(true)} className="font-bold text-gray-700 cursor-pointer">
            {list.title}
          </h3>
        )}

        <button onClick={deleteList} className="text-gray-400 hover:text-red-500">
          ✕
        </button>

      </div>
<div className="bg-rose-50 rounded-xl p-0 space-y-0 max-h-[70vh] overflow-y-auto">
        {list.cards.map(card=>(
          <CardItem
            key={card.id}
            card={card}
            listId={list.id}
            syncFirestore={syncFirestore}
          />
        ))}
      </div>

      <button
        onClick={addCard}
        className="mt-3 w-full text-left text-gray-600 hover:bg-rose-100 rounded-lg p-2"
      >
        + Add a card
      </button>

    </div>
  );
}