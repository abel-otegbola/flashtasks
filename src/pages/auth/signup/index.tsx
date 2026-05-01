import { Formik } from "formik";
import { useContext } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Button from "../../../components/button/button";
import LoadingIcon from "../../../assets/icons/loading";
import { AuthContext } from "../../../context/authContext";
import { registerSchema } from "../../../schema/auth";
import Input from "../../../components/input/input";
import LogoIcon from "../../../assets/icons/logo";
import { Letter, Lock, User } from "@solar-icons/react";
import BlurReveal from "../../../components/animations/blurReveal";

export default function SignupPage() {
  const { signUp, loading } = useContext(AuthContext);
  const [URLSearchParams] = useSearchParams()
  const callbackURL = URLSearchParams.get("callbackURL") || ""

  return (

      <div className="flex md:w-[55%] h-screen w-full items-center justify-center">
        <div className="sm:w-[400px] md:mx-0 mx-auto w-full p-6">
          <div className="flex flex-col justify-center gap-6 md:p-[5%]">
            <div className="flex flex-col items-center gap-4">
              <div className="px-4 rounded-lg shadow-[0px_2px_5px_0px_#20202020] border border-gray-500/[0.2] w-fit">
                <LogoIcon className="w-[14px]"  />
              </div>

              <BlurReveal preset="slide-left">
                <h1 className="font-bold md:text-[28px] text-[16px] text-dark-500">Create Account</h1>
              </BlurReveal>
              <BlurReveal preset="slide-left">
                <p className="text-gray text-center">Enter your personal details to create an account</p>
              </BlurReveal>
            </div>
            <Formik
              initialValues={{ email: "", name: "", password: "" }}
              validationSchema={registerSchema}
              onSubmit={(values, { setSubmitting }) => {
                signUp(values.name, values.email, values.password, callbackURL || "/account/dashboard");
                setSubmitting(false);
              }}
            >
              {({ values, errors, touched, handleChange, handleSubmit, isSubmitting }) => (
                <form onSubmit={handleSubmit} className="flex flex-col w-full gap-6">
                    <Input
                      name="name" 
                      value={values.name}
                      onChange={handleChange}
                      type="text"
                      error={touched.name ? errors.name : ""}
                      placeholder="User name"
                      leftIcon={<User weight="Outline" />}
                    />

                    <Input
                      name="email"
                      value={values.email}
                      onChange={handleChange}
                      type="email"
                      error={touched.email ? errors.email : ""}
                      placeholder="Email Address"
                      leftIcon={<Letter weight="Outline" />}
                    />

                    <Input
                      name="password"
                      value={values.password}
                      onChange={handleChange}
                      type="password"
                      error={touched.password ? errors.password : ""}
                      placeholder="Password"
                      leftIcon={<Lock weight="Outline" />}
                    />
                  
                  <Button type="submit" className="w-full mt-4 py-[12px]">
                    {isSubmitting || loading ? <LoadingIcon color="white" className="animate-spin w-[20px]" /> : "Register"}
                  </Button>
                </form>

              )}
            </Formik>

            <Link to="/auth/login" className="text-center mt-4 text-[14px]">
              Already have an account? <span className="text-primary">Login</span>
            </Link>
          </div>
        </div>
      </div>
  );
}

