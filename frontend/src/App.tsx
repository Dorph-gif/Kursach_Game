import { useEffect, useState } from "react";
import { client } from "./api/client";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import EmployeesPage from "./pages/Emploees";
import Layout from "./pages/Layout";
import KnowledgePage from "./pages/KnowlegePage"
import CreateArticlePage from "./pages/CreateArticle"
import ArticleViewPage from "./pages/ReadArticle"
import EditArticlePage from "./pages/EditArticle"

const AuthWrapper = () => {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/login") {
      setIsAuth(false);
      return;
    }

    client.get("/api/users/me")
      .then(() => setIsAuth(true))
      .catch(() => setIsAuth(false));
  }, [location.pathname]);

  if (isAuth === null) return <div>Загрузка...</div>;

  return (
    <Routes>
      <Route path="/login" element={isAuth ? <Navigate to="/" /> : <Login />} />
      <Route
        path="/"
        element={isAuth ? <Home /> : <Navigate to="/login" />}
      />
      <Route
        path="/employees"
        element={isAuth ? <Layout><EmployeesPage /></Layout> : <Navigate to="/login" />}
      />
      <Route
        path="/knowlege"
        element={isAuth ? <Layout><KnowledgePage /></Layout> : <Navigate to="/login" />}
      />
      <Route
        path="/knowlege/article/create"
        element={isAuth ? <Layout><CreateArticlePage /></Layout> : <Navigate to="/login" />}
      />
      <Route
        path="/knowlege/article/:article_id"
        element={isAuth ? <Layout><ArticleViewPage /></Layout> : <Navigate to="/login" />}
      />
      <Route
        path="/knowlege/article/edit/:article_id"
        element={isAuth ? <Layout><EditArticlePage /></Layout> : <Navigate to="/login" />}
      />
    </Routes>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthWrapper />
  </BrowserRouter>
);

export default App;
