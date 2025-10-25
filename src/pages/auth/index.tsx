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
    text: "Capture key decisions and tasks automatically so nothing slips through the cracks. Reliable, secure, and designed for teams.",
  },
  {
    title: "Make Every Meeting Count",
    text: "Instant summaries and task generation from voice — save time, reduce churn, and accelerate follow-through.",
  },
  {
    title: "Trusted by Teams",
    text: "Join forward-thinking teams that save hours each week — try Flashtasks free and see the difference in your delivery rhythm.",
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

      <div className="bg-[url('/bg-auth.jpeg')] bg-cover bg-center md:w-[45%] h-[95vh] rounded-[12px] m-4 sticky top-0 md:block hidden">
        <div className="flex flex-col gap-6 p-[10%] h-full justify-between bg-black/[0.1] backdrop-blur-sm w-full rounded-[12px]">
          <h1 className="flex items-center gap-2">
            <LogoIcon className="text-primary" />
            <span className="text-[20px] font-medium">Flashtasks</span>
          </h1>

          <div className="flex flex-col gap-6 text-white w-full">

          {/* Slides */}
            <div className="relative h-[140px] overflow-hidden">
              <div
                className="flex relative h-full"
              >
                <Slider slides={slides} activeSlider={activeSlider} />
              </div>
            </div>

            {/* Dots */}
            <div className="flex items-center gap-3 mt-4 px-2">
              {slides.map((_, i) => (
                <button onClick={() => setActiveSlider(i)}
                  key={i}
                  className={`cursor-pointer duration-500 rounded-[40px] ${activeSlider === i ? " bg-primary w-3 h-3 outline-2 outline-offset-2 outline-white/[0.5]" : " bg-white/[0.6] w-2 h-2"}`}
                ></button>
              ))}
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