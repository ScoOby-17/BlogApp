import '../styles/CategoryFilter.css';

const CategoryFilter = ({ activeCategory, onCategoryChange }) => {
  const categories = ['all', 'tech', 'food', 'place', 'other'];

  return (
    <div className="category-filter">
      {categories.map((category) => (
        <button
          key={category}
          className={`category-btn ${activeCategory === category ? 'active' : ''}`}
          onClick={() => onCategoryChange(category)}
        >
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
