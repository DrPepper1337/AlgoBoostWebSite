import { useState } from "react";
import sponsorshipPDF from '../../assets/documents/sponsorship_proposal.pdf';
import constitutionPDF from '../../assets/documents/Constitution of AlgoBoost Society.pdf';
import OfferIcon from "../LottieIcon/Lottie";
import './DocElement.css';

export default function DocElement({ iconName, title, text, document }) {
    const [isHovered, setIsHovered] = useState(false);

    const downloadDocument = () => {
        const link = document.createElement('a');
        if (document === 'sponsorship') {
            link.href = sponsorshipPDF;
            link.download = 'AlgoBoost_Sponsorship_Proposal.pdf';
        } else if (document === 'constitution') {
            link.href = constitutionPDF;
            link.download = 'AlgoBoost_Society_Constitution.pdf';
        } else {
            return;
        }
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <div className="doc-card"
            onClick={downloadDocument}
            onMouseEnter={() => { setIsHovered(true); }}
            onMouseLeave={() => { setIsHovered(false); }}>
            <div className="doc-icon-wrap reveal" data-sr="up" style={{ "--sr-order": 0 }}>
                <OfferIcon iconName={iconName} isHovered={isHovered} />
            </div>
            <h5 className="reveal" data-sr="up" style={{ "--sr-order": 1 }}>{title}</h5>
            <p className="reveal" data-sr="up" style={{ "--sr-order": 2 }}>{text}</p>
        </div>
    );
}