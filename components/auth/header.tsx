interface HeaderProps {
  label: string;
  head: string;
}

export const Header = ({ head, label }: HeaderProps) => {
  return (
    <div className="w-full flex flex-col gap-y-6 items-center justify-center text-center">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
          {head}
        </h1>
        <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto"></div>
      </div>
      
      <p className="text-gray-600 text-lg font-medium leading-relaxed max-w-sm">
        {label}
      </p>

      {/* Decorative Elements */}
      <div className="flex items-center justify-center gap-2 opacity-30">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-500"></div>
        <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-1000"></div>
      </div>
    </div>
  );
};
