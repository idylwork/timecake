import classNames from 'classnames';
import { useId } from 'react';
import styles from './index.module.css';

interface Props extends React.ComponentPropsWithoutRef<'input'> {
  datalist?: string[];
}

/**
 *
 * @param props.children -
 * @return
 */
export default function Input({ children, type = 'text', className, datalist, ...props }: Props) {
  const listId = useId();

  return (
    <div className={classNames(styles.root, className)}>
      <input type={type} list={listId} {...props} />
      {children}
      {datalist && (
        <datalist id={listId}>
          {datalist.map((data) => (
            <option value={data} key={data} />
          ))}
        </datalist>
      )}
      {children}
    </div>
  );
}
