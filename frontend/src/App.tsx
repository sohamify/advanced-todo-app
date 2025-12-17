import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import TodoListPage from './pages/TodoListPage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<TodoListPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;