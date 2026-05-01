import useTheme from '../../../customHooks/useTheme'
import { useUser } from '../../../context/authContext'
import Button from "../../../components/button/button"
import LogoIcon from "../../../assets/icons/logo"
import BlurReveal from '../../../components/animations/blurReveal';

function Home() {
  const { user } = useUser();
  const theme = useTheme();
  return (
    <main className="w-full dark:bg-[#101010] dark:text-gray-100 pb-20">
      <header className="flex flex-col justify-center items-center w-full bg-[#F6F6F6]/[0.4] dark:bg-[#191919] py-20 px-6">
        
        <div className="flex flex-col text-center items-center justify-center gap-4 ">
          <div className=" px-4 rounded-lg shadow-[0px_2px_5px_0px_#20202020] border border-gray-500/[0.2]">
            <LogoIcon className="w-[14px]"  />
          </div>
          <div className="flex flex-col md:text-[48px] text-[28px] max-[400px]:text-[24px] font-semibold md:leading-[60px] leading-[36px]">
            
            <BlurReveal preset="slide-right"><h1>Get tasks done</h1></BlurReveal>

            <h1 className="flex gap-2 items-center justify-center">
            <BlurReveal preset="slide-right">Faster and more</BlurReveal>
              <span className="relative ml-1 underline decoration-[#22FF7E]">
                Efficiently
                <img src="/arrow.svg" alt="sparkle" width={200} height={64} className="md:block hidden absolute -top-16 -right-24 animate-pulse" />
              </span>
            </h1>
          </div>
          <p className="text-gray dark:text-gray-300 mb-6">
            <BlurReveal preset="slide-right">Efficiently manage your tasks and boost productivity</BlurReveal>
          </p>
          <div className="flex gap-4">
            <Button href="/auth/signup" className='py-[2px] sm:w-fit w-full'>Get free demo</Button>
            <Button href="/auth/signup" variant='secondary' className='py-[2px] sm:w-fit w-full'>Learn more</Button>
          </div>

          <div className='grid sm:grid-cols-3 gap-4 w-3.5xl mt-6'>
            <div className='flex gap-2 items-center justify-center'>
              <div className='flex items-center justify-center h-4 w-4 bg-dark/[0.3] rounded-full'>
                <div className='h-2 w-2 bg-dark rounded-full'></div>
              </div>
              <p className='text-gray-500'>Real-time collaboration</p>
            </div>
            <div className='flex gap-2 items-center justify-center'>
              <div className='flex items-center justify-center h-4 w-4 bg-dark/[0.3] rounded-full'>
                <div className='h-2 w-2 bg-dark rounded-full'></div>
              </div>
              <p className='text-gray-500'>Intelligent task automation</p>
            </div>
            <div className='flex gap-2 items-center justify-center'>
              <div className='flex items-center justify-center h-4 w-4 bg-dark/[0.3] rounded-full'>
                <div className='h-2 w-2 bg-dark rounded-full'></div>
              </div>
              <p className='text-gray-500'>Customizable analytics dashboard</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col justify-center items-center py-[60px] p-4 md:w-[65%] w-full">
          <img src={`/hero-img-${theme === 'dark' ? 'dark' : 'light'}.webp`} width={1229} height={829} alt="hero" className="shadow-2xl rounded-[16px]" />
          <h2 className="font-medium mt-20 mb-4 text-center">Join 500+ teams saving 10+ hours/week of quality time</h2>
          <img src="/users.png" alt="users" width={240} height={64} className="" />
        </div>
        
      </header>

    </main>
  )
}

export default Home
