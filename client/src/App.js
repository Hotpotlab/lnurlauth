import "./App.css";
import { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { MdPostAdd, MdLogin, MdLogout } from "react-icons/md";
import Axios from "axios";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    Axios({
      method: "GET",
      withCredentials: true,
      url: "http://localhost:3001/user",
    }).then((res) => {
      res.data.id ? setUser(res.data.id) : setUser(null);
      console.log(res);
    });
  });

  const navigateHome = () => {
    navigateHome("/");
  };

  const navigateLogin = () => {
    window.location.replace("http://localhost:3001/login");
  };

  const navigateLogout = () => {
    Axios({
      method: "GET",
      withCredentials: true,
      url: "http://localhost:3001/logout",
    }).then((res) => {
      setUser(null);
      console.log(res);
    });
  };

  return (
    <body>
      <div>
        <nav>
          <h2 className="navTitle" onClick={navigateHome}>
            Youflix
          </h2>
          {user == null ? (
            <div></div>
          ) : (
            <div>
              <p className="user">Logged in as: {user}</p>
            </div>
          )}

          {user == null ? (
            <div className="cpLayout" onClick={navigateLogin}>
              <MdLogin className="cpIcon" />
              <h4 className="navCP">Login</h4>
            </div>
          ) : (
            <div className="cpLayout" onClick={navigateLogout}>
              <MdLogout className="cpIcon" />
              <h4 className="navCP">Logout</h4>
            </div>
          )}
        </nav>
        <div className="" style={{ textAlign: `center` }}>
          {user == null ? (
            <p className="">
              Please Login to view the fantastic world of YouFlix
            </p>
          ) : (
            <>
              <p className="">
                Hey Bro, You did it, thanks for subscribing too
              </p>
              <img src="https://api.cloudnouns.com/v1/pfp" alt="" />
            </>
          )}
        </div>
      </div>
    </body>
  );
}

export default App;
