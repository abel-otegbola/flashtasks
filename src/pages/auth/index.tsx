import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./login";
import SuccessPage from "./success";
import SignupPage from "./signup";
import LogoIcon from "../../assets/icons/logo";
import Slider from "../../components/slider/slider";
import { useEffect, useState } from "react";

function AuthPages() {
  const [activeSlider, setActiveSlider] = useState(0);
  
const slides = [
  {
    title: "Build With Confidence",
    text: "You don’t need perfect conditions to begin. Start where you are, use what you have, and move forward—clarity comes through action..",
  },
  {
    title: "Make Every Meeting Count",
    text: "Great things aren’t built in bursts of inspiration, but in quiet, consistent action. Show up, do the work, and let progress speak for itself.",
  },
  {
    title: "Execution is key",
    text: "The difference between ideas and achievement is execution. Decide, commit, and take the first step—momentum will carry you the rest of the way.",
  },
];

  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveSlider((prev) => (prev === slides.length -1 ? 0 : prev + 1));
    }, 5000);
    return () => clearTimeout(timer);
  }, [activeSlider]);

  return (
    <div className="min-h-[400px] flex justify-between">

      <div className="relative bg-[url('/hero-bg3.png')] bg-cover bg-center md:w-[45%] h-[96vh] rounded-[12px] m-4 sticky top-0 md:block hidden">
        <div className="flex flex-col gap-6 p-[10%] h-full justify-end w-full rounded-[12px]">

          <div className="flex flex-col gap-6 w-full">

          {/* Slides */}
            <div className="relative h-[140px] overflow-hidden">
              <div
                className="flex relative h-full"
              >
                <Slider slides={slides} activeSlider={activeSlider} />
              </div>
            </div>

          </div>
        </div>
      </div>
      <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignupPage/>} />
          <Route path="/signup/success" element={<SuccessPage />} />
      </Routes>

    </div>
  )
}

export default AuthPages