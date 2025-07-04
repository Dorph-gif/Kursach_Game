import React, { useEffect, useState } from "react";
import { client } from "../api/client";

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
  role: string;
  status: string;
}

export interface UserFilter {
  post?: string;
  team?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface UserCreate {
  name: string;
  surname: string;
  patronymic: string;
  email: string;
  phone: string;
  telegram_link?: string;
  post: string;
  team: string;
  role: string;
  status: string;
}

export interface UserUpdate {
  name?: string;
  surname?: string;
  patronymic?: string;
  phone?: string;
  telegram_link?: string;
  post?: string;
  team?: string;
  role?: string;
  status?: string;
}

const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<UserRead[]>([]);
  const [filters, setFilters] = useState<UserFilter>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEmployee, setNewEmployee] = useState<UserCreate>({
    name: "",
    surname: "",
    patronymic: "",
    email: "",
    phone: "",
    telegram_link: "",
    post: "",
    team: "",
    role: "user",
    status: "inactive",
  });

  const [selectedUser, setSelectedUser] = useState<UserRead | null>(null);
  const [editUserData, setEditUserData] = useState<UserUpdate>({});
  const [isSaving, setIsSaving] = useState(false);

  const fetchEmployees = async () => {
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(
          ([_, v]) => v !== "" && v !== undefined && v !== null
        )
      );
      const response = await client.get("/api/users/", { params: cleanFilters });
      setEmployees(response.data);
    } catch (error) {
      console.error("Ошибка загрузки сотрудников:", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [filters]);

  const applyFilters = () => {
    fetchEmployees();
  };

  const createEmployee = async () => {
    try {
      await client.post("/api/users/", newEmployee);
      setShowCreateForm(false);
      fetchEmployees();
    } catch (error) {
      console.error("Ошибка создания сотрудника:", error);
    }
  };

  const onSelectUser = async (id: number) => {
    try {
      const res = await client.get(`/api/users/${id}`);
      setSelectedUser(res.data);
      setEditUserData(res.data);
    } catch (error) {
      console.error("Ошибка загрузки сотрудника:", error);
    }
  };

  const onEditChange = (field: keyof UserUpdate, value: any) => {
    setEditUserData((prev) => ({ ...prev, [field]: value }));
  };

  const saveChanges = async () => {
    if (!selectedUser) return;
    setIsSaving(true);
    try {
      await client.patch(`/api/users/${selectedUser.id}`, editUserData);
      setSelectedUser(null);
      setEditUserData({});
      fetchEmployees();
    } catch (error) {
      console.error("Ошибка сохранения сотрудника:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-gray-900">
      <h2 className="text-3xl font-semibold mb-8">Сотрудники</h2>

      {/* Фильтры */}
      <div className="flex flex-wrap gap-4 mb-8">
        <input
          type="text"
          placeholder="Пост"
          value={filters.post || ""}
          onChange={(e) => setFilters({ ...filters, post: e.target.value })}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 bg-white"
        />
        <input
          type="text"
          placeholder="Команда"
          value={filters.team || ""}
          onChange={(e) => setFilters({ ...filters, team: e.target.value })}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 bg-white"
        />
        <select
          value={filters.status || ""}
          onChange={(e) =>
            setFilters({
              ...filters,
              status: e.target.value || undefined,
            })
          }
          className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-800"
        >
          <option value="">Активность</option>
          <option value="active">Активный</option>
          <option value="busy">Занят</option>
          <option value="inactive">Неактивный</option>
        </select>
        <button
          onClick={applyFilters}
          className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors"
        >
          Применить фильтры
        </button>
      </div>

      {/* Список сотрудников */}
      <div className="grid gap-4">
        {employees.map((emp) => (
          <div
            key={emp.id}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow hover:shadow-md cursor-pointer transition"
            onClick={() => onSelectUser(emp.id)}
          >
            <div className="text-lg font-medium">
              {emp.name} {emp.surname}
            </div>
            <div className="text-sm text-gray-500">
              {emp.post}, {emp.team} ({emp.status})
            </div>
          </div>
        ))}
      </div>

      {/* Модалка редактирования */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-900 text-lg"
              onClick={() => setSelectedUser(null)}
            >
              ✖
            </button>
            <h3 className="text-2xl font-semibold mb-6">
              Редактирование: {selectedUser.name} {selectedUser.surname}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Имя"
                value={editUserData.name || ""}
                onChange={(e) => onEditChange("name", e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
              />
              <input
                type="text"
                placeholder="Фамилия"
                value={editUserData.surname || ""}
                onChange={(e) => onEditChange("surname", e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
              />
              <input
                type="text"
                placeholder="Отчество"
                value={editUserData.patronymic || ""}
                onChange={(e) => onEditChange("patronymic", e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
              />
              <input
                type="text"
                placeholder="Телефон"
                value={editUserData.phone || ""}
                onChange={(e) => onEditChange("phone", e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
              />
              <input
                type="text"
                placeholder="Telegram"
                value={editUserData.telegram_link || ""}
                onChange={(e) => onEditChange("telegram_link", e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
              />
              <input
                type="text"
                placeholder="Пост"
                value={editUserData.post || ""}
                onChange={(e) => onEditChange("post", e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
              />
              <input
                type="text"
                placeholder="Команда"
                value={editUserData.team || ""}
                onChange={(e) => onEditChange("team", e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
              />
              <select
                value={editUserData.role || ""}
                onChange={(e) => onEditChange("role", e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 bg-white"
              >
                <option value="user">User</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
                <option value="guest">Guest</option>
              </select>
              <select
                value={editUserData.status || ""}
                onChange={(e) => onEditChange("status", e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 bg-white"
              >
                <option value="active">Активный</option>
                <option value="busy">Занят</option>
                <option value="inactive">Неактивный</option>
              </select>
            </div>
            <button
              disabled={isSaving}
              onClick={saveChanges}
              className={`mt-6 w-full py-2 rounded-md text-white text-sm ${
                isSaving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gray-900 hover:bg-gray-700"
              }`}
            >
              {isSaving ? "Сохраняем..." : "Сохранить"}
            </button>
          </div>
        </div>
      )}

      {/* Кнопка создания */}
      <div className="mt-8">
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors"
        >
          Добавить сотрудника
        </button>
      </div>

      {/* Модалка создания */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-900 text-lg"
              onClick={() => setShowCreateForm(false)}
            >
              ✖
            </button>
            <h3 className="text-2xl font-semibold mb-6">
              Добавить сотрудника
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Имя"
                value={newEmployee.name}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, name: e.target.value })
                }
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
              />
              <input
                type="text"
                placeholder="Фамилия"
                value={newEmployee.surname}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, surname: e.target.value })
                }
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
              />
              <input
                type="text"
                placeholder="Отчество"
                value={newEmployee.patronymic}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, patronymic: e.target.value })
                }
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
              />
              <input
                type="text"
                placeholder="Email"
                value={newEmployee.email}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, email: e.target.value })
                }
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
              />
              <input
                type="text"
                placeholder="Телефон"
                value={newEmployee.phone}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, phone: e.target.value })
                }
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
              />
              <input
                type="text"
                placeholder="Telegram"
                value={newEmployee.telegram_link}
                onChange={(e) =>
                  setNewEmployee({
                    ...newEmployee,
                    telegram_link: e.target.value,
                  })
                }
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
              />
              <input
                type="text"
                placeholder="Пост"
                value={newEmployee.post}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, post: e.target.value })
                }
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
              />
              <input
                type="text"
                placeholder="Команда"
                value={newEmployee.team}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, team: e.target.value })
                }
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
              />
              <select
                value={newEmployee.role}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, role: e.target.value })
                }
                className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-800"
              >
                <option value="user">User</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
                <option value="guest">Guest</option>
              </select>
              <select
                value={newEmployee.status}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, status: e.target.value })
                }
                className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-800"
              >
                <option value="active">Активный</option>
                <option value="busy">Занят</option>
                <option value="inactive">Неактивный</option>
              </select>
            </div>
            <button
              onClick={createEmployee}
              className="mt-6 w-full py-2 rounded-md text-white text-sm bg-gray-900 hover:bg-gray-700 transition-colors"
            >
              Создать
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesPage;
