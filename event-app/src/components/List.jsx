// src/components/List.jsx
import { Link } from "react-router-dom";
import "./List.css";

function List({ items }) {
  return (
    <div className="list-container">
      {items.map((item, index) => (
        <div className="list-box" key={index}>
          <img src={item.image} alt={item.name} />
          <h3>{item.name}</h3>
          <p>{item.description}</p>
          <Link to={item.link} className="see-more">See More</Link>
        </div>
      ))}
    </div>
  );
}

export default List;










