import { Formik } from "formik";
import { useContext } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Button from "../../../components/button/button";
import LoadingIcon from "../../../assets/icons/loading";
import { AuthContext } from "../../../context/authContext";
import { loginSchema } from "../../../schema/auth";
import Input from "../../../components/input/input";
import LogoIcon from "../../../assets/icons/logo";
import { Letter, Lock } from "@solar-icons/react";
import BlurReveal from "../../../components/animations/blurReveal";

export default function Login() {
  const { signIn, loading } = useContext(AuthContext);
  const [URLSearchParams] = useSearchParams()
  const callbackURL = URLSearchParams.get("callbackURL") || ""

  return (
      <div className="flex md:w-[60%] h-auto w-full max-w-lg mx-auto items-center justify-center">
        <div className="sm:w-[400px] md:mx-0 mx-auto w-full p-6">
          <div className="flex flex-col justify-center gap-6 md:p-[5%] md:py-[5%] py-[80px]">
            <div className="flex flex-col items-center gap-4">
              <div className=" px-4 rounded-lg border border-gray-500/[0.2] w-fit">
                <LogoIcon className="w-[14px]"  />
              </div>
              
              <BlurReveal preset="slide-left">
                <h1 className="font-semibold text-[32px] text-dark-500 font-Elsie">Welcome back</h1>
              </BlurReveal>
              <BlurReveal preset="slide-left">
                <p className="text-gray-500 text-center">Enter your email and password below</p>
              </BlurReveal>
            </div>
            <Formik
              initialValues={{ email: "", password: "" }}
              enableReinitialize={true}
              validationSchema={loginSchema}
              onSubmit={(values, { setSubmitting }) => {
                signIn(values.email, values.password, callbackURL || "/account/dashboard");
                setSubmitting(false);
              }}
            >
              {({ values, errors, touched, handleChange, handleSubmit, isSubmitting }) => (
                <form onSubmit={handleSubmit} className="flex flex-col w-full gap-6">
                  <Input
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    type="email"
                    error={touched.email ? errors.email : ""}
                    placeholder="Email Address"
                    label="Email Address"
                    leftIcon={<Letter />}
                  />
                  <Input
                    name="password"
                    value={values.password}
                    onChange={handleChange}
                    type="password"
                    error={touched.password ? errors.password : ""}
                    placeholder="Password"
                    label="Password"
                    leftIcon={<Lock />}
                  />
                  <Button type="submit" className="w-full py-[12px]">
                    {isSubmitting || loading ? <LoadingIcon color="white" className="animate-spin w-[20px]" /> : "Login"}
                  </Button>
                </form>

              )}
            </Formik>

            <Link to="/auth/signup" className="text-center mt-4 text-[14px]">
              <BlurReveal preset="slide-left">
                Don't have an account? <span className="text-primary">Register</span>
              </BlurReveal>
            </Link>
            
            <Link to="/" className="text-center mt-4 text-[14px] underline">
              Back to Home
            </Link>

          </div>
        </div>
      </div>
  );
}

