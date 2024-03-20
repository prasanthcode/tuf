import { NavLink, Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <>
      <nav className="navbar">
        <h1>takeUforward</h1>
        <ul>
          <li>
            <NavLink className="link" to="/">Submit Code</NavLink>
          </li>
          <li>
            <NavLink className="link" to="/submissions">Submissions</NavLink>
          </li>
        </ul>
      </nav>
      <Outlet/>
    </>
  );
};

export default Layout;
