import React, { useEffect, useState } from "react";
import { client } from "../api/client";
import AddButtonIcon from '../components/ui/AddButton.svg';

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
  const [showCreateModal, setShowCreateModal] = useState(false);
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

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

  const createEmployee = async () => {
    setIsCreating(true);
    try {
      await client.post("/api/users/", newEmployee);
      setShowCreateModal(false);
      setNewEmployee({
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
      fetchEmployees();
    } catch (error) {
      console.error("Ошибка создания сотрудника:", error);
    } finally {
      setIsCreating(false);
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

  const deleteEmployee = async (id: number) => {
    if (!window.confirm("Вы уверены, что хотите удалить этого сотрудника?")) return;

    setIsDeleting(true);
    try {
      await client.delete(`/api/users/${id}`);
      fetchEmployees();
    } catch (error) {
      console.error("Ошибка удаления сотрудника:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-gray-900 relative">
      {/* Кнопка добавления */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="fixed top-6 right-6 bg-black text-white p-3 rounded-full hover:bg-gray-800 transition-colors shadow-lg z-10"
      >
        <img src={AddButtonIcon} alt="Добавить сотрудника" className="h-6 w-6" />
      </button>

      {/* Фильтры */}
      <div className="flex flex-wrap gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <input
          type="text"
          placeholder="Должность"
          value={filters.post || ""}
          onChange={(e) => setFilters({ ...filters, post: e.target.value })}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-full md:w-auto"
        />
        <input
          type="text"
          placeholder="Команда"
          value={filters.team || ""}
          onChange={(e) => setFilters({ ...filters, team: e.target.value })}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-full md:w-auto"
        />
        <select
          value={filters.status || ""}
          onChange={(e) =>
            setFilters({
              ...filters,
              status: e.target.value || undefined,
            })
          }
          className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto"
        >
          <option value="">Все статусы</option>
          <option value="active">Активный</option>
          <option value="busy">Занят</option>
          <option value="inactive">Неактивный</option>
        </select>
      </div>

      {/* Таблица сотрудников */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ФИО</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Телефон</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Telegram</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Должность</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Роль</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Доступ</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm font-medium text-gray-900">
                      {emp.surname} {emp.name} {emp.patronymic}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">{emp.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">{emp.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                    {emp.telegram_link && (
                      <a href={emp.telegram_link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                        {emp.telegram_link.replace('https://t.me/', '')}
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">{emp.post}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">{emp.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <span className="text-gray-500">полный</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectUser(emp.id);
                        }}
                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-1 rounded-md shadow-sm"
                      >
                        Ред.
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteEmployee(emp.id);
                        }}
                        className="bg-red-600 text-white hover:bg-red-700 px-3 py-1 rounded-md shadow-sm"
                        disabled={isDeleting}
                      >
                        Удал.
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Модалка создания */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-900 text-lg"
              onClick={() => setShowCreateModal(false)}
            >
              ✖
            </button>
            <h3 className="text-xl font-semibold mb-4 border-b pb-2">Новый сотрудник</h3>
            <div className="space-y-4">
              {[
                { label: "Фамилия", field: "surname" },
                { label: "Имя", field: "name" },
                { label: "Отчество", field: "patronymic" },
                { label: "E-mail", field: "email" },
                { label: "Телефон", field: "phone" },
                { label: "Telegram", field: "telegram_link" },
                { label: "Должность", field: "post" },
                { label: "Команда", field: "team" }
              ].map(({ label, field }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-500">{label}</label>
                  <input
                    type="text"
                    value={(newEmployee as any)[field] || ""}
                    onChange={(e) =>
                      setNewEmployee((prev) => ({ ...prev, [field]: e.target.value }))
                    }
                    className="mt-1 block w-full border-b border-gray-300 px-0 py-1 focus:border-blue-500 focus:outline-none focus:ring-0"
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-500">Статус</label>
                <select
                  value={newEmployee.status}
                  onChange={(e) =>
                    setNewEmployee((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="mt-1 block w-full border-b border-gray-300 px-0 py-1 focus:border-blue-500 focus:outline-none focus:ring-0"
                >
                  <option value="inactive">Неактивный</option>
                  <option value="active">Активный</option>
                  <option value="busy">Занят</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-4 py-2 rounded-md"
              >
                Отмена
              </button>
              <button
                onClick={createEmployee}
                disabled={isCreating}
                className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md"
              >
                {isCreating ? "Сохранение..." : "Создать"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка редактирования */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-900 text-lg"
              onClick={() => setSelectedUser(null)}
            >
              ✖
            </button>
            <h3 className="text-xl font-semibold mb-4 border-b pb-2">Редактирование</h3>
            <div className="space-y-4">
              {[
                { label: "Фамилия", field: "surname" },
                { label: "Имя", field: "name" },
                { label: "Отчество", field: "patronymic" },
                { label: "Телефон", field: "phone" },
                { label: "Telegram", field: "telegram_link" },
                { label: "Должность", field: "post" },
                { label: "Команда", field: "team" },
                { label: "Роль", field: "role" },
                { label: "Статус", field: "status" }
              ].map(({ label, field }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-500">{label}</label>
                  {field === "status" ? (
                    <select
                      value={editUserData.status || ""}
                      onChange={(e) => onEditChange(field, e.target.value)}
                      className="mt-1 block w-full border-b border-gray-300 px-0 py-1 focus:border-blue-500 focus:outline-none focus:ring-0"
                    >
                      <option value="inactive">Неактивный</option>
                      <option value="active">Активный</option>
                      <option value="busy">Занят</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={(editUserData as any)[field] || ""}
                      onChange={(e) => onEditChange(field as keyof UserUpdate, e.target.value)}
                      className="mt-1 block w-full border-b border-gray-300 px-0 py-1 focus:border-blue-500 focus:outline-none focus:ring-0"
                    />
                  )}
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-500">E-mail</label>
                <input
                  type="text"
                  value={selectedUser.email}
                  readOnly
                  className="mt-1 block w-full border-b border-gray-300 px-0 py-1 bg-gray-50 focus:outline-none"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedUser(null)}
                className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-4 py-2 rounded-md"
              >
                Отмена
              </button>
              <button
                onClick={saveChanges}
                disabled={isSaving}
                className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md"
              >
                {isSaving ? "Сохранение..." : "Сохранить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesPage;