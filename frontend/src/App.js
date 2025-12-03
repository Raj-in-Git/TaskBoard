import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./component/NavBar";
import TasksTable from "./component/TasksTable";
import UpdateTable from "./component/updateTable";
import "./App.css";



function App() {

  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<UpdateTable />} /> 
        <Route path="/tasks" element={ <TasksTable />} />
      </Routes>
    </Router>

  );
}

export default App;
