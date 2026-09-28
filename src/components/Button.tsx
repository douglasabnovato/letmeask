/* Botão padrão (preenchido ou contornado) com repasse de ref */
import { ButtonHTMLAttributes, forwardRef } from "react";
import "../styles/button.scss";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { isOutlined?: boolean };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ isOutlined = false, className = "", ...props }, ref) {
  return <button ref={ref} type="button" className={`button ${isOutlined ? "outlined" : ""} ${className}`} {...props} />;
});
/* Fim de Button.tsx */
