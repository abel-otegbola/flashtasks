import { Formik } from "formik";
import { useContext } from "react";
import { Link } from "react-router-dom";
import Button from "../../../components/button/button";
import LoadingIcon from "../../../assets/icons/loading";
import { AuthContext } from "../../../context/authContext";
import { loginSchema } from "../../../schema/auth";
import Input from "../../../components/input/input";
import LogoIcon from "../../../assets/icons/logo";
import { Letter } from "@solar-icons/react";
import BlurReveal from "../../../components/animations/blurReveal";

export default function ForgotPassword() {
  const { forgotPassword, loading } = useContext(AuthContext);

  return (
      <div className="flex md:w-[60%] h-auto w-full max-w-lg mx-auto items-center justify-center">
        <div className="sm:w-[400px] md:mx-0 mx-auto w-full p-6">
          <div className="flex flex-col justify-center gap-6 md:p-[5%] md:py-[5%] py-[80px]">
            <div className="flex flex-col items-center text-center gap-4">
              <div className=" px-4 py-2 rounded-lg border border-gray-500/[0.2] w-fit">
                <LogoIcon className="w-[14px] h-[28px]"  />
              </div>
              
              <BlurReveal preset="slide-left">
                <h1 className="font-semibold text-[32px] text-dark-500">Forgot Password</h1>
              </BlurReveal>
              <BlurReveal preset="slide-left">
                <p className="text-gray-500 text-center">Enter your email address below to recover your password</p>
              </BlurReveal>
            </div>
            <Formik
              initialValues={{ email: "" }}
              enableReinitialize={true}
              onSubmit={(values, { setSubmitting }) => {
                forgotPassword(values.email);
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
                  <Button type="submit" className="w-full py-[12px]">
                    {isSubmitting || loading ? <LoadingIcon color="white" className="animate-spin w-[20px]" /> : "Continue"}
                  </Button>
                </form>

              )}
            </Formik>
            
            <Link to="/" className="text-center mt-4 text-[12px] opacity-70">
              Back to Home
            </Link>

          </div>
        </div>
      </div>
  );
}

