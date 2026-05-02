import { Link } from "react-router-dom"
import LogoIcon from "../../assets/icons/logo"


function Footer() {
  return (
    <div className="py-12 flex flex-col gap-6 justify-center items-center md:px-[6%] pt-10 p-6">

      <div className="grid lg:grid-cols-4 sm:grid-cols-2 gap-6 w-full border-b border-gray-500/[0.2] pb-10">
        <div className="flex flex-col gap-4">
          <h3 className="font-semibold mb-2 text-lg">Products</h3>
          {
            ["Features", "Integrations", "Pricing", "For teams"].map(item => (
              <Link to={item} key={item} className="text-gray-500 hover:text-primary cursor-pointer">
                {item}
              </Link>
            ))
          }
        </div>
        
        <div className="flex flex-col gap-4">
          <h3 className="font-semibold mb-2 text-lg">Resources</h3>
          {
            ["Help center", "What's new", "FAQs", "Blog"].map(item => (
              <Link to={item} key={item} className="text-gray-500 hover:text-primary cursor-pointer">
                {item}
              </Link>
            ))
          }
        </div>
        
        <div className="flex flex-col gap-4">
          <h3 className="font-semibold mb-2 text-lg">Company</h3>
          {
            ["About us", "Careers", "Forums", "Announcements"].map(item => (
              <Link to={item} key={item} className="text-gray-500 hover:text-primary cursor-pointer">
                {item}
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