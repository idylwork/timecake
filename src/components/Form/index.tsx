interface Props {
  children: React.ReactNode;
  className?: string;
}

/**
 *
 * @param props.children -
 * @return
 */
export default function Form({ children, className }: Props) {
  /**
   * フォーム送信操作時
   * @param event
   */
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const element = document.activeElement;
    if (element instanceof HTMLInputElement) {
      element.blur();
    }
  };

  return (
    <form className={className} onSubmit={handleSubmit}>
      {children}
    </form>
  );
}
