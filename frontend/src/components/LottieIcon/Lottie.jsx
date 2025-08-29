import Lottie from "lottie-react";
import { useEffect, useRef } from "react";
import calendar from "../../assets/animated/calendar.json";
import book from "../../assets/animated/book.json";
import house from "../../assets/animated/house.json";
import heart from "../../assets/animated/heart.json";
import user from "../../assets/animated/user.json";
import up from "../../assets/animated/up.json";
import sponsorship from "../../assets/animated/sponsorship.json";
import constitution from "../../assets/animated/constitution.json";

const animations = { calendar, book, house, heart, user, up, sponsorship, constitution };

export default function OfferIcon({ iconName, isHovered }) {
  const lottieRef = useRef(null);

  useEffect(() => {
    const inst = lottieRef.current;
    if (!inst) return;

    if (isHovered) {
      inst.goToAndPlay(0, true);
    } else {
      inst.stop();
      inst.goToAndStop(0, true);
    }
  }, [isHovered]);

  return (
    // <div className="offer-icon-wrap">
      <Lottie
        lottieRef={lottieRef}
        animationData={animations[iconName]}
        loop={false}
        autoplay={false}
        className="lottie-icon"
        // style={{ width: "4rem", height: "4rem" }}
      />
    // </div>
  );
}