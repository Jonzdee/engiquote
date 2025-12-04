import { useEffect,  } from "react";
import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();

  // This useEffect help me run my code one time, immediately the page load
  // this is might to wait 6 secs before navigate to dashboard
  // I clear the timeout to avoide memory leakage
  useEffect(() => {
    // Navigate after 9 seconds
    const navTimer = setTimeout(() => {
      navigate("/login");
    }, 6000);

    return () => {
      clearTimeout(navTimer);
    };
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black">
      <h1
        className="text-5xl font-extrabold tracking-tight text-white relative mb-4"
        style={{
          fontFamily: "Montserrat",
          textShadow: "0 0 20px rgba(255,255,255,0.6)",
        }}> 
        EngiQuote
        <span className="absolute left-0 -bottom-3 w-full h-1 overflow-hidden">
          <span className="block h-1 w-1/2 bg-white animate-slide"></span>
        </span>
      </h1>
      <style>
        {`
          @keyframes slide {
            0% { transform: translateX(0%); }
            50% { transform: translateX(100%); }
            100% { transform: translateX(0%); }
          }

          .animate-slide {
            animation: slide 2s ease-in-out infinite;
          }
        `}
      </style>
    </div>
  );
}