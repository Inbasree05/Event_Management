
import List from "../components/List";  
import dImg from "../assets/decoration.jpeg";
import mImg from "../assets/mehndi.jpeg";
import cImg from "../assets/catering.jpeg";

const services = [
  {
    name: "Stage Decoration",
    description: "Beautiful stage designs for your dream wedding",
    image: dImg,
    link: "/decoration",
  },
  {
    name: "Mehndi",
    description: "Traditional and modern mehndi designs",
    image: mImg,
    link: "/mehndi",
  },
  {
    name: "Catering",
    description: "Delicious menu options for your big day",
    image: cImg,
    link: "/catering",
  },
];

function Home() {
  return (
    <div className="home-container">
     
      <List items={services} />
    </div>
  );
}

export default Home;










