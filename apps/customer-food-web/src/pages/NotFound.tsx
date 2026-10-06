import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Utensils, Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F6F2] px-4 font-sans select-none">
      <div className="text-center max-w-sm w-full bg-white border border-[#E8E3DC] rounded-3xl p-8 shadow-xl space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-[#9E6B38]/10 text-[#9E6B38] flex items-center justify-center mx-auto border border-[#9E6B38]/20 shadow-sm">
          <Utensils className="w-8 h-8 stroke-[2]" />
        </div>

        <div>
          <span className="text-xs font-black uppercase tracking-widest text-[#9E6B38] block mb-1">Error 404</span>
          <h1 className="text-2xl font-black text-[#2D241E] tracking-tight font-serif">Dish or Page Not Found</h1>
          <p className="text-xs text-[#7A746B] mt-2 leading-relaxed">
            The page or food menu you are looking for might have moved, or is currently unavailable in this outlet.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 min-h-[44px] py-2.5 px-4 rounded-full border border-[#E8E3DC] text-[#2D241E] hover:bg-[#F8F6F2] font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex-1 min-h-[44px] py-2.5 px-4 rounded-full bg-gradient-to-r from-[#9E6B38] to-[#8C5E35] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
          >
            <Home className="w-4 h-4" /> Home Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

