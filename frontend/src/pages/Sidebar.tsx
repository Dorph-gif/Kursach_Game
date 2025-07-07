import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { client } from "../api/client";

interface User {
  id: number;
  name: string;
  surname: string;
  patronymic?: string;
  post: string;
  team: string;
  role: "admin" | "user";
  status: "active" | "busy" | "inactive";
}

const statusColors = {
  active: "#4CAF50",
  busy: "#FF9800",
  inactive: "#9E9E9E"
};

const statusLabels = {
  active: "Активен",
  busy: "Занят",
  inactive: "Неактивен"
};

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await client.get("/api/users/me");
        setUser(response.data);
      } catch (err) {
        setError("Не удалось загрузить данные пользователя");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const updateStatus = async (newStatus: "active" | "busy" | "inactive") => {
    try {
      await client.patch("/api/users/me/update_status", { status: newStatus });
      setUser(prev => prev ? { ...prev, status: newStatus } : null);
      setShowStatusDropdown(false);
    } catch (err) {
      console.error("Ошибка при обновлении статуса", err);
    }
  };

  const sidebarStyle: React.CSSProperties = {
    width: isOpen ? "250px" : "80px",
    background: "#1A1A1A",
    color: "#FFF",
    height: "100vh",
    padding: "20px 0",
    transition: "width 0.3s",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "visible", // Добавляем скрытие переполнения
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflowY: "auto", // Добавляем прокрутку при необходимости
    paddingBottom: "20px", // Отступ для блока пользователя
  };

  const userSectionStyle: React.CSSProperties = {
    padding: "15px 20px",
    borderTop: "1px solid #555",
    marginTop: "auto", // Поднимаем блок выше
    position: "sticky",
    bottom: 0,
    background: "#1A1A1A",
    zIndex: 1,
  };

  const toggleButtonStyle: React.CSSProperties = {
    position: "absolute",
    top: "20px",
    right: "-15px",
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    background: "#2C2C2C",
    border: "2px solid #555",
    color: "#FFF",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
    zIndex: 10,
    transition: "all 0.3s ease",
    transform: isOpen ? "rotate(0deg)" : "rotate(180deg)",
  };
  
  return (
    <div style={sidebarStyle}>
      {/* Кнопка переключения и заголовок */}
      <button onClick={toggleSidebar} style={toggleButtonStyle}>
        {isOpen ? "‹" : "‹"}
      </button>

      <div style={contentStyle}>
        <h1 style={{ textAlign: "center", marginBottom: "30px", fontSize: "24px" }}>
          {isOpen ? "CENTURION" : "C"}
        </h1>

        {/* Меню */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {[
            { title: "Сотрудники", path: "/employees" },
            { title: "Читалка", path: "/knowlege" },
            { title: "О нас", path: "/about" },
            { title: "Полезные материалы", path: "/materials" },
            { title: "Настройки", path: "/settings" }
          ].map((item) => (
            <button
              key={item.title}
              onClick={() => navigate(item.path)}
              style={{
                padding: "12px 20px",
                margin: "5px 0",
                background: "none",
                border: "none",
                color: "#FFF",
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
                fontSize: "16px",
                borderRadius: "4px",
                transition: "background 0.2s",
                ...(user?.role === "user" && item.title === "Сотрудники" ? { display: "none" } : {}),
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              {isOpen ? item.title : "•"}
            </button>
          ))}
        </div>

        {/* Блок пользователя */}
        {user && (
          <div style={userSectionStyle}>
            <div style={{ fontWeight: "bold" }}>
              {isOpen ? `${user.surname} ${user.name}` : `${user.surname[0]}${user.name[0]}`}
            </div>
            
            {isOpen && (
              <>
                <div style={{ fontSize: "12px", opacity: 0.8, marginTop: "3px" }}>
                  {user.team}
                </div>
                
                <div 
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    fontSize: "12px",
                    marginTop: "5px",
                    cursor: "pointer",
                    color: statusColors[user.status],
                  }}
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                >
                  <span style={{
                    display: "inline-block",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: statusColors[user.status],
                  }} />
                  {statusLabels[user.status]}
                </div>

                {showStatusDropdown && (
                  <div style={{
                    position: "absolute",
                    bottom: "60px",
                    right: "20px",
                    background: "#2C2C2C",
                    border: "1px solid #555",
                    borderRadius: "4px",
                    padding: "5px 0",
                    zIndex: 20,
                    width: "120px",
                  }}>
                    {Object.entries(statusLabels).map(([status, label]) => (
                      <div
                        key={status}
                        style={{
                          padding: "5px 10px",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          cursor: "pointer",
                        }}
                        onClick={() => updateStatus(status as "active" | "busy" | "inactive")}
                      >
                        <span style={{
                          display: "inline-block",
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: statusColors[status as keyof typeof statusColors],
                        }} />
                        {label}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;