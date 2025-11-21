import { MedalRibbon, Microphone2, ChartSquare, Lightning, Magnet, CheckCircle, ArrowRight, UsersGroupRounded } from "@solar-icons/react"
import HeroCheckIcon from "../../../assets/icons/heroCheck"
import useTheme from '../../../customHooks/useTheme'
import { useUser } from '../../../context/authContext'
import BlurReveal from "../../../components/animations/blurReveal"
import Button from "../../../components/button/button"

function Home() {
  const { user } = useUser();
  const theme = useTheme();
  return (
    <main className="w-full dark:bg-dark dark:text-gray-100">
      {/* Hero Section */}
      <header className="flex justify-center items-center flex-col gap-6 sm:rounded-[40px] md:p-[40px] p-4 py-[80px] md:mx-[32px]">
        <p className="flex items-center gap-2 text-gray dark:text-gray-200 text-[12px] border border-gray-500/[0.2] bg-white/[0.1] dark:bg-white/[0.05] w-fit px-2 py-1 pr-4 rounded-full">
          <MedalRibbon weight="BoldDuotone" color="#FF7700" />
          Record. Transcribe. Act
        </p>

        <div>
          <BlurReveal preset="slide-left">
            <h1 className="md:text-[48px] text-[24px] font-bold w-fit text-center mx-auto leading-[120%]">
              Turn meetings into actions
            </h1>
          </BlurReveal>
          <BlurReveal preset="slide-left">
            <h1 className="flex flex-wrap md:text-[48px] text-[24px] font-bold w-fit text-center gap-2 items-center mx-auto leading-[120%]">
              Instantly⚡
            </h1>
          </BlurReveal>
        </div>

        <BlurReveal preset="slide-left">
          <p className="text-gray dark:text-gray-300 text-center mx-auto md:w-[65%] w-full md:text-[18px]">
            Stop wasting time on manual meeting follow-ups. Record meetings or speak naturally — our AI converts conversations into prioritized, assigned tasks so teams spend less time tracking work and more time doing high-quality work.
          </p>
        </BlurReveal>
        <div className="flex gap-4 flex-wrap justify-center">
          <Button href="/auth/signup">Start Free Trial</Button>
          <button className="px-6 py-3 rounded-lg border border-primary text-primary hover:bg-primary/10 transition-colors duration-300 font-medium">
            Watch Demo
          </button>
        </div>

  <img src={`/hero-img-${theme === 'dark' ? 'dark' : 'light'}.webp`} width={729} height={529} alt="hero" className="shadow-2xl rounded-lg" />
        
        <div className="py-4 flex flex-col items-center gap-4 md:w-[55%] text-center mb-12">
          <BlurReveal preset="zoom">
            <h2 className="md:text-[24px] text-[18px] font-medium">Join 500+ teams saving 10+ hours/week of quality time</h2>
          </BlurReveal>
          <BlurReveal preset="zoom">
            <p className="dark:text-gray-300">Get early access, influence features, and unlock exclusive perks for early adopters</p>
          </BlurReveal>
          <img src="/users.png" alt="users" width={220} height={36} className="" />
          {/* Show Sign up when not authenticated, otherwise show user initial circle */}
          <Button href="/auth/signup">Get Started</Button>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="md:p-[80px] p-4 py-[60px] flex flex-col gap-12">
        <div className="text-center max-w-3xl mx-auto">
            <span className="text-primary uppercase font-semibold tracking-wide text-[14px]">Features</span>
            <h2 className="md:text-[40px] text-[28px] font-bold mt-4 mb-6">
              Automate task follow-ups and reclaim quality time
            </h2>
            <p className="text-gray dark:text-gray-300 md:text-[18px]">
              Convert voice into prioritized action in seconds—automate task capture, assignment, and deadlines so your team can focus on impactful work instead of admin.
            </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {[
            {
              icon: <Microphone2 size={32} className="text-primary" />,
              title: "Voice-to-Task Conversion",
              description: "Record meetings or speak directly. Our AI extracts tasks, assigns priorities, and sets deadlines automatically.",
              benefit: "Save 5+ hours per week on manual task entry"
            },
            {
              icon: <Lightning size={32} className="text-primary" />,
              title: "AI-Powered Summarization",
              description: "Google Gemini analyzes recordings and generates concise summaries with key action items and decisions.",
              benefit: "Never miss important details again"
            },
            {
              icon: <Magnet size={32} className="text-primary" />,
              title: "Lightning-Fast Search",
              description: "ElasticSearch integration lets you find any task, meeting note, or action item instantly across thousands of entries.",
              benefit: "Find anything in under 2 seconds"
            },
            {
              icon: <ChartSquare size={32} className="text-primary" />,
              title: "Productivity Analytics",
              description: "Track task completion rates, identify bottlenecks, and see real-time team productivity metrics.",
              benefit: "Boost team output by 30%"
            },
            {
              icon: <UsersGroupRounded size={32} className="text-primary" />,
              title: "Workflow Optimization",
              description: "AI analyzes communication patterns, meeting frequency, and workload distribution to suggest improvements.",
              benefit: "Eliminate 40% of unnecessary meetings"
            },
            {
              icon: <CheckCircle size={32} className="text-primary" />,
              title: "Smart Task Management",
              description: "Auto-categorize tasks, detect dependencies, and get intelligent recommendations for what to tackle next.",
              benefit: "Complete 25% more tasks per sprint"
            }
          ].map((feature, index) => (
              <div className="p-6 rounded-2xl border border-border-gray-100 dark:border-gray-700 bg-bg-gray-100 dark:bg-dark-bg-secondary/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-[20px] font-bold mb-3">{feature.title}</h3>
                <p className="text-gray dark:text-gray-300 mb-4">{feature.description}</p>
                <p className="text-[14px] text-gray-300/[0.4] font-medium">✓ {feature.benefit}</p>
              </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="md:p-[80px] p-4 py-[60px] bg-bg-gray-100 dark:bg-dark-bg/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="uppercase font-bold tracking-wide text-[14px] px-6 py-3 rounded-lg border border-gray-100 shadow-sm">How It Works</span>
              <h2 className="md:text-[40px] text-[28px] font-semibold mt-4 mb-6">
                Three simple steps to move from chaotic meetings to focused action.
              </h2>
              <p className="text-gray dark:text-gray-300 md:text-[18px]">
                No complex setup. No learning curve. Just effortless productivity.
              </p>
          </div>

          <div className="grid md:grid-cols-3 gap-2">
            {[
              {
                id: 'step-1',
                title: "Record or Speak",
                description: "Upload meeting recordings or use voice input to capture your thoughts, discussions, and ideas naturally.",
              },
              {
                id: 'step-2',
                title: "AI Processes Everything",
                description: "Google Gemini analyzes the content, identifies action items, extracts key insights, and structures everything intelligently.",
              },
              {
                id: 'step-3',
                title: "Get Actionable Tasks",
                description: "Receive organized tasks with priorities, deadlines, and recommendations. Search, track, and optimize your workflow instantly.",
              }
            ].map((step, index) => (
              <BlurReveal key={index} preset="zoom">
                <div className="flex flex-col gap-6">
                  <img src={`/${step.id}-${theme === 'dark' ? 'dark' : 'light'}.webp`} alt={step.title} className="w-full" />
                </div>
              </BlurReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="md:p-[80px] p-4 py-[60px]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <BlurReveal preset="zoom">
              <span className="text-primary uppercase font-semibold tracking-wide text-[14px]">Pricing</span>
              <h2 className="md:text-[40px] text-[28px] font-bold mt-4 mb-6">
                Simple, Transparent Pricing
              </h2>
              <p className="text-gray dark:text-gray-300 md:text-[18px]">
                Start free, scale as you grow. No hidden fees, cancel anytime.
              </p>
            </BlurReveal>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Starter",
                price: "Free",
                description: "Perfect for individuals testing the waters",
                features: [
                  "Up to 10 hours of recording/month",
                  "Basic task conversion",
                  "7-day history",
                  "Email support",
                  "Core features access"
                ],
                cta: "Start Free",
                popular: false
              },
              {
                name: "Professional",
                price: "$29",
                period: "/user/month",
                description: "Best for growing teams who need more power",
                features: [
                  "Unlimited recordings",
                  "Advanced AI analytics",
                  "Unlimited history",
                  "Priority support",
                  "Workflow optimization insights",
                  "Team collaboration tools",
                  "Custom integrations"
                ],
                cta: "Start 14-Day Trial",
                popular: true
              },
              {
                name: "Enterprise",
                price: "Custom",
                description: "For large teams with advanced needs",
                features: [
                  "Everything in Professional",
                  "Dedicated account manager",
                  "Custom AI training",
                  "SLA guarantee",
                  "Advanced security & compliance",
                  "White-label options",
                  "API access"
                ],
                cta: "Contact Sales",
                popular: false
              }
            ].map((plan, index) => (
              <BlurReveal key={index} preset="zoom">
                <div className={`p-8 rounded-2xl border ${plan.popular ? 'border-primary shadow-2xl scale-105' : 'border-border-gray-100 dark:border-gray-700'} bg-white dark:bg-dark-bg-secondary/50 relative`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-[12px] font-semibold">
                      MOST POPULAR
                    </div>
                  )}
                  <h3 className="text-[24px] font-bold mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-[40px] font-bold">{plan.price}</span>
                    {plan.period && <span className="text-gray dark:text-gray-300">{plan.period}</span>}
                  </div>
                  <p className="text-gray dark:text-gray-300 mb-6">{plan.description}</p>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle size={20} className="text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-[14px]">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button href="/auth/signup" variant={plan.name === "Professional" ? "primary" : "secondary"} className={`w-full justify-center ${plan.popular ? '' : 'bg-transparent border border-primary text-primary hover:bg-primary hover:text-white'}`}>
                    {plan.cta}
                  </Button>
                </div>
              </BlurReveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs Section (replaces testimonials) */}
      <section id="faqs" className="md:p-[80px] p-4 py-[60px]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <BlurReveal preset="zoom">
              <span className="text-primary uppercase font-semibold tracking-wide text-[14px]">FAQs</span>
              <h2 className="md:text-[40px] text-[28px] font-bold mt-4 mb-6">Frequently asked questions</h2>
              <p className="text-gray dark:text-gray-300 md:text-[18px]">Answers to common questions about how Flashtasks saves teams time by automating task capture and follow-up.</p>
            </BlurReveal>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                q: 'How does Flashtasks save my team time?',
                a: 'Our AI converts meeting audio and voice notes into prioritized, assigned tasks with deadlines — eliminating manual follow-ups and reducing admin work so your team can focus on higher-value work.'
              },
              {
                q: 'Is my meeting data secure?',
                a: 'Yes — we follow industry best practices for data security and encryption. You can also control access through organization and team permissions.'
              },
              {
                q: 'Which integrations are supported?',
                a: 'We index tasks for fast search and provide integrations to common task and collaboration tools. Contact us for custom integration options.'
              },
              {
                q: 'How accurate is the AI at extracting tasks?',
                a: 'Our AI is tuned for action-item detection and improves over time. You can edit or reassign any generated task before it goes into your workflows.'
              }
            ].map((faq, idx) => (
              <div key={idx} className="p-6 bg-white dark:bg-dark-bg-secondary/50 rounded-2xl border border-border-gray-100 dark:border-gray-700">
                <div className="font-semibold mb-2">{faq.q}</div>
                <div className="text-gray dark:text-gray-300 text-sm">{faq.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="md:p-[80px] p-4 py-[60px]">
        <BlurReveal preset="zoom">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-dark to-dark-bg rounded-3xl p-12 text-white">
            <h2 className="md:text-[28px] text-[16px] font-bold mb-6">
              Reclaim your team's time by automating meeting follow-ups
            </h2>
            <div className="flex gap-4 flex-wrap justify-center">
              <Button href="/auth/signup" className="">
                Get Started Free <ArrowRight className="ml-2" />
              </Button>
              <button className="px-6 py-3 rounded-lg border-2 border-white text-white hover:bg-white/10 transition-colors duration-300 font-medium">
                Schedule a Demo
              </button>
            </div>
            <p className="mt-6 text-[14px] opacity-75">✓ 14-day free trial ✓ No credit card required ✓ Cancel anytime</p>
          </div>
        </BlurReveal>
      </section>
    </main>
  )
}

export default Home
