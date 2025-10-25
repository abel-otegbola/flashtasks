
function Slider({slides, activeSlider}: {slides: {title: string, text: string}[], activeSlider: number}) {
  return (
    <div>
        {slides.map((slide, idx) => (
        <div
            key={idx}
            className="absolute left-0 right-0 flex-shrink-0 w-full flex flex-col gap-2 transition duration-[1000ms] ease-in-out p-6 rounded-[10px] bg-black/20 backdrop-blur-sm border border-gray-500/[0.2]"
            style={{ 
            width: "100%", 
            transform: activeSlider === idx ? "translateX(0%)" : activeSlider === 2 && idx === 0 ? "translateX(110%)" : activeSlider === 0 && idx === slides.length -1 ? "translateX(-110%)" : activeSlider > idx ? "translateX(-110%)" : `translateX(110%)`,
            opacity: activeSlider === idx ? 1 : 0,
            }}
        >
            <h2 className="text-[18px] font-medium">{slide.title}</h2>
            <p className="text-sm">{slide.text}</p>
        </div>
        ))}
    </div>
  )
}

export default Slider