import { MedalRibbon, Microphone2, ChartSquare, Lightning, Magnet, CheckCircle, ArrowRight, UsersGroupRounded } from "@solar-icons/react"
import HeroCheckIcon from "../../../assets/icons/heroCheck"
import useTheme from '../../../customHooks/useTheme'
import { useUser } from '../../../context/authContext'
import Button from "../../../components/button/button"

function Home() {
  const { user } = useUser();
  const theme = useTheme();
  return (
    <main className="w-full dark:bg-dark dark:text-gray-100">
      <header className="flex md:flex-row flex-col min-h-[600px]">

        <div className="flex flex-col flex-1 h-[600px] md:py-0 py-[60px] justify-center md:px-[10%] px-4 gap-8 ">
          <h1 className="md:text-[56px] text-[32px] font-medium md:leading-[60px]">
            AI Meeting Recorder & Note Transcriber
          </h1>
          <p className="text-gray dark:text-gray-300">
            FlashTasks automatically joins your meetings, records conversations, and generates accurate transcripts and meeting notes — so you never miss important discussions.
          </p>
          <Button href="/auth/signup">Get Started</Button>
          <h2 className="font-medium">Join 500+ teams saving 10+ hours/week of quality time</h2>
          <img src="/users.png" alt="users" width={120} height={36} className="" />
        </div>
        
        <div className="flex justify-center items-center md:p-[8%] p-4 md:w-[45%] w-full md:h-[600px] bg-[#D0D0D00D] ">
          <img src={`/hero-img-${theme === 'dark' ? 'dark' : 'light'}.webp`} width={729} height={529} alt="hero" className="shadow-2xl rounded-lg" />
        </div>
      </header>

    </main>
  )
}

export default Home
