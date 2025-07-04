import React from "react";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar />
      <main
        style={{
          flex: 1,
          background: "#f5f5f5",
          overflowY: "auto",
          padding: "20px",
        }}
      >
        {children}
      </main>
    </div>
  );
};

export default Layout;