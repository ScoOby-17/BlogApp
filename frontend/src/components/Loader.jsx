import '../styles/Loader.css';

const Loader = ({ size = 'md', text = '' }) => {
  return (
    <div className="loader-wrapper">
      <div className={`spinner spinner-${size}`}></div>
      {text && <p className="loader-text">{text}</p>}
    </div>
  );
};

export default Loader;