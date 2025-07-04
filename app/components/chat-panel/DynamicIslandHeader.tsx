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
        <div className={`flex items-center justify-between px-4 py-3 w-full ${isEmbed ? 'websyte-embed-header' : ''}`}>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2 flex-shrink-0">
            <img 
              src={advertiserLogo || 'https://websyte.ai/websyte-ai-logo.svg'} 
              alt={advertiserName} 
              className="w-7 h-7 rounded"
            />
            {advertiserName}
          </h1>
          {!hidePoweredBy && (
            <p className="text-sm text-gray-500 flex items-center gap-1 flex-shrink-0">
              Powered by 
              <a 
                href="https://websyte.ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
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