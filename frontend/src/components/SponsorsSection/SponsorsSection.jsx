import RevealOnScroll from "../TextReveal/RevealOnScroll";
import "./SponsorsSection.css";

const sponsors = [
  {
    name: "Jane Street",
    logo: "https://www.janestreet.com/assets/logo_horizontal-16929188a56384c8e77bea91967c4553146ed7293f60a8f4f2ab6a06187881ce.svg",
    url: "https://www.janestreet.com/",
  },
  {
    name: "Handshake",
    logo: "/handshake_logo.svg",
    url: "https://joinhandshake.co.uk/",
  },
];

export default function SponsorsSection() {
  return (
    <RevealOnScroll
      as="section"
      id="sponsors"
      className="sponsors-section"
      threshold={0.4}
      rootMargin="0px 0px -10% 0px"
    >
      <div className="sponsors-grid">
        {sponsors.map((sponsor, index) => (
          <a
            key={sponsor.name}
            className="sponsor-card reveal"
            data-sr="up"
            style={{ "--sr-order": index + 2 }}
            href={sponsor.url}
            aria-label={`${sponsor.name} website`}
          >
            <div className="sponsor-logo-wrap">
              <img
                src={sponsor.logo}
                alt={`${sponsor.name} logo`}
                className="sponsor-logo sponsor-logo--base"
                loading="lazy"
              />
              <img
                src={sponsor.logo}
                alt=""
                aria-hidden="true"
                className="sponsor-logo sponsor-logo--hover"
                loading="lazy"
              />
            </div>
          </a>
        ))}
      </div>
      <div className="sponsors-header">
        <h1 className="reveal" data-sr="up" style={{ "--sr-order": 0 }}>
          Our Sponsors
        </h1>
        <p className="reveal" data-sr="up" style={{ "--sr-order": 1 }}>
          AlgoBoost Society is grateful for the support of our sponsors, who
          help us create opportunities for students to develop their technical
          skills and connect with industry. Through sponsorship, we are able to
          host workshops, competitions, hackathons, and career-focused events.
          <br /> <br />
          We are always excited to collaborate with organisations that share our
          commitment to fostering the next generation of problem-solvers.
        </p>
      </div>
    </RevealOnScroll>
  );
}
