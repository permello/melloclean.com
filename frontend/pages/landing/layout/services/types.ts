type Color = 'emerald' | 'teal' | 'amber' | 'slate';

type ServiceOption = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  price: string;
  color: Color;
  features: string[];
};

type ColorClassesOptions = {
  bg: string;
  icon: string;
  hover: string;
};
