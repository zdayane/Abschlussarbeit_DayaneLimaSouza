import { Route, Routes } from "react-router-dom";
import { getUserIDFromJWT, UserIDContext, BoardIDContext, getBoardIDFromJWT } from "./backend/boardapi";
import { useState } from "react";
import Login from "./components/Login";
import NewsForm from "./components/NewsForm";
import Board from "./components/Board";
import NewsSubmitted from "./components/NewsSubmitted";
import NewsDraft from "./components/NewsDraft";
import News from "./components/News";
import NewsReject from "./components/NewsReject";
import NewsEdit from "./components/NewsEdit";
import User from "./components/User";


function App() {
  // Local state to store the user ID and board ID
  const [userID, setUserID] = useState(getUserIDFromJWT());
  const [boardID, setBoardID] = useState(getBoardIDFromJWT());

  return (
    // Context providers to supply the user ID and board ID to child components
    <UserIDContext.Provider value={{ userID, setUserID }}>
      <BoardIDContext.Provider value={{ boardID, setBoardID }}>
        <Routes>
          <Route path="/" element={<Login />}></Route>
          <Route path="/user" element={<User />}></Route>
          <Route path="/news" element={<NewsForm />}></Route>
          <Route path="/news/:newsId" element={<News />}></Route>
          <Route path="/news/:newsId/draft" element={<NewsDraft />}></Route>
          <Route path="/news/:newsId/edit" element={<NewsEdit />}></Route>
          <Route path="/news/:newsId/submit" element={<NewsSubmitted />}></Route>
          <Route path="/news/:newsId/reject" element={<NewsReject />}></Route>
          <Route path="/board/:boardId" element={<Board />}></Route>
        </Routes>
      </BoardIDContext.Provider>
    </UserIDContext.Provider>

  );
}

export default App;
