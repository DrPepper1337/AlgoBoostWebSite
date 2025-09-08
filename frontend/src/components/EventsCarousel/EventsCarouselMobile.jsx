// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
import { useState, useRef } from 'react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

import dsaTalkImage from '../../assets/DSA_talk.webp';
import tutorialsImage from '../../assets/tutorials.jpg';
import competitionsImage from '../../assets/competitions.jpg';

import './EventsCarouselMobile.css';

const eventTypes = [
    { id: 'competitions', title: 'Competitions', description: 'Exciting competitions to test your skills. With prizes, of course.', image: competitionsImage },
    { id: 'dsa-talks', title: 'DSA Talks', description: 'Weekly discussions on Data Structures and Algorithms.', image: dsaTalkImage },
    { id: 'tutorials', title: 'Tutorials', description: 'In-depth tutorials to consolidate your understanding of key concepts.', image: tutorialsImage },
];

function EventsCarouselMobile() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isEntering, setIsEntering] = useState(false);
    const swiperRef = useRef(null);

    const handleSlideChange = (swiper) => {
        const newIndex = swiper.activeIndex;
        if (newIndex !== currentSlide) {
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentSlide(newIndex);
                setIsTransitioning(false);
                setIsEntering(true);
                setTimeout(() => setIsEntering(false), 400);
            }, 150);
        }
    };

    const goToSlide = (index) => {
        if (swiperRef.current && index !== currentSlide) {
            swiperRef.current.slideTo(index);
        }
    };

    return (
        <div className="events-carousel-mobile">
            {/* Pagination dots above carousel */}
            <div className="carousel-dots">
                {eventTypes.map((_, index) => (
                    <span 
                        key={index}
                        className={`dot ${index === currentSlide ? 'active' : ''}`}
                        onClick={() => {
                            goToSlide(index);
                        }}
                    ></span>
                ))}
            </div>

            <Swiper
                ref={swiperRef}
                modules={[Pagination, Autoplay]}
                spaceBetween={0}
                slidesPerView={1}
                navigation={false}
                pagination={false}
                centeredSlides={true}
                loop={false}
                className="carousel-container-mobile"
                onSlideChange={handleSlideChange}
                initialSlide={currentSlide}
            >
                {eventTypes.map((event, index) => (
                    <SwiperSlide key={index} className="carousel-item-mobile">
                        <div className="event-card-mobile">
                            {event.image ? (
                                <img src={event.image} alt={event.title} className="event-image-mobile" />
                            ) : (
                                <h3>{event.title}</h3>
                            )}
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            <div className={`carousel-description-mobile ${isTransitioning ? 'transitioning' : ''} ${isEntering ? 'entering' : ''}`} key={currentSlide}>
                <h4>{eventTypes[currentSlide].title}</h4>
                <p>{eventTypes[currentSlide].description}</p>
            </div>
        </div>
    );
}

export default EventsCarouselMobile;
