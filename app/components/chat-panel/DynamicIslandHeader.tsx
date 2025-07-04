import { DynamicIslandProvider, DynamicIsland } from "../ui/dynamic-island";

interface DynamicIslandHeaderProps {
  advertiserName: string;
  advertiserLogo?: string;
  baseUrl?: string;
  hidePoweredBy?: boolean;
  isEmbed?: boolean;
  className?: string;
}

export function DynamicIslandHeader({
  advertiserName,
  advertiserLogo,
  baseUrl = "",
  hidePoweredBy = false,
  isEmbed = false,
  className = "",
}: DynamicIslandHeaderProps) {
  return (
    <DynamicIslandProvider 
      size="large"
      position="top"
      className={`!w-[calc(100%-2rem)] !max-w-[600px] !z-50 ${className}`}
    >
      <DynamicIsland className="w-full">
        <div className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3 w-full">
          <h1 className="text-base sm:text-lg md:text-xl font-bold text-foreground flex items-center gap-2 flex-shrink-0">
            <img 
              src={advertiserLogo || 'https://websyte.ai/websyte-ai-logo.svg'} 
              alt={advertiserName} 
              className="w-6 h-6 sm:w-7 sm:h-7 rounded"
            />
            {advertiserName}
          </h1>
          {!hidePoweredBy && (
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 flex-shrink-0 max-h-[399px]:hidden">
              Powered by 
              <a 
                href="https://websyte.ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <img 
                  src={`${baseUrl}/websyte-ai-logo.svg`} 
                  alt="Websyte.ai" 
                  className="w-3.5 h-3.5"
                />
                Websyte.ai
              </a>
            </p>
          )}
        </div>
      </DynamicIsland>
    </DynamicIslandProvider>
  );
}