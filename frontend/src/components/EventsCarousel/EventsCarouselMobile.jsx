// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
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
    return (
        <div className="events-carousel-mobile">
            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={30}
                slidesPerView={1}
                navigation={true}
                pagination={{ clickable: true }}
                centeredSlides={true}
                loop={false}
                className="carousel-container-mobile"
            >
                {eventTypes.map((event, index) => (
                    <SwiperSlide key={index} className="carousel-item-mobile">
                        <div className="event-card">
                            {event.image ? (
                                <img src={event.image} alt={event.title} className="event-image" />
                            ) : (
                                <h3>{event.title}</h3>
                            )}
                            <div className="event-content">
                                <h3>{event.title}</h3>
                                <p>{event.description}</p>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}

export default EventsCarouselMobile;
