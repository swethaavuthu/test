import CardItem from "./CardItem";
import { v4 as uuid } from "uuid";
import { useState } from "react";
import { useBoard } from "../context/BoardContext";
import { useDroppable } from "@dnd-kit/core";

export default function List({ list, syncFirestore }) {

  const { lists, setLists } = useBoard();

  const { setNodeRef } = useDroppable({
    id: list.id
  });

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

  const deleteList=e=>{
    e.stopPropagation();
    updateLists(lists.filter(l=>l.id!==list.id));
  };

  const saveTitle=()=>{
    if(!title.trim()) return;

    updateLists(
      lists.map(l=>l.id===list.id?{...l,title}:l)
    );

    setEditing(false);
  };

  return(
    <div
      ref={setNodeRef}
      className="bg-[#ebecf0] rounded-2xl p-3 w-[300px] shadow-lg"
    >

      <div className="flex justify-between items-center mb-3">

        {editing?(
          <input
            value={title}
            autoFocus
            onChange={e=>setTitle(e.target.value)}
            onBlur={saveTitle}
            className="border rounded p-1 w-full"
          />
        ):(
          <h3
            onClick={()=>setEditing(true)}
            className="font-bold text-gray-700 cursor-pointer"
          >
            {list.title}
          </h3>
        )}

        <button
          onClick={deleteList}
          className="text-gray-400 hover:text-red-500"
        >
          ✕
        </button>

      </div>

      <div className="bg-rose-50 rounded-xl p-2 space-y-3 max-h-[70vh] overflow-y-auto">
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
        className="mt-3 w-full text-left text-gray-600 hover:bg-rose-100 rounded-lg p-2 transition"
      >
        + Add a card
      </button>

    </div>
  );
}