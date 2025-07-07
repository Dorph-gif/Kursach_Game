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
    status: "ACTIVE" | "INACTIVE";
  }
  