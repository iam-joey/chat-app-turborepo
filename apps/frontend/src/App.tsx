import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { RecoilRoot } from "recoil";

import About from "./pages/About";
import { Login } from "./pages/Login";
import { SignUp } from "./pages/SignUp";
import CreateRoom from "./pages/CreateRoom";
import PrivateRoute from "./pages/PrivateRoutes";
import NavBar from "./components/NavBar";

function App() {
  return (
    <>
      <Toaster
        position="top-center"
        richColors
        closeButton
        duration={60 * 10}
      />
      <RecoilRoot>
        <BrowserRouter>
          <MainApp />
        </BrowserRouter>
      </RecoilRoot>
    </>
  );
}

function MainApp() {
  return (
    <div className="border-black ">
      <NavBar />
      <Routes>
        <Route path="/" element={<About />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route element={<PrivateRoute />}>
          <Route path="/room" element={<CreateRoom />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
