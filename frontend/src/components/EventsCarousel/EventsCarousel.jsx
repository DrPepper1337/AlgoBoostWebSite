import React, {useMemo, useState } from 'react';
import './EventsCarousel.css';
import dsaTalkImage from '../../assets/DSA_talk.webp';
import tutorialsImage from '../../assets/tutorials.jpg';
import competitionsImage from '../../assets/competitions.jpg';

const eventTypes = [
    { id: 'competitions', title: 'Competitions', description: 'Exciting competitions to test your skills. With prizes, of course.', image: competitionsImage },
    { id: 'dsa-talks', title: 'DSA Talks', description: 'Weekly discussions on Data Structures and Algorithms.', image: dsaTalkImage },
    { id: 'tutorials', title: 'Tutorials', description: 'In-depth tutorials to consolidate your understanding of key concepts.', image: tutorialsImage },
];

export default function EventsCarousel() {
    const [current, setCurrent] = useState(1);
    const [dir, setDir] = useState(null);
    const [run, setRun] = useState(false);
    const [entering, setEntering] = useState(false);

    const rightIdx = (current + eventTypes.length - 1) % eventTypes.length;
    const centerIdx = current;
    const leftIdx = (current + 1) % eventTypes.length;

    const goRight = () => {
        if (dir) return;
        setDir('right');
        setEntering(false);
        requestAnimationFrame(() => setRun(true));
        setTimeout(() => {
            setCurrent(rightIdx);
            setDir(null);
            setRun(false);
            setEntering(true);
            setTimeout(() => setEntering(false), 400);
        }, 600);
    };

    const goLeft = () => {
        if (dir) return;
        setDir('left');
        setEntering(false);
        requestAnimationFrame(() => setRun(true));
        setTimeout(() => {
            setCurrent(leftIdx);
            setDir(null);
            setRun(false);
            setEntering(true);
            setTimeout(() => setEntering(false), 400);
        }, 600);
    };

    const items = useMemo(() => {
        const base = [
            { key: `L-${eventTypes[leftIdx].id}`, idx: leftIdx, slot: 'left' },
            { key: `C-${eventTypes[centerIdx].id}`, idx: centerIdx, slot: 'center' },
            { key: `R-${eventTypes[rightIdx].id}`, idx: rightIdx, slot: 'right' },
        ];

        if (dir === 'left') {
            base.push({ key: `G-R-${eventTypes[leftIdx].id}`, idx: rightIdx, slot: 'ghost-enter-left' });
        } else if (dir === 'right') {
            base.push({ key: `G-L-${eventTypes[rightIdx].id}`, idx: leftIdx, slot: 'ghost-enter-right' });
        }
        return base;
    }, [dir, leftIdx, centerIdx, rightIdx]);

    const getClass = (slot) => {
        if (!dir) return slotClass[slot].atRest;

        if (dir === 'left') {
            if (!run) return slotClassRight.start[slot];
            return slotClassRight.end[slot];
        } else { // dir === 'left'
            if (!run) return slotClassLeft.start[slot];
            return slotClassLeft.end[slot];
        }
    };

    return (
        <div className="events-carousel">
            <div className="carousel-container">
                <button className="carousel-arrow left" onClick={goLeft} disabled={!!dir}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>

                <div className="carousel-items">
                    {items.map(({ key, idx, slot }) => (
                        <div key={key} className={`carousel-item ${getClass(slot)}`}>
                            <div className="event-card">
                                {eventTypes[idx].image ? (
                                    <img src={eventTypes[idx].image} alt={eventTypes[idx].title} className="event-image" />
                                ) : (
                                    <h3>{eventTypes[idx].title}</h3>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <button className="carousel-arrow right" onClick={goRight} disabled={!!dir}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
            </div>

            <div className={`carousel-description ${dir ? 'transitioning' : ''} ${entering ? 'entering' : ''}`} key={current}>
                <h4>{eventTypes[current].title}</h4>
                <p>{eventTypes[current].description}</p>
            </div>
        </div>
    );
}

const slotClass = {
    left: { atRest: 'pos-left' },
    center: { atRest: 'pos-center' },
    right: { atRest: 'pos-right' },
    'ghost-enter-left': { atRest: 'off-left' },
    'ghost-enter-right': { atRest: 'off-right' },
};

const slotClassRight = {
    start: {
        left: 'pos-left',
        center: 'pos-center',
        right: 'pos-right',
        'ghost-enter-left': 'off-left',     // ghost starts off-screen left
    },
    end: {
        left: 'to-center',
        center: 'to-right',
        right: 'to-off-right',
        'ghost-enter-left': 'to-left',
    },
};

const slotClassLeft = {
    // When clicking LEFT: everything moves to the LEFT.
    start: {
        left: 'pos-left',
        center: 'pos-center',
        right: 'pos-right',
        'ghost-enter-right': 'off-right',
    },
    end: {
        left: 'to-off-left',
        center: 'to-left',
        right: 'to-center',
        'ghost-enter-right': 'to-right',
    },
};