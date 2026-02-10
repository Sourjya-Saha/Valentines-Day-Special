import React from 'react';

interface IonIconProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const IonIcon: React.FC<IonIconProps> = ({ name, className, style, onClick }) => {
  return React.createElement('ion-icon', {
    name,
    className,
    style,
    onClick,
  });
};

export default IonIcon;