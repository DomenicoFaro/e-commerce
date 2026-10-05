import Image, { type ImageProps } from "next/image";

/** next/image che non ottimizza gli SVG (segnaposto e loghi). */
export default function ProductImage(props: ImageProps & { src: string }) {
  return <Image {...props} alt={props.alt} unoptimized={props.src.endsWith(".svg")} />;
}
