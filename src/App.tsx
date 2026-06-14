import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import HabitDetail from "@/pages/HabitDetail";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/habit/:habitId" element={<HabitDetail />} />
      </Routes>
    </Router>
  );
}
