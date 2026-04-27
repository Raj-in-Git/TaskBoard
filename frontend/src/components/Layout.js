import React, { useState } from "react";
import Sidebar from "./Sidebar";
import NavBar from "./NavBar";

const Layout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  const isLoggedIn = localStorage.getItem("token");

  return (
    <>
      {isLoggedIn && <NavBar toggleSidebar={toggleSidebar} isOpen={isOpen} />}
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      <div style={{ padding: "20px" }}>
        {children}
      </div>
    </>
  );
};

export default Layout;