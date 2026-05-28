import { Link } from "react-router-dom"

function Footer() {
  const resources = [
    { label: "Help center", to: "/help-center" },
    { label: "What's new", to: "/help-center#whats-new" },
    { label: "FAQs", to: "/faqs" },
    { label: "Blog", to: "/blog" },
  ];

  return (
    <div className="py-12 flex flex-col gap-6 justify-center items-center md:px-[6%] pt-10 p-6">

      <div className="grid lg:grid-cols-4 sm:grid-cols-2 gap-6 w-full border-b border-gray-500/[0.2] pb-10">
        <div className="flex flex-col gap-4">
          <h3 className="font-semibold mb-2 text-lg">Products</h3>
          {
            ["Features", "Integrations", "Pricing", "For teams"].map(item => (
              <Link to={"/" + item} key={item} className="text-gray-500 hover:text-primary cursor-pointer">
                {item}
              </Link>
            ))
          }
        </div>
        
        <div className="flex flex-col gap-4">
          <h3 className="font-semibold mb-2 text-lg">Resources</h3>
          {
            resources.map(item => (
              <Link to={item.to} key={item.label} className="text-gray-500 hover:text-primary cursor-pointer">
                {item.label}
              </Link>
            ))
          }
        </div>
        
        <div className="flex flex-col gap-4">
          <h3 className="font-semibold mb-2 text-lg">Company</h3>
          {
            [
              { label: "About us", to: "/about-us" },
              { label: "Careers", to: "/careers" },
              { label: "Forums", to: "/forum" },
              { label: "Announcements", to: "/announcements" },
            ].map(item => (
              <Link to={item.to} key={item.label} className="text-gray-500 hover:text-primary cursor-pointer">
                {item.label}
              </Link>
            ))
          }
        </div>

        
        <div className="flex flex-col gap-4">
          <h3 className="font-semibold mb-2 text-lg">Social Media</h3>
          {
            ["Instagram", "Twitter", "LinkedIn", "Facebook"].map(item => (
              <Link to={item} key={item} className="text-gray-500 hover:text-primary cursor-pointer">
                {item}
              </Link>
            ))
          }
        </div>
      </div>

      <p>Flashtasks &copy; {new Date().getFullYear()} All rights reserved.</p>
    </div>
  )
}

export default Footer