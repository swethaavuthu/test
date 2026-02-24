import { useDraggable } from "@dnd-kit/core";
import { useState } from "react";
import { useBoard } from "../context/BoardContext";

const COLORS = [
  "bg-green-500",
  "bg-blue-500",
  "bg-yellow-500",
  "bg-red-500",
  "bg-purple-500",
  "bg-pink-500"
];

export default function CardItem({ card, listId, syncFirestore }) {

  const { lists, setLists } = useBoard();

  const { attributes, listeners, setNodeRef, transform } =
    useDraggable({ id: card.id });

  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined
  };


  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(card.text || "");

  const [descEditing, setDescEditing] = useState(false);
  const [description, setDescription] =
    useState(card.description || "");

  const [showTagInput, setShowTagInput] = useState(false);
  const [tagName, setTagName] = useState("");


  const updateLists = updated => {
    setLists(updated);
    syncFirestore(updated);
  };


  const deleteCard = e => {
    e.stopPropagation();

    const updated = lists.map(list =>
      list.id === listId
        ? {
            ...list,
            cards: list.cards.filter(c => c.id !== card.id)
          }
        : list
    );

    updateLists(updated);
  };


  const saveEdit = () => {

    const updated = lists.map(list =>
      list.id === listId
        ? {
            ...list,
            cards: list.cards.map(c =>
              c.id === card.id ? { ...c, text } : c
            )
          }
        : list
    );

    updateLists(updated);
    setEditing(false);
  };


  const saveDescription = () => {

    const updated = lists.map(list =>
      list.id === listId
        ? {
            ...list,
            cards: list.cards.map(c =>
              c.id === card.id
                ? { ...c, description }
                : c
            )
          }
        : list
    );

    updateLists(updated);
    setDescEditing(false);
  };


  const addImage = e => {

    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {

      const updated = lists.map(list =>
        list.id === listId
          ? {
              ...list,
              cards: list.cards.map(c =>
                c.id === card.id
                  ? { ...c, image: reader.result }
                  : c
              )
            }
          : list
      );

      updateLists(updated);
    };

    reader.readAsDataURL(file);
  };

  const addTag = color => {

    if (!tagName.trim()) return;

    const newTag = {
      name: tagName,
      color
    };

    const updated = lists.map(list =>
      list.id === listId
        ? {
            ...list,
            cards: list.cards.map(c =>
              c.id === card.id
                ? {
                    ...c,
                    tags: [...(c.tags || []), newTag]
                  }
                : c
            )
          }
        : list
    );

    updateLists(updated);

    setTagName("");
    setShowTagInput(false);
  };


  const removeTag = index => {

    const updated = lists.map(list =>
      list.id === listId
        ? {
            ...list,
            cards: list.cards.map(c =>
              c.id === card.id
                ? {
                    ...c,
                    tags: c.tags.filter((_, i) => i !== index)
                  }
                : c
            )
          }
        : list
    );

    updateLists(updated);
  };


  return (
  
<div
  ref={setNodeRef}
  {...attributes}
  style={style}
  className="
  bg-green-50
  rounded-xl
  p-3
  shadow-sm
  hover:shadow-lg
  hover:-translate-y-1
  transition
  duration-200
  border border-green-200
  relative
"
>
      

      <div {...listeners} className="cursor-grab text-gray-400 mb-2">
        ☰
      </div>

      <button
        onClick={deleteCard}
        className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
      >
        ✕
      </button>


      <div className="flex flex-wrap gap-1 mb-2">

        {(card.tags || []).map((tag, i) => (
          <span
            key={i}
            onClick={() => removeTag(i)}
            className={`${tag.color} text-white text-xs px-2 py-1 rounded cursor-pointer`}
          >
            {tag.name}
          </span>
        ))}

      </div>

      {showTagInput ? (
        <div className="mb-2">

          <input
            value={tagName}
            onChange={e => setTagName(e.target.value)}
            placeholder="Tag name"
            className="border w-full p-1 rounded text-xs mb-2"
          />

          <div className="flex gap-2 flex-wrap">
            {COLORS.map(color => (
              <div
                key={color}
                onClick={() => addTag(color)}
                className={`${color} w-6 h-6 rounded cursor-pointer`}
              />
            ))}
          </div>

        </div>
      ) : (
        <button
          onClick={() => setShowTagInput(true)}
          className="text-xs text-blue-500 mb-2"
        >
          + Add Tag
        </button>
      )}

      {card.image && (
        <div className="flex justify-center mb-3">
          <img
            src={card.image}
            alt="image"
            className="
              w-10 h-10 object-cover
              rounded-full
              border-2 border-gray-200
            "
          />
        </div>
      )}

      {editing ? (
        <input
          value={text}
          autoFocus
          onChange={e => setText(e.target.value)}
          onBlur={saveEdit}
          onKeyDown={e => e.key === "Enter" && saveEdit()}
          className="w-full border rounded p-1 text-sm"
        />
      ) : (
        <p
          onClick={() => setEditing(true)}
          className="text-sm font-medium cursor-pointer text-gray-700"
        >
          {card.text || "Add card title..."}
        </p>
      )}

      <div className="mt-2">

        {descEditing ? (
          <textarea
            value={description}
            rows={3}
            autoFocus
            onChange={e => setDescription(e.target.value)}
            onBlur={saveDescription}
            className="w-full border rounded p-2 text-xs"
            placeholder="Add description..."
          />
        ) : (
          <p
            onClick={() => setDescEditing(true)}
            className="text-xs text-gray-500 cursor-pointer"
          >
            {description || "Add description..."}
          </p>
        )}

      </div>

      <label className="text-xs text-blue-500 cursor-pointer mt-3 block">
        + Add Image
        <input
          type="file"
          accept="image/*"
          onChange={addImage}
          className="hidden"
        />
      </label>

      <div className="flex justify-between items-center mt-3 text-xs text-gray-500">

        <span>📅 Feb 28</span>

        <div className="w-7 h-7 rounded-full bg-purple-400 flex items-center justify-center text-white">
          U
        </div>

      </div>

    </div>
  );
}