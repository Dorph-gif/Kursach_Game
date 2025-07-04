// src/pages/KnowledgePage.tsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { client } from "../api/client";
import { Button } from "../components/ui/button";

export interface UserRead {
  id: number;
  name: string;
  surname: string;
  patronymic: string;
  email: string;
  phone: string;
  telegram_link?: string;
  post: string;
  team: string;
  role: "user" | "editor" | "admin";
  status: string;
}

export interface ArticleShortRead {
  id: number;
  title: string;
  description?: string;
}

const categories = ["Все", "к1", "к2"];

export const KnowledgePage: React.FC = () => {
  const [user, setUser] = useState<UserRead | null>(null);
  const [articles, setArticles] = useState<ArticleShortRead[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("Все");
  const [offset, setOffset] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const navigate = useNavigate();

  const limit = 10;

  const fetchUser = async () => {
    try {
      const res = await client.get("/api/users/me");
      setUser(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchArticles = async (
    category: string,
    offsetValue: number,
    append: boolean = false
  ) => {
    const categoryQuery = category === "Все" ? "all" : category;

    try {
      const res = await client.get("/api/knowlege", {
        params: {
          category: categoryQuery,
          limit: limit,
          offset: offsetValue,
        },
      });

      const data: ArticleShortRead[] = res.data;

      if (append) {
        setArticles((prev) => [...prev, ...data]);
      } else {
        setArticles(data);
      }

      if (data.length < limit) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchArticles("Все", 0);
  }, []);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setOffset(0);
    fetchArticles(category, 0, false);
  };

  const handleLoadMore = () => {
    const newOffset = offset + limit;
    setOffset(newOffset);
    fetchArticles(selectedCategory, newOffset, true);
  };

  const handleCardClick = (id: number) => {
    navigate(`/knowlege/article/${id}`);
  };

  const handleAddArticle = () => {
    navigate("/knowlege/article/create");
  };

  return (
    <div className="p-6 relative">
      <h1 className="text-3xl font-bold mb-4">База знаний</h1>

      <div className="mb-6 flex gap-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-4 py-2 rounded ${
              selectedCategory === cat
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {articles.map((article) => (
          <div
            key={article.id}
            onClick={() => handleCardClick(article.id)}
            className="cursor-pointer border border-gray-300 rounded-lg p-4 hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold mb-2">{article.title}</h2>
            <p className="text-gray-600">{article.description}</p>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="mt-6 text-center">
          <Button onClick={handleLoadMore}>Загрузить ещё</Button>
        </div>
      )}

      {user && (user.role === "admin" || user.role === "editor") && (
        <Button
          onClick={handleAddArticle}
          className="fixed bottom-6 right-6 rounded-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white shadow-lg"
        >
          + Добавить статью
        </Button>
      )}
    </div>
  );
};

export default KnowledgePage;
