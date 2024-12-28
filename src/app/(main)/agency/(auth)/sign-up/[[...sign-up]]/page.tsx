import { SignUp } from '@clerk/nextjs'
import React from 'react'

const page = () => {
  return (
    <SignUp path="/agency/sign-up" routing="path" />
  )
}

export default page