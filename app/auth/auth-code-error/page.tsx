export default function AuthCodeError() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
        <p className="text-gray-600 mb-6">
          There was an error signing you in. Please try again.
        </p>
        <a 
          href="/"
          className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
        >
          Return Home
        </a>
      </div>
    </div>
  )
}