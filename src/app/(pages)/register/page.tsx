"use client"
import { Button } from '@/components/ui/button';
import { RegisterInterface } from '@/interfaces/RegisterInterface';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import z from "zod"
import axios, { AxiosError } from "axios";
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2, Eye, EyeOff } from 'lucide-react';


function Register() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [registerMessageError, setRegisterMessageError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showRePassword, setShowRePassword] = useState(false)

  const schema = z.object({
    name: z.string().nonempty("Name Is Required").min(2,"Name Must Be At Least 2 Characters").max(100),
    email: z.email("Please enter invalid email").nonempty("Email Is Required"),
    password: z.string().nonempty("Password Is Required").min(6, "Password Must Be At Least 6 Characters").max(100),
    rePassword: z.string().nonempty("rePassword Is Required"),
    phone: z.string().nonempty("").regex(/^01[0125]\d{8}$/, "we need egyptian phone number")
  }).refine((object) => {
    return object.password === object.rePassword
  }, {
    path: ["rePassword"],
    error: "rePassword Does't Match Password"
  })


  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      rePassword: "",
      phone: ""
    },
    resolver: zodResolver(schema),
    mode: "onTouched"
  })
  const  {register, handleSubmit, formState} = form;


  // HandleRegister
  async function handleRegister(data: RegisterInterface) {
    try {
      setIsLoading(true)
      // TODO: Replace with your actual backend API URL
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ecommerce.routemisr.com";
      const response  = await axios.post(`${API_URL}/api/v1/auth/signup`, data);
      if (response.data.message === "success") {
        toast.success("Register Successfully")
        router.push("/login")
      }
    } catch (error) {
      if (error instanceof AxiosError) {
    setRegisterMessageError(error.response?.data.message)
  }
    }finally {
      setIsLoading(false)
    }

  }





  return (
    <div className='py-16 flex items-center justify-center flex-col gap-5'>
      <h2 className='text-xl font-bold'>Register now and Join US</h2>
        <div className='w-full sm:w-110 h-auto p-5 shadow border-2 border-gray-200 rounded-md'>
      
        <form onSubmit={handleSubmit(handleRegister)} className='w-full h-auto flex flex-col gap-5'>

          {/* name */}
          <div>
            <label htmlFor='name' className='font-semibold block mb-1'>Name</label>
            <input {...register("name")} type='text' placeholder='Ahmed' id='name' className='block w-full border-2 border-gray-200 py-1.5 px-4 rounded-md'/>
            {formState.errors.name && <p className='text-sm text-red-700 font-semibold'>{formState.errors.name.message}</p>}
          </div>

          {/* email */}
          <div>
            <label htmlFor='email' className='font-semibold block mb-1'>Email</label>
            <input {...register("email")} type='email' placeholder='ahmed@gmail.com' id='email' className='block w-full border-2 border-gray-200 py-1.5 px-4 rounded-md'/>
            {formState.errors.email && <p className='text-sm text-red-700 font-semibold'>{formState.errors.email.message}</p>}

          </div>

          {/* password */}
          <div>
            <label htmlFor='password' className='font-semibold block mb-1'>Password</label>
            <div className="relative">
              <input {...register("password")} type={showPassword ? 'text' : 'password'} placeholder='ahmed@123' id='password' className='block w-full border-2 border-gray-200 py-1.5 px-4 pr-10 rounded-md'/>
              <button type="button" tabIndex={-1} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {formState.errors.password && <p className='text-sm text-red-700 font-semibold'>{formState.errors.password.message}</p>}
          </div>

          {/* rePassword */}
          <div>
            <label htmlFor='rePassword' className='font-semibold block mb-1'>Confirm Password</label>
            <div className="relative">
              <input {...register("rePassword")} type={showRePassword ? 'text' : 'password'} placeholder='ahmed@123' id='rePassword' className='block w-full border-2 border-gray-200 py-1.5 px-4 pr-10 rounded-md'/>
              <button type="button" tabIndex={-1} onClick={() => setShowRePassword(!showRePassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showRePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {formState.errors.rePassword && <p className='text-sm text-red-700 font-semibold'>{formState.errors.rePassword.message}</p>}
          </div>

          {/* phone */}
          <div>
            <label htmlFor='phone' className='font-semibold block mb-1'>Phone</label>
            <input {...register("phone")} type='text' placeholder='01059123587' id='phone' className='block w-full border-2 border-gray-200 py-1.5 px-4 rounded-md'/>
            {formState.errors.phone && <p className='text-sm text-red-700 font-semibold'>{formState.errors.phone.message}</p>}
          </div>

          {/* Submit */}
          <Button type='submit' disabled={isLoading}>{isLoading && <Loader2 className='animate-spin'/>} Submit</Button>

        {
          registerMessageError && <div className='bg-gray-400 p-5 text-center mt-3'>
            <p className='text-red-700 font-semibold'>{registerMessageError}</p>
          </div>
        }
      
      
        </form>   

        </div>
    </div>
  )
}

export default Register