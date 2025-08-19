import Lottie from "lottie-react";
import { useRef } from "react";
import calendar from "../../assets/animated/calendar.json";
import book from "../../assets/animated/book.json";
import house from "../../assets/animated/house.json";
import heart from "../../assets/animated/heart.json";
import user from "../../assets/animated/user.json";
import up from "../../assets/animated/up.json";


const animations = { calendar, book, house, heart, user, up };

export default function OfferIcon({ iconName }) {
  const lottieRef = useRef(null);
  return (
    <div
      className="offer-icon-wrap"
      onMouseEnter={() => lottieRef.current?.play()}
      onMouseLeave={() => { lottieRef.current?.stop(); lottieRef.current?.goToAndStop(0, true); }}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={animations[iconName]}
        loop={false}
        autoplay={false}
        play={isHovered}
        style={{ width: "60%", height: "60%" }}
      />
    </div>
  );
}