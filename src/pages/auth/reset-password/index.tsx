import React, { useContext, useEffect } from 'react'
import LogoIcon from '../../../assets/icons/logo'
import BlurReveal from '../../../components/animations/blurReveal'
import { useSearchParams } from 'react-router-dom'
import { AuthContext } from '../../../context/authContext'
import { Formik } from 'formik'
import Input from '../../../components/input/input'
import { Lock } from '@solar-icons/react'
import Button from '../../../components/button/button'
import LoadingIcon from '../../../assets/icons/loading'

function ResetPasswordPage() {
    const [URLSearchParama,] = useSearchParams()
    const secret = URLSearchParama.get("secret") || ""
    const userId = URLSearchParama.get("userId") || ""  
    const { updatePassword, loading } = useContext(AuthContext)

    return (
        
        <div className="flex md:w-[55%] h-screen w-full items-center justify-center">
        <div className="sm:w-[400px] md:mx-0 mx-auto w-full p-6">
          <div className="flex flex-col justify-center gap-6 md:p-[5%] md:py-[5%] py-[80px]">
                    <div className=" px-4 py-2 rounded-lg border border-gray-500/[0.2] w-fit mx-auto">
                        <LogoIcon className="w-[14px] h-[28px]"  />
                    </div>
                    
                    <BlurReveal preset="slide-left">
                        <h1 className="font-semibold text-center text-[32px] text-dark-500">Reset Password</h1>
                    </BlurReveal>

                    <Formik 
                        initialValues={{ password: "" }}
                        onSubmit={(values) => {
                            updatePassword(values.password, userId, secret);
                        }}
                    >
                        {({ values, handleChange, handleSubmit, isSubmitting }) => (
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <Input
                                    name="password"
                                    value={values.password}
                                    onChange={handleChange}
                                    type="password"
                                    placeholder="New password"
                                    label="New password"
                                    leftIcon={<Lock weight="Outline" />}
                                />
                                <Button type="submit" className="w-full py-[12px]">
                                {isSubmitting || loading ? <LoadingIcon color="white" className="animate-spin w-[20px]" /> : "Submit"}
                                </Button>
                            </form>
                        )}
                    </Formik>

                    
                </div>
            </div>
        </div>
  )
}

export default ResetPasswordPage