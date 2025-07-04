import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { client } from "../api/client";

type BlockType = "text" | "image" | "video";

interface ArticleBlockCreate {
  block_type: BlockType;
  content: string;
  position: number;
}

interface ArticleCreate {
  title: string;
  description?: string;
  category: string;
  blocks_data: ArticleBlockCreate[];
}

const blockColors: Record<BlockType, string> = {
  text: "#f0f0f0", // пастельно-серый
  image: "#ffe5b4", // пастельно-оранжевый
  video: "#cce5ff", // пастельно-голубой
};

export const CreateArticlePage = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  const [blocks, setBlocks] = useState<ArticleBlockCreate[]>([
    { block_type: "text", content: "", position: 0 },
  ]);

  const addBlock = (index: number, type: BlockType) => {
    const newBlock: ArticleBlockCreate = {
      block_type: type,
      content: "",
      position: index + 1,
    };

    // Вставляем новый блок после текущего
    const updatedBlocks = [
      ...blocks.slice(0, index + 1),
      newBlock,
      ...blocks.slice(index + 1),
    ];

    // переустанавливаем позиции
    const reIndexed = updatedBlocks.map((b, idx) => ({
      ...b,
      position: idx,
    }));

    setBlocks(reIndexed);
  };

  const removeBlock = (index: number) => {
    const updatedBlocks = blocks.filter((_, i) => i !== index);
    const reIndexed = updatedBlocks.map((b, idx) => ({
      ...b,
      position: idx,
    }));
    setBlocks(reIndexed);
  };

  const handleChangeBlockContent = (
    index: number,
    value: string
  ) => {
    const updatedBlocks = blocks.map((b, i) =>
      i === index ? { ...b, content: value } : b
    );
    setBlocks(updatedBlocks);
  };

  const handlePublish = async () => {
    const payload: ArticleCreate = {
      title,
      description,
      category,
      blocks_data: blocks,
    };

    try {
      await client.post("/api/knowlege", payload);
      navigate("/knowlege");
    } catch (e) {
      console.error(e);
      alert("Ошибка при создании статьи");
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      {/* Кнопка Назад */}
      <button
        onClick={() => navigate("/knowlege")}
        className="mb-4 text-blue-600 hover:underline"
      >
        ← Назад
      </button>

      {/* Поля заголовка, описания, категории */}
      <div className="flex flex-col gap-4 mb-6">
        <input
          type="text"
          placeholder="Название"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 rounded"
        />

        <textarea
          placeholder="Описание"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="text"
          placeholder="Категория"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      {/* Блоки статьи */}
      <div className="flex flex-col gap-4">
        {blocks.map((block, index) => (
          <div
            key={index}
            className="p-4 rounded relative"
            style={{ backgroundColor: blockColors[block.block_type] }}
          >
            {/* Контент блока */}
            {block.block_type === "text" && (
              <textarea
                value={block.content}
                onChange={(e) =>
                  handleChangeBlockContent(index, e.target.value)
                }
                placeholder="Введите текст..."
                className="w-full border p-2 rounded"
              />
            )}

            {block.block_type === "image" && (
              <input
                type="text"
                placeholder="URL картинки"
                value={block.content}
                onChange={(e) =>
                  handleChangeBlockContent(index, e.target.value)
                }
                className="w-full border p-2 rounded"
              />
            )}

            {block.block_type === "video" && (
              <input
                type="text"
                placeholder="URL видео"
                value={block.content}
                onChange={(e) =>
                  handleChangeBlockContent(index, e.target.value)
                }
                className="w-full border p-2 rounded"
              />
            )}

            {/* Кнопки управления блоками */}
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => addBlock(index, "text")}
                className="bg-gray-300 px-2 py-1 rounded text-sm"
              >
                + Текст
              </button>
              <button
                onClick={() => addBlock(index, "image")}
                className="bg-orange-300 px-2 py-1 rounded text-sm"
              >
                + Картинка
              </button>
              <button
                onClick={() => addBlock(index, "video")}
                className="bg-blue-300 px-2 py-1 rounded text-sm"
              >
                + Видео
              </button>
              <button
                onClick={() => removeBlock(index)}
                className="ml-auto text-red-600 hover:underline text-sm"
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Кнопка публикации */}
      <button
        onClick={handlePublish}
        className="mt-6 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
      >
        Опубликовать
      </button>
    </div>
  );
};

export default CreateArticlePage;