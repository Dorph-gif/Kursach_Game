import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { client } from "../api/client";
import { Button } from "../components/ui/button";
import { Loader } from "../components/ui/loader";
import { toast } from "react-toastify";

interface User {
  id: number;
  role: "admin" | "editor" | "user";
}

interface ArticleBlock {
  id: number;
  block_type: string;
  content: string;
  position: number;
}

interface Article {
  id: number;
  title: string;
  category: string;
  blocks_data: ArticleBlock[];
}

export const ArticleViewPage: React.FC = () => {
    const { article_id } = useParams<{ article_id: string }>();
    const navigate = useNavigate();
  
    const [user, setUser] = useState<User | null>(null);
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      if (!article_id) return; // защита от undefined
  
      const loadData = async () => {
        try {
          const [userRes, articleRes] = await Promise.all([
            client.get("/api/users/me"),
            client.get(`/api/knowlege/${article_id}`),
          ]);
          setUser(userRes.data);
          setArticle(articleRes.data);
        } catch (err) {
          toast.error("Ошибка при загрузке статьи");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
  
      loadData();
    }, [article_id]);

  const handleDelete = async () => {
    if (!window.confirm("Вы уверены, что хотите удалить статью?")) return;
    try {
      await client.delete(`/api/knowlege/${article_id}`);
      toast.success("Статья удалена");
      navigate("/knowlege");
    } catch (err) {
      toast.error("Ошибка при удалении");
      console.error(err);
    }
  };

  const isEditor = user?.role === "admin" || user?.role === "editor";

  if (loading) return <Loader />;

  if (!article) return <div>Статья не найдена</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-start">
        <h1 className="text-3xl font-bold">{article.title}</h1>
        {isEditor && (
          <div className="flex gap-2">
            <Button
              onClick={() => navigate(`/knowlege/article/edit/${article.id}`)}
            >
              Редактировать
            </Button>
            <Button onClick={handleDelete}>
              Удалить
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {article.blocks_data
          .sort((a, b) => a.position - b.position)
          .map((block) => (
            <ArticleBlock key={block.id} block={block} />
          ))}
      </div>
    </div>
  );
};

const ArticleBlock: React.FC<{ block: ArticleBlock }> = ({ block }) => {
    switch (block.block_type) {
      case "text":
        return <p className="text-lg">{block.content}</p>;
  
      case "quote":
        return (
          <blockquote className="border-l-4 border-gray-400 pl-4 italic text-gray-600">
            {block.content}
          </blockquote>
        );
  
      case "code":
        return (
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            <code>{block.content}</code>
          </pre>
        );
  
      case "image":
        return (
          <div className="my-4">
            <img
              src={block.content}
              alt=""
              className="max-w-full h-auto rounded shadow"
            />
          </div>
        );
  
      case "video":
        return (
          <div className="my-4">
            <video
              src={block.content}
              controls
              className="max-w-full h-auto rounded shadow"
            />
          </div>
        );
  
      default:
        return <p>{block.content}</p>;
    }
  };
  

export default ArticleViewPage