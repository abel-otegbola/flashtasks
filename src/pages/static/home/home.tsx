import useTheme from '../../../customHooks/useTheme'
import { useUser } from '../../../context/authContext'
import Button from "../../../components/button/button"
import LogoIcon from "../../../assets/icons/logo"
import BlurReveal from '../../../components/animations/blurReveal';
import { CalendarIcon, GridFourIcon, GridNineIcon, LightningIcon, UsersIcon } from '@phosphor-icons/react';
import { ArrowRightUp } from '@solar-icons/react';

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
          <div className="relative flex flex-col text-[48px] font-semibold md:leading-[60px] leading-[56px] max-[400px]:leading-[50px]">
            
            <BlurReveal preset="slide-right"><h1>Get tasks done</h1></BlurReveal>

            <h1 className="">
            <BlurReveal preset="slide-right" className='inline md:mr-2 mr-1'>Faster and more</BlurReveal>
              <span className="underline decoration-[#22FF7E]">
                Efficiently
              </span>
            </h1>
            <img src="/arrow.svg" alt="sparkle" width={200} height={64} className="md:block hidden absolute top-0 -right-24 animate-pulse" />
          </div>
          <div className="text-gray dark:text-gray-300 mb-6">
            <BlurReveal preset="slide-right">Efficiently manage your tasks and boost productivity</BlurReveal>
          </div>
          <div className="flex gap-4 items-center justify-center flex-wrap w-full">
            <Button href="/auth/signup" className='py-[2px] sm:w-fit w-full'>Get free demo</Button>
            <Button href="/auth/signup" variant='secondary' className='py-[2px] sm:w-fit w-full'>Learn more</Button>
          </div>

          <div className='grid sm:grid-cols-3 gap-4 w-3.5xl mt-6'>
            {
              ["Real-time collaboration", "Intelligent task automation", "Customizable analytics dashboard"].map((feature) => (
                <div key={feature} className='flex gap-2 items-center justify-center'>
                  <div className='flex items-center justify-center h-4 w-4 bg-dark/[0.3] dark:bg-white/[0.1] rounded-full'>
                    <div className='h-2 w-2 bg-dark dark:bg-white rounded-full'></div>
                  </div>
                  <p className='text-gray-500'>{feature}</p>
                </div>
              ))
            }
          </div>
        </div>
        
        <div className="flex flex-col justify-center items-center py-[60px] p-4 md:w-[65%] w-full">
          <img src={`/hero-img-${theme === 'dark' ? 'dark' : 'light'}.webp`} width={1229} height={829} alt="hero" className="shadow-2xl rounded-[16px]" />
          <h2 className="font-medium mt-20 mb-4 text-center">Join 500+ teams saving 10+ hours/week of quality time</h2>
          <img src="/users.png" alt="users" width={240} height={64} className="" />
        </div>
        
      </header>

      
      <section className="flex flex-col gap-10 lg:px-[6%] md:px-[3%] p-4">

        <div className="flex flex-col justify-center items-center mx-auto max-w-3xl gap-[19px] mb-10 text-center">
          <p className="font-medium flex items-center gap-2 border border-gray-500/[0.2] rounded-full px-6 py-2">
            <LightningIcon />
            Why People Choose Flashtasks
          </p>
          <h2 className="md:text-[32px] text-[28px] font-medium leading-[120%]">
            Built to help teams move faster with less effort
          </h2>
          <p className='text-[#939395] md:w-[60%] w-[90%] mx-auto'>
            Flashtasks keeps planning, prioritization, and collaboration in one simple workspace.
          </p>
        </div>

        <div className="grid md:grid-cols-3 max-w-6xl mx-auto md:gap-[60px] gap-8">
          <div className="flex flex-col gap-4 border border-gray-500/[0.2] p-12">
            <p className="md:text-[40px] text-[32px] text-primary">
              <GridNineIcon weight='light' />
            </p>

            <h2 className="font-medium">AI Task Breakdown</h2>

            <p>
              Turn overwhelming projects into actionable steps instantly. 
            </p>
            <div className='flex-1 flex items-end'>
              <div className='mt-8 p-3 w-fit rounded-full border border-gray-500/[0.2]'>
                <ArrowRightUp size={20} weight='Outline' opacity={0.6} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 border border-gray-500/[0.2] p-12">
            <p className="md:text-[40px] text-[32px] text-primary">
              <CalendarIcon weight='light' />
            </p>

            <h2 className="font-medium">Smart Daily Planning</h2>

            <p>
              Automatically organize your day with AI-powered prioritization.
            </p>
            <div className='flex-1 flex items-end'>
              <div className='mt-8 p-3 w-fit rounded-full border border-white/[0.5]'>
                <ArrowRightUp size={20} weight='Outline' opacity={0.6} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 border border-gray-500/[0.2] p-12 bg-primary text-white">
            <p className="md:text-[40px] text-[32px] text-white">
              <UsersIcon weight='light' />
            </p>

            <h2 className="font-medium">Collaborate Anywhere</h2>

            <p>
              Manage tasks with teammates, clients, or study groups in shared workspaces.
            </p>

            <div className='flex-1 flex items-end'>
              <div className='mt-8 p-3 w-fit rounded-full border border-gray-500/[0.2]'>
                <ArrowRightUp size={20} weight='Outline' opacity={0.6} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-10 pt-20 pb-10 p-4 md:mx-[5%]">
        <div className="flex flex-col justify-center items-center mx-auto max-w-3xl gap-[19px] mb-10">
          <p className="font-medium flex items-center gap-2 border border-gray-500/[0.2] rounded-full px-6 py-2">
            <GridFourIcon />
            Features
          </p>

          <h2 className="md:text-[32px] text-[28px] text-center font-medium leading-[120%]">
            Latest advanced technologies to ensure everything you need
          </h2>
          <p className='text-[#939395] md:w-[60%] w-[90%] mx-auto text-center'>maximize your team productivity with our advanced technologies built specifically for you.</p>
        </div>

      </section>

      <section className="flex flex-col gap-10 lg:px-[6%] md:px-[3%] p-4">

        <div className="relative flex md:flex-nowrap flex-wrap w-full gap-8 bg-gray-100 dark:bg-[#191919] rounded-lg md:pl-[6%] p-6 pb-0 md:h-[400px]">
          <div className="flex flex-col justify-between gap-8 md:w-[30%] py-[6%]">
            <h3 className="font-semibold text-lg">
              Clear Task Visibility
            </h3>

            <p>
              Track projects, due dates, and priorities from a single dashboard so your team always knows what to do next.
            </p>

            <Button href="/auth/signup" variant="primary" className="">
              Learn more
            </Button>
          </div>

          <div className="flex-1 flex items-end h-full justify-center">
            <img
              src={`/hero-img-${theme === 'dark' ? 'dark' : 'light'}.webp`}
              width={500}
              height={300}
              className="object-cover md:w-[500px] w-full"
            />

            <div className="absolute bottom-0 left-0 w-full h-[90px] bg-gradient-to-t from-[gray-500/[0.1]  rounded-b-lg"></div>
          </div>
        </div>

        <div className="flex md:flex-nowrap flex-wrap gap-[32px]">
          <div className="flex flex-col md:w-[50%] w-full gap-4 bg-gray-100 dark:bg-[#191919] rounded-lg md:p-[6%] p-6">
            <h3 className="font-medium text-[80px] font-semibold">AI</h3>

            <p>
              Intelligent task management powered by AI scheduling, prioritization,
              task organization, and productivity assistance.
            </p>
          </div>

          <div className="flex flex-col justify-between md:w-[50%] w-full gap-4 bg-gray-100 dark:bg-[#191919] rounded-lg md:p-[6%] p-6">
            <h3 className="font-semibold text-lg">
              Simple & Distraction-Free
            </h3>

            <p>
              Designed with clarity in mind. No overwhelming dashboards or bloated
              workflows — just a clean productivity system focused on helping you get
              work done faster.
            </p>
          </div>
        </div>

      </section>

      <section className="flex flex-col items-center justify-center gap-10 lg:p-[6%] p-[10%] sm:mx-[6%] mt-20 mx-4 mb-12 rounded-[12px] bg-primary text-white">
        <div>
          <h2 className="md:text-[32px] text-[24px] font-medium leading-[110%] text-center">
            Start achieving more with Flashtasks today
          </h2>
        </div>

        <div>
          <Button className="z-2 bg-white text-primary hover:bg-gray-100" variant="tertiary" href="/auth/login">
            Get Started Free
          </Button>
        </div>
      </section>

    </main>
  )
}

export default Home
