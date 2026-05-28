import LoginForm from "@/components/LoginForm/LoginForm"

function Login() {
  return (
    <div className="text-xl font-bold flex flex-col gap-3 justify-center items-center h-[80vh]">
      <h2>Login</h2>
      <LoginForm />
    </div>
  )
}

export default Login