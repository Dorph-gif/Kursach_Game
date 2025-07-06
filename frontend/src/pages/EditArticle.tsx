import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { client } from "../api/client";

type BlockType = "text" | "image" | "video";

interface ArticleBlockRead {
  id: number;
  block_type: BlockType;
  content: string;
  position: number;
}

interface ArticleRead {
  id: number;
  title: string;
  description?: string;
  category: string;
  blocks_data: ArticleBlockRead[];
}

interface ArticleBlockUpdate {
  block_type: BlockType;
  content: string;
  position: number;
}

interface ArticleInfoUpdate {
  title?: string;
  description?: string;
  category?: string;
}

const blockColors: Record<BlockType, string> = {
  text: "#f0f0f0",
  image: "#ffe5b4",
  video: "#cce5ff",
};

export const EditArticlePage = () => {
  const navigate = useNavigate();
  const { article_id } = useParams<{ article_id: string }>();

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [blocks, setBlocks] = useState<ArticleBlockUpdate[]>([]);

  // Получить данные статьи при загрузке
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const { data } = await client.get(`/api/knowlege/${article_id}`);
        const article: ArticleRead = data;

        setTitle(article.title);
        setDescription(article.description || "");
        setCategory(article.category);

        const sortedBlocks = [...article.blocks_data].sort(
          (a, b) => a.position - b.position
        );

        setBlocks(
          sortedBlocks.map((b) => ({
            block_type: b.block_type,
            content: b.content,
            position: b.position,
          }))
        );
      } catch (e) {
        console.error(e);
        alert("Ошибка при загрузке статьи");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [article_id]);

  const addBlock = (index: number, type: BlockType) => {
    const newBlock: ArticleBlockUpdate = {
      block_type: type,
      content: "",
      position: index + 1,
    };

    const updatedBlocks = [
      ...blocks.slice(0, index + 1),
      newBlock,
      ...blocks.slice(index + 1),
    ];

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

  const handleChangeBlockContent = (index: number, value: string) => {
    const updatedBlocks = blocks.map((b, i) =>
      i === index ? { ...b, content: value } : b
    );
    setBlocks(updatedBlocks);
  };

  const handleSave = async () => {
    try {
      // Обновить info
      const infoUpdate: ArticleInfoUpdate = {
        title,
        description,
        category,
      };

      await client.patch(
        `/api/knowlege/${article_id}/info`,
        infoUpdate
      );

      // Обновить blocks
      await client.put(
        `/api/knowlege/${article_id}/blocks`,
        { blocks_data: blocks }
      );

      navigate("/knowlege");
    } catch (e) {
      console.error(e);
      alert("Ошибка при сохранении изменений");
    }
  };

  if (loading) {
    return <div className="p-4 text-gray-600">Загрузка статьи...</div>;
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <button
        onClick={() => navigate("/knowlege")}
        className="mb-4 text-blue-600 hover:underline"
      >
        ← Назад
      </button>

      <h2 className="text-2xl font-bold mb-6">Редактирование статьи</h2>

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

      <div className="flex flex-col gap-4">
        {blocks.map((block, index) => (
          <div
            key={index}
            className="p-4 rounded relative"
            style={{ backgroundColor: blockColors[block.block_type] }}
          >
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

      <button
        onClick={handleSave}
        className="mt-6 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
      >
        Сохранить изменения
      </button>
    </div>
  );
};

export default EditArticlePage;
