import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

// Aceita Markdown e também o HTML das aulas importadas, removendo qualquer script ou estilo perigoso
const schema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "u", "mark", "figure", "figcaption"],
};

export default function Conteudo({ texto }: { texto: string }) {
  return (
    <ReactMarkdown rehypePlugins={[rehypeRaw, [rehypeSanitize, schema]]}>
      {texto}
    </ReactMarkdown>
  );
}
