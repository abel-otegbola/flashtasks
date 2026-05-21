import React, { useContext, useEffect } from 'react'
import LogoIcon from '../../../assets/icons/logo'
import BlurReveal from '../../../components/animations/blurReveal'
import { useSearchParams } from 'react-router-dom'
import { AuthContext } from '../../../context/authContext'
import { Formik } from 'formik'
import Input from '../../../components/input/input'
import { Lock } from '@solar-icons/react'
import Button from '../../../components/button/button'

function ResetPasswordPage() {
    const [URLSearchParama,] = useSearchParams()
    const secret = URLSearchParama.get("secret") || ""
    const userId = URLSearchParama.get("userId") || ""  
    const { updatePassword } = useContext(AuthContext)

    return (
        
        <div className="flex md:w-[55%] h-screen w-full items-center justify-center">
            <div className="sm:w-[400px] md:mx-0 mx-auto w-full p-6">
                <div className="flex flex-col justify-center gap-6 md:p-[5%]">
                    <LogoIcon />
                    
                    <BlurReveal preset="slide-right">
                        <h1 className='md:text-[32px] text-[20px] font-semibold leading-[120%]'>Reset Password</h1>
                    </BlurReveal>

                    <Formik 
                        initialValues={{ password: "" }}
                        onSubmit={(values) => {
                            updatePassword(values.password, userId, secret);
                        }}
                    >
                        {({ values, handleChange, handleSubmit }) => (
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
                                <Button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Reset Password</Button>
                            </form>
                        )}
                    </Formik>

                    
                </div>
            </div>
        </div>
  )
}

export default ResetPasswordPage