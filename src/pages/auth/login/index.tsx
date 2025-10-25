import { Formik } from "formik";
import { useContext } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Button from "../../../components/button/button";
import LoadingIcon from "../../../assets/icons/loading";
import { AuthContext } from "../../../context/authContext";
import { loginSchema } from "../../../schema/auth";
import Input from "../../../components/input/input";

export default function Login() {
  const { signIn, loading } = useContext(AuthContext);
  const [URLSearchParams] = useSearchParams()
  const callbackURL = URLSearchParams.get("callbackURL") || ""

  return (
      <div className="flex md:w-[60%] h-auto w-full items-center justify-center">
        <div className="sm:w-[400px] md:mx-0 mx-auto w-full p-6">
          <div className="flex flex-col justify-center gap-6 md:p-[5%] md:py-[5%] py-[80px]">
            <div>
              <h1 className="font-semibold md:text-[30px] text-[24px] text-dark-500">Welcome 👋</h1>
              <p className="text-gray-500">Please login here</p>
            </div>
            <Formik
              initialValues={{ email: "test@gmail.com", password: "password1" }}
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
                    label="Email Address"
                  />
                  <Input
                    name="password"
                    value={values.password}
                    onChange={handleChange}
                    type="password"
                    error={touched.password ? errors.password : ""}
                    label="Password"
                  />
                  <Button type="submit" className="w-full">
                    {isSubmitting || loading ? <LoadingIcon color="white" className="animate-spin w-[20px]" /> : "Login"}
                  </Button>
                </form>

              )}
            </Formik>

            <Link to="/auth/signup" className="text-center mt-4 text-[14px]">
              Don't have an account? <span className="text-primary">Register</span>
            </Link>

          </div>
        </div>
      </div>
  );
}

