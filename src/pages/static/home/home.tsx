import useTheme from '../../../customHooks/useTheme'
import { useUser } from '../../../context/authContext'
import Button from "../../../components/button/button"
import LogoIcon from "../../../assets/icons/logo"
import BlurReveal from '../../../components/animations/blurReveal';
import { ChartLineUpIcon, LightningIcon, ShareNetworkIcon } from '@phosphor-icons/react';

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
          <div className="flex gap-4 items-center justify-center flex-wrap">
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

      <section className="flex flex-col gap-10 lg:p-[6%] md:p-[3%] p-4 md:mx-[5%] mb-12 md:shadow-lg rounded-[12px] bg-white -mt-12">
        <div className="grid md:grid-cols-2 items-center gap-[60px]">
          <div className="flex flex-col gap-4">
            <p className="font-medium text-primary uppercase">AI-Powered Productivity</p>
            <h2 className="text-[42px] font-medium leading-[110%]">
              Built For Faster Execution & Smarter Workflows
            </h2>
          </div>

          <div className="flex items-center md:justify-center">
            <p className="md:w-[75%]">
              From students managing assignments to teams handling complex projects,
              Flashtasks helps you organize work, prioritize smarter, and complete
              tasks faster using intelligent AI-powered planning and productivity
              tools.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 items-center gap-[60px]">
          <div className="flex flex-col gap-4">
            <p className="md:text-[40px] text-[32px] text-primary">
              <LightningIcon />
            </p>

            <h2 className="font-medium">AI Task Breakdown</h2>

            <p>
              Turn overwhelming projects into actionable steps instantly. Flashtasks
              intelligently breaks down large goals into manageable tasks so you can
              start faster and stay productive.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <p className="md:text-[40px] text-[32px] text-primary">
              <ChartLineUpIcon />
            </p>

            <h2 className="font-medium">Smart Daily Planning</h2>

            <p>
              Automatically organize your day with AI-powered prioritization. Focus
              on what matters most, reduce mental overload, and maintain momentum
              throughout your workflow.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <p className="md:text-[40px] text-[32px] text-primary">
              <ShareNetworkIcon />
            </p>

            <h2 className="font-medium">Collaborate Anywhere</h2>

            <p>
              Manage tasks with teammates, clients, or study groups in shared
              workspaces. Assign tasks, track progress, and stay aligned across every
              project from one clean dashboard.
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-10 lg:p-[6%] md:p-[3%] p-4 mb-12">
        <div className="flex flex-col justify-center md:items-center gap-4 mb-10">
          <p className="font-medium text-primary uppercase">
            Built For Modern Productivity
          </p>

          <h2 className="text-[42px] font-medium leading-[110%]">
            Why People Choose Flashtasks
          </h2>
        </div>

        <div className="flex md:flex-nowrap flex-wrap gap-[32px]">
          <div className="flex flex-col md:w-[50%] w-full gap-4 bg-primary/[0.08] rounded-lg p-6">
            <h3 className="font-medium text-[80px] font-semibold">AI</h3>

            <p>
              Intelligent task management powered by AI scheduling, prioritization,
              task organization, and productivity assistance.
            </p>
          </div>

          <div className="flex flex-col justify-between md:w-[50%] w-full gap-4 bg-primary/[0.08] rounded-lg p-6">
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

        <div className="relative flex md:flex-nowrap flex-wrap w-full gap-8 bg-primary/[0.08] rounded-lg p-6 pb-0 md:h-[400px]">
          <div className="flex flex-col justify-center gap-8 md:w-[30%]">
            <h3 className="font-semibold text-lg">
              Complete Productivity Visibility
            </h3>

            <p>
              Track progress across projects, assignments, and daily tasks with a
              smart dashboard that keeps your priorities, deadlines, and workflow
              performance organized in one place.
            </p>
          </div>

          <div className="flex-1 flex items-end h-full justify-center">
            <img
              src="/why-bg.png"
              width={500}
              height={300}
              className="object-cover md:w-[500px] w-full"
            />

            <div className="absolute bottom-0 left-0 w-full h-[90px] bg-gradient-to-t from-primary/[0.1] via-primary/[0.08] rounded-b-lg"></div>
          </div>
        </div>
      </section>

      <section className="flex flex-col items-center justify-center gap-10 lg:p-[6%] p-[10%] sm:mx-[6%] mx-4 mb-12 rounded-[12px] bg-primary text-white">
        <div>
          <h2 className="md:text-[42px] text-[32px] font-medium leading-[110%] text-center">
            Start Achieving More With AI
          </h2>
        </div>

        <div>
          <Button variant="secondary" className="z-2" href="/auth/login">
            Get Started Free
          </Button>
        </div>
      </section>

    </main>
  )
}

export default Home
