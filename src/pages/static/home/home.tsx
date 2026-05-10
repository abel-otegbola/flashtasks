import useTheme from '../../../customHooks/useTheme'
import { useUser } from '../../../context/authContext'
import Button from "../../../components/button/button"
import LogoIcon from "../../../assets/icons/logo"
import BlurReveal from '../../../components/animations/blurReveal';
import { CalendarIcon, GridFourIcon, GridNineIcon, LightningIcon, UsersIcon } from '@phosphor-icons/react';
import { ArrowRightUp, Microphone } from '@solar-icons/react';
import FaqSection from '../../../components/faqs/faqs';
import Animate from '../../../components/animations/animate';
import TodoCard from '../../../components/cards/todoCard';
import { todo } from '../../../interface/todo';
import TaskListView from '../../../components/cards/taskListView';

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
            
            <BlurReveal preset="slide-up"  delay={0.2}><h1>Get tasks done</h1></BlurReveal>

              <h1 className="sm:flex hidden gap-2 items-center">
                Faster and more<span className="underline decoration-[#22FF7E]">Efficiently</span>
              </h1>
            <img src="/arrow.svg" alt="sparkle" width={200} height={64} className="md:block hidden absolute top-0 -right-24" />
          </div>
          <div className="text-gray dark:text-gray-300 mb-6">
            <BlurReveal preset="slide-up" delay={0.2} duration={2}>Efficiently manage your tasks and boost productivity</BlurReveal>
          </div>
          <div className="flex gap-4 items-center justify-center flex-wrap w-full">
            <Button href="/auth/signup" className='py-[2px] sm:w-fit w-full'><BlurReveal preset="slide-up">Get free demo</BlurReveal></Button>
            <Button href="/auth/signup" variant='secondary' className='py-[2px] sm:w-fit w-full'><BlurReveal preset="slide-up">Learn more</BlurReveal></Button>
          </div>

          <div className='sm:grid hidden sm:grid-cols-3 gap-4 w-3.5xl mt-6'>
            {
              ["Real-time collaboration", "Intelligent task automation", "Customizable analytics dashboard"].map((feature) => (
                <div key={feature} className='flex gap-2 items-center justify-center'>
                  <div className='flex items-center justify-center h-4 w-4 bg-dark/[0.3] dark:bg-white/[0.1] rounded-full'>
                    <div className='h-2 w-2 bg-dark dark:bg-white rounded-full'></div>
                  </div>
                  <BlurReveal preset="slide-right" delay={0.2} className='text-gray-500'>{feature}</BlurReveal>
                </div>
              ))
            }
          </div>
        </div>
        
        <div className="flex flex-col justify-center items-center py-[60px] p-4 md:w-[65%] w-full">
          <Animate preset="zoomIn" duration={2} className='shadow-lg md:rounded-[24px] rounded w-full flex items-center justify-center bg-[#F6F6F6]/[0.4] dark:bg-dark/[0.7] md:p-4 p-1'>
            <video autoPlay loop muted playsInline className="w-full h-full md:rounded-[16px] rounded-[8px] border border-gray-500/[0.07]">
              <source src={`/hero-video-${theme === 'dark' ? 'dark' : 'light'}.webm`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </Animate>
          <BlurReveal preset="slide-up"><h2 className="font-medium mt-20 mb-4 text-center">Join 500+ teams saving 10+ hours/week of quality time</h2></BlurReveal>
          <img src="/users.png" alt="users" width={240} height={64} className="" />
        </div>
        
      </header>

      
      <section className="flex flex-col gap-10 lg:px-[6%] md:px-[3%] p-4 py-[60px]">

        <div className="flex flex-col justify-center items-center mx-auto max-w-3xl gap-[19px] mb-10 text-center">
          <BlurReveal preset="slide-up" className="font-medium flex items-center gap-2 border border-gray-500/[0.2] rounded-full px-6 py-2">
            <LightningIcon />
            Why People Choose Flashtasks
          </BlurReveal>
          <BlurReveal preset="slide-up"><h2 className="md:text-[32px] text-[28px] font-medium leading-[120%]">Built to help teams move faster with less effort</h2></BlurReveal>
          <BlurReveal preset="slide-up"><p className='text-[#939395] md:w-[60%] w-[90%] mx-auto'>Flashtasks keeps planning, prioritization, and collaboration in one simple workspace.</p></BlurReveal>
        </div>

        <div className="grid md:grid-cols-3 max-w-6xl mx-auto md:gap-[60px] gap-8">
          <Animate preset="zoomIn" duration={2} className="flex flex-col gap-4 border border-gray-500/[0.2] p-12">
            <p className="md:text-[40px] text-[32px] text-primary">
              <GridNineIcon weight='light' />
            </p>

            <BlurReveal preset="slide-up"><h2 className="font-medium">AI Task Breakdown</h2></BlurReveal>

            <BlurReveal preset="slide-up"><p>Turn overwhelming projects into actionable steps instantly.</p></BlurReveal>
            <div className='flex-1 flex items-end'>
              <div className='mt-8 p-3 w-fit rounded-full border border-gray-500/[0.2] animate-bounce'>
                <ArrowRightUp size={20} weight='Outline' opacity={0.6} />
              </div>
            </div>
          </Animate>

          <Animate preset="zoomIn" duration={2} delay={0.2} className="flex flex-col gap-4 border border-gray-500/[0.2] p-12">
            <p className="md:text-[40px] text-[32px] text-primary">
              <CalendarIcon weight='light' />
            </p>

            <BlurReveal preset="slide-up"><h2 className="font-medium">Smart Daily Planning</h2></BlurReveal>

            <BlurReveal preset="slide-up"><p>Automatically organize your day with AI-powered prioritization.</p></BlurReveal>
            <div className='flex-1 flex items-end'>
              <div className='mt-8 p-3 w-fit rounded-full border border-gray-500/[0.2] animate-bounce'>
                <ArrowRightUp size={20} weight='Outline' opacity={0.6} />
              </div>
            </div>
          </Animate>

          <Animate preset="zoomIn" duration={2} delay={0.4} className="flex flex-col gap-4 border border-gray-500/[0.2] p-12 bg-primary text-white">
            <p className="md:text-[40px] text-[32px] text-white">
              <UsersIcon weight='light' />
            </p>

            <BlurReveal preset="slide-up"><h2 className="font-medium">Collaborate Anywhere</h2></BlurReveal>

            <BlurReveal preset="slide-up"><p>Manage tasks with teammates, clients, or study groups in shared workspaces.</p></BlurReveal>

            <div className='flex-1 flex items-end'>
              <div className='mt-8 p-3 w-fit rounded-full border border-white/[0.5] animate-bounce'>
                <ArrowRightUp size={20} weight='Outline' opacity={0.6} />
              </div>
            </div>
          </Animate>
        </div>
      </section>

      <section className="flex flex-col gap-10 pt-20 pb-10 p-4 md:mx-[5%]" id="features">
        <div className="flex flex-col justify-center items-center mx-auto max-w-3xl gap-[19px] mb-10">
          <BlurReveal preset="slide-up" className="font-medium flex items-center gap-2 border border-gray-500/[0.2] rounded-full px-6 py-2">
            <GridFourIcon />
            Features
          </BlurReveal>

          <BlurReveal preset="slide-up"><h2 className="md:text-[32px] text-[28px] text-center font-medium leading-[120%]">Latest advanced technologies to ensure everything you need</h2></BlurReveal>
          <BlurReveal preset="slide-up"><p className='text-[#939395] md:w-[60%] w-[90%] mx-auto text-center'>maximize your team productivity with our advanced technologies built specifically for you.</p></BlurReveal>
        </div>

      </section>

      <section className="flex flex-col gap-10 lg:px-[6%] md:px-[3%] p-4">

        <div className="relative flex md:flex-nowrap items-end flex-wrap w-full gap-8 bg-gray-100 dark:bg-dark/[0.4] rounded-lg md:pl-[6%] p-12 pb-0">
          <div className="flex flex-col justify-between gap-8 md:w-[45%] py-[6%]">
            <BlurReveal preset="slide-up" className="font-medium flex items-center gap-2 w-fit border border-gray-500/[0.2] rounded-full px-6 py-2">
              <Microphone />
              Voice to tasks
            </BlurReveal>

            <BlurReveal preset="slide-up"><p className="sm:text-[40px] text-[32px] md:leading-[60px] sm:leading-[56px] leading-[40px]">Convert your spoken words into actionable tasks seamlessly</p></BlurReveal>

            <Button href="/auth/signup" variant="primary" className="">
              <BlurReveal preset="slide-up">Learn more</BlurReveal>
            </Button>
          </div>

          <div className="flex-1 flex items-end h-full justify-center">
            <Animate preset="fadeIn" duration={2} delay={0.6}>
              <div className='rounded-t-lg sm:w-[600px] w-[100%] h-auto flex items-center justify-center bg-[#F6F6F6]/[0.4] dark:bg-dark/[0.7] md:p-3 p-1'>
                <video autoPlay loop muted playsInline className="w-full h-full md:rounded-[10px] rounded-[8px] border border-gray-500/[0.07]">
                  <source src={`/voice-to-tasks-${theme === 'dark' ? 'dark' : 'light'}.mp4`} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </Animate>

            <div className="absolute bottom-0 left-0 w-full h-[90px] bg-gradient-to-t from-[gray-500/[0.1]  rounded-b-lg"></div>
          </div>
        </div>

        <div className="flex md:flex-nowrap flex-wrap gap-[32px]">
          <div className="flex flex-col md:w-[50%] w-full gap-4 bg-gray-100 dark:bg-dark/[0.4] rounded-lg md:p-[6%] p-12">
            <BlurReveal preset="slide-up"><h3 className="font-medium text-[80px] font-semibold">AI</h3></BlurReveal>

            <BlurReveal preset="slide-up"><p>Intelligent task management powered by AI scheduling, prioritization, task organization, and productivity assistance.</p></BlurReveal>
          </div>

          <div className="flex flex-col justify-between md:w-[50%] w-full gap-4 bg-gray-100 dark:bg-dark/[0.4] rounded-lg md:p-[6%] p-12">
            <BlurReveal preset="slide-up"><h3 className="font-semibold text-lg">Simple & Distraction-Free</h3></BlurReveal>

            <BlurReveal preset="slide-up"><p>Designed with clarity in mind. No overwhelming dashboards or bloated workflows — just a clean productivity system focused on helping you get work done faster.</p></BlurReveal>
          </div>
        </div>

      </section>

      <section className="flex flex-col gap-10 pt-20 pb-10 p-4 md:mx-[5%]" id="features">
        <div className="flex flex-col justify-center items-center mx-auto max-w-3xl gap-[19px] mb-10">
          <BlurReveal preset="slide-up" className="font-medium flex items-center gap-2 border border-gray-500/[0.2] rounded-full px-6 py-2">
            <GridFourIcon />
            Solutions
          </BlurReveal>

          <BlurReveal preset="slide-up"><h2 className="md:text-[32px] text-[28px] text-center font-medium leading-[120%] px-6">Work Smarter. Move Faster</h2></BlurReveal>
          <BlurReveal preset="slide-up"><p className='text-[#939395] md:w-[60%] w-[90%] mx-auto text-center'>FlashTasks helps teams and individuals simplify task management, improve collaboration, and stay productive with an organized all-in-one workspace.</p></BlurReveal>
        </div>

        <div className="grid md:grid-cols-2 max-w-12xl mx-auto gap-8 w-full">
          <Animate preset="zoomIn" duration={2} className="flex flex-col gap-4 border border-gray-500/[0.2] md:p-12 p-4">
            <div className='flex flex-col gap-2 bg-gray-100 dark:bg-dark/[0.4] p-4'>
              {
                  ([
                    { $id:"0", title: "Develop new features", description: "Need to research and implement new features", category: "dev", priority: "high", status: "pending", userId: "", userEmail: "", comments: "", $createdAt: "" },
                    { $id:"1", title: "Review pull requests", description: "Review and provide feedback on pending pull requests", category: "review", priority: "medium", status: "completed", userId: "", userEmail: "", comments: "", $createdAt: "" },
                    { $id:"2", title: "Update documentation", description: "Update user documentation with latest changes", category: "doc", priority: "low", status: "completed", userId: "", userEmail: "", comments: "", $createdAt: "" },
                  ] as todo[]).map((task: todo,index: number) => (
                  <TaskListView key={task.$id} task={task} openTaskDetails={() => {}} index={index} />
                ))  
              }
            </div>
            <BlurReveal preset="slide-up"><h2 className="font-medium text-center">Organize projects and daily tasks effortlessly</h2></BlurReveal>
          </Animate>  
          <Animate preset="zoomIn" duration={2} className="flex flex-col gap-4 border border-gray-500/[0.2] md:p-12 p-4">
            <div className='flex sm:flex-row flex-col gap-2 bg-gray-100 dark:bg-dark/[0.4] p-4'>
              {
                  ([
                    { $id:"1", title: "Update documentation", description: "Update user documentation with latest changes", category: "doc", priority: "low", status: "completed", userId: "", userEmail: "", comments: "", $createdAt: "", assignees: ["abel15655@gmail.com", "abel.d.otegbola@gmail.com"] },
                    { $id:"2", title: "Update documentation", description: "Update user documentation with latest changes", category: "doc", priority: "low", status: "completed", userId: "", userEmail: "", comments: "", $createdAt: "", assignees: ["user@gmail.com", "user2@gmail.com"] },
                  ] as todo[]).map((task: todo) => (
                  <TodoCard key={task.$id} {...task} />
                ))  
              }
            </div>
            <BlurReveal preset="slide-up"><h2 className="font-medium text-center">Collaborate with teams in real time</h2></BlurReveal>
          </Animate> 
        </div>

      </section>

      <FaqSection />

      <section className="flex flex-col items-center justify-center gap-10 lg:p-[6%] p-[10%] sm:mx-[6%] mt-20 mx-4 mb-12 bg-primary text-white">
        <div>
          <BlurReveal preset="slide-up"><h2 className="md:text-[32px] text-[24px] font-medium leading-[110%] text-center">Start achieving more with Flashtasks today</h2></BlurReveal>
        </div>

        <div>
          <Button className="z-2 bg-white text-primary hover:bg-gray-100" variant="tertiary" href="/auth/login">
            <BlurReveal preset="slide-up">Get Started Free</BlurReveal>
          </Button>
        </div>
      </section>

    </main>
  )
}

export default Home
