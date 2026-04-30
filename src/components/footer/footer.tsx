import LogoIcon from "../../assets/icons/logo"


function Footer() {
  return (
    <div className="py-12 flex md:flex-row flex-col gap-6 justify-center items-center md:px-9 p-4 ">
      <p>Flashtasks &copy; {new Date().getFullYear()} All rights reserved.</p>
    </div>
  )
}

export default Footer