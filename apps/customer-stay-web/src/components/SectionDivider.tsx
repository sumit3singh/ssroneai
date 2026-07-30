interface SectionDividerProps {
  variant?: "wave" | "curve" | "slant";
  flip?: boolean;
  className?: string;
}

const SectionDivider = ({ variant = "wave", flip = false, className = "" }: SectionDividerProps) => {
  const transforms = flip ? "rotate-180" : "";

  const paths = {
    wave: "M0,96L48,106.7C96,117,192,139,288,138.7C384,139,480,117,576,112C672,107,768,117,864,128C960,139,1056,149,1152,144C1248,139,1344,117,1392,106.7L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z",
    curve: "M0,64L80,80C160,96,320,128,480,128C640,128,800,96,960,80C1120,64,1280,64,1360,64L1440,64L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z",
    slant: "M0,0L1440,128L1440,0L0,0Z",
  };

  return (
    <div className={`w-full overflow-hidden leading-[0] ${transforms} ${className}`}>
      <svg
        className="relative block w-full h-[50px] md:h-[80px]"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 160"
        preserveAspectRatio="none"
      >
        <path
          d={paths[variant]}
          className="fill-blush"
        />
      </svg>
    </div>
  );
};

export default SectionDivider;
