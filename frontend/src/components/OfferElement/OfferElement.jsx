import { useState } from "react";
import OfferIcon from "../LottieIcon/Lottie";

export default function OfferElement({ iconName, text, order }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="offer-element reveal"
      data-sr="up"
      style={{ "--sr-order": order }}
    >
      <button
        className="offer-card"
        onMouseEnter={() => { setIsHovered(true); console.log("Mouse entered"); }}
        onMouseLeave={() => { setIsHovered(false); console.log("Mouse left"); }}
      >
        <div className="offer-icon-wrap">
          <OfferIcon iconName={iconName} isHovered={isHovered} />
        </div>
        <p>{text}</p>
      </button>
    </div>
  );
}