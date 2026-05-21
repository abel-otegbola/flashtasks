import React, { useContext, useEffect } from 'react'
import LogoIcon from '../../../assets/icons/logo'
import BlurReveal from '../../../components/animations/blurReveal'
import { useSearchParams } from 'react-router-dom'
import { AuthContext } from '../../../context/authContext'

function VerifyEmailPage() {
    const [URLSearchParama,] = useSearchParams()
    const secret = URLSearchParama.get("secret") || ""
    const userId = URLSearchParama.get("userId") || ""  
    const { updateEmailVerification } = useContext(AuthContext)

    useEffect(() => {
        if (secret && userId) {
            updateEmailVerification(userId, secret)
        }
    }, [secret, userId])

    return (
        
        <div className="flex md:w-[55%] h-screen w-full items-center justify-center">
            <div className="sm:w-[400px] md:mx-0 mx-auto w-full p-6">
                <div className="flex flex-col justify-center gap-6 md:p-[5%]">
                    <LogoIcon />
                    
                    <BlurReveal preset="slide-right">
                        <h1 className='md:text-[32px] text-[20px] font-semibold leading-[120%]'>Email Verification</h1>
                    </BlurReveal>
                    
                    <BlurReveal preset="slide-right">
                        <p>Verifying your email address...</p>
                    </BlurReveal>
                </div>
            </div>
        </div>
  )
}

export default VerifyEmailPage