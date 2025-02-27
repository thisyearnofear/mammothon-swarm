// Type declarations for modules without type definitions
declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.svg" {
  const content: React.FC<React.SVGProps<SVGSVGElement>>;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.jpg" {
  const content: string;
  export default content;
}

// Ensure JSX is recognized
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
