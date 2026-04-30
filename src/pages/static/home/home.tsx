import useTheme from '../../../customHooks/useTheme'
import { useUser } from '../../../context/authContext'
import Button from "../../../components/button/button"
import LogoIcon from "../../../assets/icons/logo"
import BlurReveal from '../../../components/animations/blurReveal';

function Home() {
  const { user } = useUser();
  const theme = useTheme();
  return (
    <main className="w-full dark:bg-dark dark:text-gray-100 py-20 px-6">
      <header className="flex flex-col justify-center items-center w-full">
        
        <div className="flex flex-col text-center items-center justify-center gap-4 ">
          <div className=" px-4 rounded-lg shadow-[0px_2px_5px_0px_#20202020] border border-gray-500/[0.2]">
            <LogoIcon className="w-[14px]"  />
          </div>
          <div className="flex flex-col gap-3 md:text-[48px] text-[28px] max-[400px]:text-[24px] font-semibold md:leading-[60px] leading-[40px]">
            
            <BlurReveal preset="slide-right"><h1>Get tasks done</h1></BlurReveal>

            <h1 className="flex gap-2 items-center justify-center">
            <BlurReveal preset="slide-right"><span className="text-[#8E7CF8]">Faster</span> and more</BlurReveal>
              <span className="relative bg-gradient-to-r from-[#8E7CF8] via-[#1AC464] to-[#1AC464] bg-clip-text text-transparent ml-1">
                Efficiently
                <img src="/arrow.svg" alt="sparkle" width={200} height={64} className="md:block hidden absolute -top-16 -right-24 animate-pulse" />
              </span>
            </h1>
          </div>
          <p className="text-gray dark:text-gray-300 mb-6">
            <BlurReveal preset="slide-right">Efficiently manage your tasks and boost productivity</BlurReveal>
          </p>
          <Button href="/auth/signup">Get free demo</Button>
        </div>
        
        <div className="flex flex-col justify-center items-center py-[60px] p-4 md:w-[75%] w-full">
          <img src={`/hero-img-${theme === 'dark' ? 'dark' : 'light'}.webp`} width={1229} height={829} alt="hero" className="shadow-2xl rounded-lg" />
          <h2 className="font-medium mt-20 mb-4 text-center">Join 500+ teams saving 10+ hours/week of quality time</h2>
          <img src="/users.png" alt="users" width={240} height={64} className="" />
        </div>
        
      </header>

    </main>
  )
}

export default Home
