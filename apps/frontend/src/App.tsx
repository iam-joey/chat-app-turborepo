import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { RecoilRoot } from "recoil";

import About from "./pages/About";
import { Login } from "./pages/Login";
import { SignUp } from "./pages/SignUp";

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
          <Routes>
            <Route path="/about" element={<About />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </BrowserRouter>
      </RecoilRoot>
    </>
  );
}

export default App;
