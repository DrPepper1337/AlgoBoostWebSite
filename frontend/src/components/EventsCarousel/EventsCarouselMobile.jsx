// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
import { useState, useRef } from 'react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';


import image1 from '../../assets/carousel/photo1.jpg';
import image2 from '../../assets/carousel/photo2.jpg';
import image3 from '../../assets/carousel/photo3.jpg';
import image4 from '../../assets/carousel/photo4.jpg';
import image5 from '../../assets/carousel/photo5.jpg';
import image6 from '../../assets/carousel/photo6.jpg';
import image7 from '../../assets/carousel/photo7.jpg';

import './EventsCarouselMobile.css';


const eventTypes = [
    { id: 'gallery-1', image: image1 },
    { id: 'gallery-2', image: image2 },
    { id: 'gallery-3', image: image3 },
    { id: 'gallery-4', image: image4 },
    { id: 'gallery-5', image: image5 },
    { id: 'gallery-6', image: image6 },
    { id: 'gallery-7', image: image7 },
];

function EventsCarouselMobile() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const swiperRef = useRef(null);

    const handleSlideChange = (swiper) => {
        setCurrentSlide(swiper.activeIndex);
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
                spaceBetween={20}
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
                    <SwiperSlide key={index} className="carousel-slide-mobile">
                        <div className="event-card-mobile">
                            {event.image ? (
                                <img src={event.image} alt={`Gallery photo ${index + 1}`} className="event-image-mobile" />
                            ) : (
                                <h3>{event.title}</h3>
                            )}
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}

export default EventsCarouselMobile;
