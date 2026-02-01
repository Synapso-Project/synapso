export default function TestPage() {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h1 className="text-4xl font-bold text-blue-600">Hello Tailwind 👋</h1>
        <p className="mt-4 text-lg text-gray-700">
          If you see this styled text, Tailwind is working!
        </p>
        <button className="mt-6 px-6 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600">
          Test Button
        </button>
      </div>
    );
  }
  
