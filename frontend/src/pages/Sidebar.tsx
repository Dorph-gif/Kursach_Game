import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { client } from "../api/client";

interface User {
  first_name: string;
  last_name: string;
  role: string;
}

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await client.get("/api/users/me");
        setUser(response.data);
      } catch (error) {
        console.error("Не удалось получить данные пользователя", error);
      }
    }

    fetchUser();
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <div
      style={{
        width: isOpen ? 200 : 50,
        transition: "width 0.3s",
        background: "#333",
        color: "#fff",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>
        <button
          onClick={toggleSidebar}
          style={{
            background: "none",
            border: "none",
            color: "#fff",
            padding: "10px",
            cursor: "pointer",
            textAlign: "left",
            width: "100%",
          }}
        >
          {isOpen ? "Скрыть" : "Показать"}
        </button>

        {isOpen && (
          <>
            <button
              onClick={() => navigate("/service1")}
              style={{
                padding: "10px",
                background: "none",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
              }}
            >
              Сервис 1
            </button>
            <button
              onClick={() => navigate("/service2")}
              style={{
                padding: "10px",
                background: "none",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
              }}
            >
              Сервис 2
            </button>

            {/* Кнопка База знаний для всех */}
            <button
              onClick={() => navigate("/knowlege")}
              style={{
                padding: "10px",
                background: "none",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
              }}
            >
              База знаний
            </button>

            {/* Кнопка Сотрудники только для админа */}
            {user?.role === "admin" && (
              <button
                onClick={() => navigate("/employees")}
                style={{
                  padding: "10px",
                  background: "none",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                }}
              >
                Сотрудники
              </button>
            )}
          </>
        )}
      </div>

      {/* Отображение имени и фамилии внизу */}
      {isOpen && user && (
        <div
          style={{
            padding: "10px",
            borderTop: "1px solid #555",
            fontSize: "14px",
            textAlign: "center",
          }}
        >
          {user.first_name} {user.last_name}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
