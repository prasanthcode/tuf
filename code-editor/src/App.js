import "./App.css";
import CodeForm from "./CodeForm";
import Submission from "./Submission";
import { BrowserRouter,  Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function App() {
  return (
    <div className="app">
      <ToastContainer/>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<CodeForm />} />
            <Route path="submissions" element={<Submission />} />
          </Route>
        </Routes>
      </BrowserRouter>

    </div>
  );
}

export default App;
