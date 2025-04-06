interface TextViewProps {
  data: any;
  config: {
    content?: string;
    fontSize?: string;
    textAlign?: string;
    fontWeight?: string;
  };
}

export function TextView({ data, config }: TextViewProps) {
  const {
    content = "",
    fontSize = "1rem",
    textAlign = "left",
    fontWeight = "normal",
  } = config;

  // Use content from config or from data if available
  const displayContent = content || (data && data.content) || "";

  return (
    <div
      className="h-full w-full overflow-auto p-2"
      style={{
        fontSize,
        textAlign: textAlign as any,
        fontWeight: fontWeight as any,
      }}
    >
      {displayContent}
    </div>
  );
}