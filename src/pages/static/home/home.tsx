import useTheme from '../../../customHooks/useTheme'
import { useUser } from '../../../context/authContext'
import Button from "../../../components/button/button"
import LogoIcon from "../../../assets/icons/logo"
import BlurReveal from '../../../components/animations/blurReveal';
import { CalendarIcon, GridFourIcon, GridNineIcon, LightningIcon, UsersIcon } from '@phosphor-icons/react';
import { ArrowRightUp, Microphone } from '@solar-icons/react';
import FaqSection from '../../../components/faqs/faqs';

function Home() {
  const { user } = useUser();
  const theme = useTheme();
  return (
    <main className="w-full dark:bg-dark-bg dark:text-gray-100 pb-20">
      <header className="flex flex-col justify-center items-center w-full bg-[#F6F6F6]/[0.4] dark:bg-dark/[0.4] py-20">
        
        <div className="flex flex-col text-center items-center justify-center gap-4 px-6">
          <div className=" px-4 rounded-lg shadow-[0px_2px_5px_0px_#20202020] border border-gray-500/[0.2] animate-bounce">
            <LogoIcon className="w-[14px]"  />
          </div>
          <div className="relative flex flex-col text-[48px] max-[400px]:text-[40px] font-semibold md:leading-[60px] leading-[56px] max-[400px]:leading-[50px]">
            
            <BlurReveal preset="slide-right"><h1>Get tasks done</h1></BlurReveal>

              <h1 className="">
                Faster and more <span className="underline decoration-[#22FF7E]">Efficiently</span>
              </h1>
            <img src="/arrow.svg" alt="sparkle" width={200} height={64} className="md:block hidden absolute top-0 -right-24 animate-bounce" />
          </div>
          <div className="text-gray dark:text-gray-300 mb-6">
            <BlurReveal preset="slide-right">Efficiently manage your tasks and boost productivity</BlurReveal>
          </div>
          <div className="flex gap-4 items-center justify-center flex-wrap w-full">
            <Button href="/auth/signup" className='py-[2px] sm:w-fit w-full'><BlurReveal preset="slide-right">Get free demo</BlurReveal></Button>
            <Button href="/auth/signup" variant='secondary' className='py-[2px] sm:w-fit w-full'><BlurReveal preset="slide-right">Learn more</BlurReveal></Button>
          </div>

          <div className='sm:grid hidden sm:grid-cols-3 gap-4 w-3.5xl mt-6'>
            {
              ["Real-time collaboration", "Intelligent task automation", "Customizable analytics dashboard"].map((feature) => (
                <div key={feature} className='flex gap-2 items-center justify-center'>
                  <div className='flex items-center justify-center h-4 w-4 bg-dark/[0.3] dark:bg-white/[0.1] rounded-full'>
                    <div className='h-2 w-2 bg-dark dark:bg-white rounded-full'></div>
                  </div>
                  <BlurReveal preset="slide-right" className='text-gray-500'>{feature}</BlurReveal>
                </div>
              ))
            }
          </div>
        </div>
        
        <div className="flex flex-col justify-center items-center py-[60px] p-4 md:w-[65%] w-full">
          <div className='shadow-lg md:rounded-[24px] rounded w-full flex items-center justify-center bg-[#F6F6F6]/[0.4] dark:bg-dark/[0.7] md:p-4 p-1'>
            <video autoPlay loop muted playsInline className="w-full h-full md:rounded-[16px] rounded-[8px] border border-gray-500/[0.07]">
              <source src={`/hero-video-${theme === 'dark' ? 'dark' : 'light'}.webm`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <BlurReveal preset="slide-right"><h2 className="font-medium mt-20 mb-4 text-center">Join 500+ teams saving 10+ hours/week of quality time</h2></BlurReveal>
          <img src="/users.png" alt="users" width={240} height={64} className="" />
        </div>
        
      </header>

      
      <section className="flex flex-col gap-10 lg:px-[6%] md:px-[3%] p-4 py-[60px]">

        <div className="flex flex-col justify-center items-center mx-auto max-w-3xl gap-[19px] mb-10 text-center">
          <BlurReveal preset="slide-right" className="font-medium flex items-center gap-2 border border-gray-500/[0.2] rounded-full px-6 py-2">
            <LightningIcon />
            Why People Choose Flashtasks
          </BlurReveal>
          <BlurReveal preset="slide-right"><h2 className="md:text-[32px] text-[28px] font-medium leading-[120%]">Built to help teams move faster with less effort</h2></BlurReveal>
          <BlurReveal preset="slide-right"><p className='text-[#939395] md:w-[60%] w-[90%] mx-auto'>Flashtasks keeps planning, prioritization, and collaboration in one simple workspace.</p></BlurReveal>
        </div>

        <div className="grid md:grid-cols-3 max-w-6xl mx-auto md:gap-[60px] gap-8">
          <div className="flex flex-col gap-4 border border-gray-500/[0.2] p-12">
            <p className="md:text-[40px] text-[32px] text-primary">
              <GridNineIcon weight='light' />
            </p>

            <BlurReveal preset="slide-right"><h2 className="font-medium">AI Task Breakdown</h2></BlurReveal>

            <BlurReveal preset="slide-right"><p>Turn overwhelming projects into actionable steps instantly.</p></BlurReveal>
            <div className='flex-1 flex items-end'>
              <div className='mt-8 p-3 w-fit rounded-full border border-gray-500/[0.2] animate-bounce'>
                <ArrowRightUp size={20} weight='Outline' opacity={0.6} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 border border-gray-500/[0.2] p-12">
            <p className="md:text-[40px] text-[32px] text-primary">
              <CalendarIcon weight='light' />
            </p>

            <BlurReveal preset="slide-right"><h2 className="font-medium">Smart Daily Planning</h2></BlurReveal>

            <BlurReveal preset="slide-right"><p>Automatically organize your day with AI-powered prioritization.</p></BlurReveal>
            <div className='flex-1 flex items-end'>
              <div className='mt-8 p-3 w-fit rounded-full border border-gray-500/[0.2] animate-bounce'>
                <ArrowRightUp size={20} weight='Outline' opacity={0.6} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 border border-gray-500/[0.2] p-12 bg-primary text-white">
            <p className="md:text-[40px] text-[32px] text-white">
              <UsersIcon weight='light' />
            </p>

            <BlurReveal preset="slide-right"><h2 className="font-medium">Collaborate Anywhere</h2></BlurReveal>

            <BlurReveal preset="slide-right"><p>Manage tasks with teammates, clients, or study groups in shared workspaces.</p></BlurReveal>

            <div className='flex-1 flex items-end'>
              <div className='mt-8 p-3 w-fit rounded-full border border-white/[0.5] animate-bounce'>
                <ArrowRightUp size={20} weight='Outline' opacity={0.6} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-10 pt-20 pb-10 p-4 md:mx-[5%]" id="features">
        <div className="flex flex-col justify-center items-center mx-auto max-w-3xl gap-[19px] mb-10">
          <BlurReveal preset="slide-right" className="font-medium flex items-center gap-2 border border-gray-500/[0.2] rounded-full px-6 py-2">
            <GridFourIcon />
            Features
          </BlurReveal>

          <BlurReveal preset="slide-right"><h2 className="md:text-[32px] text-[28px] text-center font-medium leading-[120%]">Latest advanced technologies to ensure everything you need</h2></BlurReveal>
          <BlurReveal preset="slide-right"><p className='text-[#939395] md:w-[60%] w-[90%] mx-auto text-center'>maximize your team productivity with our advanced technologies built specifically for you.</p></BlurReveal>
        </div>

      </section>

      <section className="flex flex-col gap-10 lg:px-[6%] md:px-[3%] p-4">

        <div className="relative flex md:flex-nowrap items-end flex-wrap w-full gap-8 bg-gray-100 dark:bg-dark/[0.4] rounded-lg md:pl-[6%] pb-0">
          <div className="flex flex-col justify-between gap-8 md:w-[45%] py-[6%]">
            <BlurReveal preset="slide-right" className="font-medium flex items-center gap-2 w-fit border border-gray-500/[0.2] rounded-full px-6 py-2">
              <Microphone />
              Voice to tasks
            </BlurReveal>

            <BlurReveal preset="slide-right"><p className="text-[48px] max-[400px]:text-[40px] md:leading-[60px] leading-[56px] max-[400px]:leading-[50px]">Convert your spoken words into actionable tasks seamlessly</p></BlurReveal>

            <Button href="/auth/signup" variant="primary" className="">
              <BlurReveal preset="slide-right">Learn more</BlurReveal>
            </Button>
          </div>

          <div className="flex-1 flex items-end h-full justify-center">
            <div className='rounded-t-lg sm:w-[600px] w-[100%] h-auto flex items-center justify-center bg-[#F6F6F6]/[0.4] dark:bg-dark/[0.7] md:p-3 p-1'>
              <video autoPlay loop muted playsInline className="w-full h-full md:rounded-[10px] rounded-[8px] border border-gray-500/[0.07]">
                <source src={`/voice-to-tasks-${theme === 'dark' ? 'dark' : 'light'}.mp4`} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-[90px] bg-gradient-to-t from-[gray-500/[0.1]  rounded-b-lg"></div>
          </div>
        </div>

        <div className="flex md:flex-nowrap flex-wrap gap-[32px]">
          <div className="flex flex-col md:w-[50%] w-full gap-4 bg-gray-100 dark:bg-dark/[0.4] rounded-lg md:p-[6%] p-6">
            <BlurReveal preset="slide-right"><h3 className="font-medium text-[80px] font-semibold">AI</h3></BlurReveal>

            <BlurReveal preset="slide-right"><p>Intelligent task management powered by AI scheduling, prioritization, task organization, and productivity assistance.</p></BlurReveal>
          </div>

          <div className="flex flex-col justify-between md:w-[50%] w-full gap-4 bg-gray-100 dark:bg-dark/[0.4] rounded-lg md:p-[6%] p-6">
            <BlurReveal preset="slide-right"><h3 className="font-semibold text-lg">Simple & Distraction-Free</h3></BlurReveal>

            <BlurReveal preset="slide-right"><p>Designed with clarity in mind. No overwhelming dashboards or bloated workflows — just a clean productivity system focused on helping you get work done faster.</p></BlurReveal>
          </div>
        </div>

      </section>

      <FaqSection />

      <section className="flex flex-col items-center justify-center gap-10 lg:p-[6%] p-[10%] sm:mx-[6%] mt-20 mx-4 mb-12 rounded-[12px] bg-primary text-white">
        <div>
          <BlurReveal preset="slide-right"><h2 className="md:text-[32px] text-[24px] font-medium leading-[110%] text-center">Start achieving more with Flashtasks today</h2></BlurReveal>
        </div>

        <div>
          <Button className="z-2 bg-white text-primary hover:bg-gray-100" variant="tertiary" href="/auth/login">
            <BlurReveal preset="slide-right">Get Started Free</BlurReveal>
          </Button>
        </div>
      </section>

    </main>
  )
}

export default Home
